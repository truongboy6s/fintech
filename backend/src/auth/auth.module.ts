import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,      // Để dùng PrismaService
    PassportModule,    // Để dùng JWT strategy
    JwtModule.register({
      secret: process.env.JWT_SECRET,  // Key mã hóa token
      signOptions: { expiresIn: '7d' }, // Token hết hạn sau 7 ngày
    }),
  ],
  controllers: [AuthController],  // Đăng ký controller
  providers: [AuthService, JwtStrategy],  // Đăng ký service và strategy
  exports: [AuthService],  // Export để module khác dùng
})
export class AuthModule {}
