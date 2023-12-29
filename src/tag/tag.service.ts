import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class TagService {
  constructor(private readonly prisma: DbService) {}

  async getAllTags() {
    return await this.prisma.tag.findMany();
  }
}
