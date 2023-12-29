import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RulesetModule } from './ruleset/ruleset.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [AuthModule, DbModule, UserModule, RulesetModule, TagModule],
})
export class AppModule {}
