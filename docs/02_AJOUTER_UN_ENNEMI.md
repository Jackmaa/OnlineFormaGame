# Guide : Ajouter un nouvel ennemi

Ce guide explique comment ajouter un nouveau type d'ennemi au jeu.

## Structure d'un ennemi

Les ennemis sont des instances de la classe `Bug` (ou d'une classe qui en hérite).

## Étapes d'implémentation

### Option 1 : Créer un nouveau type d'ennemi (classe séparée)

### 1. Créer le fichier de l'ennemi

Créez un nouveau fichier dans `src/entities/` (ex: `src/entities/Goblin.js`).

```javascript
// src/entities/Goblin.js
export default class Goblin {
  constructor(x, y, sprite, width = 32) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = width;
    this.height = (width / sprite.width) * sprite.height;
    
    // Stats de base
    this.speed = 60;
    this.hp = 20;
    this.maxHp = 20;
    this.contactDamage = 2;
    this.contactCooldown = 1.0; // 1 seconde entre deux contacts
    this.contactTimer = 0;
    
    // Comportement
    this.dir = { x: 0, y: 0 };
    this.timer = 0;
    this.agroRange = 200; // Distance à laquelle l'ennemi détecte le joueur
    
    // Propriétés spéciales
    this.isBoss = false; // true si c'est un boss
  }

  update(dt, player) {
    // Décrémenter le timer de contact
    if (this.contactTimer > 0) {
      this.contactTimer -= dt;
    }

    // Comportement : suivre le joueur si assez proche
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.agroRange && dist > 10) {
      // Suivre le joueur
      this.dir.x = dx / dist;
      this.dir.y = dy / dist;
    } else {
      // Mouvement aléatoire
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = 0.5 + Math.random();
        const a = Math.random() * Math.PI * 2;
        this.dir.x = Math.cos(a);
        this.dir.y = Math.sin(a);
      }
    }

    // Appliquer le mouvement
    this.x += this.dir.x * this.speed * dt;
    this.y += this.dir.y * this.speed * dt;
  }

  render(ctx) {
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    
    // Afficher la barre de vie (optionnel)
    if (this.hp < this.maxHp) {
      const barWidth = this.width;
      const barHeight = 4;
      const barX = this.x;
      const barY = this.y - 8;
      
      // Fond rouge
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Vie verte
      const hpPercent = this.hp / this.maxHp;
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    }
  }

  /**
   * À appeler après la mort pour créer une gemme d'XP
   * @param {HTMLImageElement} xpSprite
   * @param {number} amount
   * @returns {XPGem}
   */
  dropXpGem(xpSprite, amount = 5) {
    return new XPGem(
      this.x + this.width / 2,
      this.y + this.height / 2,
      xpSprite,
      32,
      amount
    );
  }
}
```

### 2. Intégrer dans WaveManager

Modifiez `src/systems/WaveManager.js` pour utiliser votre nouvel ennemi :

```javascript
// Importer la classe
import Bug from "../entities/Bug.js";
import Goblin from "../entities/Goblin.js"; // ← Nouveau

export default class WaveManager {
  constructor(game, enemySprite) {
    this.game = game;
    this.enemySprite = enemySprite;
    this.goblinSprite = enemySprite; // Ou charger un sprite spécifique
    // ...
  }

  createEnemy(x, y) {
    const difficulty = Math.floor(this.game.gameTime / 60);
    const rand = Math.random();
    let enemy;

    if (difficulty < 2) {
      enemy = new Bug(x, y, this.enemySprite, 32);
      enemy.hp = 10;
      enemy.speed = 50;
    } else if (difficulty < 5) {
      if (rand < 0.7) {
        enemy = new Bug(x, y, this.enemySprite, 32);
        enemy.hp = 15;
      } else {
        // ← Nouveau type d'ennemi
        enemy = new Goblin(x, y, this.goblinSprite, 40);
        enemy.hp = 20;
        enemy.speed = 60;
        enemy.contactDamage = 2;
      }
    } else {
      // Logique pour les difficultés supérieures
      // ...
    }

    return enemy;
  }
}
```

### Option 2 : Étendre Bug existant

Si vous voulez juste modifier le comportement d'un Bug existant, vous pouvez créer des variantes dans `WaveManager.createEnemy()` :

```javascript
createEnemy(x, y) {
  const enemy = new Bug(x, y, this.enemySprite, 32);
  
  // Modifier les stats
  enemy.hp = 30;
  enemy.speed = 80;
  enemy.contactDamage = 3;
  
  // Ajouter un comportement spécial
  enemy.agroRange = 250;
  enemy.originalUpdate = enemy.update;
  enemy.update = function(dt, player) {
    // Comportement personnalisé
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist < this.agroRange) {
      // Suivre le joueur
      this.dir.x = dx / dist;
      this.dir.y = dy / dist;
    } else {
      // Comportement normal
      this.originalUpdate(dt, player);
    }
    
    this.x += this.dir.x * this.speed * dt;
    this.y += this.dir.y * this.speed * dt;
  };
  
  return enemy;
}
```

### 3. Charger le sprite (si différent)

Si votre ennemi utilise un sprite différent, ajoutez-le dans `src/main.js` :

```javascript
const assetsToLoad = {
  enemy: "assets/sprites/bug_glitch.png",
  goblin: "assets/sprites/goblin.png", // ← Nouveau sprite
  weapon: "assets/sprites/sword.png",
  xpGem: "assets/sprites/xp_gem.png",
  tileset: "assets/tilesets/tiles.png",
};
```

Puis dans `WaveManager` :

```javascript
constructor(game, enemySprite) {
  this.game = game;
  this.enemySprite = enemySprite;
  this.goblinSprite = game.assets.goblin; // Utiliser le sprite chargé
}
```

Et dans `GameScene.create()` :

```javascript
this.waveManager = new WaveManager(this.game, assets.enemy);
this.waveManager.goblinSprite = assets.goblin; // Passer le sprite
```

## Propriétés importantes

### Obligatoires
- `x`, `y` : Position
- `width`, `height` : Taille
- `sprite` : Image HTMLImageElement
- `hp` : Points de vie
- `speed` : Vitesse de déplacement
- `contactDamage` : Dégâts au contact
- `contactCooldown` : Temps entre deux contacts
- `contactTimer` : Timer de contact (à décrémenter)

### Optionnelles
- `isBoss` : `true` si c'est un boss (donne plus d'XP, dégâts bonus)
- `dir` : Direction de mouvement `{ x, y }`
- `timer` : Timer pour comportements périodiques

