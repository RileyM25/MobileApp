import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonThumbnail,
  IonSpinner,
  IonInput,
} from '@ionic/angular/standalone';

import { FavoritesDb } from '../services/favourites-db';
import { MovieDisplay } from '../models/movie-display.model';
import { TmdbService } from '../services/tmdb';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonThumbnail,
    IonSpinner,
    IonInput,
    FormsModule,
  ],
})
export class FavouritesPage {
  // original list from DB
  favouritesAll: MovieDisplay[] = [];

  // list displayed after filter/sort
  favourites: MovieDisplay[] = [];

  isLoading = false;
  errorMsg = '';

  // Insights UI
  filterText = '';
  sortMode: 'title-asc' | 'title-desc' = 'title-asc';

  constructor(
    private favouritesDb: FavoritesDb,
    public tmdb: TmdbService,
    private router: Router
  ) {}

  async ionViewWillEnter() {
    this.errorMsg = '';
    this.isLoading = true;

    try {
      this.favouritesAll = await this.favouritesDb.getAllFavourites();
      this.applySortFilter();
    } catch {
      this.errorMsg = 'Failed to load favourites.';
      this.favouritesAll = [];
      this.favourites = [];
    } finally {
      this.isLoading = false;
    }
  }

  get favouritesCount() {
    return this.favouritesAll.length;
  }

  applySortFilter() {
    const text = this.filterText.trim().toLowerCase();

    let list = this.favouritesAll;

    if (text) {
      list = list.filter((m) => (m.title ?? '').toLowerCase().includes(text));
    }

    list = [...list].sort((a, b) => {
      const at = (a.title ?? '').toLowerCase();
      const bt = (b.title ?? '').toLowerCase();
      if (at < bt) return this.sortMode === 'title-asc' ? -1 : 1;
      if (at > bt) return this.sortMode === 'title-asc' ? 1 : -1;
      return 0;
    });

    this.favourites = list;
  }

  onFilterInput() {
    this.applySortFilter();
  }

  setSort(mode: 'title-asc' | 'title-desc') {
    this.sortMode = mode;
    this.applySortFilter();
  }

  async clearFavourites() {
    if (this.favouritesAll.length === 0) return;

    const ok = confirm('Clear all favourites? This cannot be undone.');
    if (!ok) return;

    // No removeAll method in your service, so remove each favourite by id
    await Promise.all(this.favouritesAll.map((m) => this.favouritesDb.removeFavourite(m.id)));

    this.favouritesAll = [];
    this.favourites = [];
    this.filterText = '';
    this.sortMode = 'title-asc';
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  openMovie(movieId: number) {
    this.router.navigate(['/movie', movieId]);
  }
}