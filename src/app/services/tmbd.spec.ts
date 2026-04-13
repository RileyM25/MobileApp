import { TestBed } from '@angular/core/testing';

import { Tmbd } from './tmbd';

describe('Tmbd', () => {
  let service: Tmbd;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tmbd);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
