// src/systems/LevelUpSystem.js
import PowerUpRegistry from "../powerups/PowerUpRegistry.js";

export default class LevelUpSystem {
  constructor(game, player) {
    this.game = game;
    this.player = player;
    this.isPaused = false;
    // ⚠️ CORRECTION : Créer une INSTANCE au lieu d'assigner la classe
    this.registry = new PowerUpRegistry();

    this.createUI();
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
      <div id="powerup-choices" style="display:flex;gap:20px;"></div>
    `;

    document.body.appendChild(this.container);
    this.choicesEl = this.container.querySelector("#powerup-choices");
  }

  show() {
    this.isPaused = true;
    this.container.style.display = "flex";

    // ⚠️ CORRECTION : Utiliser getRandomPowerUps qui existe vraiment
    // Récupérer les IDs des power-ups au max level
    const excludeIds = [];
    this.registry.getAll().forEach((pu) => {
      if (!pu.canLevelUp()) {
        excludeIds.push(pu.id);
      }
    });

    // Obtenir 3 power-ups aléatoires
    const choices = this.registry.getRandomPowerUps(3, excludeIds);

    // Afficher les choix
    this.choicesEl.innerHTML = "";
    choices.forEach((powerUp) => {
      const card = this.createPowerUpCard(powerUp);
      this.choicesEl.appendChild(card);
    });
  }

  createPowerUpCard(powerUp) {
    const card = document.createElement("div");

    // Couleur selon le type de power-up (basé sur l'ID)
    let gradient;
    const offensiveIds = ["damage", "cooldown", "area", "projectile"];
    const defensiveIds = ["maxhp", "heal", "regen"];
    const utilityIds = ["speed", "xpboost", "magnet"];

    if (offensiveIds.includes(powerUp.id)) {
      gradient = "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)";
    } else if (defensiveIds.includes(powerUp.id)) {
      gradient = "linear-gradient(135deg, #3498db 0%, #2980b9 100%)";
    } else if (utilityIds.includes(powerUp.id)) {
      gradient = "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)";
    } else {
      gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }

    Object.assign(card.style, {
      background: gradient,
      padding: "30px",
      borderRadius: "15px",
      cursor: "pointer",
      minWidth: "220px",
      textAlign: "center",
      transition: "transform 0.2s, box-shadow 0.2s",
      border: "3px solid rgba(255,255,255,0.2)",
    });

    // ⚠️ CORRECTION : Utiliser les propriétés qui existent vraiment
    const nextLevel = powerUp.currentLevel + 1;

    card.innerHTML = `
      <div style="font-size:64px;margin-bottom:15px;">${powerUp.icon}</div>
      <div style="font-size:20px;font-weight:bold;text-shadow:1px 1px 2px #000;margin-bottom:8px;">
        ${powerUp.name}
      </div>
      <div style="font-size:14px;opacity:0.9;text-shadow:1px 1px 2px #000;margin-bottom:10px;">
        ${powerUp.description}
      </div>
      <div style="font-size:12px;opacity:0.7;text-shadow:1px 1px 2px #000;border-top:1px solid rgba(255,255,255,0.3);padding-top:10px;">
        Niveau: ${powerUp.currentLevel} → ${nextLevel}
      </div>
    `;

    card.onmouseenter = () => {
      card.style.transform = "scale(1.1)";
      card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
    };

    card.onmouseleave = () => {
      card.style.transform = "scale(1)";
      card.style.boxShadow = "none";
    };

    card.onclick = () => this.selectPowerUp(powerUp);

    return card;
  }

  hide() {
    this.isPaused = false;
    this.container.style.display = "none";
  }

  selectPowerUp(powerUp) {
    // ⚠️ CORRECTION : Utiliser levelUp() qui existe vraiment
    const success = powerUp.levelUp(this.player);

    if (success) {
      console.log(
        `✅ Power-up ${powerUp.name} appliqué ! Niveau ${powerUp.currentLevel}`
      );

      // Sauvegarder dans le joueur si besoin
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
}
