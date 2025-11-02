// src/weapons/LaserWeapon.js
import BaseWeapon from "./BaseWeapon.js";

export default class LaserWeapon extends BaseWeapon {
  constructor(player, sprite) {
    super(player, sprite);

    // ✅ Laser = DPS (dégâts continus)
    this.isDPS = true;

    this.damage = 60; // DPS
    this.laserRange = 400;
    this.laserWidth = 8;
    this.rotationSpeed = 2.0; // Vitesse de rotation du laser
    
    this.width = 48;
    this.height = 48;

    // Pour le ciblage
    this.enemies = [];
    
    // ✅ Support de plusieurs lasers et ricochet
    this.lasers = []; // Tableau de lasers (un par projectileBonus + 1)
    this.targetUpdateTimer = 0;
    this.targetUpdateInterval = 0.1; // Mise à jour de la cible toutes les 0.1s
  }

  update(dt) {
    super.update(dt);

    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    
    // ✅ Nombre de lasers basé sur les bonus du joueur
    const count = 1 + (this.player.projectileBonus || 0);
    
    // ✅ Créer les lasers si nécessaire
    while (this.lasers.length < count) {
      this.lasers.push({
        currentAngle: 0,
        targetAngle: 0,
        targetEnemy: null,
        hitEnemies: new Set(),
        ricochetRemaining: this.player.ricochetCount || 0,
      });
    }
    
    // ✅ Mettre à jour ricochetRemaining pour tous les lasers (au cas où ça change)
    const currentRicochetCount = this.player.ricochetCount || 0;
    this.lasers.forEach((laser) => {
      // Si le ricochet augmente, augmenter aussi pour les lasers existants
      if (currentRicochetCount > laser.ricochetRemaining) {
        laser.ricochetRemaining = currentRicochetCount;
      }
    });
    
    // ✅ Retirer les lasers en trop si projectileBonus diminue
    while (this.lasers.length > count) {
      this.lasers.pop();
    }

    // Mettre à jour la cible régulièrement
    this.targetUpdateTimer -= dt;
    if (this.targetUpdateTimer <= 0) {
      this.targetUpdateTimer = this.targetUpdateInterval;
      this.updateTargets();
    }

    // Mettre à jour chaque laser
    this.lasers.forEach((laser, index) => {
      // Rotation progressive vers la cible
      let angleDiff = laser.targetAngle - laser.currentAngle;
      
      // Normaliser l'angle entre -PI et PI
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Rotation vers la cible
      const maxRotation = this.rotationSpeed * dt;
      if (Math.abs(angleDiff) < maxRotation) {
        laser.currentAngle = laser.targetAngle;
      } else {
        laser.currentAngle += Math.sign(angleDiff) * maxRotation;
      }
    });
  }

  updateTargets() {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    const range = this.laserRange * (this.player.areaMultiplier || 1);

    // Trouver tous les ennemis dans la portée, triés par distance
    const availableEnemies = [];
    for (const enemy of this.enemies) {
      const dx = enemy.x + enemy.width / 2 - centerX;
      const dy = enemy.y + enemy.height / 2 - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < range) {
        availableEnemies.push({ enemy, dist, dx, dy });
      }
    }
    
    availableEnemies.sort((a, b) => a.dist - b.dist);

