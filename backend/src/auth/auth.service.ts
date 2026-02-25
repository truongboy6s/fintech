import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // Service làm việc với database thông qua Prisma
    private jwtService: JwtService, // Service dùng để tạo & verify JWT
  ) {}

  /**
   * Đăng ký tài khoản mới
   * - Kiểm tra email đã tồn tại hay chưa
   * - Hash mật khẩu
   * - Lưu user vào database
   * - Tạo JWT token và trả về cho client
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    // Nếu đã tồn tại thì ném lỗi trùng email
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash mật khẩu trước khi lưu vào DB (tăng bảo mật)
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Tạo user mới trong database
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
      },
    });

    // Tạo access token JWT chứa thông tin user
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    // Trả về token và thông tin user (không trả password)
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Đăng nhập
   * - Tìm user theo email
   * - So sánh mật khẩu nhập vào với mật khẩu đã hash
   * - Nếu hợp lệ thì tạo JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    // Nếu không tìm thấy user
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // So sánh mật khẩu người dùng nhập với mật khẩu đã hash trong DB
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    // Nếu mật khẩu không đúng
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Tạo JWT token sau khi đăng nhập thành công
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    // Trả về token và thông tin user
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Validate user
   * - Dùng khi decode JWT
   * - Lấy thông tin user từ database dựa trên userId trong token
   */
  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  /**
   * Quên mật khẩu
   * - Kiểm tra email có tồn tại không
   * - Tạo reset token (JWT với thời gian hết hạn ngắn)
   * - Trong thực tế cần gửi email, ở đây trả về token để test
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Không nên tiết lộ email có tồn tại hay không để bảo mật
      // Nhưng để đơn giản, ta sẽ throw error
      throw new NotFoundException('Email not found');
    }

    // Tạo reset token với thời gian hết hạn 15 phút
    const resetToken = this.jwtService.sign(
      { userId: user.id, email: user.email, type: 'reset' },
      { expiresIn: '15m' }
    );

    // Trong thực tế: Gửi email chứa link reset password với token
    // Ví dụ: https://app.com/reset-password?token=xyz
    
    return {
      message: 'Reset password token created',
      resetToken, // Chỉ để test, trong production không trả token trực tiếp
      // Trong production: trả về message "Email sent" thay vì token
    };
  }

  /**
   * Reset mật khẩu với token
   * - Verify token
   * - Cập nhật mật khẩu mới
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // Verify token
      const payload = this.jwtService.verify(resetPasswordDto.token);

      if (payload.type !== 'reset') {
        throw new BadRequestException('Invalid reset token');
      }

      // Hash mật khẩu mới
      const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

      // Cập nhật mật khẩu
      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      });

      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('Invalid or expired reset token');
      }
      throw error;
    }
  }

  /**
   * Đổi mật khẩu (khi đã đăng nhập)
   * - Verify mật khẩu hiện tại
   * - Cập nhật mật khẩu mới
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // Lấy thông tin user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra mật khẩu hiện tại có đúng không
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash và cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
