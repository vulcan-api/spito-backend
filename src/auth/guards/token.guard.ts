import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from '../../token/token.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (!req.headers.authorization) {
      return false;
    }
    const token = req.headers.authorization.split(' ')[1];

    const isValid = await this.tokenService.internalVerifyToken(token);
    return isValid;
  }
}
