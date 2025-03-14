const ConnectToDB = require("../../database/DBConnection");

let db = ConnectToDB();

exports.GetQuestionTypes = async (req, res, next) => {
    console.log("EvalController.js file/GetQuestionTypes route called");
    let sql = `SELECT questionTypeText AS questionType
    FROM Question_Type`
    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong in grabbing the question types. Please try again later.' });
        }
        if (rows) {
            console.log(`Rows retrieved:  ${JSON.stringify(rows)}`);

            let returnData = [];
            rows.forEach((row) => {
                returnData.push(row.questionType);
            });

            console.log(`Returning data: ${returnData}`);

            return res.send(returnData);
        }
        else {
            return res.send("No errors occurred, however no rows were found either.");
        }
    });
};

exports.AddQuestion = async (req, res, next) => {
    console.log("EvalController.js file/AddQuestion route called");

    console.log("Request Body:", req.body);

    let questionText = req.body.questionText;
    let questionType = req.body.questionType;
    let templateID = req.body.templateID;
    console.log(
        "Question Text: " +
        questionText +
        ", Question Type: " +
        questionType +
        ", Template ID: " +
        templateID
    );

    if (!questionText || !questionType || !templateID) {
        return res
            .status(400)
            .json({ message: "Question text, type, and template ID are required" });
    }

    let questionTypeSQLSelection = `SELECT questionTypeID
    FROM Question_Type
    WHERE questionTypeText = ?`;

    db.get(questionTypeSQLSelection, [questionType], (err, row) => {
        if (err) {
            return res.status(500).json({ message: `Something went wrong in grabbing the ID for question type \"${questionType}\". Please try again later.` });
        }
        if (row) {
            console.log(`Row found with supplied question type:  ${JSON.stringify(row)}`);

            let insertSQL = `INSERT INTO Question(questionText, questionType, templateID)
            VALUES(?, ?, ?)`;
            let data = [questionText, row.questionTypeID, templateID];

            db.run(insertSQL, data, (err, row) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Something went wrong when adding the question." });
                }
                else {
                    console.log(`A new question has been added with ID ${this.lastID}`);
                    return res.status(201).json({ message: "New question added.", questionId: this.lastID });
                }
            }
            );
        }
        else {
            return res.send(`No errors occurred, however no rows were found either for the question type \"${questionType}\".`);
        }
    });
};

exports.AddTemplate = async (req, res, next) => {
    console.log("EvalControllers.js file/AddTemplate route called");

    let evaluatorID = req.params["evaluatorID"];
    let templateName = req.body.templateName;

    console.log("Template name: " + templateName);
    console.log("evaluatorID: " + evaluatorID);

    if (!templateName) {
        return res.status(400).json({ message: "Template name is required" });
    }

    if (!evaluatorID) {
        return res.status(400).json({ message: "evaluatorID is required" });
    }

    let data = [templateName, evaluatorID];
    // let sql = `INSERT INTO Template () VALUES (?, ?)`;

    db.run(
        `INSERT INTO Template(templateName, evaluatorID)
            VALUES(?, ?)`,
        data,
        function (err) {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Something went wrong when adding the template." });
            } else {
                console.log(`A new template has been added with ID ${this.lastID}`);
                return res
                    .status(201)
                    .json({ message: "New template added.", templateId: this.lastID });
            }
        });
};

exports.GetQuestions = async (req, res, next) => {
    console.log("EvalControllers.js file/Questions route called");

    let templateID = req.params.templateID;
    if (!templateID) {
        return res.status(400).json({ message: "Template ID is required" });
    }

    let sql = `SELECT q.questionID, q.questionText, qt.questionTypeText AS questionType, q.templateID
  FROM Question as q
  INNER JOIN Question_Type as qt ON qt.questionTypeID = q.questionType
  WHERE templateID = ?`;

    db.all(sql, [templateID],
        (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: "Error retrieving questions." });
            }
            res.status(200).json(rows);
        }
    );
};

