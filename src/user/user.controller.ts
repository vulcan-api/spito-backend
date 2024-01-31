import { Controller, Param, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { JwtAuthDto } from 'src/auth/dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optionalJwtAuth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async getPublicInformation(@Param('userId') userId: number) {
    return await this.userService.getPublicInformation(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('activity/:userId')
  async getUserActivity(
    @Param('userId') userId: number,
    @Query('from')
    from = new Date(new Date().setMonth(new Date().getMonth() - 1)),
    @Query('to') to = new Date(),
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.userService.getUserActivity(
      userId,
      from,
      to,
      user.userId,
    );
  }
}
