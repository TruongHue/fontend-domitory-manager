import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomStatusManagementComponent } from './room-status-management.component';

describe('RoomStatusManagementComponent', () => {
  let component: RoomStatusManagementComponent;
  let fixture: ComponentFixture<RoomStatusManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoomStatusManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoomStatusManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
