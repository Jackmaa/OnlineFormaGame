// src/weapons/GuidedMissile.js
import BaseWeapon from "./BaseWeapon.js";

export default class GuidedMissile extends BaseWeapon {
  constructor(player, sprite) {
    super(player, sprite);

    // ✅ Missile guidé = BURST (dégâts par hit)
    this.isDPS = false;

    this.damage = 20;
    this.missileSpeed = 300;
    this.missileRange = 600;
    this.fireRate = 1.0; // 1 tir par seconde
    this.fireTimer = 0;
    this.missiles = [];
    this.width = 32;
    this.height = 32;

    // Pour le ciblage
    this.enemies = [];
    
    // Vitesse de rotation (homing)
    this.homingStrength = 5.0; // Force de guidage
  }

  update(dt) {
    super.update(dt);

    const cooldown =
      (1 / this.fireRate) * (this.player.cooldownMultiplier || 1);
    this.fireTimer -= dt;

    // Tirer un nouveau missile
    if (this.fireTimer <= 0) {
      this.fireTimer = cooldown;
      this.fireMissile();
    }

    // Mettre à jour les missiles existants
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const missile = this.missiles[i];

      // ✅ GUIDAGE : Trouver l'ennemi le plus proche
      let closestEnemy = null;
      let closestDist = Infinity;

      for (const enemy of this.enemies) {
        // Ignorer les ennemis déjà touchés
        if (missile.hitEnemies && missile.hitEnemies.has(enemy)) {
          continue;
        }

        const dx = enemy.x + enemy.width / 2 - missile.x;
        const dy = enemy.y + enemy.height / 2 - missile.y;
        const dist = Math.hypot(dx, dy);

        if (dist < closestDist) {
          closestDist = dist;
          closestEnemy = enemy;
        }
      }

      // ✅ Ajuster la direction vers l'ennemi le plus proche
      if (closestEnemy && closestDist > 10) {
        const dx = closestEnemy.x + closestEnemy.width / 2 - missile.x;
        const dy = closestEnemy.y + closestEnemy.height / 2 - missile.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
          // Direction cible
          const targetVx = (dx / dist) * this.missileSpeed;
          const targetVy = (dy / dist) * this.missileSpeed;

          // Interpolation vers la direction cible (homing)
          const lerpFactor = this.homingStrength * dt;
          missile.vx = missile.vx * (1 - lerpFactor) + targetVx * lerpFactor;
          missile.vy = missile.vy * (1 - lerpFactor) + targetVy * lerpFactor;

          // Normaliser pour maintenir la vitesse constante
          const speed = Math.hypot(missile.vx, missile.vy);
          if (speed > 0) {
            missile.vx = (missile.vx / speed) * this.missileSpeed;
            missile.vy = (missile.vy / speed) * this.missileSpeed;
          }

          // Mettre à jour l'angle pour le rendu
          missile.angle = Math.atan2(missile.vy, missile.vx);
        }
      }

      // Déplacement
      missile.x += missile.vx * dt;
      missile.y += missile.vy * dt;
      missile.distance += Math.hypot(missile.vx * dt, missile.vy * dt);

