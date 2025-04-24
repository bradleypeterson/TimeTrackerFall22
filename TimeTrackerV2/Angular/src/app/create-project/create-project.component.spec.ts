import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProjectComponent } from './create-project.component';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

describe('CreateProjectComponent', () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let router: jasmine.SpyObj<Router>;

  const mockUser = {
    userID: 1,
    firstName: 'Test',
    lastName: 'User',
    type: 'instructor',
  };

  beforeEach(async () => {
    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      if (key === 'currentUser') {
        return JSON.stringify(mockUser);
      }
      return null;
    });

    // Create spies
    httpClient = jasmine.createSpyObj('HttpClient', ['post']);
    router = jasmine.createSpyObj('Router', [
      'navigate',
      'getCurrentNavigation',
    ]);

    // Mock router state
    (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
      extras: {
        state: {
          courseID: 1,
        },
      },
    });

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [CreateProjectComponent],
      providers: [
        { provide: HttpClient, useValue: httpClient },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
        UntypedFormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.createProjectForm.get('projectName')?.value).toBe('');
    expect(component.createProjectForm.get('description')?.value).toBe('');
    expect(component.createProjectForm.get('isActive')?.value).toBe('');
  });

  it('should create a project when form is valid', () => {
    const project = {
      projectName: 'Test Project',
      description: 'Test Description',
      isActive: true,
    };

    // Mock the post response
    httpClient.post.and.returnValue(of({ success: true }));

    // Set form values
    component.createProjectForm.patchValue(project);
    fixture.detectChanges();

    // Submit the form
    component.onSubmit();

    // Verify HTTP call was made
    expect(httpClient.post).toHaveBeenCalledWith(
      `${environment.apiURL}/api/createProject`,
      {
        projectName: 'Test Project',
        description: 'Test Description',
        isActive: true,
        courseID: 1,
      },
      jasmine.any(Object)
    );

    // Verify navigation
    expect(router.navigate).toHaveBeenCalledWith(['/course'], {
      state: { courseID: 1 },
    });
  });

  it('should not create a project when form is invalid', () => {
    const project = {
      projectName: '',
      description: '',
      isActive: true,
    };

    // Mock the post response
    httpClient.post.and.returnValue(of({ success: false }));

    component.createProjectForm.patchValue(project);
    fixture.detectChanges();

    // Submit the form
    component.onSubmit();

    // Verify HTTP call was not made
    expect(httpClient.post).not.toHaveBeenCalled();

    // Verify navigation was not called
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
