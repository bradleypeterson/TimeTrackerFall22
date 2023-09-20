import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReportsComponent } from './user-reports.component';

describe('UserReportsComponent', () => {
  let component: UserReportsComponent;
  let fixture: ComponentFixture<UserReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserReportsComponent]
    });
    fixture = TestBed.createComponent(UserReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
