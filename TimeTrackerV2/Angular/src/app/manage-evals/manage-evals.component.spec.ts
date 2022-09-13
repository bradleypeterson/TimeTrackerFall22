import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEvalsComponent } from './manage-evals.component';

describe('ManageEvalsComponent', () => {
  let component: ManageEvalsComponent;
  let fixture: ComponentFixture<ManageEvalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageEvalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageEvalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
