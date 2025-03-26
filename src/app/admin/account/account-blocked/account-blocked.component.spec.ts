import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBlockedComponent } from './account-blocked.component';

describe('AccountBlockedComponent', () => {
  let component: AccountBlockedComponent;
  let fixture: ComponentFixture<AccountBlockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountBlockedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountBlockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
