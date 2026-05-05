import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonList, IonThumbnail,
  IonSpinner
} from '@ionic/angular/standalone';

import { TmdbService } from '../services/tmdb';

@Component({
  selector: 'app-person-details',
  templateUrl: './person-details.page.html',
  styleUrls: ['./person-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonList, IonThumbnail,
    IonSpinner
  ],
})
export class PersonDetailsPage {
  personId!: number;

  details:
    | {
        name: string;
        profile_path: string | null;
        also_known_as: string[];
        birthday: string | null;
        deathday: string | null;
        place_of_birth: string | null;
        biography: string | null;
      }
    | null = null;

  otherMovies: { id: number; title: string; poster_path: string | null }[] = [];

  isLoading = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public tmdb: TmdbService
  ) {}

  async ionViewWillEnter() {
    this.errorMsg = '';
    this.isLoading = true;

    const idParam = this.route.snapshot.paramMap.get('personId');
    this.personId = Number(idParam);

    try {
      this.details = await this.tmdb.getPersonDetails(this.personId);
      this.otherMovies = await this.tmdb.getPersonMovieCredits(this.personId);
    } catch {
      this.errorMsg = 'Failed to load person details.';
    } finally {
      this.isLoading = false;
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goFavourites() {
    this.router.navigate(['/favourites']);
  }

  openMovie(movieId: number) {
    this.router.navigate(['/movie', movieId]);
  }
}