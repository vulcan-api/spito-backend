import { Controller, Param, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:userId')
  async getPublicInformation(@Param('userId') userId: number) {
    return this.userService.getPublicInformation(userId);
  }
}
