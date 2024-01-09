import { HttpException, Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateRulesetDto } from './dto/createRuleset.dto';
import { parse } from 'yaml';
import { Prisma } from '@prisma/client';
import { UpdateRulesetDto } from './dto/updateRuleset.dto';

const RAW_GITHUB_CONTENT_URL = 'https://raw.githubusercontent.com';

@Injectable()
export class RulesetService {
  constructor(private readonly prisma: DbService) {}

  async getRulesets(
    search?: string,
    skip = 0,
    take = 10,
    requestedBy?: number,
  ) {
    const whereParams = {};

    if (search) {
      whereParams['OR'] = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const rulesets: any = await this.prisma.ruleset.findMany({
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
        rules: {
          select: {
            id: true,
            name: true,
            path: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      where: whereParams,
      skip,
      take,
    });

    for (const ruleset of rulesets) {
      const rules = await this.assignLikesToRules(ruleset.rules, requestedBy);
      ruleset.rules = rules;
      ruleset.tags = ruleset.rulesetTags.map((rulesetTag) => {
        return { id: rulesetTag.tag.id, name: rulesetTag.tag.name };
      });
      ruleset.rulesetTags = undefined;
    }

    return rulesets;
  }

  async getUserRulesets(
    userId: number,
    skip = 0,
    take = 10,
    requestedBy?: number,
  ) {
    const rulesets: any = await this.prisma.ruleset.findMany({
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
        rules: {
          select: {
            id: true,
            name: true,
            path: true,
            createdAt: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      where: {
        userId,
      },
      skip,
      take,
    });

    for (const ruleset of rulesets) {
      const rules = await this.assignLikesToRules(ruleset.rules, requestedBy);
      ruleset.rules = rules;
      ruleset.tags = ruleset.rulesetTags.map((rulesetTag) => {
        return { id: rulesetTag.tag.id, name: rulesetTag.tag.name };
      });
      ruleset.rulesetTags = undefined;
    }

    return rulesets;
  }

  async createRuleset(dto: CreateRulesetDto, userId: number) {
    const extractedRepoNameAndOwner = this.extractRepoName(dto.url);
    const rulesetYmlileUrl = `${RAW_GITHUB_CONTENT_URL}/${extractedRepoNameAndOwner}/${dto.branch}/spito-rules.yml`;
    const rulesetYamlFileUrl = `${RAW_GITHUB_CONTENT_URL}/${extractedRepoNameAndOwner}/${dto.branch}/spito-rules.yaml`;
    const rulesetYmlFileRes = await fetch(rulesetYmlileUrl);
    const rulesetYamlFileRes = await fetch(rulesetYamlFileUrl);
    if (!rulesetYmlFileRes.ok && !rulesetYamlFileRes.ok) {
      throw new HttpException(
        {
          statusCode: 404,
          message: 'Ruleset info file not found',
          error: 'Not Found',
        },
        404,
      );
    }
    let rulesetInfoFile = '';
    if (rulesetYmlFileRes.ok) {
      rulesetInfoFile = await rulesetYmlFileRes.text();
    } else {
      rulesetInfoFile = await rulesetYamlFileRes.text();
    }
    const parsedRulesetInfoFile = parse(rulesetInfoFile);
    let rulesetId = 0;
    try {
      const ruleset = await this.prisma.ruleset.create({
        data: {
          name: parsedRulesetInfoFile.identifier,
          description: dto.description,
          url: dto.url,
          branch: dto.branch,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
      rulesetId = ruleset.id;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            {
              statusCode: 409,
              message: 'Ruleset with this URL already exists',
              error: 'Conflict',
            },
            409,
          );
        }
      }
    }
    for (const [name, path] of Object.entries(parsedRulesetInfoFile.rules)) {
      try {
        await this.prisma.rule.create({
          data: {
            name,
            path: path as string,
            ruleset: {
              connect: {
                id: rulesetId,
              },
            },
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
    for (const tag of dto.tags) {
      const newTag = await this.prisma.tag.upsert({
        where: {
          name: tag,
        },
        update: {},
        create: {
          name: tag,
        },
      });

      await this.prisma.rulesetTag.create({
        data: {
          ruleset: {
            connect: {
              id: rulesetId,
            },
          },
          tag: {
            connect: {
              id: newTag.id,
            },
          },
        },
      });
    }
    return {
      message: 'Ruleset created successfully',
      status: 201,
    };
  }

  async getRulesetById(id: number, requestedBy?: number) {
    const ruleset = await this.prisma.ruleset.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        url: true,
        branch: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        rules: {
          select: {
            id: true,
            name: true,
            path: true,
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
    });

    const rules = await this.assignLikesToRules(ruleset.rules, requestedBy);
    return {
      ...ruleset,
      rulesetTags: undefined,
      tags: ruleset.rulesetTags.map((rulesetTag) => {
        return { id: rulesetTag.tag.id, name: rulesetTag.tag.name };
      }),
      rules,
    };
  }

  async updateRuleset(
    rulesetId: number,
    dto: UpdateRulesetDto,
    userId: number,
  ) {
    const ruleset = await this.getRulesetById(rulesetId);
    if (!ruleset) {
      throw new HttpException(
        {
          statusCode: 404,
          message: 'Ruleset not found',
          error: 'Not Found',
        },
        404,
      );
    }
    if (ruleset.user.id !== userId) {
      throw new HttpException(
        {
          statusCode: 403,
          message: 'You are not allowed to update this ruleset',
          error: 'Forbidden',
        },
        403,
      );
    }
    await this.prisma.ruleset.update({
      where: {
        id: rulesetId,
      },
      data: {
        description: dto.description,
      },
    });
    if (dto.updateRulesList) {
      await this.updateRulesList(rulesetId, userId);
    }
    await this.updateTags(rulesetId, dto.tags, userId);
    return {
      message: 'Ruleset updated successfully',
      status: 200,
    };
  }

  async updateRulesList(
    rulesetId: number,
    userId: number,
    isNewRuleset = false,
  ) {
    const ruleset = await this.getRulesetById(rulesetId);
    if (!ruleset) {
      throw new HttpException(
        {
          statusCode: 404,
          message: 'Ruleset not found',
          error: 'Not Found',
        },
        404,
      );
    }
    if (ruleset.user.id !== userId) {
      throw new HttpException(
        {
          statusCode: 403,
          message: 'You are not allowed to update this ruleset',
          error: 'Forbidden',
        },
        403,
      );
    }
    if (!isNewRuleset) {
      await this.prisma.rule.deleteMany({
        where: {
          rulesetId,
        },
      });
    }
    const extractedRepoNameAndOwner = this.extractRepoName(ruleset.url);
    const rulesetYmlileUrl = `${RAW_GITHUB_CONTENT_URL}/${extractedRepoNameAndOwner}/${ruleset.branch}/spito-rules.yml`;
    const rulesetYamlFileUrl = `${RAW_GITHUB_CONTENT_URL}/${extractedRepoNameAndOwner}/${ruleset.branch}/spito-rules.yaml`;
    const rulesetYmlFileRes = await fetch(rulesetYmlileUrl);
    const rulesetYamlFileRes = await fetch(rulesetYamlFileUrl);
    if (!rulesetYmlFileRes.ok && !rulesetYamlFileRes.ok) {
      throw new HttpException(
        {
          statusCode: 404,
          message: 'Ruleset info file not found',
          error: 'Not Found',
        },
        404,
      );
    }
    let rulesetInfoFile = '';
    if (rulesetYmlFileRes.ok) {
      rulesetInfoFile = await rulesetYmlFileRes.text();
    } else {
      rulesetInfoFile = await rulesetYamlFileRes.text();
    }
    await this.prisma.ruleset.update({
      where: {
        id: rulesetId,
      },
      data: {
        name: parse(rulesetInfoFile).identifier,
      },
    });
    const parsedRulesetInfoFile = parse(rulesetInfoFile);
    for (const [name, path] of Object.entries(parsedRulesetInfoFile.rules)) {
      try {
        await this.prisma.rule.create({
          data: {
            name,
            path: path as string,
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  async updateTags(rulesetId: number, tags: string[], userId: number) {
    const ruleset = await this.getRulesetById(rulesetId);
    if (!ruleset) {
      throw new HttpException(
        {
          statusCode: 404,
          message: 'Ruleset not found',
          error: 'Not Found',
        },
        404,
      );
    }
    if (ruleset.user.id !== userId) {
      throw new HttpException(
        {
          statusCode: 403,
          message: 'You are not allowed to update this ruleset',
          error: 'Forbidden',
        },
        403,
      );
    }
    await this.prisma.rulesetTag.deleteMany({
      where: {
        rulesetId,
      },
    });
    for (const tag of tags) {
      const newTag = await this.prisma.tag.upsert({
        where: {
          name: tag,
        },
        update: {},
        create: {
          name: tag,
        },
      });

      await this.prisma.rulesetTag.create({
        data: {
          ruleset: {
            connect: {
              id: rulesetId,
            },
          },
          tag: {
            connect: {
              id: newTag.id,
            },
          },
        },
      });
    }
  }

  async deleteRuleset(rulesetId: number, userId: number) {
    const ruleset = await this.getRulesetById(rulesetId);
    if (!ruleset) {
      throw new HttpException(
        {
          statusCode: 404,
          message: 'Ruleset not found',
          error: 'Not Found',
        },
        404,
      );
    }
    if (ruleset.user.id !== userId) {
      throw new HttpException(
        {
          statusCode: 403,
          message: 'You are not allowed to delete this ruleset',
          error: 'Forbidden',
        },
        403,
      );
    }
    await this.prisma.ruleset.delete({
      where: {
        id: rulesetId,
      },
    });
    return {
      message: 'Ruleset deleted successfully',
      status: 200,
    };
  }

  private extractRepoName(url: string) {
    if (url.endsWith('.git')) {
      url = url.substring(0, url.length - 4);
    }
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];
  }

  private async assignLikesToRules(rules: any, requestedBy: number) {
    const rulesWithLikes = [];
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
      rulesWithLikes.push(rule);
    }
    return rulesWithLikes;
  }
}
