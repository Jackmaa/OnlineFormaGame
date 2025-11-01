// src/engine/Game.js
import SceneManager from "./SceneManager.js";

export default class Game {
  constructor({ canvas, ctx, assets, input }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.assets = assets;
    this.input = input;
    this.scene = new SceneManager(this);
    this.fps = 0;
  }

  startLoop() {
    // Initialisation pour Ã©viter dt=0 au premier frame
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(time) {
    // Calcul correct de dt (>0 dÃ¨s le premier frame)
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Update + render
    this.scene.update(dt);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.scene.render(this.ctx);

    // Next frame
    requestAnimationFrame(this.loop.bind(this));
  }
}
