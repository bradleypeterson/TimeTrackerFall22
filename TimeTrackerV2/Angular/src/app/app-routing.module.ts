import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'admin-evals', component: AdminEvalsComponent },
  { path: 'assign-evals', component: AssignEvalsComponent },
  { path: 'course', component: CourseComponent },  // Previously course/:id
  { path: 'courses', component: CoursesComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'eval', component: EvalComponent },
  { path: 'group', component: GroupComponent },
  { path: 'manage-evals', component: ManageEvalsComponent },
  { path: 'project', component: ProjectComponent },  // Previously project/:id
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: UserProfileComponent},  // Previously profile/:id
  { path: 'edit-profile', component: EditProfileComponent},
  { path: 'user', component: UserComponent },
  { path: 'users', component: UsersComponent },
  { path: 'view-eval', component: ViewEvalComponent },
  { path: 'view-evals', component: ViewEvalsComponent },
  { path: 'report', component: ViewReportComponent },
  { path: 'resetpassword', component: ResetpasswordComponent },
  { path: 'add-courses', component: AddCoursesComponent },
  { path: 'create-course', component: CreateCourseComponent },
  { path: 'edit-course', component: EditCourseComponent },  // Previously edit-course/:id
  { path: 'create-project', component: CreateProjectComponent },  // Previously create-project/:id
  { path: 'edit-project', component: EditProjectComponent },  // Previously edit-project/:id
  { path: 'add-students-project', component: AddStudentProjectComponent },  // Previously add-students-project/:id
  { path: 'edit-timecard', component: EditTimecardComponent },  // Previously edit-timecard/:id
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
