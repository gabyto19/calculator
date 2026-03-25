import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>ფინანსების მენეჯერი</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-tab-group (selectedIndexChange)="activeTab.set($event)">
            <mat-tab label="შესვლა"></mat-tab>
            <mat-tab label="რეგისტრაცია"></mat-tab>
          </mat-tab-group>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>ელ. ფოსტა</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>პაროლი</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required />
            </mat-form-field>

            @if (error()) {
              <p class="error">{{ error() }}</p>
            }

            <button mat-raised-button color="primary" type="submit" [disabled]="submitting()">
              @if (submitting()) {
                <mat-spinner diameter="20" />
              } @else {
                {{ activeTab() === 0 ? 'შესვლა' : 'რეგისტრაცია' }}
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 16px;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }
    .error {
      color: #f44336;
      font-size: 14px;
      margin: 0;
    }
    mat-card-title {
      text-align: center;
    }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  activeTab = signal(0);
  error = signal('');
  submitting = signal(false);

  async onSubmit(): Promise<void> {
    this.error.set('');
    this.submitting.set(true);

    try {
      if (this.activeTab() === 0) {
        await this.authService.login(this.email, this.password);
      } else {
        await this.authService.register(this.email, this.password);
      }
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e.message ?? 'ავტორიზაცია ვერ მოხერხდა');
    } finally {
      this.submitting.set(false);
    }
  }
}
