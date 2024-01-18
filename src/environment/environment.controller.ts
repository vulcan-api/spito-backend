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
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { JwtAuthDto } from 'src/auth/dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optionalJwtAuth.guard';
import { EnvironmentService } from './environment.service';
import { AuthGuard } from '@nestjs/passport';
import { EnvironmentDto } from './dto/enviroment.dto';
import { AddRuleToEnvironmentDto } from './dto/addRuleToEnvironment.dto';

@Controller('environment')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getAllEnvironments(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.getAllEnvironments(
      skip,
      take,
      user.userId,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getEnvironmentById(
    @Param('id') id: number,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.getEnvironmentById(id, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/like')
  async likeOrDislikeEnvironment(
    @Param('id') id: number,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.likeOrDislikeEnvironment(
      id,
      user.userId,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('user/:id')
  async getUserEnvironments(
    @Param('id') id: number,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.getUserEnvironments(id, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createEnvironment(
    @Body() data: EnvironmentDto,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.createEnvironment(data, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/rules/add')
  async addRuleToEnvironment(
    @Param('id') id: number,
    @Body() data: AddRuleToEnvironmentDto,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.addRuleToEnvironment(
      id,
      data.ruleId,
      user.userId,
    );
  }

  @Put(':id')
  async updateEnvironment(
    @Param('id') id: number,
    @Body() data: EnvironmentDto,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.updateEnvironment(
      id,
      data,
      user.userId,
    );
  }

  @Delete(':id')
  async deleteEnvironment(
    @Param('id') id: number,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.deleteEnvironment(id, user.userId);
  }
}
