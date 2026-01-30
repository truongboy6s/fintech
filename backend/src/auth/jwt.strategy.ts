import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

// Interface định nghĩa cấu trúc payload trong token
export interface JwtPayload {
  userId: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ header
      ignoreExpiration: false,  // Token hết hạn thì reject
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // Key để giải mã
    });
  }

  // Hàm validate tự động chạy khi có request có token
  async validate(payload: JwtPayload) {
    // Kiểm tra user có tồn tại trong DB không
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException(); // User không tồn tại → 401
    }

    // Trả về thông tin user, lưu vào req.user
    return { userId: user.id, email: user.email };
  }
}

// Guard để bảo vệ endpoints
export class JwtAuthGuard extends AuthGuard('jwt') {}