/*
##########################   MY WORK BELOW   ####################################
TESTS: 
Component Creation Test
Form Initialization Test
Form Validation Test
Successful Registration Test
Failed Registration Test
Run the test with ng test

*/

import {ComponentFixture, TestBed} from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

///HttpClientTestingModule fix: 
/// Using simply import { HttpClientTestingModule}, we get an error, most likely because the version of 
//Angular is not up to date, the below code works though.
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

//


describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RegisterComponent],
            providers: [
                { provide: HttpClient, useValue: { get: () => of({}), post: () => of({}) } }
            ],
        }).compileComponents();
    });

    beforeEach(async ()=> {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, RouterTestingModule],
            declarations: [RegisterComponent],
        }).compileComponents();
    });//beforeEach end

    beforeEach(()=> {
        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    //testing the component (page) is created successfully
    it('Should create the component', ()=>{
        expect(component).toBeTruthy();
    });

    //Testing the registration form is initialized successfully
    it("Should initialize the registration form", () =>{
        expect(component.registrationForm).toBeDefined();
        expect(component.registrationForm.controls['username']).toBeDefined();
        expect(component.registrationForm.controls['firstName']).toBeDefined();
        expect(component.registrationForm.controls['lastName']).toBeDefined();
        expect(component.registrationForm.controls['type']).toBeDefined();
        expect(component.registrationForm.controls['password']).toBeDefined();
        expect(component.registrationForm.controls['repeatPassword']).toBeDefined();
    });

    //Testing the form validity
    it('Should validate form fills correctly', () =>{
        const form = component.registrationForm;

        //should be invalid
        expect(form.valid).toBeFalsy();

        //set valid values
        form.controls['username'].setValue('testUser');
        form.controls['firstName'].setValue('UNITTEST');
        form.controls['lastName'].setValue('USER');
        form.controls['type'].setValue('student');
        form.controls['password'].setValue('test123');
        form.controls['repeatPassword'].setValue('test123');

        //now form should be valid
        expect(form.valid).toBeTruthy();
    });

    //Testing Successful Registration on student
    it('Shoule display success message on valid form submission', ()=>{
        component.registrationForm.setValue({
            username:'testUser',
            firstName: 'Unit',
            lastName: 'Test',
            type: 'student',
            password: 'test123',
            repeatPassword: 'test123'
        });

        //call to test
        component.onSubmit();
        expect(component.successMsg).toBe('');
    });

    //Testing Failed Registration
    it('Should show error message on invalid form submission', () => {
        component.registrationForm.setValue({
            username:'',
            firstName: 'Unit',
            lastName: 'Test',
            type: 'student',
            password: 'test123',
            repeatPassword: 'test123'
        });

        //call to test
        component.onSubmit();
        expect(component.errMsg).toBe('Please complete all required fields and select an account type.');
    });

    //Testing
    it('Should show error message on invalid form submission', () => {
        component.registrationForm.setValue({
            username:'testUser',
            firstName: 'Unit',
            lastName: 'Test',
            type: 'student',
            password: 'test123',
            repeatPassword: 'test'
        });

        //call to test
        component.onSubmit();
        expect(component.errMsg).toBe('Given passwords do not match');
    })
});//end describe()
