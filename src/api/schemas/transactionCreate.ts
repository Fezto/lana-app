/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import type { TransactionCreateDescription } from './transactionCreateDescription';
import type { TransactionCreateType } from './transactionCreateType';
import type { TransactionCreateStatus } from './transactionCreateStatus';
import type { TransactionCreateRecurringId } from './transactionCreateRecurringId';
import type { TransactionCreateFailureReason } from './transactionCreateFailureReason';

export interface TransactionCreate {
  user_id: number;
  category_id: number;
  amount: number;
  date: string;
  description?: TransactionCreateDescription;
  type?: TransactionCreateType;
  status?: TransactionCreateStatus;
  recurring_id?: TransactionCreateRecurringId;
  failure_reason?: TransactionCreateFailureReason;
}
