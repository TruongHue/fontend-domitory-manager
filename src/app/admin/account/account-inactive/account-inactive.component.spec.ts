import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInactiveComponent } from './account-inactive.component';

describe('AccountInactiveComponent', () => {
  let component: AccountInactiveComponent;
  let fixture: ComponentFixture<AccountInactiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountInactiveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountInactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
