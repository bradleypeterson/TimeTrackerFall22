// /*
// ##########################   MY WORK BELOW   ####################################
// TESTS: 
// Component Creation Test
// Initialization Test
// Course Loading Test
// Form Submission Test
// Navigation Test
// Run the test with ng test
// */

// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { EditCourseComponent } from './edit-course.component';
// import { HttpClient } from '@angular/common/http';
// import { ActivatedRoute, Router } from '@angular/router';
// import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
// import { of } from 'rxjs';

// class MockRouter {
//   navigate = jasmine.createSpy('navigate');
//   getCurrentNavigation = jasmine
//     .createSpy('getCurrentNavigation')
//     .and.returnValue({
//       extras: {
//         state: { courseID: '1' }, // Mock navigation state
//       },
//     });
// }

// class MockActivatedRoute {
//   snapshot = { paramMap: { get: () => '1' } }; // Mock courseID as '1'
// }

// beforeEach(async () => {
//   await TestBed.configureTestingModule({
//     declarations: [EditCourseComponent],
//     imports: [ReactiveFormsModule], // Import ReactiveFormsModule for form handling
//     providers: [
//       UntypedFormBuilder,
//       {
//         provide: HttpClient,
//         useValue: {
//           get: (url: string) => {
//             if (url.includes('CourseInfo')) {
//               return of({
//                 courseName: 'Test Course',
//                 description: 'Test Description',
//                 isActive: true,
//                 instructorID: '123',
//               }); // Mock course info
//             }
//             return of({});
//           },
//           post: () => of({}),
//         },
//       },
//       { provide: Router, useClass: MockRouter },
//       { provide: ActivatedRoute, useClass: MockActivatedRoute },
//     ],
//   }).compileComponents();
// });

// describe('EditCourseComponent', () => {
//   let component: EditCourseComponent;
//   let fixture: ComponentFixture<EditCourseComponent>;
//   let router: MockRouter;

//   beforeEach(() => {
//     // Mock localStorage for currentUser
//     spyOn(localStorage, 'getItem').and.callFake((key: string) => {
//       if (key === 'currentUser') {
//         return JSON.stringify({ userID: '123', type: 'instructor' }); // Mock currentUser
//       }
//       return null;
//     });

//     fixture = TestBed.createComponent(EditCourseComponent);
//     component = fixture.componentInstance;
//     router = TestBed.inject(Router) as unknown as MockRouter;

//     fixture.detectChanges();
//   });

//   // Component Creation Test
//   it('Should create the component', () => {
//     expect(component).toBeTruthy();
//   });

//   // Initialization Test
//   it('Should initialize the component', () => {
//     expect(router.getCurrentNavigation).toHaveBeenCalled();
//     expect(component.courseID).toBe('1'); // Mocked courseID
//     expect(component.currentUser).toEqual({
//       userID: '123',
//       type: 'instructor',
//     }); // Mocked currentUser
//     expect(component.editCourseForm).toBeDefined();
//   });

//   // Course Loading Test
//   it('Should load course information successfully', () => {
//     spyOn(component, 'getCourseInfo').and.callThrough();

//     component.getCourseInfo();

//     expect(component.getCourseInfo).toHaveBeenCalled();
//     expect(component.course).toEqual({
//       courseName: 'Test Course',
//       description: 'Test Description',
//       isActive: true,
//       instructorID: '123',
//     });
//     expect(component.editCourseForm.controls['courseName'].value).toBe(
//       'Test Course'
//     );
//     expect(component.editCourseForm.controls['description'].value).toBe(
//       'Test Description'
//     );
//     expect(component.editCourseForm.controls['isActive'].value).toBe(true);
//   });

//   // Form Submission Test
//   it('Should submit the form successfully', () => {
//     spyOn(component, 'onSubmit').and.callThrough();
//     spyOn(component, 'GoBackToCourse').and.callThrough();

//     component.editCourseForm.setValue({
//       courseName: 'Updated Course',
//       description: 'Updated Description',
//       isActive: true,
//       instructorID: '123',
//     });

//     component.onSubmit();

//     expect(component.onSubmit).toHaveBeenCalled();
//     expect(component.GoBackToCourse).toHaveBeenCalled();
//     expect(router.navigate).toHaveBeenCalledWith(['/course'], {
//       state: { courseID: '1' },
//     });
//   });

//   // Navigation Test
//   it('Should navigate back to the course page', () => {
//     component.GoBackToCourse();
//     expect(router.navigate).toHaveBeenCalledWith(['/course'], {
//       state: { courseID: '1' },
//     });
//   });
// });