## Méthodes à implémenter

### `update(dt, player)`
- Décrémenter `contactTimer` si > 0
- Mettre à jour le comportement (mouvement, IA)
- Gérer les timers internes

### `render(ctx)`
- Dessiner le sprite avec `ctx.drawImage()`
- Optionnel : afficher la barre de vie
- Optionnel : afficher des effets visuels

## Gestion de la mort

Dans `GameScene.update()`, quand un ennemi meurt (`hp <= 0`) :

```javascript
// Remove dead enemies and drop XP
for (let i = enemies.length - 1; i >= 0; i--) {
  const enemy = enemies[i];
  if (enemy.hp <= 0) {
    const xpAmount = enemy.isBoss ? 50 : 5;
    const gem = new XPGem(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2,
      this.xpSprite,
      enemy.isBoss ? 48 : 32,
      xpAmount
    );
    this.xpGems.push(gem);
    this.waveManager.removeEnemy(enemy);
  }
}
```

## Exemples de types d'ennemis

### Ennemi de base (Bug)
- Mouvement aléatoire
- HP faible
- Vitesse moyenne

### Ennemi rapide
- Vitesse élevée
- HP faible
- Suit le joueur

### Ennemi tank
- Vitesse lente
- HP élevé
- Dégâts de contact élevés

### Ennemi à distance
- Tirs de projectiles
- HP moyen
- Évite le joueur

### Boss
- `isBoss = true`
- HP très élevé
- Dégâts élevés
- Comportement spécial

## Checklist

- [ ] Fichier créé dans `src/entities/` (si nouvelle classe)
- [ ] Propriétés de base définies (hp, speed, contactDamage, etc.)
- [ ] `update(dt, player)` implémenté
- [ ] `render(ctx)` implémenté
- [ ] Décrémente `contactTimer` dans `update()`
- [ ] Intégré dans `WaveManager.createEnemy()`
- [ ] Sprite chargé (si différent)
- [ ] Testé dans le jeu

