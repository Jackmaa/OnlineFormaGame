// src/entities/Player.js

export default class Player {
  constructor(x, y, sprite, width = 32) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = width;
    this.height = (width / sprite.width) * sprite.height;
    this.speed = 150;

    // Health
    this.maxHp = 10;
    this.hp = this.maxHp;

    // XP & leveling
    this.xp = 0;
    this.xpForNextLevel = 20;
    this.level = 1;

    // Equipped weapon
    this.equippedWeapon = null;

    // STAB / attack settings
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.2;
    this.attackCooldown = 0.4; // 400 ms entre deux attaques
    this.cooldownTimer = 0;
    this.didHit = false;
    this.damagePerHit = 0;

    // UI callbacks (to be set from outside)
    this.onHpChange = null;
    this.onXpChange = null;
    this.onAttackStart = null;
  }

  /**
   * Change la vie du joueur et notifie l'UI.
   */
  setHp(newHp) {
    this.hp = Math.max(0, Math.min(newHp, this.maxHp));
    if (this.onHpChange) {
      this.onHpChange(this.hp, this.maxHp);
    }
  }

  /**
   * Ajoute de l'XP, notifie l'UI et gère le passage de niveau.
   */
  gainXp(amount) {
    this.xp += amount;
    if (this.onXpChange) {
      this.onXpChange(this.xp, this.xpForNextLevel);
    }
    if (this.xp >= this.xpForNextLevel) {
      this.levelUp();
    }
  }

  /**
   * Passe au niveau suivant, calcule le nouvel XP requis.
   * TODO: émettre un event pour la modal de buff.
   */
  levelUp() {
    this.level++;
    this.xp -= this.xpForNextLevel;
    this.xpForNextLevel = Math.floor(this.xpForNextLevel * 1.5);
    // Par exemple : this.onLevelUp && this.onLevelUp(this.level);
  }

  /**
   * Équipe une arme et met à jour les dégâts par frappe.
   */
  equip(weaponItem) {
    this.equippedWeapon = weaponItem;
    this.damagePerHit = weaponItem.weaponData.dps;
  }

  /**
   * Logique de mise à jour du joueur : déplacement, attaque, cooldowns.
   */
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

    // ── Déclenchement de l'attaque au clic ──
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
      if (this.onAttackStart) {
        // prévient l'UI du début du cooldown
        this.onAttackStart(this.attackCooldown + this.attackDuration);
      }
    }

    // ── Progression de l'attaque ──
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

      // 1) Angle vers la souris
      const vx = input.mouseX - cx;
      const vy = input.mouseY - cy;
      const baseAng = Math.atan2(vy, vx);

      // 2) Distance pivot + push pour l'attaque
      const baseOff = this.width / 2 + w.width / 2;
      const push = this.isAttacking
        ? Math.sin((1 - this.attackTimer / this.attackDuration) * Math.PI) *
          w.width
        : 0;
      const total = baseOff + push;

      // 3) Calcul de la position
      w.x = cx + Math.cos(baseAng) * total - w.width / 2;
      w.y = cy + Math.sin(baseAng) * total - w.height / 2;
    }
  }

  /**
   * Dessine le joueur et l'arme sur le canvas.
   */
  render(ctx, input) {
    // ── Dessine le joueur ──
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);

    if (!this.equippedWeapon) return;

    const w = this.equippedWeapon;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Angle avec pivot +90°
    const baseAng = Math.atan2(input.mouseY - cy, input.mouseX - cx);
    const angle = baseAng + Math.PI / 2;

    // Transformation et dessin de l'arme
    ctx.save();
    ctx.translate(w.x + w.width / 2, w.y + w.height / 2);
    ctx.rotate(angle);
    ctx.drawImage(w.sprite, -w.width / 2, -w.height / 2, w.width, w.height);
    ctx.restore();
  }
}
