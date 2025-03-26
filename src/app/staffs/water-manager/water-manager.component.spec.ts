import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterManagerComponent } from './water-manager.component';

describe('WaterManagerComponent', () => {
  let component: WaterManagerComponent;
  let fixture: ComponentFixture<WaterManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WaterManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
