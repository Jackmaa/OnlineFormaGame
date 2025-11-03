// src/scenes/GameScene.js - VERSION AMÉLIORÉE
// Intégration du WeaponDropSystem amélioré

import Player from "../entities/Player.js";
import Bug from "../entities/Bug.js";
import TileMap from "../engine/TileMap.js";
import XPGem from "../entities/XPGem.js";
import WeaponDrop from "../entities/WeaponDrop.js";
import DropEffect from "../effects/DropEffect.js";
import UI from "../UI.js";
import WaveManager from "../systems/WaveManager.js";
import Sword from "../weapons/Sword.js";
import OrbitalWeapon from "../weapons/OrbitalWeapon.js";
import ProjectileWeapon from "../weapons/ProjectileWeapon.js";
import GuidedMissile from "../weapons/GuidedMissile.js";
import LaserWeapon from "../weapons/LaserWeapon.js";
import LevelUpSystem from "../systems/LevelUpSystem.js";
import WeaponDropSystem from "../systems/WeaponDropSystem.js";
import { getCharacter } from "../data/Characters.js";

export default class GameScene {
  constructor(mapArray, ts, tileset) {
    Object.assign(this, { mapArray, ts, tileset });
  }

  init() {
    this.tileMap = null;
    this.player = null;
    this.waveManager = null;
    this.xpGems = [];
    this.weaponDrops = [];
    this.dropEffects = [];
    this.UI = null;
    this.levelUpSystem = null;
    this.weaponDropSystem = null;
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
    this.game.Bug = Bug;
    this.waveManager = new WaveManager(this.game, assets.enemy);

    // ✅ Weapon Drop System
    this.weaponDropSystem = new WeaponDropSystem();

    // XP Gem sprite
    this.xpSprite = assets.xpGem;

    // Add starting weapon based on character
    const characterData = getCharacter(characterId);
    const startWeapon = this.createWeapon(
      characterData.startWeapon,
      this.player,
      assets.weapon
    );
    this.player.addWeapon(startWeapon);

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

    // ✅ Debug: Afficher les drop rates au démarrage
    console.log(`\n🎮 ${this.player.characterName} commence la partie !`);
    this.weaponDropSystem.debugDropRates(this.player.luckMultiplier || 1.0);
  }

  /**
   * Crée une arme en fonction de son type
   */
  createWeapon(weaponType, player, sprite) {
    switch (weaponType) {
      case "sword":
        return new Sword(player, sprite);
      case "orbital":
        return new OrbitalWeapon(player, sprite);
      case "projectile":
        return new ProjectileWeapon(player, sprite);
      case "guidedMissile":
        return new GuidedMissile(player, sprite);
      case "laser":
        return new LaserWeapon(player, sprite);
      default:
        console.warn(
          `Type d'arme inconnu: ${weaponType}, utilisation de l'épée par défaut`
        );
        return new Sword(player, sprite);
    }
  }

