import { Injectable } from '@angular/core';
import { openDB, DBSchema } from 'idb';
import { MovieDisplay } from '../models/movie-display.model';
import { CastCrewMember, MovieCredits, PersonDetails, PersonMovieCredit } from './tmdb';

type JsonAny = any;

interface SearchHistoryEntry {
  query: string;      // original (trimmed) query
  searchedAt: number; // ms
}

interface TmdbCacheEntry<T> {
  expiresAt: number;
  data: T;
}

interface AppDB extends DBSchema {
  tmdbCache: {
    key: string; // e.g. "trending:day", "search:toy+story", "credits:123"
    value: TmdbCacheEntry<JsonAny>;
  };
  searchHistory: {
    key: string; // normalized query key
    value: SearchHistoryEntry;
  };
}

@Injectable({ providedIn: 'root' })
export class AppDb {
  private dbPromise = openDB<AppDB>('movie-app-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tmdbCache')) db.createObjectStore('tmdbCache');
      if (!db.objectStoreNames.contains('searchHistory')) db.createObjectStore('searchHistory');
    },
  });

  async getCached<T>(key: string): Promise<T | null> {
    const db = await this.dbPromise;
    const entry = await db.get('tmdbCache', key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) return null;
    return entry.data as T;
  }

  async setCached<T>(key: string, data: T, ttlMs: number): Promise<void> {
    const db = await this.dbPromise;
    await db.put('tmdbCache', { expiresAt: Date.now() + ttlMs, data } as any, key);
  }

  private normalize(q: string) {
    return q.trim().toLowerCase();
  }

  async addSearchQuery(query: string, limit = 10): Promise<void> {
    const normalized = this.normalize(query);
    if (!normalized) return;

    const db = await this.dbPromise;

    // upsert latest
    await db.put('searchHistory', { query: query.trim(), searchedAt: Date.now() }, normalized);

    // prune to limit
    const all = await db.getAll('searchHistory');
    all.sort((a, b) => b.searchedAt - a.searchedAt);
    const keep = all.slice(0, limit);

    const keepKeys = new Set(keep.map((x) => this.normalize(x.query)));
    await Promise.all(
      all.map(async (x) => {
        const k = this.normalize(x.query);
        if (!keepKeys.has(k)) await db.delete('searchHistory', k);
      })
    );
  }

  async getSearchHistory(limit = 10): Promise<string[]> {
    const db = await this.dbPromise;
    const all = await db.getAll('searchHistory');
    all.sort((a, b) => b.searchedAt - a.searchedAt);
    return all.slice(0, limit).map((x) => x.query);
  }
}