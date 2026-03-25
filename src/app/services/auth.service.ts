import { Injectable, signal, computed } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(null);
  private readonly loading = signal(true);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isLoading = this.loading.asReadonly();

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser.set(user);
      this.loading.set(false);
    });
  }

  get uid(): string | null {
    return this.currentUser()?.uid ?? null;
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }
}
