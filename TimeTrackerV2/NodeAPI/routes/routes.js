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
} = require("./controllers/CourseControllers")

const {
    CreateNewGroup,
} = require("./controllers/MiscellaneousControllers")

const {
    GetProjectInfo,
    GetActiveProjectsForUser: GetAllProjectsForUser,
    GetUserTimesForProject,
    GetAllProjectsForCourse,
    GetUserProjectsForCourse,
    GetNonUserProjectsForCourse,
    JoinGroup,
    LeaveGroup,
    GetAllStudentsInProject,
    GetAllStudentsNotInProject,
} = require("./controllers/ProjectControllers")

const {
    GetReportsData,
    GetAllTimeCardsForUserInProject,
    GetAllTimeCardsForUser,
    SaveTimeCard,
} = require("./controllers/TimeCardControllers")

const {
    GetUserInfo,
    GetUserProfile,
    GetAllFirstLastUserNames,
    GetCoursesRegisteredFor,
    GetCoursesNotRegisteredFor,
    RegisterForCourse,
    DropCourse,
    CreateCourse,
    EditCourse,
    DeleteCourse,
    CreateProject,
    EditProject,
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
//#endregion

//#region Miscellaneous routes
router.post('/createGroup', CreateNewGroup);
//#endregion

//#region Project routes
router.get('/ProjectInfo/:id', GetProjectInfo);

router.get('/ProjectsForUser/:userID', GetAllProjectsForUser);

router.get('/Projects/:id/Users', GetUserTimesForProject);

router.get('/Projects/:id', GetAllProjectsForCourse);

router.get('/ProjectsForUser/:courseID/:userID/userGroups', GetUserProjectsForCourse);

router.get('/ProjectsForUser/:courseID/:userID/nonUserGroups', GetNonUserProjectsForCourse);

router.get('/AddToProject/:projectID/InProject', GetAllStudentsInProject);

router.get('/AddToProject/:projectID/NotInProject', GetAllStudentsNotInProject);
//#endregion

//#region Time card routes
router.get('/Course/:courseID/GetReportsData', GetReportsData);

router.get('/Users/:userID/:projectID/activities', GetAllTimeCardsForUserInProject);

router.get('/Users/:userID/activities', GetAllTimeCardsForUser);

router.post('/clock', SaveTimeCard);
//#endregion

//#region User routes
router.get('/GetUserInfo/:id', GetUserInfo);

router.get('/UserProfile/:userID', GetUserProfile);

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

router.post('/editCourse', EditCourse);

router.post('/deleteCourse', DeleteCourse);

router.post('/createProject', CreateProject);

router.post('/editProject', EditProject);

router.post('/deleteProject', DeleteProject);
//#endregion
//#endregion


module.exports = router;  //export the constant "router" (which contains the get, post, put, and delete http responses) so that we can make use of it outside this file.  This is the middleware that Router.use() requires to run.  https://stackoverflow.com/questions/27465850/typeerror-router-use-requires-middleware-function-but-got-a-object