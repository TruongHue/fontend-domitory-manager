import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpManagerComponent } from './help-manager.component';

describe('HelpManagerComponent', () => {
  let component: HelpManagerComponent;
  let fixture: ComponentFixture<HelpManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HelpManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
