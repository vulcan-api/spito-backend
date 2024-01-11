import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class PublishRulesDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsArray()
  rules: Rule[];
}

interface Rule {
  name: string;
  description: string;
  path: string;
}
