import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { EntryService } from '../../services/entry.service';
import { DayGroup } from '../../models/entry.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="history">
      <h1>ისტორია</h1>

      @if (loading()) {
        <div class="center">
          <mat-spinner diameter="40" />
        </div>
      } @else {
        @if (weeklyTotal() !== null) {
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="summary-row">
                <span>ამ კვირის შემოსავალი</span>
                <span class="summary-value">₾ {{ weeklyTotal()!.toFixed(2) }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        }

        @if (dayGroups().length === 0) {
          <mat-card>
            <mat-card-content>
              <p class="empty">ჩანაწერები არ არის. დაიწყეთ სერვისების დამატება მთავარ გვერდზე.</p>
            </mat-card-content>
          </mat-card>
        } @else {
          @for (day of dayGroups(); track day.date) {
            <mat-card class="day-card" (click)="toggleDay(day.date)">
              <mat-card-content>
                <div class="day-header">
                  <div class="day-info">
                    <span class="day-date">{{ day.date | date:'longDate' }}</span>
                    <span class="day-count">{{ day.entries.length }} სერვისი</span>
                  </div>
                  <div class="day-summary">
                    <span class="income-text">+₾{{ day.totalIncome.toFixed(2) }}</span>
                    <span class="expense-text">-₾{{ day.totalExpenses.toFixed(2) }}</span>
                    <span class="net-text" [class.positive]="day.totalNet >= 0" [class.negative]="day.totalNet < 0">
                      = ₾{{ day.totalNet.toFixed(2) }}
                    </span>
                    <mat-icon class="expand-icon">
                      {{ expandedDays().has(day.date) ? 'expand_less' : 'expand_more' }}
                    </mat-icon>
                  </div>
                </div>

                @if (expandedDays().has(day.date)) {
                  <mat-divider />
                  <div class="services-list">
                    @for (entry of day.entries; track entry.id) {
                      <div class="service-row">
                        <span class="service-name">{{ entry.serviceName }}</span>
                        <div class="service-amounts">
                          <span class="income-text">+₾{{ entry.income.toFixed(2) }}</span>
                          <span class="expense-text">-₾{{ entry.expenses.toFixed(2) }}</span>
                          <span [class.positive]="entry.net >= 0" [class.negative]="entry.net < 0">
                            ₾{{ entry.net.toFixed(2) }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        }
      }
    </div>
  `,
  styles: [`
    .history {
      max-width: 700px;
      margin: 0 auto;
      padding: 16px;
    }
    .summary-card { margin-bottom: 16px; }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
    }
    .summary-value { font-weight: 700; font-size: 20px; color: #1565c0; }
    .day-card {
      margin-bottom: 8px;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .day-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .day-info { display: flex; flex-direction: column; gap: 2px; }
    .day-date { font-weight: 500; font-size: 15px; }
    .day-count { font-size: 12px; color: #888; }
    .day-summary {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }
    .income-text { color: #2e7d32; }
    .expense-text { color: #c62828; }
    .net-text { font-weight: 600; }
    .positive { color: #2e7d32; }
    .negative { color: #c62828; }
    .expand-icon { color: #888; }
    .services-list { margin-top: 12px; }
    .service-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .service-row:last-child { border-bottom: none; }
    .service-name { font-size: 14px; }
    .service-amounts {
      display: flex;
      gap: 12px;
      font-size: 13px;
    }
    .empty { text-align: center; color: #666; padding: 24px 0; }
    .center { display: flex; justify-content: center; padding: 32px; }
  `],
})
export class HistoryComponent implements OnInit {
  private readonly entryService = inject(EntryService);

  loading = signal(true);
  expandedDays = signal<Set<string>>(new Set());

  dayGroups = this.entryService.dayGroups;

  weeklyTotal = computed(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const startStr = startOfWeek.toISOString().slice(0, 10);

    const weekDays = this.dayGroups().filter((g) => g.date >= startStr);
    if (weekDays.length === 0) return null;
    return weekDays.reduce((sum, g) => sum + g.totalIncome, 0);
  });

  toggleDay(date: string): void {
    const current = new Set(this.expandedDays());
    if (current.has(date)) {
      current.delete(date);
    } else {
      current.add(date);
    }
    this.expandedDays.set(current);
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.entryService.loadEntries();
    } finally {
      this.loading.set(false);
    }
  }
}
