import { Controller, Param, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:userId')
  async getPublicInformation(@Param('userId') userId: number) {
    return this.userService.getPublicInformation(userId);
  }
}
