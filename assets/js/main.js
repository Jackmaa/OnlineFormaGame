class Player {
  player_img = new Image();

  constructor(game) {
    this.player_img.src = "./vincent.png";
    this.game = game;
    this.width = 100;
    this.height = 100;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
  }

  draw(context) {
    context.drawImage(this.player_img, this.x, this.y, this.width, this.height);
  }

  update() {
    // Handle movement based on active keys
    if (this.game.keys.has("ArrowLeft") || this.game.keys.has("q")) {
      this.x -= this.speed;
    }
    if (this.game.keys.has("ArrowRight") || this.game.keys.has("d")) {
      this.x += this.speed;
    }
    if (this.game.keys.has("ArrowUp") || this.game.keys.has("z")) {
      this.y -= this.speed;
    }
    if (this.game.keys.has("ArrowDown") || this.game.keys.has("s")) {
      this.y += this.speed;
    }
    if (this.game.keys.has("shift")) {
      //sprint
      this.speed = 10;
    }

    // Horizontal boundaries
    if (this.x < 0) this.x = 0;
    else if (this.x > this.game.width - this.width) {
      this.x = this.game.width - this.width;
    }

    // Vertical boundaries
    if (this.y < 0) this.y = 0;
    else if (this.y > this.game.height - this.height) {
      this.y = this.game.height - this.height;
    }
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = new Set();
    this.player = new Player(this);

    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      this.keys.add(key);
      console.log(`Key down: ${key}, Current keys: ${[...this.keys]}`);
      e.preventDefault();
    });

    window.addEventListener("keyup", (e) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
      console.log(`Key up: ${key}, Current keys: ${[...this.keys]}`);
      e.preventDefault();
      this.player.speed = 5; // reset speed to default
    });
  }

  render(context) {
    this.player.draw(context);
    this.player.update();
  }
}

// Run script when all assets are loaded
window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 750;

  const game = new Game(canvas);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});
