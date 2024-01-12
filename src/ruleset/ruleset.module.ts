import { Module } from '@nestjs/common';
import { RulesetService } from './ruleset.service';
import { RulesetController } from './ruleset.controller';
import { TokenModule } from 'src/token/token.module';

@Module({
  providers: [RulesetService],
  controllers: [RulesetController],
  imports: [TokenModule],
})
export class RulesetModule {}
