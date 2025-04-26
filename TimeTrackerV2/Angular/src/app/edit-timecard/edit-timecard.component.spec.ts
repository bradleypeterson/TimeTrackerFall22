import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { EditTimecardComponent } from './edit-timecard.component';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
} from '@angular/forms';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

describe('EditTimecardComponent', () => {
  let component: EditTimecardComponent;
  let fixture: ComponentFixture<EditTimecardComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let router: jasmine.SpyObj<Router>;

  const mockTimecard = {
    timeslotID: 123,
    studentName: 'John Doe',
    timeIn: '2024-04-11T10:00:00',
    timeOut: '2024-04-11T12:00:00',
  };

  const mockUser = {
    userID: 1,
    firstName: 'Test',
    lastName: 'User',
    type: 'instructor',
  };

  beforeEach(async () => {
    // Mock localStorage:
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      if (key === 'currentUser') {
        return JSON.stringify(mockUser);
      }
      return null;
    });

    // Create spies
    httpClient = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    router = jasmine.createSpyObj('Router', [
      'navigate',
      'getCurrentNavigation',
    ]);

    // Mock router state
    (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
      extras: {
        state: {
          projectID: 1,
          timeslotID: 123,
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    });

    // Mock HTTP responses
    httpClient.get
      .withArgs(
        `${environment.apiURL}/api/TimeCardInfo/123`,
        jasmine.any(Object)
      )
      .and.returnValue(of(mockTimecard));

    await TestBed.configureTestingModule({
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule],
      declarations: [EditTimecardComponent],
      providers: [
        { provide: HttpClient, useValue: httpClient },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
        UntypedFormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTimecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
