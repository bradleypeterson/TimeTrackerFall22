import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEvalComponent } from './view-eval.component';

describe('ViewEvalComponent', () => {
  let component: ViewEvalComponent;
  let fixture: ComponentFixture<ViewEvalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewEvalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEvalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
