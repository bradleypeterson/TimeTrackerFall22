import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEvalsComponent } from './view-evals.component';

describe('ViewEvalsComponent', () => {
  let component: ViewEvalsComponent;
  let fixture: ComponentFixture<ViewEvalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewEvalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEvalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
