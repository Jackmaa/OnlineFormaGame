class Player {
  player_img = new Image();

  constructor(game) {
    this.player_img.src = "./vincent.png";
    this.game = game;

    this.width = 100;
    this.height = 100;

    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.directionX = 0; // -1 for left, 1 for right
    this.directionY = 0; //-1 top // 1 bot
    this.speed = 5;

    this.shootCooldown = 200; //shoot CD in ms
    this.lastShootTime = 0;
  }

  draw(context) {
    context.drawImage(this.player_img, this.x, this.y, this.width, this.height);
  }

  update() {
    //reset dir every move the player makes
    this.directionX = 0;
    this.directionY = 0;

    // Handle movement based on active keys
    if (this.game.keys.has("arrowleft") || this.game.keys.has("q")) {
      this.x -= this.speed;
      this.directionX = -1;
    }
    if (this.game.keys.has("arrowright") || this.game.keys.has("d")) {
      this.x += this.speed;
      this.directionX = 1;
    }
    if (this.game.keys.has("arrowup") || this.game.keys.has("z")) {
      this.y -= this.speed;
      this.directionY = -1;
    }
    if (this.game.keys.has("arrowdown") || this.game.keys.has("s")) {
      this.y += this.speed;
      this.directionY = 1;
    }
    if (this.game.keys.has("shift")) {
      //sprint
      this.speed = 10;
    } else {
      this.speed = 5;
    }

    // Default shoot direction if player is stationary
    if (this.directionX === 0 && this.directionY === 0) {
      this.directionY = -1; // Default to shooting upwards
    }

    if (this.game.keys.has("p")) {
      this.shoot();
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

  shoot() {
    //ajout CD pour le shoot
    const now = Date.now();
    if (now - this.lastShootTime >= this.shootCooldown) {
      const projectile = this.game.getProjectile(); //pull one proj if available
      if (projectile) {
        const magnitude =
          Math.sqrt(this.directionX ** 2 + this.directionY ** 2) || 1; // normalisation des directions pour eviter un vitesse accrues en diag
        const directionX = this.directionX;
        const directionY = this.directionY; //-1 pour envoyer par défaut de mouvement vers le haut
        projectile.start(
          this.x + this.width * 0.5,
          this.y,
          directionX / magnitude,
          directionY / magnitude
        ); // if we get one we pass the x and y of the player
      }
      this.lastShootTime = now;
    }
  }
}

class Projectile {
  constructor(game) {
    this.game = game;
    this.width = 8;
    this.height = 20;
    this.x = 0;
    this.y = 0;
    this.speed = 15;
    //we're gonna create a pool of reusable lasers (10) so we create a prop to say if the laser is free to reuse see object pool design pattern
    this.free = true;

    //directions
    this.dirX = 0;
    this.dirY = -1;
  }

  draw(context) {
    if (!this.free) {
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
    if (!this.free) {
      this.x += this.dirX * this.speed;
      this.y += this.dirY * this.speed;

      // Check if projectile is out of bounds
      if (
        this.x < -this.width ||
        this.x > this.game.width ||
        this.y < -this.height ||
        this.y > this.game.height
      ) {
        this.reset();
      }
    }
  }
  //function to take one object of the pool of lasers
  start(x, y, dirX, dirY) {
    this.x = x - this.width * 0.5; // we substract the width of the proj to center it no matter the width of the proj
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.free = false;
  }
  //function to reset the lasers back in the pool
  reset() {
    this.free = true;
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = new Set();
    this.player = new Player(this);

    this.projectilesPool = [];
    this.numberOfProjectiles = 10;
    this.createProjectiles();

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
    });
  }

  render(context) {
    this.player.draw(context);
    this.player.update();
    this.projectilesPool.forEach((projectile) => {
      projectile.update();
      projectile.draw(context);
    });
  }

  //create projectiles object pool
  createProjectiles() {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      this.projectilesPool.push(new Projectile(this));
    }
  }

  //get free projectile from the pool
  getProjectile() {
    for (let i = 0; i < this.projectilesPool.length; i++) {
      if (this.projectilesPool[i].free) return this.projectilesPool[i];
    }
  }
}

// Run script when all assets are loaded
window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 750;
  ctx.fillStyle = "black";

  const game = new Game(canvas);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});
