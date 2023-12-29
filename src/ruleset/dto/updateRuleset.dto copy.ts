import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRulesetDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  updateRulesList: boolean;

  @IsArray()
  tags: string[];
}
