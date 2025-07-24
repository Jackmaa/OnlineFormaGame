// src/Quiz.js
export default class Quiz {
  /**
   * @param {Array<{q: string, choices: string[], correct: number}>} questions
   * @param {Function} onComplete callback(success: boolean) appelé quand tout est répondu
   */
  constructor(questions, onComplete) {
    this.questions = questions;
    this.onComplete = onComplete;
    this.current = 0;
    this.correctCount = 0; // ← nouveau

    // Création de l’overlay DOM (inchangé)
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.8)",
      display: "none",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontFamily: "Arial, sans-serif",
      zIndex: 1000,
    });
    this.container.innerHTML = `
      <div id="quiz-box" style="background:#222;padding:20px;border-radius:8px;max-width:400px;text-align:center">
        <div id="quiz-question" style="margin-bottom:1em"></div>
        <div id="quiz-choices"></div>
      </div>`;
    document.body.appendChild(this.container);

    this.questionEl = this.container.querySelector("#quiz-question");
    this.choicesEl = this.container.querySelector("#quiz-choices");
  }

  show() {
    this.container.style.display = "flex";
    this.current = 0;
    this.correctCount = 0; // réinitialise le compteur
    this._renderQuestion();
  }

  hide() {
    this.container.style.display = "none";
  }

  _renderQuestion() {
    const { q, choices } = this.questions[this.current];
    this.questionEl.textContent = q;
    this.choicesEl.innerHTML = "";
    choices.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      Object.assign(btn.style, {
        display: "block",
        margin: "0.5em auto",
        padding: "0.5em 1em",
        cursor: "pointer",
      });
      btn.onclick = () => this._handleAnswer(i);
      this.choicesEl.appendChild(btn);
    });
  }

  _handleAnswer(index) {
    const isCorrect = index === this.questions[this.current].correct;
    if (isCorrect) this.correctCount++;

    // feedback simple (vous pouvez remplacer par un rendu custom)
    alert(isCorrect ? "✅ Bonne réponse !" : "❌ Raté…");

    this.current++;
    if (this.current < this.questions.length) {
      this._renderQuestion();
    } else {
      this.hide();
      // Succès si toutes les réponses sont correctes
      const success = this.correctCount === this.questions.length;
      this.onComplete(success);
    }
  }
}
