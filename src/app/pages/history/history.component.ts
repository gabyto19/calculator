import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntryService } from '../../services/entry.service';
import { Entry } from '../../models/entry.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
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
                <span class="summary-value">{{ weeklyTotal() | currency:'GEL':'symbol-narrow':'1.2-2' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        }

        @if (entries().length === 0) {
          <mat-card>
            <mat-card-content>
              <p class="empty">ჩანაწერები არ არის. დაიწყეთ დღევანდელი მონაცემების დამატება მთავარ გვერდზე.</p>
            </mat-card-content>
          </mat-card>
        } @else {
          <mat-card class="table-card">
            <div class="table-scroll">
              <table mat-table [dataSource]="entries()" class="full-width">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>თარიღი</th>
                  <td mat-cell *matCellDef="let row">{{ row.date | date:'mediumDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="income">
                  <th mat-header-cell *matHeaderCellDef>შემოსავალი</th>
                  <td mat-cell *matCellDef="let row">
                    {{ row.income | currency:'GEL':'symbol-narrow':'1.2-2' }}
                    @if (row.incomeDescription) {
                      <div class="desc">{{ row.incomeDescription }}</div>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="expenses">
                  <th mat-header-cell *matHeaderCellDef>ხარჯი</th>
                  <td mat-cell *matCellDef="let row">
                    {{ row.expenses | currency:'GEL':'symbol-narrow':'1.2-2' }}
                    @if (row.expenseDescription) {
                      <div class="desc">{{ row.expenseDescription }}</div>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="net">
                  <th mat-header-cell *matHeaderCellDef>წმინდა</th>
                  <td mat-cell *matCellDef="let row"
                      [class.positive]="row.net >= 0"
                      [class.negative]="row.net < 0">
                    {{ row.net | currency:'GEL':'symbol-narrow':'1.2-2' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card>
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
    .summary-card {
      margin-bottom: 16px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
    }
    .summary-value {
      font-weight: 700;
      font-size: 20px;
      color: #1565c0;
    }
    .full-width { width: 100%; }
    .positive { color: #2e7d32; font-weight: 500; }
    .negative { color: #c62828; font-weight: 500; }
    .desc { font-size: 12px; color: #888; margin-top: 2px; }
    .table-scroll { overflow-x: auto; }
    .table-card { overflow: hidden; }
    .empty { text-align: center; color: #666; padding: 24px 0; }
    .center { display: flex; justify-content: center; padding: 32px; }
  `],
})
export class HistoryComponent implements OnInit {
  private readonly entryService = inject(EntryService);

  loading = signal(true);
  entries = this.entryService.entries;
  displayedColumns = ['date', 'income', 'expenses', 'net'];

  weeklyTotal = computed(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const startStr = startOfWeek.toISOString().slice(0, 10);

    const weekEntries = this.entries().filter((e) => e.date >= startStr);
    if (weekEntries.length === 0) return null;
    return weekEntries.reduce((sum, e) => sum + e.income, 0);
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.entryService.loadEntries();
    } finally {
      this.loading.set(false);
    }
  }
}
