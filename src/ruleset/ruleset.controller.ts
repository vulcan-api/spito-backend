import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RulesetService } from './ruleset.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/getUser.decorator';
import { JwtAuthDto } from '../auth/dto';
import { CreateRulesetDto } from './dto/createRuleset.dto';
import { UpdateRulesetDto } from './dto/updateRuleset.dto';

@Controller('ruleset')
export class RulesetController {
  constructor(private readonly rulesetService: RulesetService) {}

  @Get()
  async getRulesets(
    @Query('search') search: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return await this.rulesetService.getRulesets(search, page, pageSize);
  }

  @Get('user/:userId')
  async getUserRulesets(
    @Param('userId') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return await this.rulesetService.getUserRulesets(userId, page, pageSize);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createRuleset(
    @Body() dto: CreateRulesetDto,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.rulesetService.createRuleset(dto, user.userId);
  }

  @Get(':id')
  async getRuleset(@Param('id') id: number) {
    return await this.rulesetService.getRulesetById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateRuleset(
    @Body() dto: UpdateRulesetDto,
    @GetUser() user: JwtAuthDto,
    @Param('id') id: number,
  ) {
    return await this.rulesetService.updateRuleset(id, dto, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteRuleset(@Param('id') id: number, @GetUser() user: JwtAuthDto) {
    return await this.rulesetService.deleteRuleset(id, user.userId);
  }
}
