/* src/engine/SceneManager.js */
export default class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = new Map();
    this.current = null;
  }
  add(key, scene) {
    scene.game = this.game;
    this.scenes.set(key, scene);
  }
  start(key) {
    this.current = this.scenes.get(key);
    this.current.init?.();
    this.current.create?.();
    this.game.lastTime = 0;
    this.game.startLoop();
  }
  update(dt) {
    this.current.update?.(dt);
  }
  render(ctx) {
    this.current.render?.(ctx);
  }
}