exports.GetTemplates = async (req, res, next) => {
    console.log("EvalControllers.js file/Templates route called");

    let evaluatorID = req.params["evaluatorID"];
    console.log("evaluatorID", evaluatorID);
    if (!evaluatorID) {
        return res.status(400).json({ message: "evaluatorID is required" });
    }

    db.all("SELECT * FROM Template WHERE evaluatorID = ?",
        [evaluatorID],
        (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: "Error retrieving templates." });
            }
            res.status(200).json(rows);
        });
};

exports.UpdateQuestion = async (req, res, next) => {
    console.log("EvalControllers.js file/UpdateQuestion route called");

    console.log(req.params);

    let questionID = req.params.questionID;
    let questionText = req.body.questionText;
    let questionType = req.body.questionType;

    console.log(
        `Updating Question - ID: ${questionID}, Text: ${questionText}, Type: ${questionType}`
    );

    // Check if the question ID is provided, return an error if not.
    if (!questionID) {
        return res.status(400).json({ message: "Question ID is required" });
    }

    // Check if either question text or type is provided, return an error if both are missing.
    if (!questionText && !questionType) {
        return res.status(400).json({ message: "Either question text or type is required to update" });
    }

    let questionTypeSQLSelection = `SELECT questionTypeID
    FROM Question_Type
    WHERE questionTypeText = ?`;

    db.get(questionTypeSQLSelection, [questionType], (err, row) => {
        if (err) {
            return res.status(500).json({ message: `Something went wrong in grabbing the ID for question type \"${questionType}\". Please try again later.` });
        }
        if (row) {
            // Start building the SQL query to update the question.
            let updateSQL = `UPDATE Question
            SET questionText = ?,  questionType = ?
            WHERE questionID = ?`;
            let data = [questionText, row.questionTypeID, questionID];

            // Execute the SQL query against the database.
            db.run(updateSQL, data, function (err) {
                // Handle any errors during query execution.
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({
                        message: "Something went wrong when updating the question.",
                    });
                }
                else if (this.changes === 0) {
                    // If no rows were updated, send a 404 not found error.
                    return res.status(404).json({ message: "Question not found." });
                }
                else {
                    // Log success message and send a 200 OK response.
                    console.log(`Question with ID ${questionID} has been updated.`);
                    return res.status(200).json({ message: "Question updated successfully." });
                }
            });

        }
        else {
            return res.send(`No errors occurred, however no rows were found either for the question type \"${questionType}\".`);
        }
    });
};


exports.DeleteQuestion = async (req, res, next) => {
    console.log("EvalControllers.js file/DeleteQuestion route called");

    let questionID = req.params.questionID;

    if (!questionID) {
        return res.status(400).json({ message: "Question ID is required" });
    }

    db.run(
        "DELETE FROM Question WHERE questionID = ?",
        [questionID],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({
                    message: "Something went wrong when deleting the question.",
                });
            } else if (this.changes === 0) {
                return res.status(404).json({ message: "Question not found." });
            } else {
                console.log(`Question with ID ${questionID} has been deleted.`);
                return res
                    .status(200)
                    .json({ message: "Question deleted successfully." });
            }
        }
    );
};

