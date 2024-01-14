import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/getUser.decorator';
import { JwtAuthDto } from '../auth/dto';
import { CreateTokenDto } from './dto/createToken.dto';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createToken(@Body() dto: CreateTokenDto, @GetUser() user: JwtAuthDto) {
    return await this.tokenService.createToken(user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUsersTokens(@GetUser() user: JwtAuthDto) {
    return await this.tokenService.getUsersTokens(user.userId);
  }

  @Get('verify/:token')
  async verifyToken(@Param('token') token: string) {
    return await this.tokenService.verifyToken(token);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteToken(@GetUser() user: JwtAuthDto, @Param('id') id: number) {
    return await this.tokenService.deleteToken(+id, user.userId);
  }
}
