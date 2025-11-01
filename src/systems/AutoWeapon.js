// src/systems/AutoWeapon.js
export default class AutoWeapon {
  constructor(player, sprite, type = "orbital") {
    this.player = player;
    this.sprite = sprite;
    this.type = type; // "orbital", "projectile", "boomerang", "beam", "slash"
    this.damage = 10;
    this.level = 1;
    
    // Slash settings (épée qui fait un mouvement de balayage)
    this.slashCooldown = 0.5; // Temps entre chaque slash
    this.slashTimer = 0;
    this.slashDuration = 0.3; // Durée du mouvement de slash
    this.slashProgress = 0; // 0 = début, 1 = fin du slash
    this.isSlashing = false;
    this.slashStartAngle = -Math.PI / 3; // -60 degrés
    this.slashEndAngle = Math.PI / 3; // +60 degrés
    this.slashDistance = 50; // Distance de l'épée par rapport au joueur
    this.slashCount = 1; // Nombre d'épées qui slashent
    
    // Orbital settings
    this.orbitalDistance = 60;
    this.orbitalSpeed = 2;
    this.orbitalAngle = 0;
    this.orbitalCount = 1;
    
    // Projectile settings
    this.projectileSpeed = 300;
    this.projectileRange = 400;
    this.fireRate = 1.0; // seconds
    this.fireTimer = 0;
    this.projectiles = [];
    
    // Boomerang settings
    this.boomerangSpeed = 400;
    this.boomerangMaxDist = 300;
    this.boomerangs = [];
    
    // Beam settings
    this.beamLength = 200;
    this.beamWidth = 20;
    
    // Size multiplier
    this.sizeMultiplier = 1.0;
  }

  update(dt) {
    switch(this.type) {
      case "slash":
        this.updateSlash(dt);
        break;
      case "orbital":
        this.updateOrbital(dt);
        break;
      case "projectile":
        this.updateProjectile(dt);
        break;
      case "boomerang":
        this.updateBoomerang(dt);
        break;
      case "beam":
        this.updateBeam(dt);
        break;
    }
  }

  updateOrbital(dt) {
    this.orbitalAngle += this.orbitalSpeed * dt;
  }

