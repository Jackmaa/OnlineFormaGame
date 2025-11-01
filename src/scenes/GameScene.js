// src/scenes/GameScene.js
import Player from "../entities/Player.js";
import Bug from "../entities/Bug.js";
import TileMap from "../engine/TileMap.js";
import XPGem from "../entities/XPGem.js";
import UI from "../UI.js";
import WaveManager from "../systems/WaveManager.js";
import Sword from "../weapons/Sword.js";
import OrbitalWeapon from "../weapons/OrbitalWeapon.js";
import ProjectileWeapon from "../weapons/ProjectileWeapon.js";
import LevelUpSystem from "../systems/LevelUpSystem.js";

export default class GameScene {
  constructor(mapArray, ts, tileset) {
    Object.assign(this, { mapArray, ts, tileset });
  }

  init() {
    this.tileMap = null;
    this.player = null;
    this.waveManager = null;
    this.xpGems = [];
    this.UI = null;
    this.levelUpSystem = null;
    this.gameTime = 0;
    this.paused = false;
  }

  create() {
    const { assets } = this.game;
    this.tileMap = new TileMap(this.mapArray, this.ts, this.tileset);

    // Get selected character
    const characterId = this.game.selectedCharacter || "vincent";

    // Get character sprite
    const characterSprite =
      this.game.characterSprites[characterId] ||
      assets[characterId] ||
      assets.vincent;

    // Create player with character
    this.player = new Player(
      this.game.canvas.width / 2 - 32,
      this.game.canvas.height / 2 - 32,
      characterSprite,
      64,
      characterId
    );

    // Setup level up callback
    this.player.onLevelUp = (level) => {
      this.levelUpSystem.show();
      this.paused = true;
    };

    // Wave Manager
    this.game.Bug = Bug; // Pass Bug class
    this.waveManager = new WaveManager(this.game, assets.enemy);

    // XP Gem sprite
    this.xpSprite = assets.xpGem;
    // Add starting weapon (Sword with slash)
    const sword = new Sword(this.player, assets.weapon);
    this.player.addWeapon(sword);

    // UI overlay
    this.UI = new UI({
      gameCanvas: this.game.canvas,
      player: this.player,
      width: this.game.canvas.width,
      height: this.game.canvas.height,
    });

    // Level up system
    this.levelUpSystem = new LevelUpSystem(this.game, this.player);

    // Override hide to unpause
    const originalHide = this.levelUpSystem.hide.bind(this.levelUpSystem);
    this.levelUpSystem.hide = () => {
      originalHide();
      this.paused = false;
    };
  }

  update(dt) {
    if (this.paused) return;

    this.gameTime += dt;
    this.game.gameTime = this.gameTime; // Make available to wave manager

    const input = this.game.input;

    // Player movement
    this.player.update(dt, input);

    // Clamp player in canvas
    this.player.x = Math.max(
      0,
      Math.min(this.player.x, this.game.canvas.width - this.player.width)
    );
    this.player.y = Math.max(
      0,
      Math.min(this.player.y, this.game.canvas.height - this.player.height)
    );

    // Wave Manager
    this.waveManager.update(dt);
    const enemies = this.waveManager.getEnemies();

    // Mettre à jour la liste des ennemis pour les armes (ciblage automatique)
    for (const weapon of this.player.weapons) {
      if (weapon.setEnemies) {
        weapon.setEnemies(enemies);
      }
    }

    // Update enemies
    for (const enemy of enemies) {
      enemy.update(dt, this.player);

      // Clamp enemy in canvas
      enemy.x = Math.max(
        0,
        Math.min(enemy.x, this.game.canvas.width - enemy.width)
      );
      enemy.y = Math.max(
        0,
        Math.min(enemy.y, this.game.canvas.height - enemy.height)
      );

      // Contact damage
      if (this.checkCollision(this.player, enemy) && enemy.contactTimer <= 0) {
        if (this.player.takeDamage(enemy.contactDamage)) {
          enemy.contactTimer = enemy.contactCooldown;
        }
      }
    }

    // Weapon collision with enemies
    for (const weapon of this.player.weapons) {
      const hitboxes = weapon.getHitboxes();

      for (const hitbox of hitboxes) {
        for (const enemy of enemies) {
          if (this.checkCollision(hitbox, enemy)) {
            let damage = hitbox.damage * this.player.damageMultiplier;

            // Boss damage multiplier
            if (enemy.isBoss) {
              damage *= this.player.bossDamageMultiplier;
            }

            // Critical hit
            if (Math.random() < this.player.critChance) {
              damage *= 1.5;
            }

            enemy.hp -= damage;
          }
        }
      }
    }

    // Remove dead enemies and drop XP
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      if (enemy.hp <= 0) {
        const xpAmount = enemy.isBoss ? 50 : 5;
        const gem = new XPGem(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          this.xpSprite,
          enemy.isBoss ? 48 : 32,
          xpAmount
        );
        this.xpGems.push(gem);
        this.waveManager.removeEnemy(enemy);
      }
    }

    // Update XP gems
    for (const gem of this.xpGems) {
      gem.update(dt, this.player);
    }
    this.xpGems = this.xpGems.filter((g) => !g.collected);

    // Check death
    if (this.player.hp <= 0) {
      this.gameOver();
    }

    // FPS
    if (dt > 0) this.game.fps = 1 / dt;

    // UI
    this.UI.update(dt);
  }

  render(ctx) {
    // Background
    this.tileMap.render(ctx);

    // XP Gems
    this.xpGems.forEach((g) => g.render(ctx));

    // Enemies
    const enemies = this.waveManager.getEnemies();
    enemies.forEach((e) => e.render(ctx));

    // Player
    this.player.render(ctx, this.game.input);

    // UI
    this.UI.render(ctx);

    // Timer
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      this.formatTime(this.gameTime),
      this.game.canvas.width / 2,
      30
    );

    // Enemy count
    ctx.font = "16px Arial";
    ctx.fillText(`Enemies: ${enemies.length}`, this.game.canvas.width / 2, 55);
    ctx.restore();
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  gameOver() {
    // Create game over screen
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.9)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontFamily: "Arial",
      zIndex: 3000,
    });

    overlay.innerHTML = `
      <h1 style="font-size:72px;margin:0;color:#e53e3e;">GAME OVER</h1>
      <p style="font-size:36px;margin:20px 0;">Time Survived: ${this.formatTime(
        this.gameTime
      )}</p>
      <p style="font-size:24px;opacity:0.8;">Level: ${this.player.level}</p>
      <button id="restart-btn" style="
        font-size:28px;
        padding:20px 60px;
        background:#48bb78;
        color:white;
        border:none;
        border-radius:10px;
        cursor:pointer;
        margin-top:40px;
        font-weight:bold;
      ">RESTART</button>
    `;

    document.body.appendChild(overlay);

    document.getElementById("restart-btn").onclick = () => {
      document.body.removeChild(overlay);
      location.reload();
    };

    this.paused = true;
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}

// Map generator
export function generateRandomMap(cols, rows) {
  const map = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
        row.push(4);
      } else {
        const r = Math.random();
        row.push(r < 0.5 ? 0 : r < 0.7 ? 3 : r < 0.9 ? 2 : 4);
      }
    }
    map.push(row);
  }
  return map;
}
