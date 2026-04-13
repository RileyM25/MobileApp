import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonList, IonThumbnail, IonInput, IonSpinner} from '@ionic/angular/standalone';
import { TmdbService } from '../../services/tmdb.service';
import { MovieDisplay } from '../../models/movie-display.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonList, IonThumbnail, IonInput, IonSpinner ],
})
export class HomePage {
  studentId = 'G00485530';

  movies: MovieDisplay[] = [];
  searchQuery = '';
  isLoading = false;
  errorMsg = '';

  // so template can generate the image URL
  posterUrl = this.tmdb.posterUrl.bind(this.tmdb);

  constructor(private tmdb: TmdbService, private router: Router) {}

  async ionViewWillEnter() {
    // First open => today's trending (also covers empty-search state) 
    await this.loadTrending();
  }

  private async loadTrending() {
    this.isLoading = true;
    this.errorMsg = '';
    try {
      this.movies = await this.tmdb.getTrendingToday();
    } catch {
      this.errorMsg = 'Failed to load today’s trending movies.';
      this.movies = [];
    } finally {
      this.isLoading = false;
    }
  }

  async onSearch() {
    const q = this.searchQuery.trim();

    if (!q) {
      await this.loadTrending(); // empty search => trending 
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    try {
      this.movies = await this.tmdb.searchMovies(q);
    } catch {
      this.errorMsg = 'Search failed.';
      this.movies = [];
    } finally {
      this.isLoading = false;
    }
  }

  openMovie(movieId: number) {
    // open Movie Details page 
    this.router.navigate(['/movie', movieId]);
  }

  goToFavourites() {
    this.router.navigate(['/favourites']);
  }
}