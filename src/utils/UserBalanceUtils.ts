export const UNKNOWN_TRANSACTION_TYPE = 'Unknown'

export function getTransactionType(isDeposit: boolean): string {
  return isDeposit ? 'Deposit' : 'Withdraw';
}