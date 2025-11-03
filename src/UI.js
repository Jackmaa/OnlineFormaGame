// src/UI_DOM.js
// UI moderne en HTML/CSS qui s'affiche en DEHORS du canvas

export default class UI_DOM {
  constructor({ player, width, height }) {
    this.player = player;
    this.width = width;
    this.height = height;

    // Valeurs courantes
    this.hp = player.hp;
    this.maxHp = player.maxHp;
    this.xp = player.xp;
    this.xpForNext = player.xpForNextLevel;
    this.level = player.level;

    // Animations
    this.hpAnimated = player.hp;
    this.xpAnimated = player.xp;
    this.damageFlash = 0;
    this.levelUpFlash = 0;

    // Créer l'UI
    this.createUIElements();

    // Callbacks
    player.onHpChange = (hp, maxHp) => {
      if (hp < this.hp) this.damageFlash = 0.5;
      this.hp = hp;
      this.maxHp = maxHp;
      this.updateDisplay();
    };

    player.onXpChange = (xp, xpForNext) => {
      this.xp = xp;
      this.xpForNext = xpForNext;
      this.updateDisplay();
    };

    const originalOnLevelUp = player.onLevelUp;
    player.onLevelUp = (level) => {
      this.level = level;
      this.levelUpFlash = 1.0;
      this.updateDisplay();
      if (originalOnLevelUp) originalOnLevelUp(level);
    };
  }

  createUIElements() {
    // Conteneur principal
    this.container = document.createElement("div");
    this.container.id = "game-ui-overlay";
    Object.assign(this.container.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 100,
      fontFamily: "Arial, sans-serif",
    });

