import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthDto } from 'src/auth/dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optionalJwtAuth.guard';
import { SearchService } from './search.service';
import { GetUser } from 'src/auth/decorator/getUser.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async search(@Query('query') query: string, @GetUser() user: JwtAuthDto) {
    return this.searchService.search(query, user.userId);
  }
}
