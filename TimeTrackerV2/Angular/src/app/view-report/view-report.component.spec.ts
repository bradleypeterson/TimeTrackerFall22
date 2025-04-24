import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewReportComponent } from './view-report.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { importProvidersFrom } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

const mockRouter = {
    getCurrentNavigation: () => ({
        extras: {
            state: {
                studentID: '30', 
                projectID: '1', 
                courseID: '2',
            },
        },
    }),
};

describe('ViewReportComponent', () =>{

    let component: ViewReportComponent;
    let fixture: ComponentFixture<ViewReportComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () =>{
        await TestBed.configureTestingModule({
            declarations: [ViewReportComponent], 
            imports: [HttpClientTestingModule, 
                NgxPaginationModule
            ],
            providers: [ {
                provide: Router, useValue: mockRouter
            },]
        }).compileComponents();

        const mockUser= {
            userID: 10,
            username: 'RGilmore',
            password: 'c092f87e8d56fae802ec1189fb58b243c0d62eb4e74d42564e1a915d2e7eaa7082501c598fd85c6cb4c5c95d68d5e72dfb27a550686530b317fc5c9ce1e0c07f',
            firstName: 'Lorelai',
            lastName: 'Gilmore',
            type: 'student',
            isApproved: true,
            isActive: true,
            salt: '02197eb84a018c631a8f4348665e5005'
          };

        localStorage.removeItem('currentUser');
        localStorage.setItem('currentUser', JSON.stringify(mockUser));

        fixture = TestBed.createComponent(ViewReportComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
    
    });


    it('Should Create Component', ()=> {
        expect(component).toBeTruthy();
    });

    //for RGilmore
    //studentID=userID = 10
    //projectID = 1
    //courseID = 2 "Test 2"
    it('Should fetch user info successfully', ()=>{
        component.sID = '10';
        component.GetUserInfo(); 

        const req = httpMock.expectOne(`${environment.apiURL}/api/GetUserInfo/10`);
        expect(req.request.method).toBe('GET');
        req.flush({firstName: 'Lorelai', lastName: 'Gilmore'});
        expect(component.studentName).toBe('Lorelai Gilmore');
        expect(component.errMsg).toBe('');
    });

    it('Should handle user info fetch error', () =>{
        component.sID= '10';
        component.GetUserInfo();

        const req = httpMock.expectOne(`${environment.apiURL}/api/GetUserInfo/10`);
        req.flush({message: 'Something went wrong. Please try again later.' }, {status: 500, statusText: 'Internal Server Error' });

        expect(component.errMsg).toBe('Something went wrong. Please try again later.');
    });


    it('Should fetch project info Successfully', () => {
        component.pID = '1';
        component.GetProjectInfo();

        const req = httpMock.expectOne(`${environment.apiURL}/api/ProjectInfo/1`);
        expect(req.request.method).toBe('GET');
        req.flush({projectName: 'Project Unit Test'});

        expect(component.projectName).toBe('Project Unit Test');
        expect(component.errMsg).toBe('');
    });

    it('Should handle project info fetch error', () => {
        component.pID = '1';
        component.GetProjectInfo();

        const req = httpMock.expectOne(`${environment.apiURL}/api/ProjectInfo/1`);
        req.flush({message: 'Failed to fetch project info' }, {status: 500, statusText: 'Internal Server Error'});
     
        expect(component.errMsg).toBe('Failed to fetch project info');
    });

    it('Should fetch project timecard report successfully', () =>{
        component.sID = '10';
        component.pID = '1';
        component.cID = '2';
        component.GetDetailedReport();

        //`${environment.apiURL}/api/Users/${this.sID}/${this.pID}/activities/`
        const req = httpMock.expectOne(`${environment.apiURL}/api/Users/10/1/activities/`);
        expect(req.request.method).toBe('GET');
        const mockReport = [{timeIn: '1:03', timeOut: '1:09', description: 'Test1'},
            {timeIn: '2:04', timeOut: '2:10', description: 'Test2'},
            {timeIn: '3:05', timeOut: '3:11', description: 'Test3'},
        ];
        req.flush(mockReport);

        expect(component.timeTables).toEqual(mockReport);
        expect(component.errMsg).toBe('');
    });

    it('Should handle project timecard info fetch error', () => {
        component.sID = '10';
        component.pID = '1';
        component.cID = '2';
        component.GetDetailedReport();

        const req = httpMock.expectOne(`${environment.apiURL}/api/Users/10/1/activities/`);
        req.flush({message: 'Something went wrong. Please try again later.' }, {status: 500, statusText: 'Internal Server Error'});
     
        expect(component.errMsg).toBe('Something went wrong. Please try again later.');
    });


    afterEach(()=>{
        httpMock.verify(); //Cleans up any outstanding requests
        localStorage.removeItem('currentUser');
      });
}); //end Describe