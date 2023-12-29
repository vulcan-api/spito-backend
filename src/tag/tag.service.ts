import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class TagService {
  constructor(private readonly prisma: DbService) {}

  async searchTags(search: string, take = 10) {
    const exactMatch: any = await this.prisma.tag.findFirst({
      where: { name: search },
    });
    const partialMatchCount = await this.prisma.rulesetTag.groupBy({
      by: ['tagId'],
      _count: true,
      orderBy: {
        _count: {
          tagId: 'desc',
        },
      },
      where: { tag: { name: { startsWith: search } } },
      take: take - (exactMatch ? 1 : 0),
    });
    const partialMatch: any = await this.prisma.tag.findMany({
      where: { id: { in: partialMatchCount.map((t) => t.tagId) } },
    });
    if (exactMatch) {
      exactMatch.usageCount = partialMatchCount.find(
        (t) => t.tagId === exactMatch.id,
      )._count;
    }
    partialMatch.map((tag) => {
      tag.usageCount = partialMatchCount.find((t) => t.tagId === tag.id)._count;
    });
    return {
      tags: [...(exactMatch ? [exactMatch] : []), ...partialMatch].filter(
        (tag, index, self) =>
          self.findIndex((t) => t.name === tag.name) === index,
      ),
    };
  }
}
