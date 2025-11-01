// src/entities/Player.js
import { getCharacter } from "../data/Characters.js";

export default class Player {
  constructor(x, y, sprite, width = 32, characterId = "vincent") {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = width;
    this.height = (width / sprite.width) * sprite.height;

    // Load character stats
    const charData = getCharacter(characterId);
    this.characterId = characterId;
    this.characterName = charData.name;

    // Base stats from character
    this.maxHp = charData.stats.maxHp;
    this.hp = this.maxHp;
    this.speed = charData.stats.speed;

    // Multipliers
    this.damageMultiplier = charData.stats.damageMultiplier || 1.0;
    this.cooldownMultiplier = charData.stats.cooldownMultiplier || 1.0;
    this.xpMultiplier = charData.stats.xpMultiplier || 1.0;
    this.areaMultiplier = charData.stats.areaMultiplier || 1.0;
    this.luckMultiplier = charData.stats.luckMultiplier || 1.0;
    this.bossDamageMultiplier = charData.stats.bossDamageMultiplier || 1.0;
    this.growthRate = charData.stats.growthRate || 1.0;

    // Special stats
    this.projectileBonus = charData.stats.projectileBonus || 0;
    this.hpRegen = charData.stats.hpRegen || 0;
    this.magnetRange = charData.stats.magnetRange || 50;
    this.critChance = charData.stats.critChance || 0;
    this.dodgeChance = charData.stats.dodgeChance || 0;

    // XP & leveling
    this.xp = 0;
    this.xpForNextLevel = 20;
    this.level = 1;

    // Equipped weapons (now multiple)
    this.weapons = [];

    // Old attack system (deprecated but kept for compatibility)
    this.equippedWeapon = null;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.2;
    this.attackCooldown = 0.4;
    this.cooldownTimer = 0;
    this.didHit = false;
    this.damagePerHit = 0;

    // Direction
    this.lastDir = { x: 1, y: 0 };

    // Invincibility frames
    this.invincible = false;
    this.invincibleTimer = 0;

    // UI callbacks
    this.onHpChange = null;
    this.onXpChange = null;
    this.onAttackStart = null;
    this.onLevelUp = null;
  }

  setHp(newHp) {
    this.hp = Math.max(0, Math.min(newHp, this.maxHp));
    if (this.onHpChange) {
      this.onHpChange(this.hp, this.maxHp);
    }
  }

  gainXp(amount) {
    const xpGained = amount * this.xpMultiplier;
    this.xp += xpGained;
    if (this.onXpChange) {
      this.onXpChange(this.xp, this.xpForNextLevel);
    }
    if (this.xp >= this.xpForNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.xp -= this.xpForNextLevel;
    this.xpForNextLevel = Math.floor(this.xpForNextLevel * 1.5);

    // Growth rate bonus
    if (this.growthRate > 1.0) {
      this.maxHp = Math.floor(this.maxHp * this.growthRate);
      this.speed *= this.growthRate;
      this.damageMultiplier *= this.growthRate;
    }

    if (this.onLevelUp) {
      this.onLevelUp(this.level);
    }
  }

  equip(weaponItem) {
    this.equippedWeapon = weaponItem;
    this.damagePerHit = weaponItem.weaponData.dps;
  }

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  takeDamage(amount) {
    if (this.invincible) return false;

    // Dodge check
    if (Math.random() < this.dodgeChance) {
      return false; // Dodged!
    }

    this.setHp(this.hp - amount);
    this.invincible = true;
    this.invincibleTimer = 0.5; // 0.5 second invincibility
    return true;
  }

  update(dt, input) {
    // HP Regeneration
    if (this.hpRegen > 0) {
      this.setHp(this.hp + this.hpRegen * dt);
    }

    // Invincibility timer
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    // Movement ZQSD
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

    // Update cooldown
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt;
    }

    // Old attack system (kept for compatibility)
    if (
      input.isMouseDown() &&
      this.equippedWeapon &&
      !this.isAttacking &&
      this.cooldownTimer <= 0
    ) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      this.cooldownTimer =
        (this.attackCooldown + this.attackDuration) * this.cooldownMultiplier;
      this.didHit = false;
      if (this.onAttackStart) {
        this.onAttackStart(this.cooldownTimer);
      }
    }

    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // Position old weapon
    if (this.equippedWeapon) {
      const w = this.equippedWeapon;
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      const vx = input.mouseX - cx;
      const vy = input.mouseY - cy;
      const baseAng = Math.atan2(vy, vx);

      const baseOff = this.width / 2 + w.width / 2;
      const push = this.isAttacking
        ? Math.sin((1 - this.attackTimer / this.attackDuration) * Math.PI) *
          w.width
        : 0;
      const total = baseOff + push;

      w.x = cx + Math.cos(baseAng) * total - w.width / 2;
      w.y = cy + Math.sin(baseAng) * total - w.height / 2;
    }

    // Update all weapons
    for (const weapon of this.weapons) {
      weapon.update(dt);
    }
  }

  render(ctx, input) {
    // Flicker when invincible
    if (this.invincible && Math.floor(this.invincibleTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    ctx.globalAlpha = 1.0;

    // Render old weapon
    if (this.equippedWeapon) {
      const w = this.equippedWeapon;
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const baseAng = Math.atan2(input.mouseY - cy, input.mouseX - cx);
      const angle = baseAng + Math.PI / 2;

      ctx.save();
      ctx.translate(w.x + w.width / 2, w.y + w.height / 2);
      ctx.rotate(angle);
      ctx.drawImage(w.sprite, -w.width / 2, -w.height / 2, w.width, w.height);
      ctx.restore();
    }

    // Render all weapons
    for (const weapon of this.weapons) {
      weapon.render(ctx);
    }
  }
}
