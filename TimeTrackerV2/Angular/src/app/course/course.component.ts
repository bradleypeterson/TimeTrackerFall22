import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})

export class CourseComponent implements OnInit {
  public course: any;
  public projects: any = [];  // This is redundant information, if the user is not part of any project, or the variable allUserGroups size is 0, then the variable nonUserGroups contains every project for the course.  I am however am not the one that created this logic so I am not removing it because I don't know if it is used in local storage in anywhere else but here, it will simply not be used in the HTML for the component.
  public errMsg = '';
  public allUserGroups: any = [];
  public nonUserGroups: any = [];
  public filteredProjects: any = [];  // This is redundant information because of the same reason as stated above.
  public projectSearchQuery: any = '';
  public allUserFilteredProjects: any = [];
  public nonUserFilteredProjects: any = [];
  public filtering: boolean = false;

  private courseID: any;

  public instructor: boolean = false;
  public student: boolean = false;
  public userID: string = '';
  public userInCourse: boolean = false;

  public currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (!tempUser) {
      this.router.navigate(["/Login"]);
      return;
    }
    this.currentUser = JSON.parse(tempUser);
    // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
    console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only
    this.courseID = this.router.getCurrentNavigation()?.extras.state?.courseID;
  }

  ngOnInit(): void {
    // get user type
    let currentUser = localStorage.getItem('currentUser');
    var userData = currentUser ? JSON.parse(currentUser) : null;
    var userType = userData.type;
    this.userID = userData.userID;
    if (userType === 'instructor') {
      this.instructor = true;
    } else if (userType === 'student') {
      this.student = true;
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

    this.checkUserInCourse();

    this.loadPage();
  }

  loadPage(): void {
    this.getCourseInfo();

    // get projects
    this.loadProjects();
    this.loadAllUserGroups();
    this.loadNonUserGroups();

    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload');
      location.reload();
    } else {
      localStorage.removeItem('foo');
    }
  }

  getCourseInfo(): void {
    this.http.get<any>(`https://localhost:8080/api/CourseInfo/${this.courseID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
        next: data => {
            this.errMsg = "";
            this.course = data;
        },
        error: error => {
            this.errMsg = error['error']['message'];
        }
    });
  }

  loadProjects(): void {
    this.http.get("https://localhost:8080/api/Projects/" + this.courseID).subscribe((data: any) => {
      this.projects = data;
      if (this.projects) {
        localStorage.setItem("projects", JSON.stringify(this.projects));
      }
    });
  }

  loadAllUserGroups(): void {
    this.http.get<any>(`https://localhost:8080/api/ProjectsForUser/${this.courseID}/${this.userID}/userGroups`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        // console.log(data);
        this.allUserGroups = data;
        this.allUserFilteredProjects = data;
        if (this.allUserGroups) {
          localStorage.setItem("allUserGroups", JSON.stringify(this.allUserGroups));
        }
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  loadNonUserGroups(): void {
    this.http.get<any>(`https://localhost:8080/api/ProjectsForUser/${this.courseID}/${this.userID}/nonUserGroups`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        // console.log(data);
        this.nonUserGroups = data;
        this.nonUserFilteredProjects = data;
        if (this.nonUserGroups) {
          localStorage.setItem("nonUserGroups", JSON.stringify(this.nonUserGroups));
        }
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  checkUserInCourse(): void {
    this.http.get<any>(`https://localhost:8080/api/Courses/UserInCourse/${this.courseID}/${this.userID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        let dataCheck = data;
        if (Object.keys(dataCheck).length > 0) {
          this.userInCourse = true;
        }
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  NavigateToEditCourse() {
    let state = {courseID: this.courseID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate([`/edit-course`], { state });
  }

  NavigateToAddProject() {
    let state = {courseID: this.courseID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate([`/create-project`], { state });
  }

  GoToProject(projectID: number) {
    let state = {projectID: projectID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate([`/project`], { state });
  }

  join(ProjectID: any) {
    let req = {
      userID: this.currentUser.userID,
      projectID: ProjectID
    };

    this.http.post<any>('https://localhost:8080/api/joinGroup/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadPage();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  leave(ProjectID: any) {
    let req = {
      userID: this.currentUser.userID,
      projectID: ProjectID
    };

    this.http.post<any>('https://localhost:8080/api/leaveGroup/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadPage();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  delete() {
    if(confirm("Are you sure you want to delete " + this.course.courseName + "?")){
      let req = {
        courseID: this.courseID
      };
  
      this.http.post<any>('https://localhost:8080/api/deleteCourse/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
        next: data => {
          this.errMsg = "";
          window.location.replace("/dashboard");
        },
        error: error => {
          this.errMsg = error['error']['message'];
        }
      });
    }
  }

  searchProjects(): void {
    const projectName = this.projectSearchQuery.toLowerCase();

    this.filtering = !projectName ? false : true;  // if the field is not supplied, then we are not filtering the data, we will return all the projects

    this.allUserFilteredProjects = this.allUserGroups.filter((project: any) => {
        // The below Match condition is read as follows, if the field is not supplied OR the field's data matches the current project, then it is considered a match.
        const nameMatch = !projectName || project.projectName.toLowerCase().includes(projectName);

        return nameMatch;  // If the name matches, then the variable "project" is included inside the array "this.allUserFilteredProjects".
    });

    this.nonUserFilteredProjects = this.nonUserGroups.filter((project: any) => {
        // The below Match condition is read as follows, if the field is not supplied OR the field's data matches the current project, then it is considered a match.
        const nameMatch = !projectName || project.projectName.toLowerCase().includes(projectName);

        return nameMatch;  // If the name matches, then the variable "project" is included inside the array "this.nonUserFilteredProjects".
    });
  }
}
