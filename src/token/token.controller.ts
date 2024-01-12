import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/getUser.decorator';
import { JwtAuthDto } from '../auth/dto';
import { CreateTokenDto } from './dto/createToken.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  async createToken(@Body() dto: CreateTokenDto, @GetUser() user: JwtAuthDto) {
    return await this.tokenService.createToken(user.userId, dto);
  }
}
