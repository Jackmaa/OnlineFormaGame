// src/weapons/OrbitalWeapon.js
import BaseWeapon from "./BaseWeapon.js";

export default class OrbitalWeapon extends BaseWeapon {
  constructor(player, sprite) {
    super(player, sprite);

    // ✅ Orbital = DPS (dégâts continus)
    this.isDPS = true;

    this.damage = 50; // 50 DPS = dégâts par seconde
    this.orbitalDistance = 60;
    this.orbitalSpeed = 2.5;
    this.orbitalAngle = 0;
    this.orbitalCount = 1;
    this.width = 32;
    this.height = 32;
  }

  update(dt) {
    // ✅ Appelle le update de BaseWeapon
    super.update(dt);

    this.orbitalAngle += this.orbitalSpeed * dt;
  }

  getHitboxes() {
    const hitboxes = [];
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    const areaMultiplier = this.player.areaMultiplier || 1;

    for (let i = 0; i < this.orbitalCount; i++) {
      const angle = this.orbitalAngle + (Math.PI * 2 * i) / this.orbitalCount;
      const dist = this.orbitalDistance * areaMultiplier;
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      const size = this.width * areaMultiplier;

      hitboxes.push({
        x: x - size / 2,
        y: y - size / 2,
        width: size,
        height: size,
        damage: this.damage, // Sera multiplié par damageMultiplier dans GameScene
        angle: angle,
      });
    }

    return hitboxes;
  }

  render(ctx) {
    const hitboxes = this.getHitboxes();

    hitboxes.forEach((hb) => {
      ctx.save();
      ctx.translate(hb.x + hb.width / 2, hb.y + hb.height / 2);
      ctx.rotate(hb.angle + Math.PI / 2);

      // Effet de lueur pour les armes DPS
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 10;

      ctx.drawImage(
        this.sprite,
        -hb.width / 2,
        -hb.height / 2,
        hb.width,
        hb.height
      );
      ctx.restore();
    });
  }

  upgrade() {
    this.level++;

    switch (this.level) {
      case 2:
        this.orbitalCount = 2; // 2 épées
        break;
      case 3:
        this.damage += 20; // 70 DPS
        this.orbitalSpeed += 0.5;
        break;
      case 4:
        this.orbitalCount = 3; // 3 épées
        break;
      case 5:
        this.damage += 30; // 100 DPS
        this.orbitalDistance += 10;
        break;
      case 6:
        this.orbitalCount = 4; // 4 épées
        this.orbitalSpeed += 1;
        this.damage += 50; // 150 DPS total
        break;
    }
  }
}
