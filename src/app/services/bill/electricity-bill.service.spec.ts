import { TestBed } from '@angular/core/testing';

import { ElectricityBillService } from './electricity-bill.service';

describe('ElectricityBillService', () => {
  let service: ElectricityBillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElectricityBillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
