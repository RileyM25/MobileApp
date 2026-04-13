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

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey = ''; // TODO: put your key here for now, or use environment.local.ts later

  constructor(private http: HttpClient) {}

  private async getJson<T>(url: string): Promise<T> {
    return await lastValueFrom(this.http.get<T>(url));
  }

  async getTrendingToday(): Promise<MovieDisplay[]> {
    const url = `${this.baseUrl}/trending/movie/day?api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);

    return (data?.results ?? []).map((m: any) => ({
      id: m.id,
      overview: m.overview ?? '',
      poster_path: m.poster_path ?? null,
    }));
  }

  async searchMovies(query: string): Promise<MovieDisplay[]> {
    const url = `${this.baseUrl}/search/movie?query=${encodeURIComponent(query)}&api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);

    return (data?.results ?? []).map((m: any) => ({
      id: m.id,
      overview: m.overview ?? '',
      poster_path: m.poster_path ?? null,
    }));
  }

  async getMovieCredits(movieId: number): Promise<MovieCredits> {
    const url = `${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);

    return {
      cast: (data?.cast ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        profile_path: c.profile_path ?? null,
        character: c.character,
      })),
      crew: (data?.crew ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        profile_path: c.profile_path ?? null,
        job: c.job,
      })),
    };
  }

  async getPersonDetails(personId: number): Promise<PersonDetails> {
    const url = `${this.baseUrl}/person/${personId}?api_key=${this.apiKey}`;
    const p: any = await this.getJson<any>(url);

    return {
      id: p.id,
      name: p.name,
      profile_path: p.profile_path ?? null,
      also_known_as: p.also_known_as ?? [],
      birthday: p.birthday ?? null,
      deathday: p.deathday ?? null,
      place_of_birth: p.place_of_birth ?? null,
      biography: p.biography ?? null,
    };
  }

  async getPersonMovieCredits(personId: number): Promise<PersonMovieCredit[]> {
    const url = `${this.baseUrl}/person/${personId}/movie_credits?api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);

    return (data?.cast ?? []).map((m: any) => ({
      id: m.id,
      title: m.title,
      poster_path: m.poster_path ?? null,
    }));
  }

  posterUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  profileUrl(path: string | null, size: string = 'w185'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}