      // Retirer si hors de portée
      if (
        missile.distance >
        this.missileRange * (this.player.areaMultiplier || 1)
      ) {
        this.missiles.splice(i, 1);
      } else if (missile.toRemove) {
        this.missiles.splice(i, 1);
      }
    }
  }

  fireMissile() {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;

    // ✅ Nombre de missiles basé sur les bonus du joueur
    const count = 1 + (this.player.projectileBonus || 0);

    // Trouver les ennemis les plus proches pour cibler
    const targetEnemies = [];
    
    for (const enemy of this.enemies) {
      const dx = enemy.x + enemy.width / 2 - centerX;
      const dy = enemy.y + enemy.height / 2 - centerY;
      const dist = Math.hypot(dx, dy);
      targetEnemies.push({ enemy, dist });
    }
    
    // Trier par distance
    targetEnemies.sort((a, b) => a.dist - b.dist);

    for (let i = 0; i < count; i++) {
      // Trouver la cible pour ce missile
      let targetEnemy = null;
      
      if (i < targetEnemies.length) {
        targetEnemy = targetEnemies[i].enemy;
      } else if (targetEnemies.length > 0) {
        // S'il y a moins d'ennemis que de missiles, répartir
        targetEnemy = targetEnemies[i % targetEnemies.length].enemy;
      }

      // Angle de départ
      let angle = 0;
      if (targetEnemy) {
        const dx = targetEnemy.x + targetEnemy.width / 2 - centerX;
        const dy = targetEnemy.y + targetEnemy.height / 2 - centerY;
        angle = Math.atan2(dy, dx);
        
        // Spread léger si plusieurs missiles
        if (count > 1) {
          const spread = Math.PI / 12; // 15 degrés
          angle += (spread * (i - (count - 1) / 2)) / Math.max(1, count - 1);
        }
      } else if (this.player.lastDir) {
        angle = Math.atan2(this.player.lastDir.y, this.player.lastDir.x);
        // Spread si plusieurs missiles
        if (count > 1) {
          const spread = Math.PI / 12;
          angle += (spread * (i - (count - 1) / 2)) / Math.max(1, count - 1);
        }
      } else {
        // Spread circulaire si aucune direction
        angle = (Math.PI * 2 * i) / count;
      }

      const vx = Math.cos(angle) * this.missileSpeed;
      const vy = Math.sin(angle) * this.missileSpeed;

      this.missiles.push({
        x: centerX,
        y: centerY,
        vx,
        vy,
        angle,
        distance: 0,
        damage: this.damage * (this.player.damageMultiplier || 1),
        hitEnemies: new Set(),
        pierceRemaining: this.player.pierceCount || 0, // ✅ Support du pierce
        toRemove: false,
      });
    }
  }

  getHitboxes() {
    const hitboxes = [];
    const size = this.width * (this.player.areaMultiplier || 1);

    this.missiles.forEach((missile) => {
      if (missile.toRemove) return;

      hitboxes.push({
        x: missile.x - size / 2,
        y: missile.y - size / 2,
        width: size,
        height: size,
        damage: missile.damage,
        angle: missile.angle,
        projectile: missile, // ✅ Nécessaire pour que GameScene gère le pierce
      });
    });

    return hitboxes;
  }

  render(ctx) {
    const hitboxes = this.getHitboxes();

    this.missiles.forEach((missile, i) => {
      if (i < hitboxes.length) {
        const hb = hitboxes[i];

        ctx.save();
        ctx.translate(missile.x, missile.y);
        ctx.rotate(missile.angle + Math.PI / 2);

        // Effet de lueur pour le missile
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 15;

        ctx.drawImage(
          this.sprite,
          -hb.width / 2,
          -hb.height / 2,
          hb.width,
          hb.height
        );

        ctx.restore();

        // Traînée de fumée (optionnel - simple cercle)
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#888888";
        ctx.beginPath();
        ctx.arc(missile.x - missile.vx * 0.05, missile.y - missile.vy * 0.05, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  upgrade() {
    this.level++;

    switch (this.level) {
      case 2:
        this.damage += 5;
        this.homingStrength += 2;
        break;
      case 3:
        this.fireRate += 0.2;
        this.missileSpeed += 50;
        break;
      case 4:
        this.damage += 10;
        this.homingStrength += 3;
        break;
      case 5:
        this.fireRate += 0.3;
        this.missileRange += 100;
        break;
      case 6:
        this.damage += 15;
        this.homingStrength += 5;
        this.missileSpeed += 100;
        break;
    }
  }

  /**
   * Met à jour la liste des ennemis pour le ciblage
   * @param {Array} enemies - Tableau des ennemis
   */
  setEnemies(enemies) {
    this.enemies = enemies;
  }
}

