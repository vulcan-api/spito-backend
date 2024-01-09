import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: DbService) {}

  async search(query: string, requestedBy?: number) {
    const dataToReturn = {};
    const exactMatch = [];
    const rulesTransactions = [];
    const isLikedTransactions = [];
    const [rules, rulesets, users]: any = await this.prisma.$transaction([
      this.prisma.rule.findMany({
        where: { name: { contains: query } },
      }),
      this.prisma.ruleset.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          url: true,
          createdAt: true,
          updatedAt: true,
          rulesetTags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        where: {
          name: { contains: query },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.findMany({
        where: { username: { contains: query } },
        select: {
          id: true,
          username: true,
        },
      }),
    ]);

    for (const rule of rules) {
      rulesTransactions.push(
        this.prisma.likedRules.count({
          where: { ruleId: rule.id },
        }),
      );
      if (requestedBy) {
        isLikedTransactions.push(
          this.prisma.likedRules.findFirst({
            where: { ruleId: rule.id, userId: requestedBy },
          }),
        );
      }
    }

    const rulesResults = await this.prisma.$transaction(rulesTransactions);
    const isLikedResults = await this.prisma.$transaction(isLikedTransactions);
    for (const result of rulesResults) {
      rules[rulesResults.indexOf(result)].likes = result;
    }
    for (const result of isLikedResults) {
      rules[isLikedResults.indexOf(result)].isLiked = result ? true : false;
    }

    if (rules.some((rule) => rule.name === query)) {
      exactMatch.push({
        ...rules.find((rule) => rule.name === query),
        type: 'rule',
      });
      dataToReturn['rules'] = rules.filter((rule) => rule.name !== query);
    } else {
      dataToReturn['rules'] = rules;
    }

    for (const ruleset of rulesets) {
      ruleset.tags = ruleset.rulesetTags.map((rulesetTag) => {
        return { id: rulesetTag.tag.id, name: rulesetTag.tag.name };
      });
      ruleset.rulesetTags = undefined;
    }

    if (rulesets.some((ruleset) => ruleset.name === query)) {
      exactMatch.push({
        ...rulesets.find((ruleset) => ruleset.name === query),
        type: 'ruleset',
      });
      dataToReturn['rulesets'] = rulesets.filter(
        (ruleset) => ruleset.name !== query,
      );
    } else {
      dataToReturn['rulesets'] = rulesets;
    }

    if (users.some((user) => user.username === query)) {
      exactMatch.push({
        ...users.find((user) => user.username === query),
        type: 'user',
      });
      dataToReturn['users'] = users.filter((user) => user.username !== query);
    } else {
      dataToReturn['users'] = users;
    }

    dataToReturn['topResults'] = exactMatch;
    return dataToReturn;
  }
}
