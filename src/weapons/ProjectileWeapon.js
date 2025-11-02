// src/weapons/ProjectileWeapon.js
import BaseWeapon from "./BaseWeapon.js";

export default class ProjectileWeapon extends BaseWeapon {
  constructor(player, sprite) {
    super(player, sprite);

    this.damage = 12;
    this.projectileSpeed = 400;
    this.projectileRange = 500;
    this.fireRate = 1.5; // Tirs par seconde
    this.fireTimer = 0;
    this.projectiles = [];
    this.width = 24;
    this.height = 24;

    // Pour le ricochet
    this.enemies = [];
  }

  update(dt) {
    const cooldown =
      (1 / this.fireRate) * (this.player.cooldownMultiplier || 1);
    this.fireTimer -= dt;

    // Tirer un nouveau projectile
    if (this.fireTimer <= 0) {
      this.fireTimer = cooldown;
      this.fireProjectile();
    }

    // Mettre à jour les projectiles existants
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];

      // Déplacement
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.distance += Math.hypot(proj.vx * dt, proj.vy * dt);

      // Vérifier les collisions avec les ennemis pour le ricochet
      if (proj.ricochetRemaining > 0 && this.player.hasRicochet) {
        for (const enemy of this.enemies) {
          if (
            !proj.hitEnemies.has(enemy) &&
            this.checkProjectileCollision(proj, enemy)
          ) {
            // Marquer l'ennemi comme touché
            proj.hitEnemies.add(enemy);
            proj.ricochetRemaining--;

            // Trouver la prochaine cible pour le ricochet
            const nextTarget = this.findNextRicochetTarget(proj);

            if (nextTarget && proj.ricochetRemaining > 0) {
              // Changer la direction vers la nouvelle cible
              const dx = nextTarget.x + nextTarget.width / 2 - proj.x;
              const dy = nextTarget.y + nextTarget.height / 2 - proj.y;
              const dist = Math.hypot(dx, dy);

              if (dist > 0) {
                proj.vx = (dx / dist) * this.projectileSpeed;
                proj.vy = (dy / dist) * this.projectileSpeed;
                proj.angle = Math.atan2(dy, dx);
                proj.distance = 0; // Réinitialiser la distance après ricochet
              }
            }

            break; // Un seul ricochet par frame
          }
        }
      }

      // Retirer si hors de portée
      if (
        proj.distance >
        this.projectileRange * (this.player.areaMultiplier || 1)
      ) {
        this.projectiles.splice(i, 1);
      }
      // Retirer si marqué pour suppression
      else if (proj.toRemove) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  fireProjectile() {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;

    // Nombre de projectiles basÃ© sur les bonus du joueur
    const count = 1 + (this.player.projectileBonus || 0);

    for (let i = 0; i < count; i++) {
      // Angle de tir (spread si multiple projectiles)
      let angle;
      if (this.player.lastDir) {
        const baseAngle = Math.atan2(
          this.player.lastDir.y,
          this.player.lastDir.x
        );
        const spread = count > 1 ? Math.PI / 6 : 0;
        angle =
          baseAngle + (spread * (i - (count - 1) / 2)) / Math.max(1, count - 1);
      } else {
        angle = (Math.PI * 2 * i) / count;
      }

      const vx = Math.cos(angle) * this.projectileSpeed;
      const vy = Math.sin(angle) * this.projectileSpeed;

      this.projectiles.push({
        x: centerX,
        y: centerY,
        vx,
        vy,
        angle,
        distance: 0,
        damage: this.damage * (this.player.damageMultiplier || 1),
        ricochetRemaining: this.player.ricochetCount || 0,
        pierceRemaining: this.player.pierceCount || 0,
        hitEnemies: new Set(), // Pour éviter de toucher le même ennemi plusieurs fois
        toRemove: false, // Marquer pour suppression
      });
    }
  }

  getHitboxes() {
    const hitboxes = [];
    const size = this.width * (this.player.areaMultiplier || 1);

    this.projectiles.forEach((proj) => {
      // Ne pas retourner les projectiles marqués pour suppression
      if (proj.toRemove) return;

      hitboxes.push({
        x: proj.x - size / 2,
        y: proj.y - size / 2,
        width: size,
        height: size,
        damage: proj.damage,
        angle: proj.angle,
        projectile: proj, // Référence au projectile pour pouvoir le manipuler
      });
    });

    return hitboxes;
  }

  render(ctx) {
    const hitboxes = this.getHitboxes();

    this.projectiles.forEach((proj, i) => {
      if (i < hitboxes.length) {
        const hb = hitboxes[i];

        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.rotate(proj.angle + Math.PI / 2);
        ctx.drawImage(
          this.sprite,
          -hb.width / 2,
          -hb.height / 2,
          hb.width,
          hb.height
        );
        ctx.restore();
      }
    });
  }

  /**
   * Définir la liste des ennemis pour le système de ricochet
   * @param {Array} enemies - Liste des ennemis
   */
  setEnemies(enemies) {
    this.enemies = enemies;
  }

  /**
   * Vérifie la collision entre un projectile et un ennemi
   * @param {Object} proj - Projectile
   * @param {Object} enemy - Ennemi
   * @returns {boolean}
   */
  checkProjectileCollision(proj, enemy) {
    const projSize = this.width * (this.player.areaMultiplier || 1);
    return (
      proj.x < enemy.x + enemy.width &&
      proj.x + projSize > enemy.x &&
      proj.y < enemy.y + enemy.height &&
      proj.y + projSize > enemy.y
    );
  }

  /**
   * Trouve le prochain ennemi pour le ricochet
   * @param {Object} proj - Projectile
   * @returns {Object|null} - Ennemi le plus proche non touché
   */
  findNextRicochetTarget(proj) {
    let closestEnemy = null;
    let closestDist = Infinity;
    const maxRicochetRange = 200; // Portée maximale de ricochet

    for (const enemy of this.enemies) {
      // Ignorer les ennemis déjà touchés
      if (proj.hitEnemies.has(enemy)) continue;

      const dx = enemy.x + enemy.width / 2 - proj.x;
      const dy = enemy.y + enemy.height / 2 - proj.y;
      const dist = Math.hypot(dx, dy);

      if (dist < maxRicochetRange && dist < closestDist) {
        closestDist = dist;
        closestEnemy = enemy;
      }
    }

    return closestEnemy;
  }

  upgrade() {
    this.level++;

    switch (this.level) {
      case 2:
        this.damage += 4;
        break;
      case 3:
        this.fireRate += 0.3;
        break;
      case 4:
        this.projectileSpeed += 100;
        this.projectileRange += 100;
        break;
      case 5:
        this.damage += 6;
        this.fireRate += 0.5;
        break;
      case 6:
        this.damage += 10;
        this.projectileSpeed += 150;
        break;
    }
  }
}
