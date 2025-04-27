import { TestBed } from '@angular/core/testing';

import { PostmanagerService } from './postmanager.service';

describe('PostmanagerService', () => {
  let service: PostmanagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostmanagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
