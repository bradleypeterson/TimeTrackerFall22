import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewReportComponent } from './view-report.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

const mockRouter = {
    getCurrentNavigation: () => ({
        extras: {
            state: {
                studentID: '30', 
                projectID: '1', 
                courseID: '1',
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

        fixture = TestBed.createComponent(ViewReportComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
    
    });

    it('Should Create Component', ()=> {
        expect(component).toBeTruthy();
    })
}); //end Describe