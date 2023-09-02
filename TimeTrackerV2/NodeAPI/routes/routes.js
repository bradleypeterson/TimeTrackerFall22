const express = require("express");  //includes the "express" module so we can use it inside this file.  Module documentation https://www.w3schools.com/nodejs/nodejs_modules.asp

const router = express.Router();

const {
    Register,
    Login,
} = require("./controllers/AccountControllers") //imports everything from inside the {} from the AccountControllers.ts file

const {
    GetAllCoursesNamesIDs,
    GetAllCoursesForInstructorID,
    GetAllCourses,
} = require("./controllers/CourseControllers")

const {
    GetFirstLastUserName,
} = require("./controllers/UsersControllers")

const {
    GetAllTimeCardsForUserInProject,
    GetAllTimeCardsForUser,
    ClockOperation,
} = require("./controllers/TimeCardControllers")

const {
    GetAllProjectsForAllCourses,
    CurrentlyUnknownFunction1,
} = require("./controllers/ProjectControllers")

const {
    CreateNewGroup,
} = require("./controllers/MiscellaneousControllers")

//This is used to validate that the api route is working, it has no functional purposes other then that
router.get("/", (req, res) => {
    res.send("api route working");
});

//#region Account routes
router.post("/register", Register);

router.post("/login", Login);
//#endregion

//#region Course routes
router.get('/Courses', GetAllCoursesNamesIDs);

router.get('/Courses/:id', GetAllCoursesForInstructorID);

router.get('/Add-Courses', GetAllCourses);
//#endregion

//#region User routes
router.get('/Users', GetFirstLastUserName);
//#endregion

//#region Time card routes
router.get('/Users/:userId/:projectID/activities', GetAllTimeCardsForUserInProject);

router.get('/Users/:userId/activities', GetAllTimeCardsForUser);

router.post('/clock', ClockOperation);
//#endregion

//#region Project routes
router.get('/Projects', GetAllProjectsForAllCourses);

router.get('/Projects/:id/Users', CurrentlyUnknownFunction1);
//#endregion

//#region Miscellaneous routes
router.post('/createGroup', CreateNewGroup);
//#endregion

module.exports = router;  //export the constant "router" (which contains the get, post, put, and delete http responses) so that we can make use of it outside this file.  This is the middleware that Router.use() requires to run.  https://stackoverflow.com/questions/27465850/typeerror-router-use-requires-middleware-function-but-got-a-object