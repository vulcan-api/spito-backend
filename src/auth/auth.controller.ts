import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { IsTakenDto, JwtAuthDto } from './dto';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/getUser.decorator';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('isTaken')
  async isTaken(dto: IsTakenDto): Promise<boolean> {
    return this.authService.isTaken(dto.username, dto.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('password/change')
  async changePassword(
    @Body() data: ChangePasswordDto,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.authService.changePassword(data, user.userId);
  }
}
