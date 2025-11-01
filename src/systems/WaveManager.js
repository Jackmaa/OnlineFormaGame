// src/systems/WaveManager.js
export default class WaveManager {
  constructor(game, enemySprite) {
    this.game = game;
    this.enemySprite = enemySprite;
    this.enemies = [];
    this.wave = 1;
    this.spawnTimer = 0;
    this.spawnInterval = 2.0;
    this.enemiesPerSpawn = 2;
    this.maxEnemies = 100;
  }

  update(dt) {
    this.spawnTimer -= dt;

    const difficulty = Math.floor(this.game.gameTime / 60);
    this.enemiesPerSpawn = 2 + Math.floor(difficulty / 2);
    this.spawnInterval = Math.max(0.5, 2.0 - difficulty * 0.1);

    if (this.spawnTimer <= 0 && this.enemies.length < this.maxEnemies) {
      this.spawnTimer = this.spawnInterval;
      this.spawnWave();
    }
  }

  spawnWave() {
    const canvas = this.game.canvas;

    for (let i = 0; i < this.enemiesPerSpawn; i++) {
      const edge = Math.floor(Math.random() * 4);
      let x, y;

      switch (edge) {
        case 0: x = Math.random() * canvas.width; y = -32; break;
        case 1: x = canvas.width + 32; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 32; break;
        case 3: x = -32; y = Math.random() * canvas.height; break;
      }

      const enemy = this.createEnemy(x, y);
      this.enemies.push(enemy);
    }
  }

  createEnemy(x, y) {
    const Bug = this.game.Bug;
    const difficulty = Math.floor(this.game.gameTime / 60);
    const rand = Math.random();
    let enemy;

    if (difficulty < 2) {
      enemy = new Bug(x, y, this.enemySprite, 32);
      enemy.hp = 10;
      enemy.speed = 50;
      enemy.contactDamage = 1;
    } else if (difficulty < 5) {
      if (rand < 0.7) {
        enemy = new Bug(x, y, this.enemySprite, 32);
        enemy.hp = 15;
        enemy.speed = 60;
        enemy.contactDamage = 1;
      } else {
        enemy = new Bug(x, y, this.enemySprite, 48);
        enemy.hp = 30;
        enemy.speed = 40;
        enemy.contactDamage = 2;
      }
    } else if (difficulty < 10) {
      if (rand < 0.5) {
        enemy = new Bug(x, y, this.enemySprite, 32);
        enemy.hp = 20;
        enemy.speed = 80;
        enemy.contactDamage = 2;
      } else if (rand < 0.8) {
        enemy = new Bug(x, y, this.enemySprite, 48);
        enemy.hp = 50;
        enemy.speed = 45;
        enemy.contactDamage = 3;
      } else {
        enemy = new Bug(x, y, this.enemySprite, 64);
        enemy.hp = 100;
        enemy.speed = 30;
        enemy.contactDamage = 5;
      }
    } else {
      if (rand < 0.3) {
        enemy = new Bug(x, y, this.enemySprite, 24);
        enemy.hp = 15;
        enemy.speed = 120;
        enemy.contactDamage = 2;
      } else if (rand < 0.6) {
        enemy = new Bug(x, y, this.enemySprite, 40);
        enemy.hp = 60;
        enemy.speed = 60;
        enemy.contactDamage = 3;
      } else if (rand < 0.9) {
        enemy = new Bug(x, y, this.enemySprite, 64);
        enemy.hp = 150;
        enemy.speed = 35;
        enemy.contactDamage = 5;
      } else {
        enemy = new Bug(x, y, this.enemySprite, 96);
        enemy.hp = 300;
        enemy.speed = 40;
        enemy.contactDamage = 10;
        enemy.isBoss = true;
      }
    }

    return enemy;
  }

  getEnemies() {
    return this.enemies;
  }

  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }
}
