// src/entities/Player.js
export default class Player {
  constructor(x, y, sprite, width = 32) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = width;
    this.height = (width / sprite.width) * sprite.height;
    this.speed = 150;
    this.hp = 10;

    this.equippedWeapon = null;

    // STAB settings
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.2;
    this.attackCooldown = 0.4; // 400 ms entre deux stabs
    this.cooldownTimer = 0;
    this.didHit = false;
    this.damagePerHit = 0;
  }

  equip(weaponItem) {
    this.equippedWeapon = weaponItem;
    this.damagePerHit = weaponItem.weaponData.dps;
  }

  update(dt, input) {
    // ── Déplacement ZQSD ──
    let dx = 0,
      dy = 0;
    if (input.isDown("q")) dx = -1;
    if (input.isDown("d")) dx = 1;
    if (input.isDown("z")) dy = -1;
    if (input.isDown("s")) dy = 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      this.lastDir = { x: dx / len, y: dy / len };
    }
    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    // ── Gestion du cooldown ──
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt;
    }

    // ── Déclenchement du STAB au clic ──
    if (
      input.isMouseDown() &&
      this.equippedWeapon &&
      !this.isAttacking &&
      this.cooldownTimer <= 0
    ) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      this.cooldownTimer = this.attackCooldown + this.attackDuration;
      this.didHit = false;
    }

    // ── Avancement du STAB ──
    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // ── Positionnement de l’arme ──
    if (this.equippedWeapon) {
      const w = this.equippedWeapon;
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      // 1) Angle de base vers la souris
      const vx = input.mouseX - cx;
      const vy = input.mouseY - cy;
      const baseAng = Math.atan2(vy, vx);

      // 2) Distance du pivot = ½ joueur + ½ arme + push pour le stab
      const baseOff = this.width / 2 + w.width / 2;
      const push = this.isAttacking
        ? Math.sin((1 - this.attackTimer / this.attackDuration) * Math.PI) *
          w.width
        : 0;
      const total = baseOff + push;

      // 3) On place le sprite sans la faire tourner ici (juste la position)
      w.x = cx + Math.cos(baseAng) * total - w.width / 2;
      w.y = cy + Math.sin(baseAng) * total - w.height / 2;
    }
  }

  render(ctx, input) {
    // ── Dessine le joueur ──
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);

    if (!this.equippedWeapon) return;
    const w = this.equippedWeapon;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const mx = input.mouseX;
    const my = input.mouseY;

    // 1) Nouvel angle vers la souris
    const baseAng = Math.atan2(my - cy, mx - cx);

    // 2) Décalage de +90° (π/2) car la pointe de la sprite
    //    (le haut de l’image) doit s’aligner sur baseAng
    const angle = baseAng + Math.PI / 2;

    // 3) On pivote autour du centre du joueur, on translate
    //    à la position de l’arme (x,y) calculée en update,
    //    et on dessine l’arme centrée sur son propre pivot.
    ctx.save();
    ctx.translate(w.x + w.width / 2, w.y + w.height / 2);
    ctx.rotate(angle);
    ctx.drawImage(w.sprite, -w.width / 2, -w.height / 2, w.width, w.height);
    ctx.restore();
  }
}
