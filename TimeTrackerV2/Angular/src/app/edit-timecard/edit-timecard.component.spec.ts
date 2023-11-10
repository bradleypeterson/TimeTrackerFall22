import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTimecardComponent } from './edit-timecard.component';

describe('EditTimecardComponent', () => {
  let component: EditTimecardComponent;
  let fixture: ComponentFixture<EditTimecardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditTimecardComponent]
    });
    fixture = TestBed.createComponent(EditTimecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
