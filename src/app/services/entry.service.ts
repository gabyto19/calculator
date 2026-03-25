import { inject, Injectable, signal, computed } from '@angular/core';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { AuthService } from './auth.service';
import { Entry, DayGroup } from '../models/entry.model';

@Injectable({ providedIn: 'root' })
export class EntryService {
  private readonly auth = inject(AuthService);
  readonly entries = signal<Entry[]>([]);

  readonly dayGroups = computed<DayGroup[]>(() => {
    const groups = new Map<string, DayGroup>();
    for (const entry of this.entries()) {
      if (!groups.has(entry.date)) {
        groups.set(entry.date, {
          date: entry.date,
          entries: [],
          totalIncome: 0,
          totalExpenses: 0,
          totalNet: 0,
        });
      }
      const g = groups.get(entry.date)!;
      g.entries.push(entry);
      g.totalIncome += entry.income;
      g.totalExpenses += entry.expenses;
      g.totalNet += entry.net;
    }
    return Array.from(groups.values()).sort((a, b) => b.date.localeCompare(a.date));
  });

  private entriesRef() {
    const uid = this.auth.uid;
    if (!uid) throw new Error('Not authenticated');
    return collection(db, 'users', uid, 'entries');
  }

  async loadEntries(): Promise<void> {
    const q = query(this.entriesRef(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Entry));
    // Sort by date desc, then by createdAt desc within same date
    entries.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
    this.entries.set(entries);
  }

  async addEntry(entry: { date: string; serviceName: string; income: number; expenses: number }): Promise<void> {
    const net = entry.income - entry.expenses;
    await addDoc(this.entriesRef(), {
      ...entry,
      net,
      createdAt: Date.now(),
    });
    await this.loadEntries();
  }

  async deleteEntry(id: string): Promise<void> {
    const docRef = doc(this.entriesRef(), id);
    await deleteDoc(docRef);
    await this.loadEntries();
  }

  getTodayEntries(): Entry[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.entries().filter((e) => e.date === today);
  }
}
