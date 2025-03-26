import { TestBed } from '@angular/core/testing';

import { RegisterRoomService } from './register-room.service';

describe('RegisterRoomService', () => {
  let service: RegisterRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
