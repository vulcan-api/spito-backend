import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @IsOptional()
  expiresAt: Date;
}
