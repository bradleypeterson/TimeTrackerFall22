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

    // Mock localStorage:
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

//   beforeEach(() => {
//     fixture = TestBed.createComponent(LoginComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
