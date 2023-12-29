import { Controller, Get, Query } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async searchTags(@Query('search') search: string) {
    return await this.tagService.searchTags(search);
  }
}
