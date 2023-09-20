import { Component } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

  routes = [
    { path: '', label: 'Login' },
    { path: '../admin-evals', label: 'Admin Evals' },
    { path: '../assign-evals', label: 'Assign Evals' },
    // { path: 'course/:id', component: CourseComponent },
    { path: '../courses', label: 'CoursesComponent' },
    { path: '../dashboard', label: 'DashboardComponent' },
    { path: '../eval', label: 'EvalComponent' },
    { path: '../group', label: 'GroupComponent' },
    { path: '../manage-evals', label: 'ManageEvalsComponent' },
    // { path: '../project/:id', label: 'ProjectComponent' },
    { path: '../register', label: 'RegisterComponent' },
    { path: '../user', label: 'UserComponent' },
    { path: '../users', label: 'UsersComponent' },
    { path: '../view-eval', label: 'ViewEvalComponent' },
    { path: '../view-evals', label: 'ViewEvalsComponent' },
    { path: '../resetpassword', label: 'ResetpasswordComponent' },
    { path: '../add-courses', label: 'AddCoursesComponent' },
    { path: '../create-course', label: 'CreateCourseComponent' },
    // { path: 'delete-course/:id', label: 'DeleteCourseComponent' },
    // { path: 'create-project/:id', label: 'CreateProjectComponent' },
    { path: '../instructor-reports', label: 'InstructorReportsComponent' },




  ];

  constructor() { }

}
