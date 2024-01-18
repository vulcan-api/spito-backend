import { IsInt } from 'class-validator';

export class AddRuleToEnvironmentDto {
  @IsInt()
  ruleId: number;
}
