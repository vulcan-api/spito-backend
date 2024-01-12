import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateTokenDto } from './dto/createToken.dto';
import { sha512 } from 'js-sha512';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: DbService) {}

  async getUsersTokens(userId: number) {
    return this.prisma.token.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        expiresAt: true,
      },
    });
  }

  async createToken(userId: number, dto: CreateTokenDto) {
    const token = crypto.randomBytes(32).toString('hex');
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

  async deleteToken(id: number, userId: number) {
    return this.prisma.token.delete({
      where: { id, userId },
    });
  }
}
