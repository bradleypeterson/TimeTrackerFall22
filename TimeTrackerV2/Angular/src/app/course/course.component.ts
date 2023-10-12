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
  public projects: any = [];
  public errMsg = '';
  public allUserGroups: any = [];
  public nonUserGroups: any = [];
  public filteredProjects: any = [];
  public projectSearchQuery: any = '';
  public allUserFilteredProjects: any = [];
  public nonUserFilteredProjects: any = [];

  private courseID: any;

  public instructor: boolean = false;
  public student: boolean = false;
  public userID: string = '';

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

    this.courseID = this.activatedRoute.snapshot.params['id']; // get course id from URL

    if (this.courseID) { // set course to course from local storage based on course ID
      let temp = localStorage.getItem('courses');

      if (temp) {
        const courses = JSON.parse(temp);

        for (let course of courses) {
          if (Number(course.courseID) === Number(this.courseID)) {
            this.course = course;
          }
        }
      }
    }

    this.loadPage();
  }

  loadPage(): void {
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

  loadProjects(): void {
    this.http.get("http://localhost:8080/api/Projects/" + this.courseID).subscribe((data: any) => {
      this.projects = data;
      if (this.projects) {
        localStorage.setItem("projects", JSON.stringify(this.projects));
      }
    });
  }

  loadAllUserGroups(): void {
    this.http.get<any>(`http://localhost:8080/api/ProjectsForUser/${this.courseID}/${this.userID}/userGroups`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        // console.log(data);
        this.allUserGroups = data;
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
    this.http.get<any>(`http://localhost:8080/api/ProjectsForUser/${this.courseID}/${this.userID}/nonUserGroups`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        // console.log(data);
        this.nonUserGroups = data;
        if (this.nonUserGroups) {
          localStorage.setItem("nonUserGroups", JSON.stringify(this.nonUserGroups));
        }
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  join(ProjectID: any) {
    let req = {
      userID: this.currentUser.userID,
      projectID: ProjectID
    };

    this.http.post<any>('http://localhost:8080/api/joinGroup/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
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

    this.http.post<any>('http://localhost:8080/api/leaveGroup/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadPage();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  searchProjects(): void {
    let sizeOfFilteredProjects = 0;
    let sizeOfAllUserFilteredProjects = 0;
    let sizeOfNonUserFilteredProjects = 0;
    if (this.projectSearchQuery == '') {
      this.filteredProjects = [];
      this.allUserFilteredProjects = [];
      this.nonUserFilteredProjects = [];
    }
    else {
      sizeOfFilteredProjects = this.filteredProjects.length;
      this.filteredProjects.splice(0, sizeOfFilteredProjects);
      sizeOfAllUserFilteredProjects = this.allUserFilteredProjects.length;
      this.allUserFilteredProjects.splice(0, sizeOfAllUserFilteredProjects);
      sizeOfNonUserFilteredProjects = this.nonUserFilteredProjects.length;
      this.nonUserFilteredProjects.splice(0, sizeOfNonUserFilteredProjects);

      for (let p of this.projects) {
        if (p.projectName.toLowerCase().search(this.projectSearchQuery.toLowerCase()) != -1) {
          this.filteredProjects.push(p);
        }
        else {
          sizeOfFilteredProjects = this.filteredProjects.length;
          this.filteredProjects.splice(0, sizeOfFilteredProjects);
        }
      }

      for (let p of this.allUserGroups) {
        if (p.projectName.toLowerCase().search(this.projectSearchQuery.toLowerCase()) != -1) {
          this.allUserFilteredProjects.push(p);
        }
        else {
          sizeOfAllUserFilteredProjects = this.allUserFilteredProjects.length;
          this.allUserFilteredProjects.splice(0, sizeOfAllUserFilteredProjects);
          sizeOfNonUserFilteredProjects = this.nonUserFilteredProjects.length;
          this.nonUserFilteredProjects.splice(0, sizeOfNonUserFilteredProjects);
        }
      }

      for (let p of this.nonUserGroups) {
        if (p.projectName.toLowerCase().search(this.projectSearchQuery.toLowerCase()) != -1) {
          this.nonUserFilteredProjects.push(p);
        }
        else {
          sizeOfNonUserFilteredProjects = this.nonUserFilteredProjects.length;
          this.nonUserFilteredProjects.splice(0, sizeOfNonUserFilteredProjects);
          sizeOfAllUserFilteredProjects = this.allUserFilteredProjects.length;
          this.allUserFilteredProjects.splice(0, sizeOfAllUserFilteredProjects);
        }
      }
    }
  }

}