    // Style CSS
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
        50% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.8); }
      }
      
      @keyframes damage-flash {
        0%, 100% { background: rgba(239, 68, 68, 0); }
        50% { background: rgba(239, 68, 68, 0.3); }
      }

      .ui-panel {
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }

      .health-bar, .xp-bar {
        position: relative;
        width: 100%;
        height: 22px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 11px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden;
        margin-bottom: 8px;
      }

      .bar-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        transition: width 0.3s ease;
      }

      .health-bar .bar-fill {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }

      .xp-bar .bar-fill {
        background: linear-gradient(90deg, #3b82f6, #2563eb);
      }

      .bar-text {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
        color: white;
        font-size: 12px;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        z-index: 1;
      }

      .bar-percent {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        z-index: 1;
      }

      .level-badge {
        width: 60px;
        height: 60px;
        background: rgba(15, 23, 42, 0.85);
        border: 3px solid rgba(251, 191, 36, 0.8);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }

      .level-badge.level-up {
        animation: pulse-glow 0.5s ease-in-out;
      }

      .level-label {
        font-size: 10px;
        color: rgba(251, 191, 36, 0.8);
        font-weight: bold;
      }

      .level-number {
        font-size: 24px;
        color: white;
        font-weight: bold;
      }

      .pause-hint {
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 8px 15px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .esc-badge {
        background: rgba(96, 165, 250, 0.2);
        border: 1px solid #60a5fa;
        border-radius: 5px;
        padding: 4px 12px;
        color: #60a5fa;
        font-size: 12px;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);

    // Panel de stats (haut gauche)
    this.container.innerHTML = `
      <div style="position: absolute; top: 15px; left: 15px; width: 300px;">
        <div class="ui-panel">
          <div style="color: #60a5fa; font-size: 16px; font-weight: bold; margin-bottom: 10px;">
            <span id="character-name">Joueur</span>
          </div>
          
          <!-- HP Bar -->
          <div class="health-bar">
            <div class="bar-fill" id="hp-fill"></div>
            <div class="bar-text" id="hp-text">❤️ HP 100/100</div>
            <div class="bar-percent" id="hp-percent">100%</div>
          </div>
          
          <!-- XP Bar -->
          <div class="xp-bar">
            <div class="bar-fill" id="xp-fill"></div>
            <div class="bar-text" id="xp-text">⭐ XP 0/20</div>
            <div class="bar-percent" id="xp-percent">0%</div>
          </div>
        </div>
      </div>

      <!-- Level Badge (haut gauche, sous le panel) -->
      <div style="position: absolute; top: 145px; left: 15px;">
        <div class="level-badge" id="level-badge">
          <div class="level-label">LV</div>
          <div class="level-number" id="level-number">1</div>
        </div>
      </div>

      <!-- Pause Hint (haut droite) -->
      <div style="position: absolute; top: 15px; right: 15px;">
        <div class="pause-hint">
          <span>Appuyez sur</span>
          <span class="esc-badge">ESC</span>
        </div>
      </div>

      <!-- Damage Flash Overlay -->
      <div id="damage-flash" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(239, 68, 68, 0);
        pointer-events: none;
        transition: background 0.1s;
      "></div>
    `;

    document.body.appendChild(this.container);

    // Références aux éléments
    this.elements = {
      characterName: document.getElementById("character-name"),
      hpFill: document.getElementById("hp-fill"),
      hpText: document.getElementById("hp-text"),
      hpPercent: document.getElementById("hp-percent"),
      xpFill: document.getElementById("xp-fill"),
      xpText: document.getElementById("xp-text"),
      xpPercent: document.getElementById("xp-percent"),
      levelBadge: document.getElementById("level-badge"),
      levelNumber: document.getElementById("level-number"),
      damageFlash: document.getElementById("damage-flash"),
    };

    // Afficher le nom du personnage
    this.elements.characterName.textContent =
      this.player.characterName || "Joueur";

    // Mise à jour initiale
    this.updateDisplay();
  }

  update(dt) {
    // Animations fluides
    const lerpSpeed = 5;
    this.hpAnimated += (this.hp - this.hpAnimated) * dt * lerpSpeed;
    this.xpAnimated += (this.xp - this.xpAnimated) * dt * lerpSpeed;

    // Flash effects
    if (this.damageFlash > 0) {
      this.damageFlash -= dt;
      const alpha = Math.max(0, this.damageFlash * 0.6);
      this.elements.damageFlash.style.background = `rgba(239, 68, 68, ${alpha})`;
    }

    if (this.levelUpFlash > 0) {
      this.levelUpFlash -= dt;
      if (this.levelUpFlash > 0.5) {
        this.elements.levelBadge.classList.add("level-up");
      } else {
        this.elements.levelBadge.classList.remove("level-up");
      }
    }

    // Mise à jour visuelle
    this.updateDisplay();
  }

  updateDisplay() {
    // HP
    const hpRatio = Math.max(0, Math.min(this.hpAnimated / this.maxHp, 1));
    const hpPercent = (hpRatio * 100).toFixed(0);
    this.elements.hpFill.style.width = `${hpPercent}%`;
    this.elements.hpText.textContent = `❤️ HP ${Math.floor(this.hp)}/${
      this.maxHp
    }`;
    this.elements.hpPercent.textContent = `${hpPercent}%`;

    // XP
    const xpRatio = Math.max(0, Math.min(this.xpAnimated / this.xpForNext, 1));
    const xpPercent = (xpRatio * 100).toFixed(0);
    this.elements.xpFill.style.width = `${xpPercent}%`;
    this.elements.xpText.textContent = `⭐ XP ${Math.floor(this.xp)}/${
      this.xpForNext
    }`;
    this.elements.xpPercent.textContent = `${xpPercent}%`;

    // Level
    this.elements.levelNumber.textContent = this.level;
  }

  render() {
    // Plus besoin de render sur canvas, tout est en HTML !
    // Cette méthode peut rester vide pour la compatibilité
  }

  destroy() {
    if (this.container && document.body.contains(this.container)) {
      document.body.removeChild(this.container);
    }
  }
}
