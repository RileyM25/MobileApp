import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { MovieDisplay } from '../models/movie-display.model';
import { AppDb } from './app-db';

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

export interface MovieOverview {
  id: number;
  overview: string;
  title: string;
  poster_path: string | null;
}

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey = '7a76837473ba329059bb3a5264ff09e1';
  private readonly TTL_MS = 12 * 60 * 60 * 1000;

  constructor(
    private http: HttpClient,
    private appDb: AppDb
  ) {}

  private async getJson<T>(url: string): Promise<T> {
    return await lastValueFrom(this.http.get<T>(url));
  }

  private normalizeQuery(q: string): string {
    return q.trim().toLowerCase();
  }

  // Home: Trending (id/title/overview/poster_path) [brief required fields]
  async getTrendingToday(): Promise<MovieDisplay[]> {
    const cacheKey = 'trending:day';
    const cached = await this.appDb.getCached<MovieDisplay[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/trending/movie/day?api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);

    const mapped = (data?.results ?? []).map((m: any) => ({
      id: m.id,
      title: m.title ?? '',
      overview: m.overview ?? '',
      poster_path: m.poster_path ?? null,
    }));

    await this.appDb.setCached(cacheKey, mapped, this.TTL_MS);
    return mapped;
  }

  // Home: Search (same fields)
  async searchMovies(query: string): Promise<MovieDisplay[]> {
    const normalized = this.normalizeQuery(query);
    const cacheKey = `search:${normalized}`;
  
    const cached = await this.appDb.getCached<MovieDisplay[]>(cacheKey);
  
    // ✅ IMPORTANT: even if cached, still save query to history
    if (cached) {
      await this.appDb.addSearchQuery(query, 10);
      return cached;
    }
  
    const url =
      `${this.baseUrl}/search/movie?query=${encodeURIComponent(query)}&api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);
  
    const mapped = (data?.results ?? []).map((m: any) => ({
      id: m.id,
      title: m.title ?? '',
      overview: m.overview ?? '',
      poster_path: m.poster_path ?? null,
    }));
  
    await this.appDb.setCached(cacheKey, mapped, this.TTL_MS);
  
    // Save query strings only (last 10)
    await this.appDb.addSearchQuery(query, 10);
  
    return mapped;
  }
  async searchMoviesAutocomplete(query: string): Promise<MovieDisplay[]> {
    const normalized = this.normalizeQuery(query);
    const cacheKey = `autocomplete:${normalized}`;
    console.log('[autocomplete] TMDB method query:', query, 'cacheKey:', cacheKey);
  
    const cached = await this.appDb.getCached<MovieDisplay[]>(cacheKey);
    if (cached) {
      console.log('[autocomplete] cache hit ✅ length:', cached.length);
      return cached;
    }
  
    console.log('[autocomplete] cache miss → calling API');
  
    const url =
      `${this.baseUrl}/search/movie?query=${encodeURIComponent(query)}&api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);
  
    const mapped = (data?.results ?? []).map((m: any) => ({
      id: m.id,
      title: m.title ?? '',
      overview: m.overview ?? '',
      poster_path: m.poster_path ?? null,
    }));
  
    await this.appDb.setCached(cacheKey, mapped, this.TTL_MS);
  
    // IMPORTANT: do NOT call addSearchQuery() here (avoids spamming search history)
    return mapped;
  }
  
  // Movie Details: cast/crew [brief]
  async getMovieCredits(movieId: number): Promise<MovieCredits> {
    const cacheKey = `movieCredits:${movieId}`;
    const cached = await this.appDb.getCached<MovieCredits>(cacheKey);
    if (cached) return cached;
  
    const url = `${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);
  
    const mapped: MovieCredits = {
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
  
    await this.appDb.setCached(cacheKey, mapped, this.TTL_MS);
    return mapped;
  }

  // Movie Details: overview for the movie details page
  async getMovieOverview(movieId: number): Promise<MovieOverview> {
    const cacheKey = `movieOverview:${movieId}`;
    const cached = await this.appDb.getCached<MovieOverview>(cacheKey);
    if (cached) return cached;
  
    const url = `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);
  
    const mapped: MovieOverview = {
      id: data.id,
      overview: data.overview ?? '',
      title: data.title ?? '',
      poster_path: data.poster_path ?? null,
    };
  
    await this.appDb.setCached(cacheKey, mapped, this.TTL_MS);
    return mapped;
  }

  // Favourites (Option A): store display data needed in favourites list
  async getMovieDisplayForFavourite(movieId: number): Promise<MovieDisplay | null> {
    const overview = await this.getMovieOverview(movieId);
  
    return {
      id: overview.id,
      title: overview.title,
      overview: overview.overview,
      poster_path: overview.poster_path,
    };
  }

  // Person Details [brief]
  async getPersonDetails(personId: number): Promise<PersonDetails> {
    const cacheKey = `person:${personId}`;
    const cached = await this.appDb.getCached<PersonDetails>(cacheKey);
    if (cached) return cached;
  
    const url = `${this.baseUrl}/person/${personId}?api_key=${this.apiKey}`;
    const p: any = await this.getJson<any>(url);
  
    const mapped: PersonDetails = {
      id: p.id,
      name: p.name,
      profile_path: p.profile_path ?? null,
      also_known_as: p.also_known_as ?? [],
      birthday: p.birthday ?? null,
      deathday: p.deathday ?? null,
      place_of_birth: p.place_of_birth ?? null,
      biography: p.biography ?? null,
    };
  
    await this.appDb.setCached(cacheKey, mapped, this.TTL_MS);
    return mapped;
  }

  // Person: other movies [brief]
  async getPersonMovieCredits(personId: number): Promise<PersonMovieCredit[]> {
    const cacheKey = `personMovieCredits:${personId}`;
    const cached = await this.appDb.getCached<PersonMovieCredit[]>(cacheKey);
    if (cached) return cached;
  
    const url = `${this.baseUrl}/person/${personId}/movie_credits?api_key=${this.apiKey}`;
    const data: any = await this.getJson<any>(url);
  
    const mapped = (data?.cast ?? []).map((m: any) => ({
      id: m.id,
      title: m.title ?? '',
      poster_path: m.poster_path ?? null,
    }));
  
    await this.appDb.setCached(cacheKey, mapped, this.TTL_MS);
    return mapped;
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