import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CurrencyPipe } from '@angular/common';
import { EntryService } from '../../services/entry.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <h1>მთავარი</h1>
      <p class="date-label">{{ todayFormatted }}</p>

      @if (loading()) {
        <div class="center">
          <mat-spinner diameter="40" />
        </div>
      } @else {
        <!-- Entry Form -->
        <mat-card class="entry-card">
          <mat-card-header>
            <mat-card-title>ახალი სერვისი</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="onAdd()" class="entry-form">
              <mat-form-field appearance="outline">
                <mat-label>სერვისის სახელი</mat-label>
                <input matInput type="text" [(ngModel)]="serviceName" name="serviceName"
                       placeholder="მაგ: თმის შეჭრა, მანიკური..." required />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>შემოსავალი</mat-label>
                <input matInput type="number" [(ngModel)]="income" name="income"
                       min="0" step="0.01" required (ngModelChange)="updateNet()" />
                <span matPrefix>₾&nbsp;</span>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>ხარჯი</mat-label>
                <input matInput type="number" [(ngModel)]="expenses" name="expenses"
                       min="0" step="0.01" required (ngModelChange)="updateNet()" />
                <span matPrefix>₾&nbsp;</span>
              </mat-form-field>

              <div class="net-display" [class.positive]="liveNet() >= 0" [class.negative]="liveNet() < 0">
                <span class="net-label">წმინდა მოგება</span>
                <span class="net-value">₾ {{ liveNet().toFixed(2) }}</span>
              </div>

              @if (error()) {
                <p class="error">{{ error() }}</p>
              }

              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                @if (saving()) {
                  <mat-spinner diameter="20" />
                } @else {
                  დამატება
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Today's Services List -->
        @if (todayEntries().length > 0) {
          <mat-card class="today-card">
            <mat-card-header>
              <mat-card-title>დღევანდელი სერვისები</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @for (entry of todayEntries(); track entry.id) {
                <div class="service-item">
                  <div class="service-header">
                    <span class="service-name">{{ entry.serviceName }}</span>
                    <button mat-icon-button color="warn" (click)="onDelete(entry.id!)"
                            aria-label="წაშლა" class="delete-btn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  <div class="service-details">
                    <span class="income-text">+₾{{ entry.income.toFixed(2) }}</span>
                    <span class="expense-text">-₾{{ entry.expenses.toFixed(2) }}</span>
                    <span class="net-text" [class.positive]="entry.net >= 0" [class.negative]="entry.net < 0">
                      = ₾{{ entry.net.toFixed(2) }}
                    </span>
                  </div>
                  <mat-divider />
                </div>
              }

              <div class="day-totals">
                <div class="total-row">
                  <span>სულ შემოსავალი</span>
                  <span class="income-text">₾ {{ todayTotalIncome().toFixed(2) }}</span>
                </div>
                <div class="total-row">
                  <span>სულ ხარჯი</span>
                  <span class="expense-text">₾ {{ todayTotalExpenses().toFixed(2) }}</span>
                </div>
                <div class="total-row total-net">
                  <span>დღის მოგება</span>
                  <span [class.positive]="todayTotalNet() >= 0" [class.negative]="todayTotalNet() < 0">
                    ₾ {{ todayTotalNet().toFixed(2) }}
                  </span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 500px;
      margin: 0 auto;
      padding: 16px;
    }
    h1 { margin-bottom: 4px; }
    .date-label { color: #666; margin-bottom: 16px; }
    .entry-card { margin-bottom: 16px; }
    .entry-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }
    .net-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      background: #f5f5f5;
      margin-bottom: 8px;
    }
    .net-label { font-weight: 500; font-size: 16px; }
    .net-value { font-weight: 700; font-size: 20px; }
    .positive { color: #2e7d32; }
    .negative { color: #c62828; }
    .net-display.positive { background: #e8f5e9; }
    .net-display.negative { background: #ffebee; }
    .error { color: #f44336; font-size: 14px; margin: 0; }
    .center { display: flex; justify-content: center; padding: 32px; }
    .today-card { margin-bottom: 16px; }
    .service-item { padding: 8px 0; }
    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .service-name { font-weight: 500; font-size: 15px; }
    .delete-btn { transform: scale(0.8); }
    .service-details {
      display: flex;
      gap: 16px;
      font-size: 14px;
      margin: 4px 0 8px;
    }
    .income-text { color: #2e7d32; }
    .expense-text { color: #c62828; }
    .net-text { font-weight: 600; }
    .day-totals {
      margin-top: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 14px;
    }
    .total-net {
      font-weight: 700;
      font-size: 16px;
      border-top: 1px solid #ddd;
      padding-top: 8px;
      margin-top: 4px;
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly entryService = inject(EntryService);

  serviceName = '';
  income = 0;
  expenses = 0;
  liveNet = signal(0);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  today = new Date().toISOString().slice(0, 10);
  todayFormatted = new Date().toLocaleDateString('ka-GE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  todayEntries = computed(() =>
    this.entryService.entries().filter((e) => e.date === this.today)
  );
  todayTotalIncome = computed(() =>
    this.todayEntries().reduce((s, e) => s + e.income, 0)
  );
  todayTotalExpenses = computed(() =>
    this.todayEntries().reduce((s, e) => s + e.expenses, 0)
  );
  todayTotalNet = computed(() =>
    this.todayTotalIncome() - this.todayTotalExpenses()
  );

  updateNet(): void {
    this.liveNet.set(this.income - this.expenses);
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.entryService.loadEntries();
    } finally {
      this.loading.set(false);
    }
  }

  async onAdd(): Promise<void> {
    if (!this.serviceName.trim()) return;
    this.error.set('');
    this.saving.set(true);
    try {
      await this.entryService.addEntry({
        date: this.today,
        serviceName: this.serviceName.trim(),
        income: this.income,
        expenses: this.expenses,
      });
      // Reset form for next entry
      this.serviceName = '';
      this.income = 0;
      this.expenses = 0;
      this.liveNet.set(0);
    } catch (e: any) {
      this.error.set(e.message ?? 'შენახვა ვერ მოხერხდა');
    } finally {
      this.saving.set(false);
    }
  }

  async onDelete(id: string): Promise<void> {
    try {
      await this.entryService.deleteEntry(id);
    } catch (e: any) {
      this.error.set(e.message ?? 'წაშლა ვერ მოხერხდა');
    }
  }
}
