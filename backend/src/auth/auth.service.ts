import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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
}
