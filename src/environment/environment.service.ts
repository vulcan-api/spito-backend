import { DbService } from '../db/db.service';
import { HttpException, Injectable } from '@nestjs/common';
import { EnvironmentDto } from './dto/enviroment.dto';

@Injectable()
export class EnvironmentService {
  constructor(private readonly prisma: DbService) {}

  async getAllEnvironments(
    skip = 1,
    take = 10,
    tags: string[],
    search?: string,
    orderBy?: string,
    descending?: boolean,
    requestedBy?: number,
  ) {
    const whereParams = {};
    const orderParams = {};
    if (tags && tags.length > 0) {
      const environmentWithTags = await this.prisma.environmentTags.findMany({
        where: {
          tag: {
            name: {
              in: tags,
            },
          },
        },
        select: {
          environment: {
            select: {
              id: true,
            },
          },
        },
      });
      const environmentIds = environmentWithTags.map(
        (environment) => environment.environment.id,
      );
      whereParams['id'] = {
        in: environmentIds,
      };
    }
    if (search) {
      whereParams['OR'] = [
        {
          name: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ];
    }
    whereParams['isPrivate'] = false;
    if (orderBy) {
      if (orderBy === 'downloads') {
        orderParams['DownloadedEnvironment'] = {
          _count: descending ? 'desc' : 'asc',
        };
      } else if (orderBy === 'likes') {
        orderParams['LikedEnvironments'] = {
          _count: descending ? 'desc' : 'asc',
        };
      } else if (orderBy === 'saves') {
        orderParams['SavedEnvironment'] = {
          _count: descending ? 'desc' : 'asc',
        };
      }
    }
    const environments = await this.getEnvironments(
      +skip,
      +take,
      requestedBy,
      whereParams,
      orderParams,
    );
    const environmentsCount = await this.prisma.environment.count({
      where: whereParams,
    });

    return {
      data: environments,
      count: environmentsCount,
    };
  }

  async getTrendingEnvironments(skip = 1, take = 10, requestedBy?: number) {
    const environmentsCount = await this.prisma.downloadedEnvironment.groupBy({
      by: ['environmentId'],
      _count: {
        environmentId: true,
      },
      orderBy: {
        _count: {
          environmentId: 'desc',
        },
      },
      where: {
        environment: {
          isPrivate: false,
        },
        createdAt: {
          gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      skip,
      take,
    });
    const whereParams = {
      id: {
        in: environmentsCount.map((env) => env.environmentId),
      },
    };
    return await this.getEnvironments(
      0,
      environmentsCount.length,
      requestedBy,
      whereParams,
    );
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
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        LikedEnvironments: {
          select: {
            id: true,
            environmentId: true,
            userId: true,
          },
        },
        SavedEnvironment: {
          select: {
            id: true,
            environmentId: true,
            userId: true,
          },
        },
        DownloadedEnvironment: {
          select: {
            id: true,
            environmentId: true,
            userId: true,
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
                LikedRules: {
                  select: {
                    id: true,
                    ruleId: true,
                    userId: true,
                  },
                },
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
    environment.likes = environment.LikedEnvironments.length;
    environment.saves = environment.SavedEnvironment.length;
    environment.downloads = environment.DownloadedEnvironment.length;
    if (requestedBy) {
      environment.isSaved = environment.SavedEnvironment.some(
        (save) => save.userId === requestedBy,
      );
      environment.isLiked = environment.LikedEnvironments.some(
        (like) => like.userId === requestedBy,
      );
    }
    const rules = [];
    for (const rule of environment.EnvironmentRules) {
      const likes = rule.rule.LikedRules.length;
      if (requestedBy) {
        const liked = rule.rule.LikedRules.some(
          (like) => like.userId === requestedBy,
        );
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
    environment.SavedEnvironment = undefined;
    environment.LikedEnvironments = undefined;
    environment.DownloadedEnvironment = undefined;
    return environment;
  }

  async getUserEnvironments(
    userId: number,
    skip = 0,
    take = 10,
    requestedBy?: number,
  ) {
    return await this.getEnvironments(skip, take, requestedBy, {
      userId,
    });
  }

  async getUserSavedEnvironments(userId: number) {
    return await this.getEnvironments(0, 100, userId, {
      SavedEnvironment: {
        some: {
          userId,
        },
      },
    });
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

  async saveOrUnsaveEnvironment(environmentId: number, userId: number) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new HttpException('Environment not found', 404);
    }

    const saved = await this.prisma.savedEnvironment.findFirst({
      where: { environmentId, userId },
    });

    if (saved) {
      await this.prisma.savedEnvironment.delete({
        where: { id: saved.id },
      });
      return {
        message: 'Environment unsaved',
      };
    }

    await this.prisma.savedEnvironment.create({
      data: {
        environmentId,
        userId,
      },
    });
    return {
      message: 'Environment saved',
    };
  }

  async downloadEnvironment(environmentId: number, userId: number) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new HttpException('Environment not found', 404);
    }

    await this.prisma.downloadedEnvironment.create({
      data: {
        environmentId,
        userId,
      },
    });
    return {
      message: 'Environment downloaded',
    };
  }

  async deleteEnvironment(id: number, userId: number) {
    return await this.prisma.environment.delete({
      where: { id, userId },
    });
  }

  async updateLogo(logoFile: Express.Multer.File, enviromentId: number) {
    return await this.prisma.environment.update({
      where: { id: enviromentId },
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

  private async getEnvironments(
    skip: number,
    take: number,
    requestedBy?: number,
    whereParams?: any,
    orderParams?: any,
  ) {
    const environments: any = await this.prisma.environment.findMany({
      where: whereParams,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        isPrivate: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        LikedEnvironments: {
          select: {
            id: true,
            environmentId: true,
            userId: true,
          },
        },
        SavedEnvironment: {
          select: {
            id: true,
            environmentId: true,
            userId: true,
          },
        },
        DownloadedEnvironment: {
          select: {
            id: true,
            environmentId: true,
            userId: true,
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
      orderBy: orderParams,
      skip,
      take,
    });
    const environmentsToReturn = [];

    for (const environment of environments) {
      environment.tags = environment.EnvironmentTags.map((enviromentTag) => {
        return {
          id: enviromentTag.tag.id,
          name: enviromentTag.tag.name,
        };
      });
      environment.EnvironmentTags = undefined;
      environment.likes = environment.LikedEnvironments.length;
      environment.saves = environment.SavedEnvironment.length;
      environment.downloads = environment.DownloadedEnvironment.length;
      environment.isSaved = environment.SavedEnvironment.some(
        (save) => save.userId === requestedBy,
      );
      environment.isLiked = environment.LikedEnvironments.some(
        (like) => like.userId === requestedBy,
      );
      if (environment.isPrivate && environment.user.id !== requestedBy) {
        continue;
      }
      environment.SavedEnvironment = undefined;
      environment.LikedEnvironments = undefined;
      environment.DownloadedEnvironment = undefined;
      environmentsToReturn.push(environment);
    }
    return environmentsToReturn;
  }

  getEnvironmentLogo(id: number): Promise<Buffer | null> {
    return this.prisma.environment
      .findUniqueOrThrow({
        where: { id: id },
        select: { logo: true },
      })
      .then((env) => env.logo);
  }
}
