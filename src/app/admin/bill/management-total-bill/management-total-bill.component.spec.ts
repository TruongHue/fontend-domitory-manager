import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementTotalBillComponent } from './management-total-bill.component';

describe('ManagementTotalBillComponent', () => {
  let component: ManagementTotalBillComponent;
  let fixture: ComponentFixture<ManagementTotalBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagementTotalBillComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManagementTotalBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
