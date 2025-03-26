import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElctricityManagerComponent } from './elctricity-manager.component';

describe('ElctricityManagerComponent', () => {
  let component: ElctricityManagerComponent;
  let fixture: ComponentFixture<ElctricityManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ElctricityManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ElctricityManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
