import { TestBed } from '@angular/core/testing';

import { FavouritesDb } from './favourites-db';

describe('FavouritesDb', () => {
  let service: FavouritesDb;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavouritesDb);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
