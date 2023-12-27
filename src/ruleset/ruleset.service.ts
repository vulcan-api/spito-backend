import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class RulesetService {
  constructor(private readonly prisma: DbService) {}
}
