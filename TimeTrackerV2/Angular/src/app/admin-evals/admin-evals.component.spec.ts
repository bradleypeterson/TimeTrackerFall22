import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEvalsComponent } from './admin-evals.component';

describe('AdminEvalsComponent', () => {
  let component: AdminEvalsComponent;
  let fixture: ComponentFixture<AdminEvalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminEvalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEvalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
