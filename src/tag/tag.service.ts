import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class TagService {
  constructor(private readonly prisma: DbService) {}

  async searchTags(search: string) {
    const exactMatch = await this.prisma.tag.findFirst({
      where: { name: search },
    });
    const partialMatch = await this.prisma.tag.findMany({
      where: { name: { contains: search } },
      orderBy: { name: 'asc' },
    });
    return {
      tags: [...(exactMatch ? [exactMatch] : []), ...partialMatch].filter(
        (tag, index, self) =>
          self.findIndex((t) => t.name === tag.name) === index,
      ),
    };
  }
}
