import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RuleService } from './rule.service';
import { JwtAuthDto } from 'src/auth/dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/getUser.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optionalJwtAuth.guard';

@Controller('rule')
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get('search')
  async searchRules(
    @Query('search') search: string,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.ruleService.searchRules(search, skip, take, user.userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('user/:userId')
  async getUserRules(
    @Param('userId') userId: number,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.ruleService.getUserRules(
      userId,
      +skip,
      +take,
      user.userId,
    );
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
