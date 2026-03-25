import { inject, Injectable, signal } from '@angular/core';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { AuthService } from './auth.service';
import { Entry } from '../models/entry.model';

@Injectable({ providedIn: 'root' })
export class EntryService {
  private readonly auth = inject(AuthService);
  readonly entries = signal<Entry[]>([]);

  private entriesRef() {
    const uid = this.auth.uid;
    if (!uid) throw new Error('Not authenticated');
    return collection(db, 'users', uid, 'entries');
  }

  async loadEntries(): Promise<void> {
    const q = query(this.entriesRef(), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Entry));
    this.entries.set(entries);
  }

  async saveEntry(entry: Omit<Entry, 'id' | 'net'>): Promise<void> {
    const net = entry.income - entry.expenses;
    const docRef = doc(this.entriesRef(), entry.date);
    await setDoc(docRef, { ...entry, net });
    await this.loadEntries();
  }

  async deleteEntry(date: string): Promise<void> {
    const docRef = doc(this.entriesRef(), date);
    await deleteDoc(docRef);
    await this.loadEntries();
  }

  getTodayEntry(): Entry | undefined {
    const today = new Date().toISOString().slice(0, 10);
    return this.entries().find((e) => e.date === today);
  }
}
