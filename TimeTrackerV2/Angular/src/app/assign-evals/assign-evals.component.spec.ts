import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignEvalsComponent } from './assign-evals.component';

describe('AssignEvalsComponent', () => {
  let component: AssignEvalsComponent;
  let fixture: ComponentFixture<AssignEvalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignEvalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignEvalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
