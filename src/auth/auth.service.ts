import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { JwtAuthDto, LoginDto, RegisterDto } from './dto';
import { DbService } from '../db/db.service';
import { sha512 } from 'js-sha512';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DbService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: RegisterDto): Promise<object> {
    const isTaken = await this.isTaken(dto.username, dto.email);
    if (isTaken) throw new ForbiddenException('Username or email is taken!');

    await this.prisma.user.create({
      data: {
        username: dto.username,
        password: sha512(dto.password),
        email: dto.email,
      },
    });
    return { msg: 'Successfully registered a new account!' };
  }

  async login(dto: LoginDto): Promise<object> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || (user && !(sha512(dto.password) === user.password))) {
      throw new HttpException('Wrong credentials!', 403);
    }

    const roles = await this.prisma.roles.findMany({
      where: { userId: user.id },
      select: { role: true },
    });

    const jwt = await this.generateAuthJwt({
      userId: user.id,
      roles: roles.map((role) => role.role),
    });

    return {
      token: jwt,
      userInfo: await this.getUserPublicInfo(dto.email),
    };
  }

  async isTaken(username: string, email: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    return Boolean(user);
  }

  async generateAuthJwt(payload: JwtAuthDto): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async getUserPublicInfo(email: string): Promise<object> {
    const { prisma } = this;
    const userPublicInfo: any = await prisma.user.findUniqueOrThrow({
      where: {
        email,
      },
      select: {
        id: true,
        username: true,
      },
    });
    const roles = await prisma.roles.findMany({
      where: {
        userId: userPublicInfo.id,
      },
      select: {
        role: true,
      },
    });
    userPublicInfo.roles = roles.map((role) => role.role);
    return userPublicInfo;
  }
}
