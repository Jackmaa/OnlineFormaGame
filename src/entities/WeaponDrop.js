// src/entities/WeaponDrop.js
export default class WeaponDrop {
  constructor(x, y, weaponType, sprite) {
    this.x = x;
    this.y = y;
    this.weaponType = weaponType;
    this.sprite = sprite;
    this.width = 48;
    this.height = 48;
    this.collected = false;
    this.magnetized = false;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.rotationSpeed = 2.0;
    this.pulsePhase = 0;
  }

  update(dt, player) {
    if (this.collected) return;

    // Rotation
    this.rotation += this.rotationSpeed * dt;
    this.pulsePhase += dt * 3;

    const dx = player.x + player.width / 2 - (this.x + this.width / 2);
    const dy = player.y + player.height / 2 - (this.y + this.height / 2);
    const dist = Math.hypot(dx, dy);

    // Magnet range (utiliser le même que les gemmes XP)
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
      this.collected = true;
      return true; // Indique qu'une arme a été collectée
    }
    
    return false;
  }

  render(ctx) {
    if (this.collected) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Rotation
    ctx.rotate(this.rotation);
    
    // Pulse effect (lueur légendaire)
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.15;
    const w = this.width * pulse;
    const h = this.height * pulse;

    // Lueur orange (légendaire)
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 20;
    
    // Cercle de fond orange
    ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
    ctx.fill();

    // Dessiner le sprite ou un symbole
    if (this.sprite) {
      ctx.drawImage(
        this.sprite,
        -w / 2,
        -h / 2,
        w,
        h
      );
    } else {
      // Fallback : dessiner un symbole d'arme
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚔️", 0, 0);
    }

    ctx.restore();

    // Badge "LÉGENDAIRE"
    ctx.save();
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LÉGENDAIRE", this.x + this.width / 2, this.y - 5);
    ctx.restore();
  }
}

