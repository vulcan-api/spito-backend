import { IsDate, IsOptional } from 'class-validator';

export class CreateTokenDto {
  @IsDate()
  @IsOptional()
  expiresAt: Date;
}
