import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRulesetDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  tags: string[];
}
