import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.isAuthenticated()) {
      <mat-toolbar color="primary" class="toolbar">
        <span class="app-title">💰 ფინანსები</span>
        <nav class="nav-links">
          <a mat-button routerLink="/dashboard" routerLinkActive="active">მთავარი</a>
          <a mat-button routerLink="/history" routerLinkActive="active">ისტორია</a>
          <a mat-button routerLink="/monthly" routerLinkActive="active">თვიური</a>
        </nav>
        <span class="spacer"></span>
        <button mat-icon-button (click)="onLogout()" aria-label="გასვლა">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>
    }
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .app-title {
      font-weight: 600;
      margin-right: 16px;
      white-space: nowrap;
    }
    .nav-links a {
      color: inherit;
    }
    .nav-links a.active {
      background: rgba(255, 255, 255, 0.15);
    }
    .spacer {
      flex: 1;
    }
    main {
      padding-bottom: 32px;
    }
    @media (max-width: 500px) {
      .app-title {
        font-size: 14px;
        margin-right: 8px;
      }
      .nav-links a {
        font-size: 13px;
        padding: 0 8px;
        min-width: auto;
      }
    }
  `],
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async onLogout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
