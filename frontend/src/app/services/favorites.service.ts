import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'learnivo_event_favorites';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly favoritesIds = signal<Set<string>>(this.loadFromStorage());

  readonly favorites = computed(() => this.favoritesIds());

  isFavorite(eventId: number | string): boolean {
    return this.favoritesIds().has(String(eventId));
  }

  toggleFavorite(eventId: number | string): void {
    const id = String(eventId);
    const next = new Set(this.favoritesIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.favoritesIds.set(next);
    this.saveToStorage(next);
  }

  private loadFromStorage(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as unknown;
      return new Set(Array.isArray(arr) ? arr.map(String) : []);
    } catch {
      return new Set();
    }
  }

  private saveToStorage(ids: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch {}
  }
}
