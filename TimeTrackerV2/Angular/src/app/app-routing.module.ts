import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { loginGuard, adminGuard, instructGuard, studentGuard } from './auth-guard.guard';
import { AdminEvalsComponent } from './admin-evals/admin-evals.component';
import { AssignEvalsComponent } from './assign-evals/assign-evals.component';
import { CourseComponent } from './course/course.component';
import { CoursesComponent } from './courses/courses.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EvalComponent } from './eval/eval.component';
import { GroupComponent } from './group/group.component';
import { LoginComponent } from './login/login.component';
import { ManageEvalsComponent } from './manage-evals/manage-evals.component';
import { ProjectComponent } from './project/project.component';
import { RegisterComponent } from './register/register.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';
import { ViewEvalComponent } from './view-eval/view-eval.component';
import { ViewEvalsComponent } from './view-evals/view-evals.component';
import { ViewReportComponent } from './view-report/view-report.component';
import { AddCoursesComponent } from './add-courses/add-courses.component';
import { CreateCourseComponent } from './create-course/create-course.component';
import { EditCourseComponent } from './edit-course/edit-course.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { AddStudentProjectComponent } from './add-student-project/add-student-project.component';
import { EditTimecardComponent } from './edit-timecard/edit-timecard.component';
import { InactiveCoursesComponent } from './inactive-courses/inactive-courses.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'admin-evals', component: AdminEvalsComponent },
  { path: 'assign-evals', component: AssignEvalsComponent, canActivate: [instructGuard]},
  { path: 'course', component: CourseComponent, canActivate: [loginGuard] },  // Previously course/:id
  { path: 'courses', component: CoursesComponent, canActivate: [studentGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [loginGuard] },
  { path: 'eval', component: EvalComponent },
  { path: 'group', component: GroupComponent },
  { path: 'manage-evals', component: ManageEvalsComponent, canActivate: [instructGuard]},
  { path: 'project', component: ProjectComponent, canActivate: [loginGuard]},  // Previously project/:id
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [loginGuard]},  // Previously profile/:id
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [loginGuard]},
  { path: 'user', component: UserComponent },
  { path: 'users', component: UsersComponent, canActivate: [adminGuard] },
  { path: 'view-eval', component: ViewEvalComponent },
  { path: 'view-evals', component: ViewEvalsComponent },
  { path: 'report', component: ViewReportComponent, canActivate: [loginGuard] },
  { path: 'resetpassword', component: ResetpasswordComponent, canActivate: [loginGuard] },
  { path: 'add-courses', component: AddCoursesComponent, canActivate: [instructGuard] },
  { path: 'create-course', component: CreateCourseComponent, canActivate: [instructGuard] },
  { path: 'edit-course', component: EditCourseComponent, canActivate: [instructGuard] },  // Previously edit-course/:id
  { path: 'create-project', component: CreateProjectComponent, canActivate: [instructGuard] },  // Previously create-project/:id
  { path: 'edit-project', component: EditProjectComponent, canActivate: [instructGuard] },  // Previously edit-project/:id
  { path: 'add-students-project', component: AddStudentProjectComponent, canActivate: [instructGuard] },  // Previously add-students-project/:id
  { path: 'edit-timecard', component: EditTimecardComponent, canActivate: [instructGuard] },  // Previously edit-timecard/:id
  { path: 'past-courses', component: InactiveCoursesComponent, canActivate: [instructGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
export const RoutingComponents = [
  DashboardComponent,
  AdminEvalsComponent,
  CourseComponent,
  CoursesComponent,
  EvalComponent,
  AssignEvalsComponent,
  GroupComponent,
  LoginComponent,
  ManageEvalsComponent,
  ProjectComponent,
  RegisterComponent,
  UserComponent,
  UsersComponent,
  ViewEvalComponent,
  ViewEvalsComponent,
  ResetpasswordComponent,
  AddCoursesComponent,
  CreateCourseComponent,
  CreateProjectComponent,
  AddStudentProjectComponent
]
