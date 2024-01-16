import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterModule } from './register/register.module';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { LoginModule } from './login/login.module';
import { TotpService } from './totp/totp.service';
import { TotpController } from './totp/totp.controller';

const { SECRET: secret = 'secret', EXPIRES_IN: expiresIn = 3600 * 24 } =
  process.env;

@Module({
  imports: [
    forwardRef(() => RegisterModule),
    forwardRef(() => LoginModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret,
      signOptions: { expiresIn: expiresIn },
    }),
    LoginModule,
  ],
  controllers: [AuthController, TotpController],
  providers: [AuthService, JwtStrategy, TotpService],
  exports: [AuthService, JwtStrategy, PassportModule, TotpService],
})
export class AuthModule {}
