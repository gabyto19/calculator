import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
        <mat-card class="entry-card">
          <mat-card-header>
            <mat-card-title>დღევანდელი ჩანაწერი</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="onSave()" class="entry-form">
              <mat-form-field appearance="outline">
                <mat-label>შემოსავალი</mat-label>
                <input matInput type="number" [(ngModel)]="income" name="income" min="0" step="0.01" required />
                <span matPrefix>₾&nbsp;</span>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>შემოსავლის აღწერა</mat-label>
                <input matInput type="text" [(ngModel)]="incomeDescription" name="incomeDescription" placeholder="მაგ: ხელფასი, ფრილანსი..." />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>ხარჯი</mat-label>
                <input matInput type="number" [(ngModel)]="expenses" name="expenses" min="0" step="0.01" required />
                <span matPrefix>₾&nbsp;</span>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>ხარჯის აღწერა</mat-label>
                <input matInput type="text" [(ngModel)]="expenseDescription" name="expenseDescription" placeholder="მაგ: საკვები, ტრანსპორტი..." />
              </mat-form-field>

              <div class="net-display" [class.positive]="netIncome() >= 0" [class.negative]="netIncome() < 0">
                <span class="net-label">წმინდა შემოსავალი</span>
                <span class="net-value">{{ netIncome() | currency:'GEL':'symbol-narrow':'1.2-2' }}</span>
              </div>

              @if (error()) {
                <p class="error">{{ error() }}</p>
              }

              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                @if (saving()) {
                  <mat-spinner diameter="20" />
                } @else {
                  {{ hasExisting() ? 'განახლება' : 'შენახვა' }}
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>
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
    .date-label {
      color: #666;
      margin-bottom: 16px;
    }
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
    .positive { color: #2e7d32; background: #e8f5e9; }
    .negative { color: #c62828; background: #ffebee; }
    .error { color: #f44336; font-size: 14px; margin: 0; }
    .center { display: flex; justify-content: center; padding: 32px; }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly entryService = inject(EntryService);

  income = 0;
  incomeDescription = '';
  expenses = 0;
  expenseDescription = '';
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  hasExisting = signal(false);

  netIncome = computed(() => this.income - this.expenses);

  today = new Date().toISOString().slice(0, 10);
  todayFormatted = new Date().toLocaleDateString('ka-GE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.entryService.loadEntries();
      const existing = this.entryService.getTodayEntry();
      if (existing) {
        this.income = existing.income;
        this.incomeDescription = existing.incomeDescription || '';
        this.expenses = existing.expenses;
        this.expenseDescription = existing.expenseDescription || '';
        this.hasExisting.set(true);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async onSave(): Promise<void> {
    this.error.set('');
    this.saving.set(true);
    try {
      await this.entryService.saveEntry({
        date: this.today,
        income: this.income,
        incomeDescription: this.incomeDescription,
        expenses: this.expenses,
        expenseDescription: this.expenseDescription,
      });
      this.hasExisting.set(true);
    } catch (e: any) {
      this.error.set(e.message ?? 'შენახვა ვერ მოხერხდა');
    } finally {
      this.saving.set(false);
    }
  }
}
