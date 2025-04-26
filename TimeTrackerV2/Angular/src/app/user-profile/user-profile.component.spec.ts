import {ComponentFixture, TestBed, inject} from '@angular/core/testing';
import { UserProfileComponent } from './user-profile.component';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router, NavigationExtras} from '@angular/router';
import {CommonModule } from'@angular/common';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

// Could further test http requests such as if there is a fail, and setting the errmsg


describe('UserProfileComponent', ()=>{
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let httpMock: HttpTestingController;
  let mockRouter: any;

  beforeEach(async()=>{

    //create mockRouter
    mockRouter = jasmine.createSpyObj('Router', ['getCurrentNavigation']);
    mockRouter.getCurrentNavigation.and.returnValue({
      extras: {
        state:{
          userID: 30
        }
      }
    });

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [UserProfileComponent],
      providers: [
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({userID:30})
          }
        }, 
        {
          provide: Router, 
          useValue: mockRouter
        }
      ]
    }).compileComponents();

    //uses dummydata generated user Jake Jagielski
    const mockUser = {
      userID: 30,
      username: 'JJagielski',
      password: '7fb587b390d4758e48ff57d1bb025a543382043361065282c807cb18f0ed975b03a1cce7d188ada4e34e4fba13ae832a4aa54c693d296be6f97ab7a9adc843e4',
      firstName: 'Jake',
      lastName: 'Jagielski',
      type: 'student',
      isApproved: true,
      isActive: true,
      salt: 'ac4567c1e062b2ed1623dd45621bd98b'
    };

    localStorage.removeItem('currentUser');
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    //Set the viewingUserID 


    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();


    
  });


  beforeEach(inject([HttpTestingController], (http:HttpTestingController)=> {
    httpMock = http;
  }));

  afterEach(()=>{
    httpMock.verify(); //Cleans up any outstanding requests
    localStorage.removeItem('currentUser');
  });

  //check that viewingUserID is set by the mockRouter 
  it('should set viewingUserID from router navigation state', () => {
    expect(component.viewingUserID).toBe(30);
  });
  
  //check component initialization
  it("Should create the component", () => {
    //component.currentUser.type = 'student'
    expect(component).toBeTruthy();
  });

  //should set default values for variables
  it("Should initialize default values", ()=>{
    expect(component.instructor).toBeFalse();
    expect(component.student).toBeTrue();
    expect(component.admin).toBeFalse();
    expect(component.dummyGen).toBeFalse();
    expect(component.errMsg).toBe("");
  });

  //should successfully retrieve the "viewing user id"
  it("Should get viewingUserID from route params", ()=>{
    expect(component.viewingUserID).toBe(30);
  });

  //ngOnInit calls getUserProfile()
  it("Should call getUserProfile on init", ()=>{
    const spy = spyOn(component, 'loadProfile');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });
  

  it('should set sameUser to true if currentUserID matches viewingUserID', () =>{
    component.currentUserID = '30';
    component.viewingUserID = '30';
    expect(component.sameUser).toBeTrue();
  })
 
}); //end describe
