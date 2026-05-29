import { TestBed } from '@angular/core/testing';

import { Kyc } from './kyc';

describe('Kyc', () => {
  let service: Kyc;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Kyc);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
