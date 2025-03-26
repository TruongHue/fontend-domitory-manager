import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElctricityBillComponent } from './elctricity-bill.component';

describe('ElctricityBillComponent', () => {
  let component: ElctricityBillComponent;
  let fixture: ComponentFixture<ElctricityBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ElctricityBillComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ElctricityBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
