import Question from "../Models/question.js";

function QuestionApi() {}
QuestionApi.prototype.getOneQuestionByNumber = function (questionNumber) {
  return fetch("../Data/questions.json")
    .then((response) => response.json())
    .then((jsonData) => {
      let { text, options, answer } = jsonData[questionNumber-1];

      return new Question(text, options, answer);
    });
};

export default QuestionApi;
