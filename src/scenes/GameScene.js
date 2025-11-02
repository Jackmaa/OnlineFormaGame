// src/scenes/GameScene.js
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
    this.weaponDrops = []; // ✅ Armes légendaires droppées
    this.dropEffects = []; // ✅ Effets visuels de drop
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
  }

  /**
   * Crée une arme en fonction de son type
   * @param {string} weaponType - Type d'arme (sword, orbital, projectile)
   * @param {Player} player - Joueur
   * @param {Image} sprite - Sprite de l'arme
   * @returns {BaseWeapon} L'arme créée
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

    // Mettre Ã  jour la liste des ennemis pour les armes (ciblage automatique)
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
            // ✅ Gestion spéciale pour les lasers (ricochet)
            if (hitbox.laser && hitbox.laserData) {
              const laserData = hitbox.laserData;

              // Vérifier si cet ennemi a déjà été touché par ce laser (ricochet)
              if (laserData.hitEnemies && laserData.hitEnemies.has(enemy)) {
                // Déjà touché, skip
                continue;
              }

              // Appliquer les dégâts
              let damage = hitbox.damage * this.player.damageMultiplier;

              if (enemy.isBoss) {
                damage *= this.player.bossDamageMultiplier;
              }

              if (Math.random() < this.player.critChance) {
                damage *= 1.5;
              }

              enemy.hp -= damage;

              // ✅ Gérer le ricochet pour le laser
              if (laserData.ricochetRemaining > 0 && this.player.hasRicochet) {
                // Marquer l'ennemi comme touché
                if (!laserData.hitEnemies) laserData.hitEnemies = new Set();
                laserData.hitEnemies.add(enemy);
                laserData.ricochetRemaining--;

                // La cible sera mise à jour dans LaserWeapon.updateTargets()
                // qui cherchera le prochain ennemi non touché
              } else {
                // Pas de ricochet, marquer quand même pour éviter les doubles hits
                if (!laserData.hitEnemies) laserData.hitEnemies = new Set();
                laserData.hitEnemies.add(enemy);
              }

              continue;
            }

            // Gestion spéciale pour les projectiles
            if (hitbox.projectile) {
              const proj = hitbox.projectile;

              // ✅ Vérifier si CET ennemi a déjà été touché par CET projectile
              // Chaque projectile a son propre hitEnemies Set, donc chaque projectile
              // peut toucher indépendamment les mêmes ennemis que d'autres projectiles
              if (proj.hitEnemies && proj.hitEnemies.has(enemy)) {
                // Cet ennemi a déjà été touché par ce projectile spécifique (via ricochet ou pierce)
                // Skip cet ennemi pour ce projectile uniquement
                continue;
              }

              // ✅ PRIORITÉ 1 : Si ricochet restant > 0 ET hasRicochet activé pour CE projectile
              // ProjectileWeapon.update() gère les collisions avec ricochet au début de chaque frame
              // Si l'ennemi n'est pas encore dans hitEnemies, cela signifie que ProjectileWeapon
              // va gérer cette collision au prochain frame (ou l'a déjà gérée cette frame)
              // On skip ici pour laisser ProjectileWeapon.update() gérer le ricochet
              // et éviter d'appliquer les dégâts deux fois
              if (proj.ricochetRemaining > 0 && this.player.hasRicochet) {
                // Le ricochet sera géré dans ProjectileWeapon.update() (appelé dans player.update())
                // Skip cette collision pour éviter les doubles dégâts
                // Note: Chaque projectile est traité indépendamment, donc les projectiles sans
                // ricochet (ricochetRemaining = 0) continueront normalement ci-dessous
                continue;
              }

              // Si on arrive ici, c'est que :
              // - Cet ennemi n'a PAS été touché par ce projectile (pas dans hitEnemies)
              // - Ce projectile n'a PAS de ricochet actif (ricochetRemaining = 0)
              // Donc on gère normalement avec le pierce

              // ✅ PRIORITÉ 2 : Si ricochet = 0 pour CE projectile, alors utiliser le pierce
              // Appliquer les dégâts normalement
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

              // Marquer l'ennemi comme touché par ce projectile pour éviter les doubles hits
              if (!proj.hitEnemies) proj.hitEnemies = new Set();
              proj.hitEnemies.add(enemy);

              // Gérer le pierce
              if (proj.pierceRemaining > 0) {
                proj.pierceRemaining--;
              } else {
                // Sinon, marquer pour suppression (seulement si ricochet aussi à 0)
                proj.toRemove = true;
              }
            } else {
              // ✅ Pour les armes non-projectiles (épée, orbitales, etc.), appliquer les dégâts normalement
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

      // ✅ Si une gemme vient d'être collectée cette frame, noter sa position pour le drop
      if (!wasCollected && gem.collected) {
        collectedGemsPositions.push({
          x: gem.x + gem.width / 2,
          y: gem.y + gem.height / 2,
        });
      }
    }

    // ✅ Filtrer les gemmes collectées
    this.xpGems = this.xpGems.filter((g) => !g.collected);

    // ✅ Essayer de dropper une arme légendaire pour chaque gemme collectée
    for (const pos of collectedGemsPositions) {
      this.tryDropLegendaryWeapon(pos.x, pos.y);
    }

    // ✅ Update weapon drops
    for (const weaponDrop of this.weaponDrops) {
      const collected = weaponDrop.update(dt, this.player);
      if (collected) {
        // Créer et équiper l'arme
        const weapon = this.createWeapon(
          weaponDrop.weaponType,
          this.player,
          this.game.assets.weapon
        );
        this.player.addWeapon(weapon);

        // ✅ Initialiser l'arme si elle a besoin de setEnemies
        const enemies = this.waveManager.getEnemies();
        if (weapon.setEnemies) {
          weapon.setEnemies(enemies);
        }

        console.log(`🎁 Arme légendaire collectée: ${weaponDrop.weaponType}`);
      }
    }
    this.weaponDrops = this.weaponDrops.filter((w) => !w.collected);

    // ✅ Update drop effects
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

    // ✅ Weapon Drops (armes légendaires)
    this.weaponDrops.forEach((w) => w.render(ctx));

    // ✅ Drop Effects (effets visuels)
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

  /**
   * ✅ Essaie de dropper une arme légendaire avec 5% de chance (modifiée par luckMultiplier)
   * @param {number} x - Position X où dropper l'arme
   * @param {number} y - Position Y où dropper l'arme
   */
  tryDropLegendaryWeapon(x, y) {
    // Chance de base : 5% (0.05)
    const baseChance = 0.05;

    // Modifier par luckMultiplier (1.0 = normal, 2.0 = double chance)
    const luckMultiplier = this.player.luckMultiplier || 1.0;
    const finalChance = baseChance * luckMultiplier;

    // Roll
    if (Math.random() < finalChance) {
      // Choisir aléatoirement entre les deux armes légendaires
      const legendaryWeapons = ["laser", "guidedMissile"];
      const randomWeapon =
        legendaryWeapons[Math.floor(Math.random() * legendaryWeapons.length)];

      const weaponDrop = new WeaponDrop(
        x,
        y,
        randomWeapon,
        this.game.assets.weapon
      );

      this.weaponDrops.push(weaponDrop);

      // ✅ Créer l'effet visuel de drop (explosion de particules)
      const dropEffect = new DropEffect(x, y);
      this.dropEffects.push(dropEffect);

      console.log(
        `✨ Arme légendaire droppée: ${randomWeapon} (Chance: ${(
          finalChance * 100
        ).toFixed(2)}%)`
      );
    }
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
