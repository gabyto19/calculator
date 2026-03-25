export interface Entry {
  id?: string;
  date: string;       // ISO date string YYYY-MM-DD
  income: number;
  incomeDescription: string;
  expenses: number;
  expenseDescription: string;
  net: number;
}
