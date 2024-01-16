import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { DbService } from '../../db/db.service';
import { AuthService } from '../auth.service';

@Injectable()
export class TotpService {
  constructor(
    private readonly prisma: DbService,
    private readonly authService: AuthService,
  ) {}
  async getQrCodeUrl(): Promise<{ url: string | undefined }> {
    const secret = speakeasy.generateSecret({
      name: 'SPITO',
    });

    return {
      url: secret.otpauth_url,
    };
  }

  async verify(email: string, userToken: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        email,
      },
      select: {
        totpSecret: true,
        Roles: {
          select: {
            role: true,
          },
        },
        id: true,
      },
    });

    if (
      !speakeasy.totp.verify({
        secret: user.totpSecret ?? '',
        encoding: 'base32',
        token: userToken,
      })
    )
      throw new HttpException(
        'The TOTP code is incorrect!',
        HttpStatus.NOT_FOUND,
      );

    return await this.authService.generateAuthJwt({
      userId: user.id,
      roles: user.Roles.map((role) => role.role),
    });
  }
  async is2faEnabled(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    return !!user.totpSecret;
  }
  async remove2FA(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        totpSecret: null,
      },
    });
  }

  async confirm(userId: number, secret: string, code: string) {
    if (
      !speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
      })
    )
      throw new HttpException(
        'The TOTP code is incorrect!',
        HttpStatus.NOT_FOUND,
      );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: secret,
      },
    });
  }
}
