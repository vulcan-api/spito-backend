import { DbService } from '../db/db.service';
import { HttpException, Injectable } from '@nestjs/common';
import { EnvironmentDto } from './dto/enviroment.dto';

@Injectable()
export class EnvironmentService {
  constructor(private readonly prisma: DbService) {}

  async getAllEnvironments(skip = 1, take = 10, requestedBy?: number) {
    const environments: any = await this.prisma.environment.findMany({
      skip,
      take,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        isPrivate: true,
        logo: true,
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
    });
    const enviromentsTransactions = [];
    const isLikedTransactions = [];
    for (const environment of environments) {
      enviromentsTransactions.push(
        this.prisma.likedEnvironment.count({
          where: { environmentId: environment.id },
        }),
      );
      if (requestedBy) {
        isLikedTransactions.push(
          this.prisma.likedEnvironment.findFirst({
            where: { environmentId: environment.id, userId: requestedBy },
          }),
        );
      }
    }
    const enviromentResults = await this.prisma.$transaction(
      enviromentsTransactions,
    );
    const isLikedResults = await this.prisma.$transaction(isLikedTransactions);
    for (const result of enviromentResults) {
      environments[enviromentResults.indexOf(result)].likes = result;
    }
    for (const result of isLikedResults) {
      environments[isLikedResults.indexOf(result)].isLiked = result
        ? true
        : false;
    }
    const environmentsToReturn = [];

    for (const environment of environments) {
      environment.tags = environment.EnvironmentTags.map((enviromentTag) => {
        return {
          id: enviromentTag.tag.id,
          name: enviromentTag.tag.name,
        };
      });
      environment.EnvironmentTags = undefined;
      const { likes, isLiked } = await this.assignLikesToEnviroment(
        environment.id,
        requestedBy,
      );
      environment.likes = likes;
      environment.isLiked = isLiked;
      if (environment.isPrivate && environment.user.id !== requestedBy) {
        continue;
      }
      environmentsToReturn.push(environment);
    }
    return environmentsToReturn;
  }

  async getEnvironmentById(id: number, requestedBy?: number) {
    const environment: any = await this.prisma.environment.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
        logo: true,
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
        EnvironmentRules: {
          select: {
            rule: {
              select: {
                id: true,
                name: true,
                description: true,
                unsafe: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });
    if (
      !environment ||
      (environment.isPrivate && environment.user.id !== requestedBy)
    ) {
      throw new HttpException('Environment not found', 404);
    }
    environment.tags = environment.EnvironmentTags.map((tag) => {
      return {
        id: tag.tag.id,
        name: tag.tag.name,
      };
    });
    environment.EnvironmentTags = undefined;
    const { likes, isLiked } = await this.assignLikesToEnviroment(
      environment.id,
      requestedBy,
    );
    environment.likes = likes;
    environment.isLiked = isLiked;
    const rules = [];
    for (const rule of environment.EnvironmentRules) {
      const likes = await this.prisma.likedRules.count({
        where: { ruleId: rule.rule.id },
      });
      if (requestedBy) {
        const liked = await this.prisma.likedRules.findFirst({
          where: { ruleId: rule.rule.id, userId: requestedBy },
        });
        rules.push({
          id: rule.rule.id,
          name: rule.rule.name,
          description: rule.rule.description,
          unsafe: rule.rule.unsafe,
          createdAt: rule.rule.createdAt,
          updatedAt: rule.rule.updatedAt,
          likes,
          isLiked: !!liked,
        });
      } else {
        rules.push({
          id: rule.rule.id,
          name: rule.rule.name,
          description: rule.rule.description,
          unsafe: rule.rule.unsafe,
          createdAt: rule.rule.createdAt,
          updatedAt: rule.rule.updatedAt,
          likes,
        });
      }
    }
    environment.rules = rules;
    environment.EnvironmentRules = undefined;
    return environment;
  }

  async getUserEnvironments(userId: number, requestedBy?: number) {
    const environments: any = await this.prisma.environment.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
        logo: true,
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
    });
    const environmentsToReturn = [];
    for (const environment of environments) {
      environment.tags = environment.EnvironmentTags.map((tag) => {
        return {
          id: tag.tag.id,
          name: tag.tag.name,
        };
      });
      environment.EnvironmentTags = undefined;
      const { likes, isLiked } = await this.assignLikesToEnviroment(
        environment.id,
        requestedBy,
      );
      environment.likes = likes;
      environment.isLiked = isLiked;
      if (environment.isPrivate && environment.user.id !== requestedBy) {
        continue;
      }
      environmentsToReturn.push(environment);
    }
    return environmentsToReturn;
  }

