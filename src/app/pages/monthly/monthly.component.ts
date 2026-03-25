import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntryService } from '../../services/entry.service';

interface MonthGroup {
  label: string;
  key: string;
  totalIncome: number;
  totalExpenses: number;
  totalNet: number;
  entryCount: number;
}

@Component({
  selector: 'app-monthly',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="monthly">
      <h1>Monthly Summary</h1>

      @if (loading()) {
        <div class="center">
          <mat-spinner diameter="40" />
        </div>
      } @else {
        @if (currentMonth(); as month) {
          <mat-card class="current-month-card">
            <mat-card-header>
              <mat-card-title>{{ month.label }}</mat-card-title>
              <mat-card-subtitle>Current Month</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-grid">
                <div class="stat">
                  <span class="stat-label">Income</span>
                  <span class="stat-value income">{{ month.totalIncome | currency }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Expenses</span>
                  <span class="stat-value expenses">{{ month.totalExpenses | currency }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Net Income</span>
                  <span class="stat-value" [class.positive]="month.totalNet >= 0" [class.negative]="month.totalNet < 0">
                    {{ month.totalNet | currency }}
                  </span>
                </div>
                <div class="stat">
                  <span class="stat-label">Entries</span>
                  <span class="stat-value">{{ month.entryCount }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }

        @if (pastMonths().length > 0) {
          <h2>Archive</h2>
          @for (month of pastMonths(); track month.key) {
            <mat-card class="archive-card">
              <mat-card-content>
                <div class="archive-header">
                  <span class="archive-label">{{ month.label }}</span>
                  <span class="archive-entries">{{ month.entryCount }} entries</span>
                </div>
                <mat-divider />
                <div class="stat-row">
                  <div class="stat-item">
                    <span class="stat-label">Income</span>
                    <span class="income">{{ month.totalIncome | currency }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Expenses</span>
                    <span class="expenses">{{ month.totalExpenses | currency }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Net</span>
                    <span [class.positive]="month.totalNet >= 0" [class.negative]="month.totalNet < 0">
                      {{ month.totalNet | currency }}
                    </span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        } @else if (!currentMonth()) {
          <mat-card>
            <mat-card-content>
              <p class="empty">No entries yet.</p>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .monthly {
      max-width: 600px;
      margin: 0 auto;
      padding: 16px;
    }
    .current-month-card {
      margin-bottom: 24px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 700;
    }
    .income { color: #2e7d32; }
    .expenses { color: #c62828; }
    .positive { color: #2e7d32; font-weight: 600; }
    .negative { color: #c62828; font-weight: 600; }
    h2 { margin-top: 8px; margin-bottom: 12px; }
    .archive-card { margin-bottom: 12px; }
    .archive-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .archive-label { font-weight: 500; font-size: 16px; }
    .archive-entries { color: #666; font-size: 14px; }
    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
    }
    .empty { text-align: center; color: #666; padding: 24px 0; }
    .center { display: flex; justify-content: center; padding: 32px; }
  `],
})
export class MonthlyComponent implements OnInit {
  private readonly entryService = inject(EntryService);

  loading = signal(true);

  private monthGroups = computed<MonthGroup[]>(() => {
    const entries = this.entryService.entries();
    const groups = new Map<string, MonthGroup>();

    for (const entry of entries) {
      const key = entry.date.slice(0, 7); // YYYY-MM
      const [year, month] = key.split('-');
      const label = new Date(+year, +month - 1).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });

      if (!groups.has(key)) {
        groups.set(key, {
          label,
          key,
          totalIncome: 0,
          totalExpenses: 0,
          totalNet: 0,
          entryCount: 0,
        });
      }

      const group = groups.get(key)!;
      group.totalIncome += entry.income;
      group.totalExpenses += entry.expenses;
      group.totalNet += entry.net;
      group.entryCount++;
    }

    return Array.from(groups.values()).sort((a, b) => b.key.localeCompare(a.key));
  });

  currentMonth = computed<MonthGroup | null>(() => {
    const currentKey = new Date().toISOString().slice(0, 7);
    return this.monthGroups().find((g) => g.key === currentKey) ?? null;
  });

  pastMonths = computed<MonthGroup[]>(() => {
    const currentKey = new Date().toISOString().slice(0, 7);
    return this.monthGroups().filter((g) => g.key !== currentKey);
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.entryService.loadEntries();
    } finally {
      this.loading.set(false);
    }
  }
}
