import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonList, IonThumbnail,
  IonSpinner,
} from '@ionic/angular/standalone';

import { TmdbService, CastCrewMember } from '../services/tmdb';
import { FavoritesDb } from '../services/favourites-db';
import { AppDb } from '../services/app-db';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.page.html',
  styleUrls: ['./movie-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonList, IonThumbnail,
    IonSpinner,
  ],
})
export class MovieDetailsPage {
  movieId!: number;

  overview = '';
  cast: CastCrewMember[] = [];
  crew: CastCrewMember[] = [];

  isFavourite = false;
  isLoading = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private favouritesDb: FavoritesDb,
    public tmdb: TmdbService,
    private router: Router,
    private appDb: AppDb
  ) {}

  async ionViewWillEnter() {
    this.errorMsg = '';
    this.isLoading = true;

    const idParam = this.route.snapshot.paramMap.get('movieId');
    this.movieId = Number(idParam);

    try {
      // credits gives cast/crew [1]
      const credits = await this.tmdb.getMovieCredits(this.movieId);
      this.cast = credits.cast;
      this.crew = credits.crew;

      // overview: simplest is to keep it from a movie endpoint 
      const overview = await this.tmdb.getMovieOverview(this.movieId);
      this.overview = overview.overview ?? '';

      await this.appDb.addRecentMovie({
        id: overview.id,
        title: overview.title ?? '',
        overview: overview.overview ?? '',
        poster_path: overview.poster_path ?? null,
      });

      // fav state
      this.isFavourite = await this.favouritesDb.isFavourite(this.movieId);
    } catch {
      this.errorMsg = 'Failed to load movie details.';
    } finally {
      this.isLoading = false;
    }
  }

  async toggleFavourite() {
    const movie = await this.tmdb.getMovieDisplayForFavourite(this.movieId);
    if (!movie) return;

    if (this.isFavourite) {
      await this.favouritesDb.removeFavourite(this.movieId);
      this.isFavourite = false;
    } else {
      await this.favouritesDb.addFavourite(movie);
      this.isFavourite = true;
    }
  }

  openPerson(personId: number) {
    this.router.navigate(['/person', personId]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goFavourites() {
    this.router.navigate(['/favourites']);
  }

}