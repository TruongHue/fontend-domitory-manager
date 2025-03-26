import { TestBed } from '@angular/core/testing';

import { RoomBillService } from './room-bill.service';

describe('RoomBillService', () => {
  let service: RoomBillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomBillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
