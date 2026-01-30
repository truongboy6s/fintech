import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Patch('me')
  updateProfile(@Request() req, @Body() updateData: { name?: string; email?: string }) {
    return this.usersService.update(req.user.userId, updateData);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.usersService.getStats(req.user.userId);
  }
}
