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

};

exports.GetAllEvals = async (req, res, next) => {
    console.log("EvalControllers.js file/GetAllEvals route called");

    let evaluateeID = req.params["evaluateeID"];

    let sql = `SELECT assignedEvalID as evalID, projectID
               FROM Assigned_Eval
               WHERE evaluateeID = ? AND evalCompleted = 0`;

    db.all(sql, [evaluateeID], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Error retrieving questions." });
        } else {
            res.status(200).json(rows);
        }
    });
};


exports.GetAssignedEvals = async (req, res, next) => {
    console.log("EvalControllers.js file/GetAssignedEvals route called");

    let evaluateeID = req.params["evaluateeID"];
    let projectID = req.params["projectID"];

    if (!evaluateeID || !projectID) {
        return res.status(404).json({ message: 'No evaluations found for this evaluatee and project.' });
    }

    let sql = `SELECT q.questionID, q.questionText, qt.questionTypeText AS questionType, q.templateID, p.projectName AS projectName, a.evaluatorID AS evaluatorID, a.assignedEvalID as evalID
    FROM Question as q
    INNER JOIN Assigned_Eval as a ON a.templateID = q.templateID
    INNER JOIN Question_Type as qt ON qt.questionTypeID = q.questionType
    INNER JOIN Projects as p ON a.projectID = p.projectID
    WHERE evaluateeID = ? AND a.projectID = ? AND evalCompleted = 0`;

    db.all(sql, [evaluateeID, projectID], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Error retrieving questions." });
        }

        // Check if there's more than one templateID
        const templateIDs = new Set(rows.map(row => row.templateID));
        if (templateIDs.size === 1) {
            // Only one templateID, return a 1-D array
            res.status(200).json(rows);
        } 
        else {
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

exports.SubmitResponses = async (req, res, next) => {
    console.log("SubmitResponses Called");

    let data = [];

    data[0] = req.body["evalID"];
    data[1] = req.body["userID"];
    data[2] = req.body["questionID"];
    data[3] = req.body["rating"];
    data[4] = req.body["response"];

    db.serialize(() => {
        db.run('BEGIN TRANSACTION;');

        //SQL for responses
        const sqlstmt = db.prepare('INSERT INTO Response (assignedEvalID, userID, questionID, rating, response) VALUES (?, ?, ?, ?, ?)');

        //add data
        sqlstmt.run(data, function(err) {
            if (err) {
                console.log(err);
                db.run('ROLLBACK;');  //Rollback if there is an error
                return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
            }
        });

        //commit if no errors
        db.run('COMMIT;', (err) => {
            if (err) {
                console.log(err);
                db.run('ROLLBACK;');  //Rollback if it can't commit
                return res.status(500).json({ message: 'Something went wrong during commit. Please try again later.' });
            } else {
                return res.status(200).json({ message: 'Response recorded successfully.' });
            }
        });
    });
};


exports.evalCompleted = async (req, res, next) => {
    console.log("EvalCompleted Called")

    const evalID = req.body.evalID

    db.serialize(() => {
        const sqlstmt = (`UPDATE Assigned_Eval SET evalCompleted = 1 WHERE assignedEvalID = ?`);

        sqlstmt.run([evalID], function(err){
            if(err) {
                console.log(err);
                db.run('ROLLBACK;');  //Rollback if there is an error
                return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
            }
        });

        //commit if no errors
        db.run('COMMIT;', (err) => {
            if (err) {
                console.log(err);
                db.run('ROLLBACK;');  //Rollback if it can't commit
                return res.status(500).json({ message: 'Something went wrong during commit. Please try again later.' });
            } else {
                return res.status(200).json({ message: 'Response recorded successfully.' });
            }
        });
    })
}