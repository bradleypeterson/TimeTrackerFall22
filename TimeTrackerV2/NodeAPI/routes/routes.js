const express = require("express"); //includes the "express" module so we can use it inside this file.  Module documentation https://www.w3schools.com/nodejs/nodejs_modules.asp

const router = express.Router();

//#region Controller imports (imports everything inside the {} to this file)
const {
    Register,
    BulkRegister,
    GrabSaltForUser,
    Login,
    DeleteAccount,
    DefaultAdminAccountCreated,
    ChangePassword,
    UpdateUserInfo,
} = require("./controllers/AccountControllers");

const {
  GetAllCoursesNamesDescriptionIDs,
  GetAllCoursesForInstructorID,
  GetInactiveCoursesForInstructorID,
  GetCourseInfo,
  CheckUserInCourse,
  CreateCourse,
  EditCourse,
  DeleteCourse,
  GetPendInstrCourses,
  GetCoursesRegisteredFor,
  GetCoursesNotRegisteredFor,
  GetCoursesPendCourses,
  PutUserInPending,
  RegisterForCourse,
  DropCourse,
  RemovePendUser,
  GetRecentCourses,
  RemoveStudentFromCourse,
  GetStudentsNotInCourse,
} = require("./controllers/CourseControllers");

const { CreateNewGroup } = require("./controllers/MiscellaneousControllers");

const {
  GetProjectInfo,
  GetActiveProjectsForUser,
  GetUserTimesForProject,
  GetAllProjectsForCourse,
  GetUserProjectsForCourse,
  GetNonUserProjectsForCourse,
  JoinGroup,
  LeaveGroup,
  GetAllStudentsInProject,
  GetAllStudentsNotInProject,
  CreateProject,
  EditProject,
  DeleteProject,
  GetRecentProjects,
} = require("./controllers/ProjectControllers");

const {
  GetReportsData,
  GetAllTimeCardsForUserInProject,
  GetAllTimeCardsForUser,
  SaveTimeCard,
  DeleteTimeCard,
  EditTimeCard,
  GetTimeCardInfo,
} = require("./controllers/TimeCardControllers");

const {
  GetUserInfo,
  GetUserProfile,
  EditUserProfile,
  GetUsersInfo,
  GetRecentUsers,
  GetUsersPendingApproval,
} = require("./controllers/UsersControllers");

const {
    GetQuestionTypes,
    AddQuestion,
    AddTemplate,
    GetQuestions,
    GetTemplates,
    UpdateQuestion,
    DeleteQuestion,
    AssignEvalToProjects,
    GetAssignedEvals,
    SubmitResponses,
    evalCompleted,

} = require("./controllers/EvalControllers");
//#endregion

//This is used to validate that the api route is working, it has no functional purposes other then that
router.get("/", (req, res) => {
  res.send("api route working");
});

//#region Account routes
router.post("/register", Register);

router.post("/bulk_register", BulkRegister);

router.get("/saltForUser/:username", GrabSaltForUser);

router.post("/login", Login);

router.delete("/deleteAccount", DeleteAccount);

router.delete("/removeStudentFromCourse", RemoveStudentFromCourse);

router.get("/defaultAdminCreated", DefaultAdminAccountCreated);

router.put("/resetPassword/:userID", ChangePassword);

router.post("/UpdateUserInfo", UpdateUserInfo);
//#endregion

//#region Course routes
router.get("/Courses", GetAllCoursesNamesDescriptionIDs);

router.get("/Courses/:id", GetAllCoursesForInstructorID);

router.get(
  "/Courses/:id/getInactiveCourses",
  GetInactiveCoursesForInstructorID
);

router.get("/CourseInfo/:id", GetCourseInfo);

router.get("/Courses/UserInCourse/:courseID/:userID", CheckUserInCourse);

router.get("/GetRecentCourses/", GetRecentCourses);

//#region Instructor specific controllers
router.post("/createCourse", CreateCourse);

