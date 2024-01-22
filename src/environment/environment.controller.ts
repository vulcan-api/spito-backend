import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { JwtAuthDto } from 'src/auth/dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optionalJwtAuth.guard';
import { EnvironmentService } from './environment.service';
import { AuthGuard } from '@nestjs/passport';
import { EnvironmentDto } from './dto/enviroment.dto';
import { AddRuleToEnvironmentDto } from './dto/addRuleToEnvironment.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './fileFilter';

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

  @UseGuards(AuthGuard('jwt'))
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

  @Put(':id/logo')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }], {
      fileFilter: fileFilter,
    }),
  )
  @UseGuards(AuthGuard('jwt'))
  async updateAvatar(
    @GetUser() user: JwtAuthDto,
    @UploadedFiles() files: { logo: Express.Multer.File[] },
  ): Promise<void> {
    await this.environmentService.updateLogo(files.logo[0], user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/rules/:ruleId')
  async deleteRuleFromEnvironment(
    @Param('id') id: number,
    @Param('ruleId') ruleId: number,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.deleteRuleFromEnvironment(
      id,
      ruleId,
      user.userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteEnvironment(
    @Param('id') id: number,
    @GetUser() user: JwtAuthDto,
  ) {
    return await this.environmentService.deleteEnvironment(id, user.userId);
  }
}
