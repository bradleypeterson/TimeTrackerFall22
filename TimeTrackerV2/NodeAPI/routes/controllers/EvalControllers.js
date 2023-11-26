const ConnectToDB = require("../../database/DBConnection");

let db = ConnectToDB();

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

  let data = [questionText, questionType, templateID];

  db.run(
    `INSERT INTO Question(questionText, questionType, templateID)
            VALUES(?, ?, ?)`,
    data,
    function (err) {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Something went wrong when adding the question." });
      } else {
        console.log(`A new question has been added with ID ${this.lastID}`);
        return res
          .status(201)
          .json({ message: "New question added.", questionId: this.lastID });
      }
    }
  );
};

exports.AddTemplate = async (req, res, next) => {
  console.log("EvalControllers.js file/AddTemplate route called");

  let templateName = req.body.templateName;
  console.log("Template name: " + templateName);

  if (!templateName) {
    return res.status(400).json({ message: "Template name is required" });
  }

  let sql = `INSERT INTO Template (templateName) VALUES (?)`;

  db.run(sql, [templateName], function (err) {
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

exports.Questions = async (req, res, next) => {
  console.log("EvalControllers.js file/Questions route called");

  let templateID = req.params.templateID;
  if (!templateID) {
    return res.status(400).json({ message: "Template ID is required" });
  }

  db.all(
    "SELECT * FROM Question WHERE templateID = ?",
    [templateID],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Error retrieving questions." });
      }
      res.status(200).json(rows);
    }
  );
};

exports.Templates = async (req, res, next) => {
  console.log("EvalControllers.js file/Templates route called");

  db.all("SELECT * FROM Template", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Error retrieving templates." });
    }
    res.status(200).json(rows);
  });
};

exports.UpdateQuestion = async (req, res, next) => {
  console.log("EvalControllers.js file/UpdateQuestion route called");

  let questionID = req.params.questionID;
  let questionText = req.body.questionText;
  let questionType = req.body.questionType;

  console.log(
    `Updating Question - ID: ${questionID}, Text: ${questionText}, Type: ${questionType}`
  );

  if (!questionID) {
    return res.status(400).json({ message: "Question ID is required" });
  }

  if (!questionText && !questionType) {
    return res
      .status(400)
      .json({ message: "Either question text or type is required to update" });
  }

  let sql = `UPDATE Question SET `;
  let data = [];

  if (questionText) {
    sql += `questionText = ? `;
    data.push(questionText);
  }

  if (questionType) {
    if (questionText) {
      sql += `, `;
    }
    sql += `questionType = ? `;
    data.push(questionType);
  }

  sql += `WHERE questionID = ?`;
  data.push(questionID);

  db.run(sql, data, function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Something went wrong when updating the question.",
      });
    } else if (this.changes === 0) {
      return res.status(404).json({ message: "Question not found." });
    } else {
      console.log(`Question with ID ${questionID} has been updated.`);
      return res
        .status(200)
        .json({ message: "Question updated successfully." });
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
