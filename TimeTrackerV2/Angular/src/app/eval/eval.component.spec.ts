import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvalComponent } from './eval.component';

describe('EvalComponent', () => {
  let component: EvalComponent;
  let fixture: ComponentFixture<EvalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
