const ConnectToDB = require('../../database/DBConnection');

let db = ConnectToDB();

exports.AddQuestion = async (req, res, next) => {
    console.log("QuestionController.js file/AddQuestion route called");

    console.log("Request Body:", req.body);

    let questionText = req.body.questionText;
    let templateID = req.body.templateID;
    console.log("Question Text: " + questionText + ", Template ID: " + templateID);

    if (!questionText || !templateID) {
        return res.status(400).json({ message: 'Both question text and template ID are required' });
    }

    let data = [questionText, templateID];

    db.run(`INSERT INTO Question(questionText, templateID)
            VALUES(?, ?)`, data, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Something went wrong when adding the question.' });
        } else {
            console.log(`A new question has been added with ID ${this.lastID}`);
            return res.status(201).json({ message: 'New question added.', questionId: this.lastID });
        }
    });
};



exports.AddTemplate = async (req, res, next) => {
    console.log("EvalControllers.js file/AddTemplate route called");

    let templateName = req.body.templateName;
    console.log("Template name: " + templateName);

    if (!templateName) {
        return res.status(400).json({ message: 'Template name is required' });
    }

    let sql = `INSERT INTO Template (templateName) VALUES (?)`;

    db.run(sql, [templateName], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Something went wrong when adding the template.' });
        } else {
            console.log(`A new template has been added with ID ${this.lastID}`);
            return res.status(201).json({ message: 'New template added.', templateId: this.lastID });
        }
    });

}

exports.Questions = async (req, res, next) => {
    console.log("EvalControllers.js file/Questions route called");

}

exports.Templates = async (req, res, next) => {
    console.log("EvalControllers.js file/Templates route called");

}

exports.UpdateQuestion = async (req, res, next) => {
    console.log("EvalControllers.js file/UpdateQuestion route called");

}