  async createEnvironment(data: EnvironmentDto, userId: number) {
    const environment = await this.prisma.environment.create({
      data: {
        name: data.name,
        description: data.description,
        userId,
      },
    });

    for (const tag of data.tags) {
      const newTag = await this.prisma.tag.upsert({
        where: {
          name: tag,
        },
        update: {},
        create: {
          name: tag,
        },
      });

      await this.prisma.environmentTags.create({
        data: {
          environment: {
            connect: {
              id: environment.id,
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
    return environment;
  }

  async updateEnvironment(id: number, data: EnvironmentDto, userId: number) {
    if (data.tags.length > 0) {
      await this.updateTags(id, data.tags);
    }
    await this.prisma.environment.update({
      where: { id, userId },
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
      },
    });
    return {
      message: 'Environment updated',
    };
  }

  async addRuleToEnvironment(
    environmentId: number,
    ruleId: number,
    userId: number,
  ) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (environment.userId !== userId) {
      throw new HttpException('You are not owner of this environment', 403);
    }
    try {
      await this.prisma.environmentRules.create({
        data: {
          environmentId,
          ruleId,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new HttpException('Rule already added to this environment', 409);
      }
    }
    return {
      message: 'Rule added to environment',
    };
  }

  async deleteRuleFromEnvironment(
    environmentId: number,
    ruleId: number,
    userId: number,
  ) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment || environment.userId !== userId) {
      throw new HttpException('Environment not found', 404);
    }

    await this.prisma.environmentRules.deleteMany({
      where: {
        environmentId,
        ruleId,
      },
    });

    return {
      message: 'Rule deleted from the environment',
    };
  }

  async likeOrDislikeEnvironment(environmentId: number, userId: number) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new HttpException('Environment not found', 404);
    }

    const liked = await this.prisma.likedEnvironment.findFirst({
      where: { environmentId, userId },
    });

    if (liked) {
      await this.prisma.likedEnvironment.delete({
        where: { id: liked.id },
      });
      return {
        message: 'Environment disliked',
      };
    }

    await this.prisma.likedEnvironment.create({
      data: {
        environmentId,
        userId,
      },
    });
    return {
      message: 'Environment liked',
    };
  }

  async deleteEnvironment(id: number, userId: number) {
    return await this.prisma.environment.delete({
      where: { id, userId },
    });
  }

  private async assignLikesToEnviroment(
    environmentId: number,
    requestedBy?: number,
  ) {
    const likes = await this.prisma.likedEnvironment.count({
      where: { environmentId },
    });
    if (requestedBy) {
      const liked = await this.prisma.likedEnvironment.findFirst({
        where: { environmentId, userId: requestedBy },
      });
      return {
        likes,
        isLiked: !!liked,
      };
    }
    return {
      likes,
    };
  }

  async updateLogo(logoFile: Express.Multer.File, userId: number) {
    return await this.prisma.environment.update({
      where: { id: userId },
      data: { logo: logoFile.buffer },
    });
  }

  async updateTags(environmentId: number, tags: string[]) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });
    if (!environment) {
      throw new HttpException(
        {
          statusCode: 404,
          message: 'Environment not found',
          error: 'Not Found',
        },
        404,
      );
    }
    await this.prisma.environmentTags.deleteMany({
      where: {
        environmentId,
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

      await this.prisma.environmentTags.create({
        data: {
          environment: {
            connect: {
              id: environmentId,
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
}
