import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { AppRoutingModule, RoutingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { TotalTimePipe } from './pipes/total-time.pipe';
import { NgChartsModule } from 'ng2-charts';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationComponent } from './navigation/navigation.component';
import { InstructorReportsComponent } from './instructor-reports/instructor-reports.component';



@NgModule({
  declarations: [
    AppComponent,
    RoutingComponents,
    LoginComponent,
    TotalTimePipe,
    NavigationComponent,
    InstructorReportsComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule,
    MatCardModule,
  ],
  providers: [FormBuilder],
  bootstrap: [AppComponent]
})
export class AppModule { }
