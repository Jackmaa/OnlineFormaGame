// src/effects/DropEffect.js
// Effet visuel lorsqu'une arme légendaire drop
export default class DropEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.duration = 1.0; // Durée de l'effet en secondes
    this.timer = 0;
    this.active = true;

    // Créer des particules d'explosion
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 100 + Math.random() * 150;
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        life: 1.0,
        color: Math.random() < 0.5 ? "#F59E0B" : "#FFD700", // Orange ou Or
      });
    }
  }

  update(dt) {
    if (!this.active) return;

    this.timer += dt;

    // Mettre à jour les particules
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.95; // Friction
      particle.vy *= 0.95;
      particle.life -= dt * 0.8;
      particle.size *= 0.98;
    }

    // Retirer les particules mortes
    this.particles = this.particles.filter((p) => p.life > 0);

    // Fin de l'effet
    if (this.timer >= this.duration || this.particles.length === 0) {
      this.active = false;
    }
  }

  render(ctx) {
    if (!this.active) return;

    const progress = this.timer / this.duration;
    const alpha = 1.0 - progress;

    // Cercle d'explosion central
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = "#F59E0B";
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 30;
    
    const radius = 30 + Math.sin(progress * Math.PI * 4) * 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Particules
    for (const particle of this.particles) {
      ctx.save();
      ctx.globalAlpha = particle.life * alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Texte "LÉGENDAIRE !"
    if (progress < 0.3) {
      ctx.save();
      ctx.globalAlpha = (1 - progress / 0.3) * alpha;
      ctx.fillStyle = "#FFD700";
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 3;
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const scale = 1 + Math.sin(progress * Math.PI * 10) * 0.3;
      ctx.translate(this.x, this.y - 40);
      ctx.scale(scale, scale);
      ctx.strokeText("LÉGENDAIRE !", 0, 0);
      ctx.fillText("LÉGENDAIRE !", 0, 0);
      ctx.restore();
    }
  }

  isFinished() {
    return !this.active;
  }
}

