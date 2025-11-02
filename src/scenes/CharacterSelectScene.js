import { getAllCharacters } from "../data/Characters.js";

export default class CharacterSelectScene {
  constructor(game) {
    this.game = game;
    this.selectedCharacter = "vincent";
    this.container = null;
  }

  create() {
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
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontFamily: "Arial, sans-serif",
      zIndex: 2000,
      overflow: "auto",
    });

    const title = document.createElement("h1");
    title.textContent = "CODE SURVIVORS";
    Object.assign(title.style, {
      fontSize: "64px",
      margin: "20px 0",
      textShadow: "4px 4px 8px rgba(0,0,0,0.5)",
      animation: "pulse 2s infinite",
    });
    this.container.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.textContent = "Choisissez votre développeur";
    Object.assign(subtitle.style, {
      fontSize: "24px",
      margin: "10px 0 40px 0",
      opacity: "0.9",
    });
    this.container.appendChild(subtitle);

    const grid = document.createElement("div");
    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      maxWidth: "900px",
      marginBottom: "30px",
    });

    const characters = getAllCharacters();
    characters.forEach((char) => {
      const card = this.createCharacterCard(char);
      grid.appendChild(card);
    });

    this.container.appendChild(grid);

    const startBtn = document.createElement("button");
    startBtn.textContent = "COMMENCER";
    Object.assign(startBtn.style, {
      fontSize: "28px",
      padding: "20px 60px",
      background: "#48bb78",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
      transition: "transform 0.2s, box-shadow 0.2s",
    });

    startBtn.onmouseenter = () => {
      startBtn.style.transform = "scale(1.1)";
      startBtn.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
    };
    startBtn.onmouseleave = () => {
      startBtn.style.transform = "scale(1)";
      startBtn.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
    };
    startBtn.onclick = () => this.startGame();

    this.container.appendChild(startBtn);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  createCharacterCard(char) {
    const card = document.createElement("div");
    Object.assign(card.style, {
      background: "rgba(255,255,255,0.1)",
      padding: "15px",
      borderRadius: "10px",
      cursor: "pointer",
      textAlign: "center",
      transition: "all 0.2s",
      border: "3px solid transparent",
      backdropFilter: "blur(10px)",
    });

    const sprite = this.game.characterSprites[char.id];
    const preview = document.createElement("img");
    preview.src = sprite ? sprite.src : "assets/sprites/missing.png";
    Object.assign(preview.style, {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      objectFit: "cover",
      marginBottom: "10px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    });
    card.appendChild(preview);

    const name = document.createElement("div");
    name.textContent = char.name;
    Object.assign(name.style, {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "8px",
    });
    card.appendChild(name);

    const desc = document.createElement("div");
    desc.textContent = char.description;
    Object.assign(desc.style, {
      fontSize: "12px",
      opacity: "0.8",
      lineHeight: "1.4",
    });
    card.appendChild(desc);

    card.onclick = () => {
      const allCards = card.parentElement.querySelectorAll("div");
      allCards.forEach((c) => {
        if (c.style) {
          c.style.border = "3px solid transparent";
          c.style.transform = "scale(1)";
        }
      });
      card.style.border = "3px solid #48bb78";
      card.style.transform = "scale(1.05)";
      this.selectedCharacter = char.id;
    };

    if (char.id === "vincent") {
      card.style.border = "3px solid #48bb78";
      card.style.transform = "scale(1.05)";
    }

    return card;
  }

  startGame() {
    document.body.removeChild(this.container);
    this.game.selectedCharacter = this.selectedCharacter;
    this.game.assets.player =
      this.game.characterSprites[this.selectedCharacter];
    this.game.scene.start("Game");
  }
}
