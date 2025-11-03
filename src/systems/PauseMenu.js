// src/PauseMenu.js
// Système de pause avec statistiques détaillées du joueur

export default class PauseMenu {
  constructor(game, player) {
    this.game = game;
    this.player = player;
    this.isPaused = false;
    this.container = null;
    this.createUI();
  }

  createUI() {
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.95)",
      display: "none",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontFamily: "Arial, sans-serif",
      zIndex: 2000,
      overflow: "auto",
      padding: "40px 20px",
    });
    document.body.appendChild(this.container);
  }

  show() {
    this.isPaused = true;
    this.container.style.display = "flex";
    this.renderContent();
  }

  hide() {
    this.isPaused = false;
    this.container.style.display = "none";
  }

  toggle() {
    if (this.isPaused) {
      this.hide();
    } else {
      this.show();
    }
  }

  renderContent() {
    const player = this.player;
    const hpPercent = ((player.hp / player.maxHp) * 100).toFixed(0);
    const xpPercent = ((player.xp / player.xpForNextLevel) * 100).toFixed(0);

    this.container.innerHTML = `
      <div style="
        max-width: 900px;
        width: 100%;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        border: 3px solid rgba(255, 255, 255, 0.1);
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="
            font-size: 48px;
            margin: 0 0 10px 0;
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
          ">⏸️ PAUSE</h1>
          <p style="font-size: 16px; opacity: 0.7; margin: 0;">
            Appuyez sur <kbd style="
              background: rgba(255,255,255,0.1);
              padding: 4px 8px;
              border-radius: 4px;
              border: 1px solid rgba(255,255,255,0.2);
            ">ESC</kbd> pour reprendre
          </p>
        </div>

        <!-- Main Content -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          
          <!-- Left Column -->
          <div>
            ${this.renderCharacterCard()}
            ${this.renderHealthXpBars()}
            ${this.renderWeapons()}
          </div>

          <!-- Right Column -->
          <div>
            ${this.renderStats()}
            ${this.renderPowerUps()}
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 20px; margin-top: 40px; justify-content: center;">
          <button id="resume-btn" style="
            font-size: 20px;
            padding: 15px 40px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            transition: all 0.2s;
          ">▶️ Reprendre</button>
          
          <button id="quit-btn" style="
            font-size: 20px;
            padding: 15px 40px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
            transition: all 0.2s;
          ">🚪 Quitter</button>
        </div>
      </div>
    `;

    // Hover effects
    const style = document.createElement("style");
    style.textContent = `
      #resume-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6); }
      #quit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6); }
    `;
    document.head.appendChild(style);

    // Event listeners
    document.getElementById("resume-btn").onclick = () => {
      this.hide();
      this.game.scene.current.paused = false; // Forcer le unpause
    };
    document.getElementById("quit-btn").onclick = () => this.quitGame();
  }

  renderCharacterCard() {
    const player = this.player;
    return `
      <div style="
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
      ">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="
            width: 80px; height: 80px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            border: 3px solid rgba(96, 165, 250, 0.5);
            box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
          ">👤</div>
          
          <div style="flex: 1;">
            <h2 style="margin: 0 0 5px 0; font-size: 28px; color: #60a5fa;">
              ${player.characterName || "Joueur"}
            </h2>
            <p style="margin: 0; opacity: 0.7; font-size: 14px;">
              ${this.getCharacterDescription()}
            </p>
            <div style="
              display: inline-block;
              background: linear-gradient(135deg, #a78bfa, #8b5cf6);
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              margin-top: 8px;
            ">⭐ Niveau ${player.level}</div>
          </div>
        </div>
      </div>
    `;
  }

  renderHealthXpBars() {
    const player = this.player;
    const hpPercent = ((player.hp / player.maxHp) * 100).toFixed(0);
    const xpPercent = ((player.xp / player.xpForNextLevel) * 100).toFixed(0);

    return `
      <div style="
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
      ">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #60a5fa;">💚 Santé & Expérience</h3>
        
        <!-- HP Bar -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-size: 14px; opacity: 0.8;">Points de Vie</span>
            <span style="font-size: 14px; font-weight: bold; color: #ef4444;">
              ${player.hp} / ${player.maxHp}
            </span>
          </div>
          <div style="
            width: 100%; height: 24px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid rgba(239, 68, 68, 0.3);
          ">
            <div style="
              width: ${hpPercent}%;
              height: 100%;
              background: linear-gradient(90deg, #ef4444, #dc2626);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              transition: width 0.3s;
            ">${hpPercent}%</div>
          </div>
        </div>
        
        <!-- XP Bar -->
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-size: 14px; opacity: 0.8;">Expérience</span>
            <span style="font-size: 14px; font-weight: bold; color: #3b82f6;">
              ${player.xp} / ${player.xpForNextLevel}
            </span>
          </div>
          <div style="
            width: 100%; height: 24px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid rgba(59, 130, 246, 0.3);
          ">
            <div style="
              width: ${xpPercent}%;
              height: 100%;
              background: linear-gradient(90deg, #3b82f6, #2563eb);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              transition: width 0.3s;
            ">${xpPercent}%</div>
          </div>
        </div>
      </div>
    `;
  }

  renderWeapons() {
    const player = this.player;
    const weapons = player.weapons || [];

    let weaponsHTML =
      weapons.length === 0
        ? `<p style="text-align: center; opacity: 0.5; padding: 20px;">Aucune arme équipée</p>`
        : weapons
            .map((weapon, index) => {
              const weaponName = this.getWeaponName(weapon);
              const weaponIcon = this.getWeaponIcon(weapon);
              return `
            <div style="
              background: rgba(255, 255, 255, 0.05);
              padding: 12px 15px;
              border-radius: 10px;
              margin-bottom: 10px;
              border: 2px solid rgba(255, 255, 255, 0.1);
              display: flex;
              align-items: center;
              gap: 12px;
            ">
              <div style="font-size: 24px;">${weaponIcon}</div>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 14px;">${weaponName}</div>
                <div style="font-size: 12px; opacity: 0.7;">
                  Niveau ${weapon.level} • Dégâts: ${weapon.damage}
                </div>
              </div>
              <div style="
                background: linear-gradient(135deg, #a78bfa, #8b5cf6);
                padding: 4px 10px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
              ">Lv.${weapon.level}</div>
            </div>
          `;
            })
            .join("");

    return `
      <div style="
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
      ">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #60a5fa;">⚔️ Armes équipées (${weapons.length})</h3>
        ${weaponsHTML}
      </div>
    `;
  }

  renderStats() {
    const player = this.player;
    const stats = [
      { icon: "⚡", label: "Vitesse", value: player.speed.toFixed(0) },
      {
        icon: "⚔️",
        label: "Dégâts",
        value: `×${player.damageMultiplier.toFixed(2)}`,
      },
      {
        icon: "⏱️",
        label: "Cooldown",
        value: `×${player.cooldownMultiplier.toFixed(2)}`,
      },
      {
        icon: "💥",
        label: "Zone",
        value: `×${(player.areaMultiplier || 1).toFixed(2)}`,
      },
      {
        icon: "🎯",
        label: "Projectiles",
        value: `+${player.projectileBonus || 0}`,
      },
      {
        icon: "💫",
        label: "Critique",
        value: `${((player.critChance || 0) * 100).toFixed(0)}%`,
      },
      {
        icon: "🍀",
        label: "Chance",
        value: `×${(player.luckMultiplier || 1).toFixed(2)}`,
      },
      {
        icon: "🧲",
        label: "Magnétisme",
        value: `${player.magnetRange || 50}px`,
      },
    ];

    const statsHTML = stats
      .map(
        (stat) => `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <span style="opacity: 0.8;">
          <span style="margin-right: 8px;">${stat.icon}</span>${stat.label}
        </span>
        <span style="font-weight: bold; color: #60a5fa;">${stat.value}</span>
      </div>
    `
      )
      .join("");

    return `
      <div style="
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
      ">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #60a5fa;">📊 Statistiques actuelles</h3>
        ${statsHTML}
      </div>
    `;
  }

  renderPowerUps() {
    const player = this.player;
    const powerUps = player.powerUps || [];

    let powerUpsHTML =
      powerUps.length === 0
        ? `<p style="text-align: center; opacity: 0.5; padding: 20px;">Aucun power-up obtenu</p>`
        : powerUps
            .map(
              (powerUp) => `
          <div style="
            background: rgba(255, 255, 255, 0.05);
            padding: 12px 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            border: 2px solid rgba(96, 165, 250, 0.2);
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <div style="font-size: 24px;">${powerUp.icon}</div>
            <div style="flex: 1;">
              <div style="font-weight: bold; font-size: 14px;">${powerUp.name}</div>
              <div style="font-size: 11px; opacity: 0.7;">${powerUp.description}</div>
            </div>
            <div style="
              background: #60a5fa;
              padding: 4px 10px;
              border-radius: 15px;
              font-size: 11px;
              font-weight: bold;
            ">Lv.${powerUp.currentLevel}</div>
          </div>
        `
            )
            .join("");

    return `
      <div style="
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        max-height: 400px;
        overflow-y: auto;
      ">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #60a5fa;">✨ Power-ups (${powerUps.length})</h3>
        ${powerUpsHTML}
      </div>
    `;
  }

  getCharacterDescription() {
    const charId = this.player.characterId;
    const descriptions = {
      vincent: "Équilibré - Le développeur polyvalent",
      ahlem: "Vitesse - Rapide et agile",
      cedric: "Tank - Résistant aux dégâts",
      christelle: "Attaque rapide - Cooldowns réduits",
      fabien: "XP Boost - +30% XP gagnée",
      illias: "Portée - +40% taille des armes",
      leV: "Critique - +25% dégâts critiques",
      lionel: "Régénération - +1 HP par seconde",
      lucile: "Multi-projectiles - +1 projectile de base",
      marc: "Zone d'effet - +30% zone",
      mathieu: "Dégâts - +25% dégâts",
      sabah: "Magnétisme - +50% portée XP",
      samy: "Esquive - +10% vitesse et esquive",
      serge: "Boss Killer - +50% dégâts vs Boss",
      thomas: "Croissance - Stats +5% par niveau",
      valentin: "Chance - +20% meilleurs drops",
    };
    return descriptions[charId] || "Personnage mystérieux";
  }

  getWeaponName(weapon) {
    const names = {
      Sword: "Épée",
      OrbitalWeapon: "Arme Orbitale",
      ProjectileWeapon: "Arme à Projectiles",
      Boomerang: "Boomerang",
    };
    return names[weapon.constructor.name] || "Arme Inconnue";
  }

  getWeaponIcon(weapon) {
    const icons = {
      Sword: "⚔️",
      OrbitalWeapon: "🔄",
      ProjectileWeapon: "🎯",
      Boomerang: "🪃",
    };
    return icons[weapon.constructor.name] || "❓";
  }

  quitGame() {
    if (
      confirm(
        "Êtes-vous sûr de vouloir quitter ? Votre progression sera perdue."
      )
    ) {
      location.reload();
    }
  }

  destroy() {
    if (this.container && document.body.contains(this.container)) {
      document.body.removeChild(this.container);
    }
  }
}
