import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceWaterElectricitiesComponent } from './price-water-electricities.component';

describe('PriceWaterElectricitiesComponent', () => {
  let component: PriceWaterElectricitiesComponent;
  let fixture: ComponentFixture<PriceWaterElectricitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PriceWaterElectricitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PriceWaterElectricitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
