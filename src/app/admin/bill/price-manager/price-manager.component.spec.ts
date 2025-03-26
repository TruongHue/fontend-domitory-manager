import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceManagerComponent } from './price-manager.component';

describe('PriceManagerComponent', () => {
  let component: PriceManagerComponent;
  let fixture: ComponentFixture<PriceManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PriceManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PriceManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
