import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RuleService } from './rule.service';
import { JwtAuthDto } from 'src/auth/dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/getUser.decorator';

@Controller('rule')
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @Get('search')
  async searchRules(@Query('search') search: string) {
    return await this.ruleService.searchRules(search);
  }

  @Get('user/:userId')
  async getUserRules(
    @Param('userId') userId: number,
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return await this.ruleService.getUserRules(userId, skip, take);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('like/:id')
  async likeOrDislikeRule(
    @Param('id') id: number,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.ruleService.likeOrDislikeRule(id, user.userId);
  }
}
