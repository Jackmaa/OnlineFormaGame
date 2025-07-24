// src/UI.js
export default class UI {
  /**
   * @param {object} options
   * @param {HTMLCanvasElement} options.gameCanvas — le canvas du jeu
   * @param {Player} options.player — instance de ton Player
   * @param {number} options.width — largeur du canvas
   * @param {number} options.height — hauteur du canvas
   */
  constructor({ gameCanvas, player, width, height }) {
    this.canvas = gameCanvas;
    this.ctx = gameCanvas.getContext("2d");
    this.player = player;
    this.width = width;
    this.height = height;

    // valeurs courantes pour le rendu
    this.hp = player.hp;
    this.maxHp = player.maxHp;
    this.xp = player.xp;
    this.xpForNext = player.xpForNextLevel;

    // cooldown (en secondes)
    this.cooldownTotal = 0;
    this.cooldownTimer = 0;

    // Hooks sur les callbacks du player
    player.onHpChange = (hp, maxHp) => {
      this.hp = hp;
      this.maxHp = maxHp;
    };
    player.onXpChange = (xp, xpForNext) => {
      this.xp = xp;
      this.xpForNext = xpForNext;
    };
    player.onAttackStart = (cooldown) => {
      this.cooldownTotal = cooldown;
      this.cooldownTimer = cooldown;
    };
  }

  /**
   * À appeler chaque frame avant le render()
   * pour décrémenter le timer de cooldown.
   */
  update(dt) {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt;
      if (this.cooldownTimer < 0) this.cooldownTimer = 0;
    }
  }

  /**
   * Dessine la UI en surcouche du canvas de jeu.
   */
  render() {
    const ctx = this.ctx;

    // 1. Barre de vie
    const barW = 200,
      barH = 20;
    const x0 = 10,
      y0 = 10;
    const hpRatio = this.hp / this.maxHp;
    ctx.save();
    // fond
    ctx.fillStyle = "black";
    ctx.fillRect(x0 - 1, y0 - 1, barW + 2, barH + 2);
    // remplissage
    ctx.fillStyle = "red";
    ctx.fillRect(x0, y0, barW * hpRatio, barH);
    // texte
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText(`HP: ${this.hp}/${this.maxHp}`, x0 + 5, y0 + 14);

    // 2. Barre d’XP
    const y1 = y0 + barH + 6;
    const xpRatio = Math.min(this.xp / this.xpForNext, 1);
    ctx.fillStyle = "black";
    ctx.fillRect(x0 - 1, y1 - 1, barW + 2, barH + 2);
    ctx.fillStyle = "blue";
    ctx.fillRect(x0, y1, barW * xpRatio, barH);
    ctx.fillStyle = "white";
    ctx.fillText(`XP: ${this.xp}/${this.xpForNext}`, x0 + 5, y1 + 14);

    // 3. Cooldown radial (en haut à droite)
    const cx = this.width - 50,
      cy = 50,
      r = 20;
    // fond de cercle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fill();
    // portion correspondant au cooldown restant
    if (this.cooldownTimer > 0 && this.cooldownTotal > 0) {
      const start = -Math.PI / 2;
      const end =
        start + (2 * Math.PI * this.cooldownTimer) / this.cooldownTotal;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = "rgba(200,200,200,0.7)";
      ctx.fill();
    }
    ctx.restore();
  }
}
