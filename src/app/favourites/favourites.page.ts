import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonList, IonThumbnail,
  IonSpinner
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
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonList, IonThumbnail,
    IonSpinner
  ],
})
export class FavouritesPage {
  favourites: MovieDisplay[] = [];
  isLoading = false;
  errorMsg = '';

  constructor(
    private favouritesDb: FavoritesDb,
    public tmdb: TmdbService,
    private router: Router
  ) {}

  async ionViewWillEnter() {
    this.errorMsg = '';
    this.isLoading = true;
    try {
      this.favourites = await this.favouritesDb.getAllFavourites();
    } catch {
      this.errorMsg = 'Failed to load favourites.';
    } finally {
      this.isLoading = false;
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  openMovie(movieId: number) {
    // opens Movie Details page: /movie/:movieId [1]
    this.router.navigate(['/movie', movieId]);
  }
}