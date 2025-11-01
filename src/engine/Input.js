// src/engine/Input.js
export default class Input {
  constructor(canvas) {
    this.keys = {};
    this.mouseDown = false;

    // On stocke e.key en minuscule (z, q, s, d, etc.)
    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.mouseDown = true;
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.mouseDown = false;
    });

    canvas.addEventListener("mousemove", (e) => {
      // coordonnÃ©es relatives au canvas
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
  }

  isDown(key) {
    return !!this.keys[key.toLowerCase()];
  }

  isMouseDown() {
    return this.mouseDown;
  }
}
