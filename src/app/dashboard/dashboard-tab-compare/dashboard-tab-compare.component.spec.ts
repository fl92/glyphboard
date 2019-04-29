import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabCompareComponent } from './dashboard-tab-compare.component';

describe('DashboardTabCompareComponent', () => {
  let component: DashboardTabCompareComponent;
  let fixture: ComponentFixture<DashboardTabCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTabCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
