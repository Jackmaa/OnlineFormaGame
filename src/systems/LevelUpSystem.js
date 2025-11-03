// src/systems/LevelUpSystem.js
import PowerUpRegistry from "../powerups/PowerUpRegistry.js";
import { debugDropRates } from "../powerups/RaritySystem.js";

export default class LevelUpSystem {
  constructor(game, player) {
    this.game = game;
    this.player = player;
    this.isPaused = false;
    this.registry = new PowerUpRegistry();

    this.createUI();

    // ✅ Debug : Afficher les drop rates au démarrage
    if (this.player.luckMultiplier > 1.0) {
      console.log(`🍀 ${this.player.characterName} - Luck active!`);
      debugDropRates(this.player.luckMultiplier);
    }
  }

  createUI() {
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.85)",
      display: "none",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontFamily: "Arial, sans-serif",
      zIndex: 1000,
      flexDirection: "column",
    });

    this.container.innerHTML = `
      <div style="text-align:center;margin-bottom:40px;">
        <h1 style="font-size:48px;margin:0;text-shadow:2px 2px 4px #000;">🎉 LEVEL UP! 🎉</h1>
        <p style="font-size:24px;margin:10px 0;opacity:0.8;">Choisis ton amélioration</p>
      </div>
      <div id="powerup-choices" style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;max-width:800px;"></div>
      <div id="luck-indicator" style="margin-top:30px;font-size:16px;opacity:0.8;text-align:center;"></div>
    `;

    document.body.appendChild(this.container);
    this.choicesEl = this.container.querySelector("#powerup-choices");
    this.luckIndicator = this.container.querySelector("#luck-indicator");
  }

  show() {
    this.isPaused = true;
    this.container.style.display = "flex";

    // ✅ Récupérer le luckMultiplier du joueur
    const playerLuck = this.player.luckMultiplier || 1.0;

    // Afficher l'indicateur de luck
    if (playerLuck > 1.0) {
      const bonusPercent = ((playerLuck - 1.0) * 100).toFixed(0);
      this.luckIndicator.innerHTML = `
        🍀 <span style="color:#10B981;font-weight:bold;">Chance +${bonusPercent}%</span> active !
        <br>
        <span style="font-size:12px;opacity:0.7;">Meilleures chances d'objets rares</span>
      `;
    } else {
      this.luckIndicator.textContent = "";
    }

    // Récupérer les IDs des power-ups au max level
    const excludeIds = [];
    this.registry.getAll().forEach((pu) => {
      if (!pu.canLevelUp()) {
        excludeIds.push(pu.id);
      }
    });

    // ✅ UTILISER LA LUCK POUR LA SÉLECTION (avec RaritySystem)
    const choices = this.registry.getRandomPowerUps(3, excludeIds, playerLuck);

    // Afficher les choix
    this.choicesEl.innerHTML = "";
    choices.forEach((powerUp) => {
      const card = this.createPowerUpCard(powerUp);
      this.choicesEl.appendChild(card);
    });
  }

  createPowerUpCard(powerUp) {
    const card = document.createElement("div");

    // ✅ Utiliser la couleur de la rareté depuis RaritySystem
    const rarity = powerUp.rarity;
    const gradient = `linear-gradient(135deg, ${rarity.color}40, ${rarity.color}80)`;

    Object.assign(card.style, {
      background: gradient,
      padding: "25px 20px",
      borderRadius: "15px",
      cursor: "pointer",
      width: "200px",
      textAlign: "center",
      transition: "all 0.2s ease",
      border: `3px solid ${rarity.color}40`,
      position: "relative",
      boxShadow: `0 4px 15px ${rarity.color}20`,
    });

    const nextLevel = powerUp.currentLevel + 1;
    const maxLevel = powerUp.maxLevel;

    card.innerHTML = `
      <div style="
        position: absolute;
        top: -10px;
        right: -10px;
        background: ${rarity.color};
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: bold;
        color: white;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        border: 2px solid white;
      ">${rarity.icon} ${rarity.name.toUpperCase()}</div>
      
      <div style="font-size:56px;margin-bottom:12px;filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        ${powerUp.icon}
      </div>
      
      <div style="font-size:18px;font-weight:bold;color:white;text-shadow:1px 1px 2px #000;margin-bottom:8px;">
        ${powerUp.name}
      </div>
      
      <div style="font-size:13px;color:white;opacity:0.95;text-shadow:1px 1px 2px #000;margin-bottom:10px;line-height:1.4;">
        ${powerUp.description}
      </div>
      
      <div style="
        font-size:11px;
        color:white;
        opacity:0.8;
        text-shadow:1px 1px 2px #000;
        border-top:1px solid rgba(255,255,255,0.3);
        padding-top:8px;
        margin-top:8px;
      ">
        Niveau ${powerUp.currentLevel} → ${nextLevel}/${maxLevel}
      </div>
    `;

    // Animation au survol
    card.onmouseenter = () => {
      card.style.transform = "translateY(-8px) scale(1.05)";
      card.style.boxShadow = `0 12px 30px ${rarity.color}60, 0 0 20px ${rarity.glowColor}80`;
      card.style.border = `3px solid ${rarity.color}`;

      // Effet spécial pour les raretés élevées
      if (rarity.id === "legendary" || rarity.id === "mythic") {
        card.style.animation = "rarePulse 0.5s ease-in-out infinite";
      }
    };

    card.onmouseleave = () => {
      card.style.transform = "translateY(0) scale(1)";
      card.style.boxShadow = `0 4px 15px ${rarity.color}20`;
      card.style.border = `3px solid ${rarity.color}40`;
      card.style.animation = "none";
    };

    card.onclick = () => this.selectPowerUp(powerUp);

    return card;
  }

  hide() {
    this.isPaused = false;
    this.container.style.display = "none";
  }

  selectPowerUp(powerUp) {
    const success = powerUp.levelUp(this.player);

    if (success) {
      console.log(
        `✅ Power-up ${powerUp.name} (${powerUp.rarity.name}) niveau ${powerUp.currentLevel} appliqué !`
      );

      // ✅ Notification visuelle pour les raretés élevées
      if (
        powerUp.rarity.id === "epic" ||
        powerUp.rarity.id === "legendary" ||
        powerUp.rarity.id === "mythic"
      ) {
        this.showRarityNotification(powerUp);
      }

      // Sauvegarder dans le joueur
      if (!this.player.powerUps) {
        this.player.powerUps = [];
      }

      const existing = this.player.powerUps.find((p) => p.id === powerUp.id);
      if (!existing) {
        this.player.powerUps.push(powerUp);
      }
    } else {
      console.warn(
        `⚠️ Impossible d'améliorer ${powerUp.name} (niveau max atteint)`
      );
    }

    this.hide();
  }

  /**
   * ✅ Affiche une notification spéciale pour les power-ups rares
   */
  showRarityNotification(powerUp) {
    const notification = document.createElement("div");
    const rarity = powerUp.rarity;

    Object.assign(notification.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: `linear-gradient(135deg, ${rarity.color}60, ${rarity.color}90)`,
      border: `4px solid ${rarity.color}`,
      borderRadius: "20px",
      padding: "40px 60px",
      zIndex: 10000,
      textAlign: "center",
      boxShadow: `0 0 60px ${rarity.color}, 0 0 100px ${rarity.glowColor}`,
      animation: "rarityAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
    });

    notification.innerHTML = `
      <div style="font-size:80px;margin-bottom:20px;filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
        ${powerUp.icon}
      </div>
      <div style="font-size:36px;font-weight:bold;color:${
        rarity.color
      };text-shadow:2px 2px 4px #000;margin-bottom:12px;">
        ${rarity.icon} ${rarity.name.toUpperCase()} ${rarity.icon}
      </div>
      <div style="font-size:28px;color:white;text-shadow:2px 2px 4px #000;font-weight:bold;">
        ${powerUp.name}
      </div>
      <div style="font-size:18px;color:white;opacity:0.9;text-shadow:1px 1px 2px #000;margin-top:12px;">
        ×${rarity.multiplier} bonus
      </div>
    `;

    // Animations CSS
    const style = document.createElement("style");
    style.textContent = `
      @keyframes rarityAppear {
        0% { 
          transform: translate(-50%, -50%) scale(0) rotate(-180deg); 
          opacity: 0; 
        }
        60% { 
          transform: translate(-50%, -50%) scale(1.15) rotate(10deg); 
        }
        100% { 
          transform: translate(-50%, -50%) scale(1) rotate(0deg); 
          opacity: 1; 
        }
      }
      
      @keyframes rarityDisappear {
        0% { 
          transform: translate(-50%, -50%) scale(1); 
          opacity: 1; 
        }
        100% { 
          transform: translate(-50%, -50%) scale(0.5) translateY(-50px); 
          opacity: 0; 
        }
      }
      
      @keyframes rarePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Particules pour legendary/mythic
    if (rarity.id === "legendary" || rarity.id === "mythic") {
      this.createParticleEffect(notification, rarity.color);
    }

    // Retirer après 2.5 secondes
    setTimeout(() => {
      notification.style.animation = "rarityDisappear 0.5s ease-in forwards";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 500);
    }, 2500);
  }

  /**
   * ✅ Crée un effet de particules autour de la notification
   */
  createParticleEffect(container, color) {
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 100 + Math.random() * 50;

      Object.assign(particle.style, {
        position: "absolute",
        width: "8px",
        height: "8px",
        background: color,
        borderRadius: "50%",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        boxShadow: `0 0 10px ${color}`,
        animation: `particleFloat 2s ease-out forwards`,
        animationDelay: `${i * 0.05}s`,
      });

      const style = document.createElement("style");
      style.textContent = `
        @keyframes particleFloat {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(${
              Math.cos(angle) * distance
            }px, ${Math.sin(angle) * distance}px) scale(0);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);

      container.appendChild(particle);

      setTimeout(() => {
        if (container.contains(particle)) {
          container.removeChild(particle);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 2500);
    }
  }
}
