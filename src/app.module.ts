import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RulesetModule } from './ruleset/ruleset.module';
import { TagModule } from './tag/tag.module';
import { RuleModule } from './rule/rule.module';
import { SearchModule } from './search/search.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    AuthModule,
    DbModule,
    UserModule,
    RulesetModule,
    TagModule,
    RuleModule,
    SearchModule,
    TokenModule,
  ],
})
export class AppModule {}
