/* src/scenes/GameScene.js */
import Player from "../entities/Player.js";
import Bug from "../entities/Bug.js";
import Weapon from "../entities/Weapon.js";
import TileMap from "../engine/TileMap.js";
import Computer from "../entities/Computer.js";

export default class GameScene {
  constructor(mapArray, ts, tileset) {
    Object.assign(this, { mapArray, ts, tileset });
  }

  init() {
    this.tileMap = null;
    this.player = null;
    this.enemies = [];
    this.items = [];
    this.computer = null;
  }

  create() {
    const { assets } = this.game;
    this.tileMap = new TileMap(this.mapArray, this.ts, this.tileset);

    // Player
    this.player = new Player(100, 100, assets.player, 64);
    // Place l'ordinateur au centre
    this.computer = new Computer(
      this.game.canvas.width / 2 - 64 / 2,
      this.game.canvas.height / 2 - 64 / 2,
      assets.computer,
      64
    );
    // Spawn 8 bugs
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * (this.game.canvas.width - 32);
      const y = Math.random() * (this.game.canvas.height - 32);
      this.enemies.push(new Bug(x, y, assets.enemy, 32));
    }

    // Spawn a weapon item
    const swordData = { name: "Sword", dps: 10, ability: "Slash", range: 40 };
    this.items.push(new Weapon(300, 300, assets.weapon, 48, swordData));
  }

  update(dt) {
    const input = this.game.input;

    // Player movement
    this.player.update(dt, input);
    // Clamp player in canvas
    this.player.x = Math.max(
      0,
      Math.min(this.player.x, this.game.canvas.width - this.player.width)
    );
    this.player.y = Math.max(
      0,
      Math.min(this.player.y, this.game.canvas.height - this.player.height)
    );

    // Pickup items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (this.checkCollision(this.player, item)) {
        this.player.equip(item);
        this.items.splice(i, 1);
      }
    }

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, this.player);
      // Clamp enemy in canvas
      enemy.x = Math.max(
        0,
        Math.min(enemy.x, this.game.canvas.width - enemy.width)
      );
      enemy.y = Math.max(
        0,
        Math.min(enemy.y, this.game.canvas.height - enemy.height)
      );
      // Damage on contact avec cooldown
      if (this.checkCollision(this.player, enemy) && enemy.contactTimer <= 0) {
        this.player.hp -= enemy.contactDamage;
        enemy.contactTimer = enemy.contactCooldown;
      }
    }

    if (this.player.isAttacking && !this.player.didHit) {
      const w = this.player.equippedWeapon;
      for (const enemy of this.enemies) {
        if (this.checkCollision(w, enemy)) {
          enemy.hp -= this.player.damagePerHit;
        }
      }
      this.player.didHit = true;
    }

    // Réinitialisation pour le prochain swing
    if (!this.player.isAttacking && this.player.didHit) {
      this.player.didHit = false;
    }

    // Remove dead
    this.enemies = this.enemies.filter((e) => e.hp > 0);

    // Dès que tous les bugs sont morts, on passe en mode "prêt à purifier"
    if (!this.purified && this.enemies.length === 0) {
      this.purified = true;
    }

    // Si prêt et que le joueur entre en collision avec l'ordi + touche E
    if (
      this.purified &&
      this.checkCollision(this.player, this.computer) &&
      input.isDown("e")
    ) {
      this.computer.isPurified = true;
      this.onPurify();
    }

    if (
      input.isMouseDown() &&
      this.player.equippedWeapon &&
      !this.player.isAttacking &&
      this.player.cooldownTimer <= 0
    ) {
      this.player.isAttacking = true;
      this.player.attackTimer = this.player.attackDuration;
      this.player.cooldownTimer =
        this.player.attackCooldown + this.player.attackDuration;
      this.player.didHit = false;
    }

    // 2) Pendant le swing, tester la hitbox de l’arme
    if (this.player.isAttacking && !this.player.didHit) {
      const w = this.player.equippedWeapon;
      this.enemies.forEach((enemy) => {
        if (this.checkCollision(w, enemy)) {
          enemy.hp -= this.player.damagePerHit;
        }
      });
      this.player.didHit = true;
    }
    if (!this.player.isAttacking && this.player.didHit) {
      this.player.didHit = false;
    }

    if (this.player.equippedWeapon) {
      const w = this.player.equippedWeapon;
      const dps = w.weaponData.dps;
      this.enemies.forEach((enemy) => {
        if (this.checkCollision(w, enemy)) {
          // inflige des dégâts proportionnels au temps écoulé
          enemy.hp -= (dps / 60) * dt; // 60 FPSs
        }
      });
    }

    // FPS
    if (dt > 0) this.game.fps = 1 / dt;
  }

  render(ctx) {
    this.tileMap.render(ctx);

    // Computer
    this.computer.render(ctx);
    // Items
    this.items.forEach((i) => i.render(ctx));
    // Enemies
    this.enemies.forEach((e) => e.render(ctx));
    // Player
    this.player.render(ctx, this.game.input);

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`HP: ${this.player.hp}`, 10, 20);
    if (this.purified && !this.computer.isPurified) {
      ctx.fillStyle = "yellow";
      ctx.fillText("Approche-toi et appuie sur E pour purifier", 10, 70);
    }
  }

  onPurify() {
    console.log("Ordinateur purifié !");
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}

/* Générateur de carte aléatoire */
export function generateRandomMap(cols, rows) {
  const map = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
        row.push(4);
      } else {
        const r = Math.random();
        row.push(r < 0.5 ? 0 : r < 0.7 ? 3 : r < 0.9 ? 2 : 4);
      }
    }
    map.push(row);
  }
  return map;
}
