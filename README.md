# TimeTrackerV2
More documentation is found in the docs folder, 
##Time Tracker 23 Hand-Off Document
This is a pure Angular version of Weber State's TimeTracker App. Currently supports user registration and basic clock-in/clock-out.

## Startup Instructions
For first time startup, navigate to the directory containing the docker-compose.yml (this should be the root) and run the following command:
```bash
docker-compose up --build
```
For any subsequent startups, run
```bash
docker-compose up -d
```
The -d parameter will remove trailing logs, so omit it if you'd like logs to appear in the console. Only run with --build if you make changes to the package.json or config files on either project.
#### Note: The database will self build when the project is first created using the seed.js

## Application Stack and Development Tools

### Application Stack
- **SEAN (SQL, Express, Angular, Node)**
- Front End: Angular 16
- Back End: NodeJS with Express 
- Database: SQLite3


### Development Tools
- **VSCode**: [Download](https://code.visualstudio.com/download)
  - Extensions: SQLite by alexcvzz (allows running and testing queries through VSCode)
- **SQLite3**: [Download](https://www.sqlite.org/download.html)
- **NodeJS**: [Download](https://nodejs.org/en/download/)
- **Docker Desktop**: [Download](https://www.docker.com/products/docker-desktop) (Optional, depending on setup)
- **RESTer Chrome Extension**: [Download](https://chromewebstore.google.com/detail/rester/eejfoncpjfgmeleakejdcanedmefagga?pli=1) (for HTTP requests)
- **Command Line Installation**: 
  - `npm install -g @angular/cli`

## Configuring Node/Angular Servers Using Docker

### Steps for Package/Docker Image Installation:
1. **Clone the repository.**
2. **Install SQLite, NodeJS, and Docker; enable WSL2 on your system. Restart your computer post-installation.**
   - Note: For SQLite, install both versions with “win32” in their name.
3. **Ensure Docker Desktop is running.**
4. **Navigate to the directory with `docker-compose.yml` and run `docker-compose up --build`.**
5. **Wait for installation completion.** The process is complete when you see “Compiled successfully.”
6. **Verify servers running:** Access `https://localhost:4200` for the front end and `https://localhost:8080` for the back end.
7. **To remove Docker containers:** Run `docker-compose down`.

### Starting/Stopping NodeJS and Angular Servers:
#### Using Docker Desktop
- Go to the Containers tab. Find the container named “timetrackerv2” and use the Play/Stop symbol.

#### Using Terminal
- Ensure Docker Desktop is running.
- Navigate to `Root_of_the_repository\TimeTrackerV2\`.
  - To start servers: Run `docker-compose up -d` or `docker-compose up`.
  - To stop servers: Run `docker-compose stop` or use “Ctrl + C”.

### Alternate Installation and Startup Method (Local Hardware):
#### Using Windows PowerShell
1. **Change execution policy to “RemoteSigned”.**
   - Check current settings with `Get-ExecutionPolicy -List`.
   - Set policy using `Set-ExecutionPolicy RemoteSigned -Scope LocalMachine` or `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`.
2. **Navigate to repository directory `Root_of_the_repository\TimeTracker23\TimeTrackerV2`.**
3. **Install packages:** Run `.\Install_Packages.ps1`.
4. **Start the server:** Run `.\Start_Servers.ps1`.

## Configuring PC for HTTPS Connections
- Certificates are valid from 11/3/2023 to 11/2/2024. Install OpenSSL if needed to generate new certificates.
- **Method 1**: Visit `https://localhost:8080` and `https://localhost:4200`, click “Advanced” then “Proceed to localhost (unsafe)”.
- **Method 2**: Install certificates manually located at `Root_of_the_repository\TimeTrackerV2\NodeAPI\certificates\cert.crt` and `Root_of_the_repository\TimeTrackerV2\Angular\certificates\cert.crt`.
  - For detailed installation steps, refer to the document.

## Application Components
- **Components Overview**: Located under `TimeTracker23\TimeTrackerV2\Angular\src\app`.
- **Specific Components**:
  - `add-courses`: Not used; course addition is handled in the courses component.
  - `add-student-project`: Allows instructors to add students to projects. It sorts students by their project enrollment status.
  - `admin-evals`: Currently not in use.
  - `assign-evals`: Enables instructors to assign evaluations to projects. Accessible via the “Assign Evals” button on the course page for instructors.
  - `changepassword`: This functionality is incorporated in the `resetpassword` component; currently unused and unfinished.
  - `course`: Displays all projects and students within a course.
  - `course-reports`: Shows detailed report data about students, their project engagements, and their total contribution time.
  - `courses`: Viewed by students for registering, dropping, and searching courses.
  - `create-course`: Allows instructors to create new courses, accessible through the navbar or dashboard.
  - `create-project`: Enables instructors to add new projects to courses, accessible from the course page.
  - `dashboard`: Home page post-login, displaying different information based on user roles: admin, instructor, and student.
  - `edit-course`: For instructors to edit course details, accessible via the course page.
  - `edit-profile`: Allows users to edit their bios, contact information, and pronouns.
  - `edit-project`: Enables instructors to edit project details and set project status (active/inactive).
  - `edit-timecard`: Allows instructors to modify time entries made by students in the project history section.
  - `eval`: Accessed by students when an evaluation is due, indicated by a button on their dashboard.
  - `group`: Not used; group functionality is integrated within the project component.
  - `inactive-courses`: Lists past courses marked as inactive by the instructor.
  - `login`: The main login page for all users.
  - `manage-evals`: Used by instructors to edit and create new evaluations, accessible via the dashboard.
  - `navigation`: Utilized for debugging to access routes to all pages and components.
  - `pipes`: Parses time in milliseconds into hours, minutes, and seconds.
  - `project`: Displays time log information for groups; users can view and add time entries for their projects.
  - `register`: Registration page for new users to create student or instructor accounts.
  - `resetpassword`: Enables users to reset their own passwords. Admins can also reset passwords for other users.
  - `user`: Currently not in use.
  - `user-profile`: Displays the user’s name, pronouns, contact, and bio. Accessible through the navbar.
  - `users`: Allows admins to view and manage all users, including setting active/inactive status and changing user types.
  - `view-eval`, `view-evals`: Currently not in use.
  - `view-report`: Gathers all timecard information for each student in a project.


