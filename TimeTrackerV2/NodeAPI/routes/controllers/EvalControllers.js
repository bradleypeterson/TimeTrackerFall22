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

exports.AssignEvalToProjects = async (req, res, next) => {
    console.log("EvalControllers.js file/AssignEvalToProjects route called");

    console.log(JSON.stringify(req.body));
    let evalTemplateID = req.body.evalTemplateID;
    let projectIDs = req.body.projectIDs;

    // We do this because the number of projects can change depending on what the user selects in the project.  However, there might be an issue with this method of doing this.  When we execute the SQL statement, we might get the following error returned to us "SQLITE_ERROR: too many SQL variables" as shown where I got this solution https://github.com/TryGhost/node-sqlite3/issues/762
    const questionMarkPlaceHolders = projectIDs.map(() => "?").join(",");
    let projectMembersSQL = `SELECT p.projectID, pu.userID
    FROM Projects p
    INNER JOIN project_Users pu ON pu.projectID = p.projectID
    WHERE p.projectID IN (${questionMarkPlaceHolders})
    ORDER BY p.projectID, pu.userID`;

    db.all(projectMembersSQL, projectIDs, (err, rows) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong in grabbing the users for the projects.\nPlease try again later.' });
		}
        else {
            console.log(`Rows retrieved:  ${JSON.stringify(rows)}`);

            let currentProjectID;
            let processedRows = [];
            let dataToBeAdded = {};

            // Go through every row returned and process it before inserting the entries into the DB
            rows.forEach((row, index) => {
                // The below if statement is only used for debugging
                if (row.projectID != currentProjectID){
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
            //Example data that the above rows.forEach() loop outputs to better understand what it is doing in the below foreach loop:  [{"projectID":1,"userIDs":[3,4]}, {"projectID":2,"userIDs":[4]}]
            processedRows.forEach(pRow => {
                // Data being processed inside here {"projectID":1,"userIDs":[3,4]}
                // Populate the data with what the information what will not change in the below for loops
                let data = ["temp", "temp", evalTemplateID, pRow.projectID, false];

                for (let evaluatorIndex = 0; evaluatorIndex < pRow.userIDs.length; evaluatorIndex++) {
                    // Grab the evaluatorID for the current user and assign it to the evaluatorID position of the data
                    data[0] = pRow.userIDs[evaluatorIndex];

                    for (let evaluateeIndex = 0; evaluateeIndex < pRow.userIDs.length; evaluateeIndex++) {
                        // If the current index of the evaluator is not the same as the evaluatee index, then add the eval to the DB.  I.E. don't assign an eval to 
                        if (evaluatorIndex != evaluateeIndex) {
                            // Grab the evaluateeID for the targeted user and assign it to the evaluateeID position of the data
                            data[1] = pRow.userIDs[evaluateeIndex];
                            console.log(`Data being inserted: ${JSON.stringify(data)}`);
                            
                            db.run(insertAssignedEvalSQL, data, (err, value) => {
                                // There is an error here because it will never get into this section before it checks the below if condition that is outside of this top most for loop about 17 lines above here.  So even if an error was detected, it will have already gone past the conditions to revert or commit the changes
                                if (err) {
                                    console.log(`The following error occurred: ${err}`);
                                    errorsGenerated = true;
                                }
                                // For debugging
                                else {
                                    console.log("Correctly inserted data");
                                }
                            });
                        }
                    }
                };
            });

            // If any errors occurred in inserting the data, rollback the changes to the DB.  Otherwise commit the changes.
            if(errorsGenerated) {
                console.log("Rolling back changes");
                db.run("ROLLBACK");
                return res.status(500).json({ message: 'Something went wrong in assigning the evals to the users of the projects.  Please try again later.' });
            }
            else {
                console.log("Committing changes");
                db.run("COMMIT");
                return res.status(200).json({ message: 'Grabbed users for projects.' });
            }
        }
    });
};
