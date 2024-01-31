import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class UserService {
  constructor(private prisma: DbService) {}

  async getPublicInformation(id: number): Promise<object> {
    const userPublicInformation: any = await this.prisma.user.findUniqueOrThrow(
      {
        where: { id },
        select: {
          username: true,
          description: true,
        },
      },
    );
    return userPublicInformation;
  }

  async getUserActivity(
    userId: number,
    from: Date,
    to: Date,
    requestedBy: number,
  ) {
    const data = await this.prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        rulesets: {
          select: {
            id: true,
            name: true,
          },
          where: {
            createdAt: {
              gte: new Date(from),
              lte: new Date(to),
            },
          },
        },
        Environment: {
          select: {
            id: true,
            isPrivate: true,
            name: true,
          },
          where: {
            createdAt: {
              gte: new Date(from),
              lte: new Date(to),
            },
          },
        },
      },
    });
    return {
      createdRulesets: data.rulesets,
      createdEnvironments: data.Environment.map((env) => {
        if (env.isPrivate) {
          return data.id === requestedBy && env;
        } else {
          return env;
        }
      }),
    };
  }
}