  updateProjectile(dt) {
    this.fireTimer -= dt;
    
    if (this.fireTimer <= 0) {
      this.fireTimer = this.fireRate * (this.player.cooldownMultiplier || 1);
      this.fireProjectile();
    }
    
    // Update existing projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.dist += Math.hypot(proj.vx * dt, proj.vy * dt);
      
      if (proj.dist > this.projectileRange) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  fireProjectile() {
    // Find nearest enemy (you'll need to pass enemies in GameScene)
    // For now, fire in random directions
    const count = 1 + (this.player.projectileBonus || 0);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const vx = Math.cos(angle) * this.projectileSpeed;
      const vy = Math.sin(angle) * this.projectileSpeed;
      
      this.projectiles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx,
        vy,
        dist: 0,
        damage: this.damage,
        width: 32 * this.sizeMultiplier,
        height: 32 * this.sizeMultiplier
      });
    }
  }

  updateBoomerang(dt) {
    this.fireTimer -= dt;
    
    if (this.fireTimer <= 0) {
      this.fireTimer = this.fireRate * (this.player.cooldownMultiplier || 1);
      this.fireBoomerang();
    }
    
    // Update boomerangs
    for (let i = this.boomerangs.length - 1; i >= 0; i--) {
      const boom = this.boomerangs[i];
      
      if (!boom.returning) {
        boom.x += boom.vx * dt;
        boom.y += boom.vy * dt;
        boom.dist += Math.hypot(boom.vx * dt, boom.vy * dt);
        
        if (boom.dist > this.boomerangMaxDist) {
          boom.returning = true;
        }
      } else {
        // Return to player
        const dx = this.player.x + this.player.width / 2 - boom.x;
        const dy = this.player.y + this.player.height / 2 - boom.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 30) {
          this.boomerangs.splice(i, 1);
          continue;
        }
        
        boom.vx = (dx / dist) * this.boomerangSpeed;
        boom.vy = (dy / dist) * this.boomerangSpeed;
        boom.x += boom.vx * dt;
        boom.y += boom.vy * dt;
      }
      
      boom.angle += 10 * dt;
    }
  }

  fireBoomerang() {
    const count = 1 + (this.player.projectileBonus || 0);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const vx = Math.cos(angle) * this.boomerangSpeed;
      const vy = Math.sin(angle) * this.boomerangSpeed;
      
      this.boomerangs.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx,
        vy,
        dist: 0,
        returning: false,
        angle: angle,
        damage: this.damage,
        width: 32 * this.sizeMultiplier,
        height: 32 * this.sizeMultiplier
      });
    }
  }

  updateBeam(dt) {
    // Beam is always active, no update needed
  }

  getHitboxes() {
    const hitboxes = [];
    const areaMultiplier = this.player.areaMultiplier || 1;
    
    switch(this.type) {
      case "orbital":
        const cx = this.player.x + this.player.width / 2;
        const cy = this.player.y + this.player.height / 2;
        
        for (let i = 0; i < this.orbitalCount; i++) {
          const angle = this.orbitalAngle + (Math.PI * 2 * i) / this.orbitalCount;
          const dist = this.orbitalDistance * areaMultiplier;
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist;
          const size = 32 * this.sizeMultiplier * areaMultiplier;
          
          hitboxes.push({
            x: x - size / 2,
            y: y - size / 2,
            width: size,
            height: size,
            damage: this.damage,
            angle: angle
          });
        }
        break;
        
      case "projectile":
        this.projectiles.forEach(proj => {
          hitboxes.push({
            x: proj.x - proj.width / 2,
            y: proj.y - proj.height / 2,
            width: proj.width * areaMultiplier,
            height: proj.height * areaMultiplier,
            damage: proj.damage
          });
        });
        break;
        
      case "boomerang":
        this.boomerangs.forEach(boom => {
          hitboxes.push({
            x: boom.x - boom.width / 2,
            y: boom.y - boom.height / 2,
            width: boom.width * areaMultiplier,
            height: boom.height * areaMultiplier,
            damage: boom.damage,
            angle: boom.angle
          });
        });
        break;
        
      case "beam":
        const pcx = this.player.x + this.player.width / 2;
        const pcy = this.player.y + this.player.height / 2;
        const beamLen = this.beamLength * areaMultiplier;
        const beamW = this.beamWidth * areaMultiplier;
        
        hitboxes.push({
          x: pcx,
          y: pcy - beamW / 2,
          width: beamLen,
          height: beamW,
          damage: this.damage
        });
        break;
    }
    
    return hitboxes;
  }

  render(ctx) {
    const hitboxes = this.getHitboxes();
    
    switch(this.type) {
      case "orbital":
        hitboxes.forEach(hb => {
          ctx.save();
          ctx.translate(hb.x + hb.width / 2, hb.y + hb.height / 2);
          ctx.rotate(hb.angle + Math.PI / 2);
          ctx.drawImage(this.sprite, -hb.width / 2, -hb.height / 2, hb.width, hb.height);
          ctx.restore();
        });
        break;
        
      case "projectile":
        this.projectiles.forEach((proj, i) => {
          const hb = hitboxes[i];
          if (!hb) return;
          const angle = Math.atan2(proj.vy, proj.vx);
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(angle + Math.PI / 2);
          ctx.drawImage(this.sprite, -hb.width / 2, -hb.height / 2, hb.width, hb.height);
          ctx.restore();
        });
        break;
        
      case "boomerang":
        this.boomerangs.forEach((boom, i) => {
          const hb = hitboxes[i];
          if (!hb) return;
          ctx.save();
          ctx.translate(boom.x, boom.y);
          ctx.rotate(boom.angle);
          ctx.drawImage(this.sprite, -hb.width / 2, -hb.height / 2, hb.width, hb.height);
          ctx.restore();
        });
        break;
        
      case "beam":
        if (hitboxes[0]) {
          const hb = hitboxes[0];
          ctx.save();
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = "#00ffff";
          ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
          ctx.globalAlpha = 1.0;
          ctx.restore();
        }
        break;
    }
  }
}
