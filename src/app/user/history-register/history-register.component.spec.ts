import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryRegisterComponent } from './history-register.component';

describe('HistoryRegisterComponent', () => {
  let component: HistoryRegisterComponent;
  let fixture: ComponentFixture<HistoryRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoryRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
