import { z } from 'zod';

export const TransactionTypeEnum = z.enum([
  'essential',
  'non-essential',
  'income',
]);

export type TransactionType = z.infer<typeof TransactionTypeEnum>;
