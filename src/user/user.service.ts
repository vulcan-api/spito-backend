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
}
