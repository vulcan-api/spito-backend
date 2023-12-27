import { Module } from '@nestjs/common';
import { RulesetService } from './ruleset.service';
import { RulesetController } from './ruleset.controller';

@Module({
  providers: [RulesetService],
  controllers: [RulesetController],
})
export class RulesetModule {}
