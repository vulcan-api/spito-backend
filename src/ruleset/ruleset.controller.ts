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
import { OptionalJwtAuthGuard } from '../auth/guards/optionalJwtAuth.guard';
import { TokenGuard } from '../auth/guards/token.guard';
import { GetToken } from '../auth/decorator/getToken.decorator';

@Controller('ruleset')
export class RulesetController {
  constructor(private readonly rulesetService: RulesetService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getRulesets(
    @Query('search') search: string,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.rulesetService.getRulesets(
      search,
      +skip,
      +take,
      user.userId,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('user/:userId')
  async getUserRulesets(
    @Param('userId') userId: number,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.rulesetService.getUserRulesets(
      userId,
      +skip,
      +take,
      user.userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createRuleset(
    @Body() dto: CreateRulesetDto,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.rulesetService.createRuleset(dto, user.userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getRuleset(@Param('id') id: number, @GetUser() user: JwtAuthDto) {
    return await this.rulesetService.getRulesetById(id, user.userId);
  }

  @UseGuards(TokenGuard)
  @Post('publish')
  async publishRules(@Body() dto: any, @GetToken() token: string) {
    return await this.rulesetService.publishRules(dto, token);
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
