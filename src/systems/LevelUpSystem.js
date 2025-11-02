// src/systems/LevelUpSystem.js

import PowerUpRegistry from "../powerups/PowerUpRegistry.js";

export default class LevelUpSystem {
  constructor(game, player) {
    this.game = game;
    this.player = player;
    this.isPaused = false;
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

    // Récupérer les IDs des power-ups au max level
    const excludeIds = [];
    this.registry.getAll().forEach((pu) => {
      if (!pu.canLevelUp()) {
        excludeIds.push(pu.id);
      }
    });

    // ✨ NOUVEAU : Obtenir 3 power-ups avec rareté selon la chance du joueur
    const luckMultiplier = this.player.luckMultiplier || 1.0;
    console.log(
      `\n🎲 Roll de power-ups (Chance: ${luckMultiplier.toFixed(2)}x)`
    );

    const choices = this.registry.getRandomPowerUps(
      3,
      excludeIds,
      luckMultiplier
    );

    // Afficher les choix
    this.choicesEl.innerHTML = "";
    choices.forEach((powerUp) => {
      const card = this.createPowerUpCard(powerUp);
      this.choicesEl.appendChild(card);
    });
  }

  /**
   * ✨ NOUVEAU : Créer une carte de power-up avec sa rareté
   */
  createPowerUpCard(rarePowerUp) {
    const card = document.createElement("div");
    const rarity = rarePowerUp.rarity;

    // Gradient basé sur la rareté
    const gradient = `linear-gradient(135deg, ${rarity.color} 0%, ${rarity.glowColor} 100%)`;

    Object.assign(card.style, {
      background: gradient,
      padding: "30px",
      borderRadius: "15px",
      cursor: "pointer",
      minWidth: "240px",
      textAlign: "center",
      transition: "transform 0.2s, box-shadow 0.2s",
      border: `3px solid ${rarity.color}`,
      boxShadow: `0 0 20px ${rarity.glowColor}`,
      position: "relative",
      overflow: "hidden",
    });

    // Animation de particules pour les rangs élevés
    if (rarity.id === "legendary" || rarity.id === "mythic") {
      this.addParticleEffect(card, rarity);
    }

    // Badge de rareté
    const badge = document.createElement("div");
    badge.textContent = `${rarity.icon} ${rarity.name}`;
    Object.assign(badge.style, {
      fontSize: "14px",
      fontWeight: "bold",
      color: "#fff",
      background: "rgba(0,0,0,0.5)",
      padding: "5px 10px",
      borderRadius: "20px",
      marginBottom: "10px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    });
    card.appendChild(badge);

    // Icône du power-up
    const icon = document.createElement("div");
    icon.textContent = rarePowerUp.icon;
    Object.assign(icon.style, {
      fontSize: "64px",
      marginBottom: "15px",
      filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
    });
    card.appendChild(icon);

    // Nom
    const name = document.createElement("div");
    name.textContent = rarePowerUp.name;
    Object.assign(name.style, {
      fontSize: "22px",
      fontWeight: "bold",
      textShadow: "2px 2px 4px #000",
      marginBottom: "8px",
    });
    card.appendChild(name);

    // Description avec multiplicateur
    const desc = document.createElement("div");
    desc.textContent = rarePowerUp.description;
    Object.assign(desc.style, {
      fontSize: "14px",
      opacity: "0.95",
      textShadow: "1px 1px 2px #000",
      marginBottom: "10px",
      lineHeight: "1.4",
    });
    card.appendChild(desc);

    // Multiplicateur visible si > 1.0
    if (rarity.multiplier > 1.0) {
      const multBadge = document.createElement("div");
      multBadge.textContent = `×${rarity.multiplier.toFixed(1)} PUISSANCE`;
      Object.assign(multBadge.style, {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#FFD700",
        textShadow: "0 0 10px #FFD700",
        marginTop: "10px",
        animation: "pulse 1s infinite",
      });
      card.appendChild(multBadge);
    }

    // Niveau actuel
    const nextLevel = rarePowerUp.currentLevel + 1;
    const levelText = document.createElement("div");
    levelText.textContent = `Niveau: ${rarePowerUp.currentLevel} → ${nextLevel}`;
    Object.assign(levelText.style, {
      fontSize: "12px",
      opacity: "0.8",
      textShadow: "1px 1px 2px #000",
      borderTop: "1px solid rgba(255,255,255,0.3)",
      paddingTop: "10px",
      marginTop: "10px",
    });
    card.appendChild(levelText);

    // Animations hover
    card.onmouseenter = () => {
      card.style.transform = "scale(1.05) translateY(-5px)";
      card.style.boxShadow = `0 15px 40px ${rarity.glowColor}`;
    };

    card.onmouseleave = () => {
      card.style.transform = "scale(1)";
      card.style.boxShadow = `0 0 20px ${rarity.glowColor}`;
    };

    card.onclick = () => this.selectPowerUp(rarePowerUp);

    return card;
  }

  /**
   * ✨ Ajouter un effet de particules pour les rangs élevés
   */
  addParticleEffect(card, rarity) {
    // Animation CSS pour les particules
    const style = document.createElement("style");
    style.textContent = `
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
      }
    `;
    document.head.appendChild(style);

    // Créer des particules
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement("div");
      particle.textContent = "✨";
      Object.assign(particle.style, {
        position: "absolute",
        fontSize: "20px",
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animation: `sparkle ${2 + Math.random()}s infinite`,
        animationDelay: `${Math.random() * 2}s`,
        pointerEvents: "none",
      });
      card.appendChild(particle);
    }
  }

  hide() {
    this.isPaused = false;
    this.container.style.display = "none";
  }

  selectPowerUp(rarePowerUp) {
    // Appliquer l'effet avec le multiplicateur de rareté
    const success = rarePowerUp.levelUp(this.player);

    if (success) {
      const rarity = rarePowerUp.rarity;
      console.log(
        `✅ ${rarity.icon} ${rarePowerUp.name} (${rarity.name}) appliqué ! ` +
          `Multiplicateur: ×${rarity.multiplier} | Niveau ${rarePowerUp.currentLevel}`
      );

      // Sauvegarder dans le joueur (sauvegarder le power-up de base depuis le registre)
      if (!this.player.powerUps) {
        this.player.powerUps = [];
      }

      const basePowerUp = this.registry.get(rarePowerUp.id);
      const existing = this.player.powerUps.find(
        (p) => p.id === basePowerUp.id
      );
      if (!existing) {
        this.player.powerUps.push(basePowerUp);
      }
    } else {
      console.warn(`⚠️ Impossible d'améliorer ${rarePowerUp.name}`);
    }

    this.hide();
  }
}
