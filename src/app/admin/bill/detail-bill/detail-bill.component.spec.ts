import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailBillComponent } from './detail-bill.component';

describe('DetailBillComponent', () => {
  let component: DetailBillComponent;
  let fixture: ComponentFixture<DetailBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailBillComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
