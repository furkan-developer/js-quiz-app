import QuestionApi from "../Modules/question-api.js";

function QuizCard() {
  this.questionApi = new QuestionApi();
  this.currentQuestionNumber = 1;
  this.timeProgressElementId = "time-progress";
  this.card = document.getElementById("card");
  this.question_text = document.getElementById("question-text");
  this.question_wrapper = document.getElementById("question__wrapper");
  this.timeProgressAnimationDuration = 5;
  this.time_indicator = document.getElementById("time-indicator");
  this.nextQuestionBtn = document.getElementById("next-question-btn");
  this.intervalId = 0;
  this.timeOutId = 0;

  if (new.target) {
    addClickEventToNextQuestionBtn(
      this.nextQuestionBtn,
      this.question_wrapper,
      this
    );
  }
}

QuizCard.prototype.renderQuestion = async function () {
  let question = await this.questionApi.getOneQuestionByNumber(
    this.currentQuestionNumber
  );

  toggleDisableNextQuestionBtn(this.nextQuestionBtn);

  this.card.insertBefore(createTimeProgressElement(this.timeProgressElementId),this.question_wrapper);

  this.question_wrapper.insertAdjacentHTML(
    "beforeend",
    `
    <p class="question-text fs-5">
      <b>${this.currentQuestionNumber}-</b>
      ${question.text}
    </p>  
  `
  );
  for (const key in question.options) {
    this.question_wrapper.insertAdjacentHTML(
      "beforeend",
      ` <div class="d-flex justify-content-between p-2 mb-2 border rounded-2 question-option">
                <span><b>${key}:</b> ${question.options[key]}</span>
        </div>`
    );
  }

  let options = this.question_wrapper.querySelectorAll(".question-option");
  options.forEach((element) => {
    addEventListenerWithParams(element, "click", this);
  });

  getTimeProgressElement(this.timeProgressElementId).style.animation = `time-progress ${this.timeProgressAnimationDuration}s`;

  startTime(this.timeProgressAnimationDuration, this.time_indicator, this);
};

QuizCard.prototype.getCurrentQuestion = async function () {
  let currentQuestion = await this.questionApi.getOneQuestionByNumber(
    this.currentQuestionNumber
  );

  return currentQuestion;
};

function startTime(duration, timeIndicatorElement, quizCard) {
  let timeStatusText = timeIndicatorElement.querySelector("p");
  let clock = timeStatusText.querySelector("span");

  clock.textContent = `${duration}`;

  toggleDisableNextQuestionBtn(quizCard.nextQuestionBtn);

  quizCard.intervalId = setInterval(function () {
    clock.innerText = duration - 1;
    duration -= 1;
  }, 1000);

  quizCard.timeOutId = setTimeout(() => {
    clearInterval(quizCard.intervalId);
    toggleDisableQuestionOptions();
    timeStatusText.textContent = "Time's up";
    timeStatusText.insertAdjacentElement("beforeend", clock);
  }, duration * 1000);
}

function addEventListenerWithParams(optionElement, event, ...param) {
  let [quizCard] = param;

  optionElement.addEventListener(event, async function () {
    clearInterval(quizCard.intervalId);
    clearTimeout(quizCard.timeOutId);
    toggleDisableQuestionOptions();

    getTimeProgressElement(quizCard.timeProgressElementId).style["animation-play-state"] = "paused";

    let answer = this.querySelector("span b").textContent.split("")[0];
    let currentQuestion = await quizCard.getCurrentQuestion();

    if (currentQuestion.checkAnswer(answer)) {
      this.insertAdjacentHTML(
        "beforeend",
        `<svg
      class="align-self-center"
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      viewBox="0 0 448 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
      ></path>
    </svg>`
      );

      this.classList.add("correct-answer");
    } else {
      this.insertAdjacentHTML(
        "beforeend",
        `<svg
      class="align-self-center"
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      viewBox="0 0 512 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z"
      ></path>
    </svg>`
      );

      this.classList.add("incorrect-answer");
    }

    quizCard.question_wrapper.classList.add("pointer-events-none");
  });
}

function toggleDisableNextQuestionBtn(btn) {
  btn.classList.toggle("disabled");
}

function toggleDisableQuestionOptions() {
  const allQuestionOptions = document.querySelectorAll(".question-option");
  [...allQuestionOptions].forEach((item) => {
    item.classList.toggle("disabled");
  });
}

function addClickEventToNextQuestionBtn(
  nextQuestionBtn,
  question_wrapper,
  quizCard
) {
  nextQuestionBtn.addEventListener("click", function () {
   getTimeProgressElement(quizCard.timeProgressElementId).remove();

    clearInterval(quizCard.intervalId);
    clearTimeout(quizCard.timeOutId);

    while (question_wrapper.firstChild) {
      question_wrapper.firstChild.remove();
    }

    console.log("Rendering a new question");
    quizCard.currentQuestionNumber += 1;
    quizCard.renderQuestion();
  });
}

function createTimeProgressElement(timeProgressElementId) {
  const timeProgress = document.createElement("div");

  timeProgress.id = timeProgressElementId;
  timeProgress.className = "time-progress bg-warning";
  
  return timeProgress;
}

function getTimeProgressElement(timeProgressElementId){
  return document.getElementById(timeProgressElementId);
}

export default QuizCard;
