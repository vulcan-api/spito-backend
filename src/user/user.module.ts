import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SettingsModule } from './settings/settings.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [SettingsModule],
})
export class UserModule {}
