import { TestBed } from '@angular/core/testing';

import { WaterbillService } from './waterbill.service';

describe('WaterbillService', () => {
  let service: WaterbillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterbillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