/*
exports.AssignEvalToProjects = async (req, res, next) => {
    console.log("EvalControllers.js file/AssignEvalToProjects route called");

    console.log(JSON.stringify(req.body));
    let evalTemplateID = req.body.evalTemplateID;
    let projectIDs = req.body.projectIDs;

    // These functions are used to re-define a new all/run sql query/command for the DB so that we can use the "await" operator inside this async function "AssignEvalToProjects" and have the server wait for a response from sqlite for if the all/run command was accepted.  The original idea for this code was found here with some slight modifications https://www.scriptol.com/sql/sqlite-async-await.php
    function newAll(query, params) {
        return new Promise(function (resolve, reject) {
            if (params == undefined) params = []

            db.all(query, params, (err, rows) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    function newRun(query, params) {
        return new Promise(function (resolve, reject) {
            if (params == undefined) params = []

            db.run(query, params, (err) => {
                if (err) {
                    console.log(err);
                    // reject(err.message);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }

    // Grab all the members for the projects supplied by the instructor
    // We do this because the number of projects can change depending on what the user selects in the project.  However, there might be an issue with this method of doing this.  When we execute the SQL statement, we might get the following error returned to us "SQLITE_ERROR: too many SQL variables" as shown where I got this solution https://github.com/TryGhost/node-sqlite3/issues/762
    const questionMarkPlaceHolders = projectIDs.map(() => "?").join(",");
    let projectMembersSQL = `SELECT p.projectID, pu.userID
    FROM Projects p
    INNER JOIN project_Users pu ON pu.projectID = p.projectID
    WHERE p.projectID IN (${questionMarkPlaceHolders})
    ORDER BY p.projectID, pu.userID`;

    var rows = await newAll(projectMembersSQL, projectIDs);

    // If something happened to prevent the Node server for accessing the DB
    if (!rows) {
        return res.status(500).json({ message: 'Something went wrong in grabbing the users for the projects.\nPlease try again later.' });
    }

    let currentProjectID;
    let processedRows = [];
    let dataToBeAdded = {};

    // Go through every row returned and process it before inserting the entries into the DB
    rows.forEach((row, index) => {
        // The below if statement is only used for debugging
        if (row.projectID != currentProjectID) {
            console.log(`\nNew project detected with an ID of ${row.projectID}`)
        }
        console.log("Processing the row: " + JSON.stringify(row));
        // if it is a new user
        if (row.projectID != currentProjectID) {
            // If it is not the first row being processed
            if (index != 0) {
                processedRows.push(dataToBeAdded);
            }
            currentProjectID = row.projectID;

            // Replace what is currently stored inside the variable dataToBeAdded with the current data in the row
            dataToBeAdded = {
                projectID: row.projectID,
                userIDs: [row.userID]
            }
        }
        // The project is already been processed before, so simply append the data to the usersID portion of the dataToBeAdded
        else {
            dataToBeAdded.userIDs.push(row.userID);
        }
        console.log(`Resulting processed data: ${JSON.stringify(dataToBeAdded)}`);  // For debugging
    });

    // Add the very last item processed to the processedRows array
    processedRows.push(dataToBeAdded);
    console.log(`\nFinished Processing the data and the result is:\n${JSON.stringify(processedRows)}`);  // For debugging

    let insertAssignedEvalSQL = `INSERT INTO Assigned_Eval (evaluatorID, evaluateeID, templateID, projectID, evalCompleted)
    VALUES(?, ?, ?, ?, ?)`;

    console.log("Beginning transaction");
    let errorsGenerated = false;
    db.run("BEGIN TRANSACTION");
    // Example data that the above rows.forEach() loop outputs to better understand what it is doing in the below for loop:  [{"projectID":1,"userIDs":[3,4]}, {"projectID":2,"userIDs":[4]}]
    // This way of processing the data makes it so that you can run the async function newRun inside of this for loop and was discovered here https://stackoverflow.com/a/66703757
    for await (const pRow of processedRows) {
        // Data being processed inside here {"projectID":1,"userIDs":[3,4]}
        // Populate the data with what the information what will not change in the below for loops
        let data = ["temp", "temp", evalTemplateID, pRow.projectID, false];

        // We add the '?' after "pRow.userIDs" in this and the following for loop because a project might not have any users assigned to it, thus userIDs would be null.  The '?' makes it so that what comes after it is optional, I.E. it might or might not exist
        for (let evaluatorIndex = 0; evaluatorIndex < pRow.userIDs?.length; evaluatorIndex++) {
            // Grab the evaluatorID for the current user and assign it to the evaluatorID position of the data
            data[0] = pRow.userIDs[evaluatorIndex];

            for (let evaluateeIndex = 0; evaluateeIndex < pRow.userIDs?.length; evaluateeIndex++) {
                // If the current index of the evaluator is not the same as the evaluatee index, then add the eval to the DB.  I.E. don't assign an eval to the same person making the evals
                if (evaluatorIndex != evaluateeIndex) {
                    // Grab the evaluateeID for the targeted user and assign it to the evaluateeID position of the data
                    data[1] = pRow.userIDs[evaluateeIndex];
                    console.log(`Data being inserted: ${JSON.stringify(data)}`);

                    // This will insert multiple table entries into the DB so that we can simplify the SQL statement and simply change the information stored inside of "data".  The original idea for this changes was found here before we implemented the newRun function https://stackoverflow.com/questions/38387373/how-can-i-perform-a-bulk-insert-using-sqlite3-in-node-js
                    const runCommandSuccessful = await newRun(insertAssignedEvalSQL, data);
                    if (!runCommandSuccessful) {
                        errorsGenerated = true;
                    }
                }
            }
        }
    }

    // If any errors occurred in inserting the data, rollback the changes to the DB, otherwise commit them to the DB.
    if (errorsGenerated) {
        console.log("Errors generated, rolling back changes");
        db.run("ROLLBACK");
        return res.status(500).json({ message: 'Something went wrong in assigning the evals to the users of the projects.  Please try again later.' });
    }
    else {
        console.log("No errors were generated, committing changes");
        db.run("COMMIT");
        return res.status(200).json({ message: 'The project users have been assigned the selected eval.' });
    }
};
*/

