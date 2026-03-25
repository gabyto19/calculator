export interface Entry {
  id?: string;
  date: string;       // ISO date string YYYY-MM-DD
  income: number;
  expenses: number;
  net: number;
}
