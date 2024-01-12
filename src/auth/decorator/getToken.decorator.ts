import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAuthDto } from '../dto';

export const GetToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtAuthDto => {
    const req = ctx.switchToHttp().getRequest();
    if (!req.headers.authorization) {
      return null;
    }
    const token = req.headers.authorization.split(' ')[1];
    return token;
  },
);
