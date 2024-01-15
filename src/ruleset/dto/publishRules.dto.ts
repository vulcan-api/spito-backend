import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PublishRulesDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsArray()
  rules: Rule[];
}

class Rule {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsBoolean()
  unsafe: boolean;
}
