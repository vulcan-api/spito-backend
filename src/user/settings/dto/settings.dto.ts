import { IsOptional, IsString } from 'class-validator';

export class SettingsDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
