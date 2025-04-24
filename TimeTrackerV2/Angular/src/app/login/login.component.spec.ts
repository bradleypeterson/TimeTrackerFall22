import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoginComponent } from './login.component';
import { of, throwError } from 'rxjs';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let router: Router;

  beforeEach(async () => {
    // Create HTTP client spy with minimal mock
    httpClient = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    httpClient.get.and.returnValue(of(false));

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('no reload'); // Prevent reload
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterModule],
      declarations: [LoginComponent],
      providers: [
        { provide: HttpClient, useValue: httpClient },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle successful login', () => {
    // Step 1: Fill in the login form
    component.checkoutForm.patchValue({
      username: 'testuser',
      password: 'password123',
    });

    // Verify form is filled
    expect(component.checkoutForm.get('username')?.value).toBe('testuser');
    expect(component.checkoutForm.get('password')?.value).toBe('password123');

    // Step 2: Mock the salt API response
    httpClient.get.and.returnValue(of('test-salt'));

    // Step 3: Mock the login API response
    const mockLoginResponse = {
      user: {
        username: 'testuser',
        type: 'user',
      },
    };
    httpClient.post.and.returnValue(of(mockLoginResponse));

    // Step 4: Trigger login
    component.onSubmit();

    // Step 5: Verify everything happened as expected
    expect(httpClient.get).toHaveBeenCalledWith(
      jasmine.stringMatching('/api/saltForUser/testuser')
    );
    expect(httpClient.post).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'currentUser',
      JSON.stringify(mockLoginResponse.user)
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'userType',
      mockLoginResponse.user.type
    );
    expect(router.navigate).toHaveBeenCalledWith(['./dashboard']);
    expect(component.errMsg).toBe('');
  });

  // it('should handle failed login', () => {
  //   // Step 1: Fill in the form with wrong credentials
  //   component.checkoutForm.patchValue({
  //     username: 'wronguser',
  //     //password: 'wrongpass',
  //   });

  //   component.onSubmit();

  //   // Step 2: Mock the salt API response
  //   //httpClient.get.and.returnValue(of('some-salt'));

  //   // Step 3: Mock the failed login response
  //   const errorResponse = {
  //     error: {
  //       message: 'Missing required field',
  //     },
  //   };
  //   httpClient.post.and.returnValue(throwError(() => errorResponse));

  //   // Step 4: Trigger login
  //   //component.onSubmit();

  //   // Step 5: Verify error handling
  //   expect(component.errMsg).toBe('Missing required field');
  //   expect(router.navigate).not.toHaveBeenCalled();
  //   expect(localStorage.setItem).not.toHaveBeenCalledWith(
  //     'currentUser',
  //     jasmine.any(String)
  //   );
  // });

  it('should prevent submission with invalid form', () => {
    // Test empty form
    component.checkoutForm.patchValue({
      username: '',
      password: '',
    });
    component.onSubmit();
    expect(component.errMsg).toBe('Missing required field');
    expect(httpClient.post).not.toHaveBeenCalled();

    // Test missing username
    component.checkoutForm.patchValue({
      username: '',
      password: 'somepass',
    });
    component.onSubmit();
    expect(component.errMsg).toBe('Missing required field');
    expect(httpClient.post).not.toHaveBeenCalled();

    // Test missing password
    component.checkoutForm.patchValue({
      username: 'someuser',
      password: '',
    });
    component.onSubmit();
    expect(component.errMsg).toBe('Missing required field');
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});