router.post("/editCourse", EditCourse);

router.post("/deleteCourse", DeleteCourse);

router.get("/Users/:userId/getPendInstrCourses", GetPendInstrCourses);
//#endregion

//#region Student specific controllers
router.get("/Users/:userId/getUserCourses", GetCoursesRegisteredFor);

router.get("/Users/:userId/getNonUserCourses", GetCoursesNotRegisteredFor);

router.get("/Users/:userId/getCoursesPendCourses", GetCoursesPendCourses);

router.post("/putUserInPending", PutUserInPending);

router.post("/addUserCourse", RegisterForCourse);

router.post("/deleteUserCourse", DropCourse);

router.post("/removePendUser", RemovePendUser);

//#endregion

//#endregion

//#region Miscellaneous routes
router.post("/createGroup", CreateNewGroup);
router.get("/UsersPendingApproval", GetUsersPendingApproval);
//#endregion

//#region Project routes
router.get("/ProjectInfo/:id", GetProjectInfo);

router.get("/ProjectsForUser/:userID", GetActiveProjectsForUser);

router.get("/Projects/:id/Users", GetUserTimesForProject);

router.get("/Projects/:id", GetAllProjectsForCourse);

router.get("/ProjectsForUser/:courseID/:userID/", GetUserProjectsForCourse);

router.get(
  "/ProjectsForUser/:courseID/:userID/nonUserGroups",
  GetNonUserProjectsForCourse
);

router.post("/joinGroup", JoinGroup);

router.post("/leaveGroup", LeaveGroup);

router.post("/createProject", CreateProject);

router.post("/editProject", EditProject);

router.post("/deleteProject", DeleteProject);

router.get("/AddToProject/:projectID/InProject", GetAllStudentsInProject);

router.get("/AddToProject/:projectID/NotInProject", GetAllStudentsNotInProject);

router.get("/GetStudentsNotInCourse/:courseID", GetStudentsNotInCourse);

router.get("/GetRecentProjects/", GetRecentProjects);
//#endregion

//#region Time card routes
router.get("/Course/:courseID/GetReportsData", GetReportsData);

router.get(
  "/Users/:userID/:projectID/activities",
  GetAllTimeCardsForUserInProject
);

router.get("/Users/:userID/activities", GetAllTimeCardsForUser);

router.post("/clock", SaveTimeCard);

router.post("/deleteTimeCard", DeleteTimeCard);

router.post("/editTimeCard", EditTimeCard);

router.get("/TimeCardInfo/:id", GetTimeCardInfo);
//#endregion

//#region User routes
router.get("/GetUserInfo/:id", GetUserInfo);

router.get("/UserProfile/:userID", GetUserProfile);

router.post("/EditProfile", EditUserProfile);

router.get("/Users", GetUsersInfo);

router.get("/GetRecentUsers", GetRecentUsers);
//#endregion

//#region Eval routes
router.get("/questionTypes", GetQuestionTypes);

router.post("/addQuestion", AddQuestion);

router.post("/addTemplate/:evaluatorID", AddTemplate);

router.get("/questions/:templateID", GetQuestions);

router.get("/templates/:evaluatorID", GetTemplates);

router.put("/updateQuestion/:questionID", UpdateQuestion);

router.delete("/deleteQuestion/:questionID", DeleteQuestion);

router.post("/assignEvalToProjects", AssignEvalToProjects);

router.get("/getAssignedEvals/:evaluateeID/:projectID", GetAssignedEvals);

router.post("/submitResponses", SubmitResponses);

router.post("/evalCompleted", evalCompleted);

//#endregion

module.exports = router; //export the constant "router" (which contains the get, post, put, and delete http responses) so that we can make use of it outside this file.  This is the middleware that Router.use() requires to run.  https://stackoverflow.com/questions/27465850/typeerror-router-use-requires-middleware-function-but-got-a-object