  update(dt) {
    if (this.paused) return;

    this.gameTime += dt;
    this.game.gameTime = this.gameTime;

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

    // Mettre à jour la liste des ennemis pour les armes
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
            // Gestion spéciale pour les lasers
            if (hitbox.laser && hitbox.laserData) {
              const laserData = hitbox.laserData;

              if (laserData.hitEnemies && laserData.hitEnemies.has(enemy)) {
                continue;
              }

              let damage = hitbox.damage * this.player.damageMultiplier;

              if (enemy.isBoss) {
                damage *= this.player.bossDamageMultiplier;
              }

              if (Math.random() < this.player.critChance) {
                damage *= 1.5;
              }

              enemy.hp -= damage;

              if (laserData.ricochetRemaining > 0 && this.player.hasRicochet) {
                if (!laserData.hitEnemies) laserData.hitEnemies = new Set();
                laserData.hitEnemies.add(enemy);
                laserData.ricochetRemaining--;
              } else {
                if (!laserData.hitEnemies) laserData.hitEnemies = new Set();
                laserData.hitEnemies.add(enemy);
              }

              continue;
            }

            // Gestion spéciale pour les projectiles
            if (hitbox.projectile) {
              const proj = hitbox.projectile;

              if (proj.hitEnemies && proj.hitEnemies.has(enemy)) {
                continue;
              }

              if (proj.ricochetRemaining > 0 && this.player.hasRicochet) {
                continue;
              }

              let damage = hitbox.damage * this.player.damageMultiplier;

              if (enemy.isBoss) {
                damage *= this.player.bossDamageMultiplier;
              }

              if (Math.random() < this.player.critChance) {
                damage *= 1.5;
              }

              enemy.hp -= damage;

              if (!proj.hitEnemies) proj.hitEnemies = new Set();
              proj.hitEnemies.add(enemy);

              if (proj.pierceRemaining > 0) {
                proj.pierceRemaining--;
              } else {
                proj.toRemove = true;
              }
            } else {
              // Armes normales
              let damage = hitbox.damage * this.player.damageMultiplier;

              if (enemy.isBoss) {
                damage *= this.player.bossDamageMultiplier;
              }

              if (Math.random() < this.player.critChance) {
                damage *= 1.5;
              }

              enemy.hp -= damage;
            }
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
    const collectedGemsPositions = [];
    for (const gem of this.xpGems) {
      const wasCollected = gem.collected;
      gem.update(dt, this.player);

      if (!wasCollected && gem.collected) {
        collectedGemsPositions.push({
          x: gem.x + gem.width / 2,
          y: gem.y + gem.height / 2,
        });
      }
    }

    this.xpGems = this.xpGems.filter((g) => !g.collected);

    for (const pos of collectedGemsPositions) {
      this.tryDropLegendaryWeapon(pos.x, pos.y);
    }

    // Update weapon drops
    for (const weaponDrop of this.weaponDrops) {
      const collected = weaponDrop.update(dt, this.player);
      if (collected) {
        const weapon = this.createWeapon(
          weaponDrop.weaponType,
          this.player,
          this.game.assets.weapon
        );
        this.player.addWeapon(weapon);

        const enemies = this.waveManager.getEnemies();
        if (weapon.setEnemies) {
          weapon.setEnemies(enemies);
        }

        // ✅ Notification améliorée
        this.showWeaponNotification(weaponDrop);
      }
    }
    this.weaponDrops = this.weaponDrops.filter((w) => !w.collected);

    // Update drop effects
    for (const effect of this.dropEffects) {
      effect.update(dt);
    }
    this.dropEffects = this.dropEffects.filter((e) => !e.isFinished());

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

    // Weapon Drops
    this.weaponDrops.forEach((w) => w.render(ctx));

    // Drop Effects
    this.dropEffects.forEach((e) => e.render(ctx));

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

    // ✅ Luck indicator
    if (this.player.luckMultiplier > 1.0) {
      ctx.fillStyle = "#10B981";
      ctx.font = "bold 14px Arial";
      const bonusPercent = ((this.player.luckMultiplier - 1.0) * 100).toFixed(
        0
      );
      ctx.fillText(
        `🍀 Chance +${bonusPercent}%`,
        this.game.canvas.width / 2,
        80
      );
    }

    ctx.restore();
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  gameOver() {
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

    // ✅ Afficher les stats de drop
    this.weaponDropSystem.debugDropStats();

    overlay.innerHTML = `
      <h1 style="font-size:72px;margin:0;color:#e53e3e;">GAME OVER</h1>
      <p style="font-size:36px;margin:20px 0;">Time Survived: ${this.formatTime(
        this.gameTime
      )}</p>
      <p style="font-size:24px;opacity:0.8;">Level: ${this.player.level}</p>
      <p style="font-size:18px;opacity:0.7;">Character: ${
        this.player.characterName
      }</p>
      ${
        this.player.luckMultiplier > 1.0
          ? `<p style="font-size:16px;opacity:0.7;color:#10B981;">🍀 Luck: x${this.player.luckMultiplier.toFixed(
              1
            )}</p>`
          : ""
      }
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

  /**
   * ✅ AMÉLIORÉ: Utilise le WeaponDropSystem pour les drops
   */
  tryDropLegendaryWeapon(x, y) {
    const luckMultiplier = this.player.luckMultiplier || 1.0;

    // ✅ Utiliser le système de drop amélioré
    const droppedWeapon = this.weaponDropSystem.tryDrop(luckMultiplier);

    if (droppedWeapon) {
      // Créer le WeaponDrop visuel
      const weaponDrop = new WeaponDrop(
        x,
        y,
        droppedWeapon.type,
        this.game.assets.weapon
      );

      // ✅ Ajouter les métadonnées de l'arme
      weaponDrop.weaponData = droppedWeapon;

      this.weaponDrops.push(weaponDrop);

      // Effet visuel
      const dropEffect = new DropEffect(x, y);
      this.dropEffects.push(dropEffect);
    }
  }

  /**
   * ✅ NOUVEAU: Notification améliorée pour les armes
   */
  showWeaponNotification(weaponDrop) {
    const weaponData = weaponDrop.weaponData;
    if (!weaponData) return;

    const notification = document.createElement("div");

    Object.assign(notification.style, {
      position: "fixed",
      top: "20%",
      left: "50%",
      transform: "translateX(-50%)",
      background: `linear-gradient(135deg, ${weaponData.color}40, ${weaponData.color}80)`,
      border: `4px solid ${weaponData.color}`,
      borderRadius: "20px",
      padding: "30px 50px",
      zIndex: 9999,
      textAlign: "center",
      boxShadow: `0 0 60px ${weaponData.color}, 0 0 100px ${weaponData.color}80`,
      animation: "weaponDropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
    });

    const rarityLabels = {
      legendary: "LÉGENDAIRE",
      epic: "ÉPIQUE",
      rare: "RARE",
    };

    notification.innerHTML = `
      <div style="font-size:64px;margin-bottom:15px;filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
        ${weaponData.icon}
      </div>
      <div style="font-size:28px;font-weight:bold;color:${
        weaponData.color
      };text-shadow:2px 2px 4px #000;margin-bottom:10px;">
        ${rarityLabels[weaponData.rarity]} OBTENU !
      </div>
      <div style="font-size:22px;color:white;text-shadow:1px 1px 2px #000;margin-bottom:8px;font-weight:bold;">
        ${weaponData.name}
      </div>
      <div style="font-size:16px;color:white;opacity:0.9;text-shadow:1px 1px 2px #000;">
        ${weaponData.description}
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes weaponDropIn {
        0% { 
          transform: translateX(-50%) translateY(-100px) scale(0.5) rotate(-10deg); 
          opacity: 0; 
        }
        60% { 
          transform: translateX(-50%) translateY(0) scale(1.1) rotate(5deg); 
        }
        100% { 
          transform: translateX(-50%) translateY(0) scale(1) rotate(0deg); 
          opacity: 1; 
        }
      }
      @keyframes weaponDropOut {
        0% { 
          transform: translateX(-50%) translateY(0) scale(1); 
          opacity: 1; 
        }
        100% { 
          transform: translateX(-50%) translateY(-100px) scale(0.5); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "weaponDropOut 0.4s ease-in forwards";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 400);
    }, 3000);
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
