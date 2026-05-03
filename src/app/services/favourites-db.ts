import { Injectable } from '@angular/core';
import { openDB, DBSchema } from 'idb';
import { MovieDisplay } from '../models/movie-display.model';

interface FavDB extends DBSchema {
  movies: {
    key: number;        // movie id
    value: MovieDisplay;
  };
}

@Injectable({ providedIn: 'root' })
export class FavoritesDbService {
  private dbPromise = openDB<FavDB>('movie-app-favorites', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('movies')) {
        db.createObjectStore('movies');
      }
    },
  });

  async isFavourite(movieId: number): Promise<boolean> {
    const db = await this.dbPromise;
    const v = await db.get('movies', movieId);
    return !!v;
  }

  async addFavourite(movie: MovieDisplay): Promise<void> {
    const db = await this.dbPromise;
    await db.put('movies', movie, movie.id);
  }

  async removeFavourite(movieId: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('movies', movieId);
  }

  async getAllFavourites(): Promise<MovieDisplay[]> {
    const db = await this.dbPromise;
    return db.getAll('movies');
  }
}