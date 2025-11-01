// src/weapons/Sword.js
import BaseWeapon from "./BaseWeapon.js";

export default class Sword extends BaseWeapon {
  constructor(player, sprite) {
    super(player, sprite);

    // ✅ Épée = BURST DAMAGE (pas de DPS)
    this.isDPS = false;

    this.damage = 15; // 15 HP par hit (pas besoin de * 50 !)
    this.attackSpeed = 1.5; // Attaques par seconde
    this.attackDuration = 0.25; // Durée du slash (secondes)
    this.range = 80; // Portée de l'épée

    // État de l'attaque
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackCooldown = 0;

    // Animation du slash
    this.slashProgress = 0; // 0 à 1
    this.slashStartAngle = 0;
    this.slashEndAngle = 0;

    // Position et taille
    this.width = 48;
    this.height = 48;

    // Référence aux ennemis (sera passée par GameScene)
    this.enemies = [];
  }

  update(dt) {
    // ✅ Appelle le update de BaseWeapon pour le reset timer
    super.update(dt);

    const cooldownTime =
      (1 / this.attackSpeed) * (this.player.cooldownMultiplier || 1);

    // Cooldown entre les attaques
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // Lancer une nouvelle attaque si prêt
    if (this.attackCooldown <= 0 && !this.isAttacking) {
      this.startAttack();
    }

    // Progression de l'attaque
    if (this.isAttacking) {
      this.attackTimer += dt;
      this.slashProgress = Math.min(this.attackTimer / this.attackDuration, 1);

      // Fin de l'attaque
      if (this.slashProgress >= 1) {
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackCooldown = cooldownTime;
      }
    }
  }

  startAttack() {
    this.isAttacking = true;
    this.attackTimer = 0;
    this.slashProgress = 0;

    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;

    // Trouver l'ennemi le plus proche
    let targetAngle = 0; // Angle par défaut (droite)
    let closestDist = Infinity;
    let closestEnemy = null;

    for (const enemy of this.enemies) {
      const enemyCenterX = enemy.x + enemy.width / 2;
      const enemyCenterY = enemy.y + enemy.height / 2;
      const dx = enemyCenterX - centerX;
      const dy = enemyCenterY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < closestDist) {
        closestDist = dist;
        closestEnemy = enemy;
        targetAngle = Math.atan2(dy, dx);
      }
    }

    // Si aucun ennemi, utiliser la dernière direction de mouvement
    if (!closestEnemy && this.player.lastDir) {
      targetAngle = Math.atan2(this.player.lastDir.y, this.player.lastDir.x);
    }

    // Le slash fait un arc de 120 degrés centré sur l'ennemi
    const slashArc = (120 * Math.PI) / 180;
    this.slashStartAngle = targetAngle - slashArc / 2;
    this.slashEndAngle = targetAngle + slashArc / 2;
  }

  /**
   * ✅ Override shouldResetHits pour reset à chaque nouveau slash
   */
  shouldResetHits() {
    // Reset au début d'un nouveau slash
    return !this.isAttacking && this.attackCooldown > 0;
  }

  getHitboxes() {
    if (!this.isAttacking) return [];

    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;

    // Angle actuel du slash basé sur la progression
    const currentAngle =
      this.slashStartAngle +
      (this.slashEndAngle - this.slashStartAngle) * this.slashProgress;

    // Position de l'épée
    const range = this.range * (this.player.areaMultiplier || 1);
    const x = centerX + Math.cos(currentAngle) * range;
    const y = centerY + Math.sin(currentAngle) * range;

    const size = this.width * (this.player.areaMultiplier || 1);

    return [
      {
        x: x - size / 2,
        y: y - size / 2,
        width: size,
        height: size,
        damage: this.damage, // ✅ Pas besoin de multiplier par damageMultiplier ici
        angle: currentAngle,
      },
    ];
  }

  render(ctx) {
    if (!this.isAttacking) return;

    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;

    // Dessiner le trail du slash (effet de mouvement)
    const range = this.range * (this.player.areaMultiplier || 1);

    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = "#88ccff";
    ctx.lineWidth = 3;
    ctx.beginPath();

    // Arc du slash
    const arcStartAngle = this.slashStartAngle;
    const arcEndAngle =
      this.slashStartAngle +
      (this.slashEndAngle - this.slashStartAngle) * this.slashProgress;

    ctx.arc(centerX, centerY, range * 0.7, arcStartAngle, arcEndAngle);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Dessiner l'épée elle-même
    const hitboxes = this.getHitboxes();
    if (hitboxes.length > 0) {
      const hb = hitboxes[0];

      ctx.save();
      ctx.translate(hb.x + hb.width / 2, hb.y + hb.height / 2);
      ctx.rotate(hb.angle + Math.PI / 2);

      // Effet de lueur pendant le slash
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 15;

      ctx.drawImage(
        this.sprite,
        -hb.width / 2,
        -hb.height / 2,
        hb.width,
        hb.height
      );

      ctx.restore();
    }
  }

  upgrade() {
    this.level++;

    switch (this.level) {
      case 2:
        this.damage += 5; // 20 HP par hit
        break;
      case 3:
        this.attackSpeed += 0.3; // 1.8 attaques/s
        break;
      case 4:
        this.range += 20; // 100 de portée
        break;
      case 5:
        this.damage += 10; // 30 HP par hit
        break;
      case 6:
        this.attackSpeed += 0.5; // 2.3 attaques/s
        this.range += 20; // 120 de portée
        break;
    }
  }

  /**
   * Met à jour la liste des ennemis pour le ciblage automatique
   * @param {Array} enemies - Tableau des ennemis
   */
  setEnemies(enemies) {
    this.enemies = enemies;
  }
}
