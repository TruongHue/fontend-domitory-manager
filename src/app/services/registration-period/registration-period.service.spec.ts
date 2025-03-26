import { TestBed } from '@angular/core/testing';

import { RegistrationPeriodService } from './registration-period.service';

describe('RegistrationPeriodService', () => {
  let service: RegistrationPeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistrationPeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
