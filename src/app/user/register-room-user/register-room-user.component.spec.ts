import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterRoomUserComponent } from './register-room-user.component';

describe('RegisterRoomUserComponent', () => {
  let component: RegisterRoomUserComponent;
  let fixture: ComponentFixture<RegisterRoomUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterRoomUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterRoomUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
