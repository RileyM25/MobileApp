import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { MovieDisplay } from '../models/movie-display.model';

export interface CastCrewMember {
  id: number;
  name: string;
  profile_path: string | null;
  character?: string; // cast
  job?: string; // crew
}

export interface MovieCredits {
  cast: CastCrewMember[];
  crew: CastCrewMember[];
}

export interface PersonDetails {
  id: number;
  name: string;
  profile_path: string | null;
  also_known_as: string[]; 
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  biography: string | null;
}

export interface PersonMovieCredit {
  id: number;
  title: string;
  poster_path: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Tmbd {
  private baseURL = 'http://api.themoviedb.org/3';
  private apiKey = "";

  constructor(private http: HttpClient) {}

  private async getJson<T>(url: string): Promise<T> {
    return await lastValueFrom(this.http.get<T>(url));
  }
  
  
}
