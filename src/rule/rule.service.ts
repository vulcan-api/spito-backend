import { DbService } from './../db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RuleService {
  constructor(private readonly prisma: DbService) {}

  async getUserRules(userId: number, skip = 0, take = 10, requestedBy: number) {
    const rules: any = await this.prisma.rule.findMany({
      where: { ruleset: { userId } },
      select: {
        id: true,
        name: true,
        description: true,
        unsafe: true,
        createdAt: true,
        updatedAt: true,
        ruleset: {
          select: {
            id: true,
            name: true,
            description: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      skip,
      take,
    });
    for (const rule of rules) {
      const likes = await this.prisma.likedRules.count({
        where: { ruleId: rule.id },
      });
      rule.likes = likes;
      if (requestedBy) {
        const liked = await this.prisma.likedRules.findFirst({
          where: { ruleId: rule.id, userId: requestedBy },
        });
        rule.isLiked = !!liked;
      }
    }
    return rules;
  }

  async likeOrDislikeRule(ruleId: number, userId: number) {
    const like = await this.prisma.likedRules.findFirst({
      where: { ruleId, userId },
    });

    if (like) {
      await this.prisma.likedRules.delete({ where: { id: like.id } });
      return {
        message: 'Rule unliked',
        status: 200,
      };
    } else {
      await this.prisma.likedRules.create({
        data: { ruleId, userId },
      });
      return {
        message: 'Rule liked',
        status: 200,
      };
    }
  }

  async searchRules(search: string, skip = 0, take = 10, requestedBy: number) {
    const rules: any = await this.prisma.rule.findMany({
      where: { name: { contains: search } },
      select: {
        id: true,
        name: true,
        description: true,
        unsafe: true,
        createdAt: true,
        updatedAt: true,
        ruleset: {
          select: {
            id: true,
            name: true,
            description: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      skip,
      take,
    });

    for (const rule of rules) {
      const likes = await this.prisma.likedRules.count({
        where: { ruleId: rule.id },
      });
      rule.likes = likes;
      if (requestedBy) {
        const liked = await this.prisma.likedRules.findFirst({
          where: { ruleId: rule.id, userId: requestedBy },
        });
        rule.isLiked = !!liked;
      }
    }
    return rules;
  }
}
