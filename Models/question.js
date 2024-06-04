function Question(text, options, answer) {
    this.text = text;
    this.options = options;
    this.answer = answer;
}

Question.prototype.checkAnswer = function (answer) {
    return answer === this.answer;
}

export default Question;