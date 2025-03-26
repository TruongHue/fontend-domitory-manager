import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerBuildingComponent } from './manager-building.component';

describe('ManagerBuildingComponent', () => {
  let component: ManagerBuildingComponent;
  let fixture: ComponentFixture<ManagerBuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagerBuildingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManagerBuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
