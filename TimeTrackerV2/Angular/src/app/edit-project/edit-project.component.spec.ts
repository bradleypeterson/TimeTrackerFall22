import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { EditProjectComponent } from './edit-project.component';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
} from '@angular/forms';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

describe('EditProjectComponent', () => {
  let component: EditProjectComponent;
  let fixture: ComponentFixture<EditProjectComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let router: jasmine.SpyObj<Router>;

  const mockProject = {
    projectID: 1,
    projectName: 'Test Project',
    description: 'Test Description',
    isActive: true,
  };

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
        },
      },
    });

    // Mock HTTP responses
    httpClient.get
      .withArgs(`${environment.apiURL}/api/ProjectInfo/1`, jasmine.any(Object))
      .and.returnValue(of(mockProject));

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [EditProjectComponent],
      providers: [
        { provide: HttpClient, useValue: httpClient },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
        UntypedFormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project data on init', () => {
    expect(httpClient.get).toHaveBeenCalledWith(
      `${environment.apiURL}/api/ProjectInfo/1`,
      jasmine.any(Object)
    );
    expect(component.project).toEqual(mockProject);
  });

  it('should populate form with existing project data', () => {
    expect(component.editProjectForm.get('projectName')?.value).toBe(
      'Test Project'
    );
    expect(component.editProjectForm.get('description')?.value).toBe(
      'Test Description'
    );
    expect(component.editProjectForm.get('isActive')?.value).toBe(true);
  });

  it('should submit updated project data', () => {
    // Setup the form with new values
    const updatedProject = {
      projectName: 'Updated Project',
      description: 'Updated Description',
      isActive: false,
    };

    component.editProjectForm.patchValue(updatedProject);
    fixture.detectChanges(); // Trigger change detection

    // Mock the post response
    httpClient.post
      .withArgs(
        `${environment.apiURL}/api/editProject`,
        {
          ...updatedProject,
          projectID: 1,
        },
        jasmine.any(Object)
      )
      .and.returnValue(of({ success: true }));

    // Submit the form
    component.onSubmit();
    fixture.detectChanges(); // Trigger change detection after submission

    // Verify HTTP call was made
    expect(httpClient.post).toHaveBeenCalledWith(
      `${environment.apiURL}/api/editProject`,
      {
        ...updatedProject,
        projectID: 1,
      },
      jasmine.any(Object)
    );

    // Verify navigation back to project
    expect(router.navigate).toHaveBeenCalledWith(['/project'], {
      state: { projectID: 1 },
    });

    // Verify form values were updated
    expect(component.editProjectForm.get('projectName')?.value).toBe(
      'Updated Project'
    );
    expect(component.editProjectForm.get('description')?.value).toBe(
      'Updated Description'
    );
    expect(component.editProjectForm.get('isActive')?.value).toBe(false);
  });

  it('should return project with updated project data', () => {
    // Setup the form with new values
    const updatedProject = {
      projectName: 'Updated Project',
      description: 'Updated Description',
      isActive: false,
    };

    component.editProjectForm.patchValue(updatedProject);
    fixture.detectChanges(); // Trigger change detection

    // Verify form values were updated
    expect(component.editProjectForm.get('projectName')?.value).toBe(
      'Updated Project'
    );
    expect(component.editProjectForm.get('description')?.value).toBe(
      'Updated Description'
    );
    expect(component.editProjectForm.get('isActive')?.value).toBe(false);
  });

  it('should not submit if form is invalid', () => {
    // Make form invalid by setting required fields to empty
    component.editProjectForm.patchValue({
      projectName: '',
      description: '',
      isActive: true,
    });

    component.onSubmit();

    // Verify no HTTP call was made
    expect(httpClient.post).not.toHaveBeenCalled();
  });

  // it('should handle HTTP error when loading project', () => {
  //   const errorMessage = 'Error loading project';
  //   httpClient.get.and.returnValue(of({ error: { message: errorMessage } }));

  //   component.getProjectInfo();

  //   expect(component.errMsg).toBe(errorMessage);
  // });
});
