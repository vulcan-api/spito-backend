import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateTokenDto } from './dto/createToken.dto';
import { sha512 } from 'js-sha512';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: DbService) {}

  async createToken(userId: number, dto: CreateTokenDto) {
    const token = sha512(Math.random().toString());
    await this.prisma.token.create({
      data: {
        userId,
        token: sha512(token).toString(),
        expiresAt: dto.expiresAt,
      },
    });
    return {
      token,
    };
  }
  async verifyToken(token: string) {
    const tokenFromDb = await this.prisma.token.findUnique({
      where: { token: sha512(token) },
    });
    if (!tokenFromDb || tokenFromDb.expiresAt < new Date()) {
      return false;
    }
    return true;
  }

  async getUserIdByToken(token: string) {
    const tokenFromDb = await this.prisma.token.findUnique({
      where: {
        token: sha512(token).toString(),
        expiresAt: { gte: new Date() },
      },
    });
    if (!tokenFromDb) {
      return null;
    }
    return tokenFromDb.userId;
  }
}
