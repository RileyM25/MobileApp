import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonList, IonThumbnail,
  IonInput, IonSpinner,
} from '@ionic/angular/standalone';

import { MovieDisplay } from '../models/movie-display.model';
import { TmdbService } from '../services/tmdb';
import { AppDb } from '../services/app-db';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonList, IonThumbnail,
    IonInput, IonSpinner,
  ],
})
export class HomePage {
  studentId = 'G00485530';

  movies: MovieDisplay[] = [];
  searchQuery = '';
  isLoading = false;
  errorMsg = '';

  // Header mode (used by your HTML)
  showingSearchResults = false;
  lastSearchQuery = '';

  // Recent searches dropdown
  recentSearches: string[] = [];
  showRecentSearchDropdown = false;
  filteredRecentSearches: string[] = [];

  posterUrl: (path: string | null, size?: string) => string | null;

  constructor(
    private tmdb: TmdbService,
    private router: Router,
    private appDb: AppDb
  ) {
    this.posterUrl = this.tmdb.posterUrl.bind(this.tmdb);
  }

  async ionViewWillEnter() {
    await this.loadTrending();
    this.recentSearches = await this.appDb.getSearchHistory(10);

    // keep dropdown closed until focus/typing
    this.filteredRecentSearches = this.recentSearches.slice(0, 8); 
    this.showRecentSearchDropdown = false;
    this.filteredRecentSearches = [];
  }

  private updateFilteredRecentSearches() {
    const typed = this.searchQuery.trim().toLowerCase();

    // input empty => show recent searches
    if (!typed) {
      this.filteredRecentSearches = this.recentSearches.slice(0, 8);
      return;
    }

    // input has text => filter
    this.filteredRecentSearches = this.recentSearches
      .filter((q) => q.toLowerCase().includes(typed))
      .slice(0, 8);
  }

  onSearchBoxFocus() {
    // show dropdown even when input is empty
    this.showRecentSearchDropdown = true;
    this.updateFilteredRecentSearches();
  }

  onSearchBoxBlur() {
    // allow click on dropdown item
    setTimeout(() => (this.showRecentSearchDropdown = false), 150);
  }

  onSearchInput() {
    this.showRecentSearchDropdown = true;
    this.updateFilteredRecentSearches();
  }

  async onSearch() {
    const q = this.searchQuery.trim();

    if (!q) {
      await this.backToTrending();
      return;
    }

    await this.performSearch(q);
  }

  async useSearchSuggestion(q: string) {
    await this.performSearch(q);
  }

  private async performSearch(q: string) {
    this.showRecentSearchDropdown = false;

    this.isLoading = true;
    this.errorMsg = '';

    // header mode
    this.showingSearchResults = true;
    this.lastSearchQuery = q;

    try {
      this.movies = await this.tmdb.searchMovies(q);

      // refresh search history
      this.recentSearches = await this.appDb.getSearchHistory(10);

      // clear search box after searching (results stay)
      this.searchQuery = '';

      // requirement: dropdown should show again when input is empty
      this.showRecentSearchDropdown = true;
      this.updateFilteredRecentSearches();
    } catch {
      this.errorMsg = 'Search failed.';
      this.movies = [];
    } finally {
      this.isLoading = false;
    }
  }

  async backToTrending() {
    this.showRecentSearchDropdown = false;
    this.showingSearchResults = false;
    this.lastSearchQuery = '';
    this.searchQuery = '';
    this.errorMsg = '';

    await this.loadTrending();
    this.recentSearches = await this.appDb.getSearchHistory(10);

    // input is empty, so show dropdown
    this.showRecentSearchDropdown = true;
    this.updateFilteredRecentSearches();
  }

  private async loadTrending() {
    this.isLoading = true;
    this.errorMsg = '';
    this.movies = [];

    try {
      this.movies = await this.tmdb.getTrendingToday();
    } catch {
      this.errorMsg = 'Failed to load today’s trending movies.';
      this.movies = [];
    } finally {
      this.isLoading = false;
    }
  }

  openMovie(movieId: number) {
    this.router.navigate(['/movie', movieId]);
  }

  goToFavourites() {
    this.router.navigate(['/favourites']);
  }
}