    // Mettre à jour la cible pour chaque laser
    this.lasers.forEach((laser, index) => {
      // ✅ Si ricochet activé, ignorer les ennemis déjà touchés
      let targetData = null;
      
      for (const enemyData of availableEnemies) {
        // Si ricochet activé, éviter les ennemis déjà touchés par ce laser
        if (laser.ricochetRemaining > 0 && this.player.hasRicochet) {
          if (!laser.hitEnemies.has(enemyData.enemy)) {
            targetData = enemyData;
            break;
          }
        } else {
          // Pas de ricochet, prendre le plus proche
          targetData = enemyData;
          break;
        }
      }

      if (targetData) {
        laser.targetEnemy = targetData.enemy;
        laser.targetAngle = Math.atan2(targetData.dy, targetData.dx);
        
        // Spread si plusieurs lasers
        if (this.lasers.length > 1) {
          const spread = Math.PI / 18; // 10 degrés
          laser.targetAngle += (spread * (index - (this.lasers.length - 1) / 2)) / Math.max(1, this.lasers.length - 1);
        }
      } else {
        // Aucune cible, utiliser la dernière direction du joueur
        if (this.player.lastDir) {
          laser.targetAngle = Math.atan2(
            this.player.lastDir.y,
            this.player.lastDir.x
          );
          // Spread si plusieurs lasers
          if (this.lasers.length > 1) {
            const spread = Math.PI / 18;
            laser.targetAngle += (spread * (index - (this.lasers.length - 1) / 2)) / Math.max(1, this.lasers.length - 1);
          }
        }
        laser.targetEnemy = null;
      }
    });
  }

  getHitboxes() {
    const hitboxes = [];
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    const range = this.laserRange * (this.player.areaMultiplier || 1);
    const width = this.laserWidth * (this.player.areaMultiplier || 1);

    // ✅ Créer une hitbox pour chaque laser
    this.lasers.forEach((laser) => {
      // Créer une hitbox rectangulaire pour le laser
      const endX = centerX + Math.cos(laser.currentAngle) * range;
      const endY = centerY + Math.sin(laser.currentAngle) * range;

      // Pour les collisions, créer une hitbox qui couvre toute la ligne
      // Calculer le rectangle englobant
      const cos = Math.cos(laser.currentAngle);
      const sin = Math.sin(laser.currentAngle);
      const perpCos = -sin; // Perpendiculaire
      const perpSin = cos;

      // Les 4 coins du rectangle
      const halfWidth = width / 2;
      const p1x = centerX + perpCos * halfWidth;
      const p1y = centerY + perpSin * halfWidth;
      const p2x = centerX - perpCos * halfWidth;
      const p2y = centerY - perpSin * halfWidth;
      const p3x = endX - perpCos * halfWidth;
      const p3y = endY - perpSin * halfWidth;
      const p4x = endX + perpCos * halfWidth;
      const p4y = endY + perpSin * halfWidth;

      // Rectangle englobant
      const minX = Math.min(p1x, p2x, p3x, p4x);
      const maxX = Math.max(p1x, p2x, p3x, p4x);
      const minY = Math.min(p1y, p2y, p3y, p4y);
      const maxY = Math.max(p1y, p2y, p3y, p4y);

      hitboxes.push({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        damage: this.damage,
        angle: laser.currentAngle,
        laser: true, // Marquer comme laser pour le rendu spécial
        laserData: laser, // Référence au laser pour le ricochet
        startX: centerX,
        startY: centerY,
        endX: endX,
        endY: endY,
      });
    });

    return hitboxes;
  }

  render(ctx) {
    const hitboxes = this.getHitboxes();
    if (hitboxes.length === 0) return;

    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;

    // Utiliser la largeur originale du laser (pas la hitbox)
    const laserWidth = this.laserWidth * (this.player.areaMultiplier || 1);

    // ✅ Dessiner chaque laser
    hitboxes.forEach((hb) => {
      ctx.save();

      // Gradient pour le laser
      const gradient = ctx.createLinearGradient(hb.startX, hb.startY, hb.endX, hb.endY);
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.9)"); // Rouge vif à l'origine
      gradient.addColorStop(0.5, "rgba(255, 100, 0, 0.8)"); // Orange au milieu
      gradient.addColorStop(1, "rgba(255, 200, 0, 0.6)"); // Jaune à la fin

      // Lueur externe
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 20;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = laserWidth * 1.5;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(hb.startX, hb.startY);
      ctx.lineTo(hb.endX, hb.endY);
      ctx.stroke();

      // Ligne principale du laser
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = laserWidth;

      ctx.beginPath();
      ctx.moveTo(hb.startX, hb.startY);
      ctx.lineTo(hb.endX, hb.endY);
      ctx.stroke();

      // Point lumineux à l'origine
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(hb.startX, hb.startY, laserWidth / 2, 0, Math.PI * 2);
      ctx.fill();

      // Particules lumineuses le long du laser (effet scintillant)
      for (let i = 0; i < 3; i++) {
        const t = (Date.now() * 0.005 + i) % 1;
        const px = hb.startX + (hb.endX - hb.startX) * t;
        const py = hb.startY + (hb.endY - hb.startY) * t;
        
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#ffff00";
        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Dessiner l'imprimante à l'origine (optionnel, si sprite fourni)
    if (this.sprite && this.lasers.length > 0) {
      ctx.save();
      ctx.translate(centerX, centerY);
      // Utiliser l'angle du premier laser pour l'orientation de l'imprimante
      ctx.rotate(this.lasers[0].currentAngle + Math.PI / 2);
      ctx.drawImage(
        this.sprite,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      ctx.restore();
    }
  }

  upgrade() {
    this.level++;

    switch (this.level) {
      case 2:
        this.damage += 20;
        this.laserRange += 50;
        break;
      case 3:
        this.rotationSpeed += 1.0;
        this.laserWidth += 2;
        break;
      case 4:
        this.damage += 30;
        this.laserRange += 100;
        break;
      case 5:
        this.rotationSpeed += 1.5;
        this.targetUpdateInterval *= 0.8; // Mise à jour plus rapide
        break;
      case 6:
        this.damage += 50;
        this.laserWidth += 4;
        this.laserRange += 150;
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

