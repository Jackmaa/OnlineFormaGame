// src/weapons/ProjectileWeapon.js
import BaseWeapon from './BaseWeapon.js';

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
  }

  update(dt) {
    const cooldown = (1 / this.fireRate) * (this.player.cooldownMultiplier || 1);
    this.fireTimer -= dt;
    
    // Tirer un nouveau projectile
    if (this.fireTimer <= 0) {
      this.fireTimer = cooldown;
      this.fireProjectile();
    }
    
    // Mettre à jour les projectiles existants
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.distance += Math.hypot(proj.vx * dt, proj.vy * dt);
      
      // Retirer si hors de portée
      if (proj.distance > this.projectileRange * (this.player.areaMultiplier || 1)) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  fireProjectile() {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    
    // Nombre de projectiles basé sur les bonus du joueur
    const count = 1 + (this.player.projectileBonus || 0);
    
    for (let i = 0; i < count; i++) {
      // Angle de tir (spread si multiple projectiles)
      let angle;
      if (this.player.lastDir) {
        const baseAngle = Math.atan2(this.player.lastDir.y, this.player.lastDir.x);
        const spread = count > 1 ? (Math.PI / 6) : 0;
        angle = baseAngle + (spread * (i - (count - 1) / 2)) / Math.max(1, count - 1);
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
        damage: this.damage * (this.player.damageMultiplier || 1)
      });
    }
  }

  getHitboxes() {
    const hitboxes = [];
    const size = this.width * (this.player.areaMultiplier || 1);
    
    this.projectiles.forEach(proj => {
      hitboxes.push({
        x: proj.x - size / 2,
        y: proj.y - size / 2,
        width: size,
        height: size,
        damage: proj.damage,
        angle: proj.angle
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
