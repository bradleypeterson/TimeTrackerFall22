import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css'],
})
export class CourseComponent implements OnInit {
  public course: any;
  public projects: any = []; // This is redundant information, if the user is not part of any project, or the variable allUserGroups size is 0, then the variable nonUserGroups contains every project for the course.  I am however am not the one that created this logic so I am not removing it because I don't know if it is used in local storage in anywhere else but here, it will simply not be used in the HTML for the component.
  public errMsg = '';
  public allUserGroups: any = [];
  public nonUserGroups: any = [];
  public filteredProjects: any = []; // This is redundant information because of the same reason as stated above.
  public projectSearchQuery: any = '';
  public allUserFilteredProjects: any[] = [];
  public nonUserFilteredProjects: any[] = [];
  public filtering: boolean = false;

  public courseID: any;

  public instructor: boolean = false;
  public admin: boolean = false;
  public student: boolean = false;
  public userID: string = '';
  public userInCourse: boolean = false;

  public currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (tempUser) {
      this.currentUser = JSON.parse(tempUser);
    }
    // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
    console.log(
      `State received: ${JSON.stringify(
        this.router.getCurrentNavigation()?.extras.state
      )}`
    ); // For debugging only
    this.courseID = this.router.getCurrentNavigation()?.extras.state?.courseID;
  }

  ngOnInit(): void {
    // get user type
    var userType = this.currentUser.type;
    this.userID = this.currentUser.userID;
    if (userType === 'instructor') {
      this.instructor = true;
    } else if (userType === 'student') {
      this.student = true;
    } else if (userType === 'admin') {
      this.admin = true;
    }

    // if (this.courseID) { // set course to course from local storage based on course ID
    //   let temp = localStorage.getItem('courses');

    //   if (temp) {
    //     const courses = JSON.parse(temp);

    //     for (let course of courses) {
    //       if (Number(course.courseID) === Number(this.courseID)) {
    //         this.course = course;
    //       }
    //     }
    //   }
    // }
    //

    this.checkUserInCourse();

    this.loadPage();
  }

  loadPage(): void {
    this.getCourseInfo();
    // get projects
    this.loadAllUserGroups();
    this.loadNonUserGroups();
  }

  getCourseInfo(): void {
    this.http
      .get<any>(`${environment.apiURL}/api/CourseInfo/${this.courseID}`, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.course = data;
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  loadProjects(): void {
    this.http
      .get(`${environment.apiURL}/api/Projects`)
      .subscribe((response: any) => {
        console.log('API Response:', response);

        // Ensure response is not null or undefined
        const allUserProjects = response?.allUserProjects || [];
        const nonUserProjects = response?.nonUserProjects || [];

        console.log('All User Projects:', allUserProjects);
        console.log('Non-User Projects:', nonUserProjects);
        // Transform response into arrays if necessary
        this.allUserFilteredProjects = Array.isArray(allUserProjects)
          ? allUserProjects
          : Object.values(allUserProjects);
        this.nonUserFilteredProjects = Array.isArray(nonUserProjects)
          ? nonUserProjects
          : Object.values(nonUserProjects);
      });
  }

  loadAllUserGroups(): void {
    this.http
      .get<any>(
        `${environment.apiURL}/api/ProjectsForUser/${this.courseID}/${this.userID}`,
        {
          headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
          }),
        }
      )
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.allUserGroups = data;
          this.allUserFilteredProjects = data;
          console.log('allUserGroups', this.allUserGroups);
          console.log('allUserFilteredProjects', this.allUserFilteredProjects);
          if (this.allUserGroups) {
            localStorage.setItem(
              'allUserGroups',
              JSON.stringify(this.allUserGroups)
            );
          }
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  loadNonUserGroups(): void {
    this.http
      .get<any>(
        `${environment.apiURL}/api/ProjectsForUser/${this.courseID}/${this.userID}/nonUserGroups`,
        {
          headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
          }),
        }
      )
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          // console.log(data);
          this.nonUserGroups = data;
          this.nonUserFilteredProjects = data;
          if (this.nonUserGroups) {
            localStorage.setItem(
              'nonUserGroups',
              JSON.stringify(this.nonUserGroups)
            );
          }
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  checkUserInCourse(): void {
    this.http
      .get<any>(
        `${environment.apiURL}/api/Courses/UserInCourse/${this.courseID}/${this.userID}`,
        {
          headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
          }),
        }
      )
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          let dataCheck = data;
          if (Object.keys(dataCheck).length > 0) {
            this.userInCourse = true;
          }
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  NavigateToEditCourse() {
    let state = { courseID: this.courseID };
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate([`/edit-course`], { state });
  }

  NavigateToAddProject() {
    let state = { courseID: this.courseID };
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate([`/create-project`], { state });
  }

  NavigateToAssignEvals() {
    let state = { courseID: this.courseID };
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate([`/assign-evals`], { state });
  }

  GoToProject(projectID: number) {
    let state = { projectID: projectID };
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate([`/project`], { state });
  }

  join(ProjectID: any) {
    let req = {
      userID: this.currentUser.userID,
      projectID: ProjectID,
    };

    this.http
      .post<any>(`${environment.apiURL}/api/joinGroup/`, req, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          // Directly load the groups without page reload
          this.loadAllUserGroups();
          this.loadNonUserGroups();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  leave(ProjectID: any) {
    let req = {
      userID: this.currentUser.userID,
      projectID: ProjectID,
    };

    this.http
      .post<any>(`${environment.apiURL}/api/leaveGroup/`, req, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          // Directly load the groups without page reload
          this.loadAllUserGroups();
          this.loadNonUserGroups();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  delete() {
    if (
      confirm('Are you sure you want to delete ' + this.course.courseName + '?')
    ) {
      let req = {
        courseID: this.courseID,
      };

      this.http
        .post<any>(`${environment.apiURL}/api/deleteCourse/`, req, {
          headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
          }),
        })
        .subscribe({
          next: (data) => {
            this.errMsg = '';
            window.location.replace('/dashboard');
          },
          error: (error) => {
            this.errMsg = error['error']['message'];
          },
        });
    }
  }

  searchProjects(): void {
    const projectName = this.projectSearchQuery.toLowerCase();

    this.filtering = !projectName ? false : true; // if the field is not supplied, then we are not filtering the data, we will return all the projects

    this.allUserFilteredProjects = this.allUserGroups.filter((project: any) => {
      // The below Match condition is read as follows, if the field is not supplied OR the field's data matches the current project, then it is considered a match.
      const nameMatch =
        !projectName || project.projectName.toLowerCase().includes(projectName);

      return nameMatch; // If the name matches, then the variable "project" is included inside the array "this.allUserFilteredProjects".
    });

    this.nonUserFilteredProjects = this.nonUserGroups.filter((project: any) => {
      // The below Match condition is read as follows, if the field is not supplied OR the field's data matches the current project, then it is considered a match.
      const nameMatch =
        !projectName || project.projectName.toLowerCase().includes(projectName);

      return nameMatch; // If the name matches, then the variable "project" is included inside the array "this.nonUserFilteredProjects".
    });
  }
}
