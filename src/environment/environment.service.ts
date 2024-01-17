import { DbService } from '../db/db.service';
import { Injectable } from '@nestjs/common';
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

    for (const enviroment of environments) {
      enviroment.tags = enviroment.EnvironmentTags.map((enviromentTag) => {
        return {
          id: enviromentTag.tag.id,
          name: enviromentTag.tag.name,
        };
      });
      enviroment.EnvironmentTags = undefined;
      const { likes, isLiked } = await this.assignLikesToEnviroment(
        enviroment.id,
        requestedBy,
      );
      enviroment.likes = likes;
      enviroment.isLiked = isLiked;
    }
    return environments;
  }

  async getEnvironmentById(id: number, requestedBy?: number) {
    const environment: any = await this.prisma.environment.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
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
    environment.rules = environment.EnvironmentRules.map((enviromentRule) => {
      return {
        id: enviromentRule.rule.id,
        name: enviromentRule.rule.name,
        description: enviromentRule.rule.description,
        unsafe: enviromentRule.rule.unsafe,
        createdAt: enviromentRule.rule.createdAt,
        updatedAt: enviromentRule.rule.updatedAt,
      };
    });
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
    });
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
    }
    return environments;
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
    return await this.prisma.environment.update({
      where: { id, userId },
      data: {
        name: data.name,
        description: data.description,
      },
    });
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
}
