// src/entities/XPGem.js
export default class XPGem {
  constructor(x, y, sprite, width = 32, value = 5) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = width;
    this.height = (width / sprite.width) * sprite.height;
    this.value = value;
    this.collected = false;
    this.magnetized = false;
    this.vx = 0;
    this.vy = 0;
  }

  update(dt, player) {
    if (this.collected) return;

    const dx = player.x + player.width / 2 - (this.x + this.width / 2);
    const dy = player.y + player.height / 2 - (this.y + this.height / 2);
    const dist = Math.hypot(dx, dy);

    // Magnet range
    const magnetRange = player.magnetRange || 50;

    if (dist < magnetRange) {
      this.magnetized = true;
    }

    if (this.magnetized) {
      // Move towards player
      const speed = 300;
      this.vx = (dx / dist) * speed;
      this.vy = (dy / dist) * speed;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    // Collection
    if (dist < 30) {
      player.gainXp(this.value);
      this.collected = true;
    }
  }

  render(ctx) {
    if (this.collected) return;
    
    // Pulse effect
    const scale = 1 + Math.sin(Date.now() / 200) * 0.1;
    const w = this.width * scale;
    const h = this.height * scale;
    
    ctx.drawImage(
      this.sprite,
      this.x + this.width / 2 - w / 2,
      this.y + this.height / 2 - h / 2,
      w,
      h
    );
  }
}