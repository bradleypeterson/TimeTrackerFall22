const express = require("express");  //includes the "express" module so we can use it inside this file.  Module documentation https://www.w3schools.com/nodejs/nodejs_modules.asp

const router = express.Router();

//#region Controller imports (imports everything inside the {} to this file)
const {
    Register,
    Login,
} = require("./controllers/AccountControllers")

const {
    GetAllCoursesNamesDescriptionIDs,
    GetAllCoursesForInstructorID,
    GetAllCourses,
} = require("./controllers/CourseControllers")

const {
    CreateNewGroup,
} = require("./controllers/MiscellaneousControllers")

const {
    GetAllProjectsForUser,
    GetUserTimesForProject,
    GetAllProjectsForCourse,
    GetUserProjectsForCourse,
    GetNonUserProjectsForCourse,
    JoinGroup,
    LeaveGroup,
    GetAllStudentsInProject,
    GetAllStudentsNotInProject,
    AddStudentToProject,
    DropStudentFromProject
} = require("./controllers/ProjectControllers")

const {
    GetAllTimeCardsForUserInProject,
    GetAllTimeCardsForUser,
    SaveTimeCard,
} = require("./controllers/TimeCardControllers")

const {
    GetAllFirstLastUserNames,
    GetCoursesRegisteredFor,
    GetCoursesNotRegisteredFor,
    RegisterForCourse,
    DropCourse,
    CreateCourse,
    DeleteCourse,
    CreateProject,
    DeleteProject,
} = require("./controllers/UsersControllers")
//#endregion


//This is used to validate that the api route is working, it has no functional purposes other then that
router.get("/", (req, res) => {
    res.send("api route working");
});

//#region Account routes
router.post("/register", Register);

router.post("/login", Login);
//#endregion

//#region Course routes
router.get('/Courses', GetAllCoursesNamesDescriptionIDs);

router.get('/Courses/:id', GetAllCoursesForInstructorID);

router.get('/Add-Courses', GetAllCourses);
//#endregion

//#region Miscellaneous routes
router.post('/createGroup', CreateNewGroup);
//#endregion

//#region Project routes
router.get('/ProjectsForUser/:userID', GetAllProjectsForUser);

router.get('/Projects/:id/Users', GetUserTimesForProject);

router.get('/Projects/:id', GetAllProjectsForCourse);

router.get('/ProjectsForUser/:courseID/:userID/userGroups', GetUserProjectsForCourse);

router.get('/ProjectsForUser/:courseID/:userID/nonUserGroups', GetNonUserProjectsForCourse);

router.get('/AddToProject/:projectID/InProject', GetAllStudentsInProject);

router.get('/AddToProject/:projectID/NotInProject', GetAllStudentsNotInProject);

router.get('/AddToProject/:projectID/:userID/Add', AddStudentToProject);

router.get('/AddToProject/:projectID/:userID/Drop', DropStudentFromProject);
//#endregion

//#region Time card routes
router.get('/Users/:userId/:projectID/activities', GetAllTimeCardsForUserInProject);

router.get('/Users/:userId/activities', GetAllTimeCardsForUser);

router.post('/clock', SaveTimeCard);
//#endregion

//#region User routes
router.get('/Users', GetAllFirstLastUserNames);

//#region Student specific controllers
router.get('/Users/:userId/getUserCourses', GetCoursesRegisteredFor);

router.get('/Users/:userId/getNonUserCourses', GetCoursesNotRegisteredFor);

router.post('/addUserCourse', RegisterForCourse);

router.post('/deleteUserCourse', DropCourse);

router.post('/joinGroup', JoinGroup);

router.post('/leaveGroup', LeaveGroup);
//#endregion

//#region Instructor specific controllers
router.post('/createCourse', CreateCourse);

router.post('/deleteCourse', DeleteCourse);

router.post('/createProject', CreateProject);

router.post('/deleteProject', DeleteProject);
//#endregion
//#endregion


module.exports = router;  //export the constant "router" (which contains the get, post, put, and delete http responses) so that we can make use of it outside this file.  This is the middleware that Router.use() requires to run.  https://stackoverflow.com/questions/27465850/typeerror-router-use-requires-middleware-function-but-got-a-object