exports.AssignEvalToProjects = async (req, res, next) => {
    console.log("AssignEvalToProject Called")

    let data = [];

    data[0] = req.body["evaluatorID"];
    data[1] = req.body["evaluateeID"];
    data[2] = req.body["templateID"];
    data[3] = req.body["projectID"];
    data[4] = req.body["evalCompleted"];

    db.run(`INSERT INTO Assigned_Eval(evaluatorID, evaluateeID, templateID, projectID, evalCompleted)
        VALUES(?, ?, ?, ?, ?)`, data, function (err, rows) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            return res.status(200).json({ course: data });
        }
    });

}

exports.GetAssignedEvals = async (req, res, next) => {
    console.log("EvalControllers.js file/GetAssignedEvals route called");

    let evaluateeID = req.params["evaluateeID"];

    if (!evaluateeID) {
        return res.status(400).json({ message: "evaluatee ID is required" });
    }

    let sql = `SELECT q.questionID, q.questionText, qt.questionTypeText AS questionType, q.templateID, p.projectName AS projectName, a.evaluatorID AS evaluatorID
    FROM Question as q
    INNER JOIN Assigned_Eval as a ON a.templateID = q.templateID
    INNER JOIN Question_Type as qt ON qt.questionTypeID = q.questionType
    INNER JOIN Projects as p ON a.projectID = p.projectID
    WHERE evaluateeID = ?`;

    db.all(sql, [evaluateeID], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Error retrieving questions." });
        }

        // Check if there's more than one templateID
        const templateIDs = new Set(rows.map(row => row.templateID));
        if (templateIDs.size === 1) {
            // Only one templateID, return a 1-D array
            res.status(200).json(rows);
        } else {
            // Multiple templateIDs, return a 2-D array indexed by templateID
            let questionsByTemplateID = {};
            rows.forEach(row => {
                if (!questionsByTemplateID[row.templateID]) {
                    questionsByTemplateID[row.templateID] = [];
                }
                questionsByTemplateID[row.templateID].push(row);
            });

            // Convert to an array of arrays
            let result = Object.values(questionsByTemplateID);
            res.status(200).json(result);
        }
    });
};
