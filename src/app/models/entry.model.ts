export interface Entry {
  id?: string;
  date: string;            // ISO date string YYYY-MM-DD
  serviceName: string;     // e.g. "თმის შეჭრა", "მანიკური"
  income: number;
  expenses: number;
  net: number;
  createdAt: number;       // timestamp for ordering within a day
}

export interface DayGroup {
  date: string;
  entries: Entry[];
  totalIncome: number;
  totalExpenses: number;
  totalNet: number;
}
