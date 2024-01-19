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
    const [rules, rulesets, users, environments]: any =
      await this.prisma.$transaction([
        this.prisma.rule.findMany({
          where: { name: { contains: query } },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            ruleset: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.ruleset.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            url: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
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
        this.prisma.environment.findMany({
          where: { name: { contains: query } },
          select: {
            id: true,
            name: true,
            description: true,
            isPrivate: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            EnvironmentTags: {
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

    const environmentTransactions = [];
    const isLikedEnvironmentTransactions = [];

    for (const environment of environments) {
      environmentTransactions.push(
        this.prisma.likedEnvironment.count({
          where: { environmentId: environment.id },
        }),
      );
      if (requestedBy) {
        isLikedEnvironmentTransactions.push(
          this.prisma.likedEnvironment.findFirst({
            where: { environmentId: environment.id, userId: requestedBy },
          }),
        );
      }
    }

    const environmentResults = await this.prisma.$transaction(
      environmentTransactions,
    );
    const isLikedEnvironmentResults = await this.prisma.$transaction(
      isLikedEnvironmentTransactions,
    );

    for (const result of environmentResults) {
      environments[environmentResults.indexOf(result)].likes = result;
    }

    for (const result of isLikedEnvironmentResults) {
      environments[isLikedEnvironmentResults.indexOf(result)].isLiked = result
        ? true
        : false;
    }
    for (const environment of environments) {
      environment.tags = environment.EnvironmentTags.map((environmentTag) => {
        return { id: environmentTag.tag.id, name: environmentTag.tag.name };
      });
      environment.EnvironmentTags = undefined;
    }

    if (environments.some((environment) => environment.name === query)) {
      exactMatch.push({
        ...environments.find((environment) => environment.name === query),
        type: 'environment',
      });
      dataToReturn['environments'] = environments.filter(
        (environment) => environment.name !== query,
      );
    } else {
      dataToReturn['environments'] = environments;
    }

    dataToReturn['topResults'] = exactMatch;
    return dataToReturn;
  }
}
