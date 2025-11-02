# Guide : Ajouter un nouveau personnage

Ce guide explique comment ajouter un nouveau personnage jouable au jeu.

## Structure d'un personnage

Les personnages sont définis dans `src/data/Characters.js` avec leurs stats et arme de départ.

## Étapes d'implémentation

### 1. Ajouter le sprite

Placez le sprite du personnage dans `assets/sprites/` :

```
assets/sprites/
  nouveau_personnage.png  ← Votre nouveau sprite
```

### 2. Ajouter dans main.js

Dans `src/main.js`, ajoutez le personnage dans la liste `characters` :

```javascript
const characters = [
  "vincent",
  "ahlem",
  "cedric",
  // ... autres personnages
  "nouveau_personnage", // ← Ajouter ici
];
```

Le sprite sera chargé automatiquement car le code fait :

```javascript
characters.forEach((char) => {
  assetsToLoad[char] = `assets/sprites/${char}.png`;
});
```

### 3. Définir le personnage dans Characters.js

Dans `src/data/Characters.js`, ajoutez votre personnage :

```javascript
export const CHARACTERS = {
  // ... autres personnages

  nouveau_personnage: {
    name: "Nouveau Personnage",
    sprite: "nouveau_personnage.png",
    description: "Description du personnage",
    startWeapon: "sword", // Type d'arme de départ
    stats: {
      maxHp: 100,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      areaMultiplier: 1.0,      // Optionnel
      luckMultiplier: 1.0,      // Optionnel
      bossDamageMultiplier: 1.0, // Optionnel
      growthRate: 1.0,           // Optionnel (1.05 = +5% par niveau)
      
      // Stats spéciales (optionnel)
      projectileBonus: 0,    // +X projectiles
      hpRegen: 0,           // HP régénérés par seconde
      magnetRange: 50,      // Portée de collecte XP
      critChance: 0,        // Chance de critique (0.0 à 1.0)
      dodgeChance: 0,       // Chance d'esquive (0.0 à 1.0)
    },
  },
};
```

## Types d'armes de départ

Les armes disponibles sont :
- `"sword"` : Épée (Burst damage)
- `"orbital"` : Arme orbitale (DPS continu)
- `"projectile"` : Arme à projectiles
- `"boomerang"` : Boomerang

Pour ajouter une nouvelle arme de départ, voir [Guide : Ajouter une arme](./01_AJOUTER_UNE_ARME.md).

## Stats expliquées

### Stats de base

- **maxHp** : Points de vie maximum
- **speed** : Vitesse de déplacement (pixels/seconde)

### Multiplicateurs

- **damageMultiplier** : Multiplicateur de dégâts (1.0 = normal, 1.25 = +25%)
- **cooldownMultiplier** : Multiplicateur de cooldown (1.0 = normal, 0.8 = 20% plus rapide)
- **xpMultiplier** : Multiplicateur d'XP gagnée (1.0 = normal, 1.3 = +30%)
- **areaMultiplier** : Multiplicateur de portée/taille des armes (1.0 = normal, 1.4 = +40%)
- **luckMultiplier** : Multiplicateur de chance de drop (1.0 = normal, 1.2 = +20%)
- **bossDamageMultiplier** : Multiplicateur de dégâts vs bosses (1.0 = normal, 1.5 = +50%)

### Stats spéciales

- **projectileBonus** : Nombre de projectiles supplémentaires par tir
- **hpRegen** : HP régénérés par seconde
- **magnetRange** : Portée de collecte d'XP (en pixels)
- **critChance** : Chance de coup critique (0.0 à 1.0, ex: 0.25 = 25%)
- **dodgeChance** : Chance d'esquive (0.0 à 1.0, ex: 0.1 = 10%)
- **growthRate** : Taux de croissance par niveau (1.0 = aucun, 1.05 = +5% par niveau)

### Growth Rate

Le `growthRate` augmente automatiquement les stats à chaque niveau :
- `maxHp` est multiplié par `growthRate`
- `speed` est multiplié par `growthRate`
- `damageMultiplier` est multiplié par `growthRate`

Exemple avec `growthRate: 1.05` :
- Niveau 2 : +5% aux stats
- Niveau 3 : +10.25% aux stats
- Niveau 4 : +15.76% aux stats
- etc.

## Exemples de personnages

### Tank (Résistant)

```javascript
tank: {
  name: "Tank",
  sprite: "tank.png",
  description: "Tank - Résistant aux dégâts",
  startWeapon: "orbital",
  stats: {
    maxHp: 150,          // HP élevé
    speed: 120,          // Vitesse lente
    damageMultiplier: 1.0,
    cooldownMultiplier: 1.1, // Un peu plus lent
    xpMultiplier: 1.0,
  },
},
```

### Assassin (Rapide)

```javascript
assassin: {
  name: "Assassin",
  sprite: "assassin.png",
  description: "Rapide - Attaque rapide",
  startWeapon: "sword",
  stats: {
    maxHp: 80,           // HP faible
    speed: 180,          // Très rapide
    damageMultiplier: 1.0,
    cooldownMultiplier: 0.7, // 30% plus rapide
    xpMultiplier: 1.0,
  },
},
```

### Mage (Dégâts)

```javascript
mage: {
  name: "Mage",
  sprite: "mage.png",
  description: "Dégâts - +25% dégâts",
  startWeapon: "projectile",
  stats: {
    maxHp: 90,
    speed: 150,
    damageMultiplier: 1.25, // +25% dégâts
    cooldownMultiplier: 1.0,
    xpMultiplier: 1.0,
  },
},
```

### Support (XP Boost)

```javascript
support: {
  name: "Support",
  sprite: "support.png",
  description: "XP Boost - +30% XP gagnée",
  startWeapon: "orbital",
  stats: {
    maxHp: 100,
    speed: 150,
    damageMultiplier: 1.0,
    cooldownMultiplier: 1.0,
    xpMultiplier: 1.3, // +30% XP
  },
},
```

### Critique (Crit Chance)

```javascript
critique: {
  name: "Critique",
  sprite: "critique.png",
  description: "Critique - +25% dégâts critiques",
  startWeapon: "sword",
  stats: {
    maxHp: 85,
    speed: 150,
    damageMultiplier: 1.25, // +25% dégâts de base
    cooldownMultiplier: 1.0,
    xpMultiplier: 1.0,
    critChance: 0.25, // 25% de chance de critique
  },
},
```

### Régénération (HP Regen)

```javascript
regen: {
  name: "Régénération",
  sprite: "regen.png",
  description: "Régénération - +1 HP par seconde",
  startWeapon: "orbital",
  stats: {
    maxHp: 120,
    speed: 135,
    damageMultiplier: 1.0,
    cooldownMultiplier: 1.0,
    xpMultiplier: 1.0,
    hpRegen: 1.0, // 1 HP par seconde
  },
},
```

### Croissance (Growth Rate)

```javascript
croissance: {
  name: "Croissance",
  sprite: "croissance.png",
  description: "Croissance - Stats +5% par niveau",
  startWeapon: "orbital",
  stats: {
    maxHp: 80,
    speed: 150,
    damageMultiplier: 1.0,
    cooldownMultiplier: 1.0,
    xpMultiplier: 1.0,
    growthRate: 1.05, // +5% par niveau
  },
},
```

## Sprites multiples (directions)

Si votre personnage a des sprites pour différentes directions :

### 1. Placer les sprites

```
assets/sprites/
  nouveau_personnage.png        ← Face
  nouveau_personnage_dos.png    ← Dos
  nouveau_personnage_gauche.png ← Gauche
  nouveau_personnage_droite.png ← Droite
```

### 2. Charger dans main.js

```javascript
const characters = ["nouveau_personnage"];

// Charger les sprites directionnels
const assetsToLoad = {
  // ... autres assets
  nouveau_personnage: "assets/sprites/nouveau_personnage.png",
  nouveau_personnage_dos: "assets/sprites/nouveau_personnage_dos.png",
  nouveau_personnage_gauche: "assets/sprites/nouveau_personnage_gauche.png",
  nouveau_personnage_droite: "assets/sprites/nouveau_personnage_droite.png",
};
```

### 3. Utiliser dans Player.js

Modifiez `Player.js` pour gérer les directions :

```javascript
update(dt, input) {
  // ... mouvement

  // Changer le sprite selon la direction
  if (this.lastDir.y < -0.5) {
    this.sprite = this.game.assets[`${this.characterId}_dos`];
  } else if (this.lastDir.y > 0.5) {
    this.sprite = this.game.assets[this.characterId];
  } else if (this.lastDir.x < -0.5) {
    this.sprite = this.game.assets[`${this.characterId}_gauche`];
  } else if (this.lastDir.x > 0.5) {
    this.sprite = this.game.assets[`${this.characterId}_droite`];
  }
}
```

## Checklist

- [ ] Sprite placé dans `assets/sprites/nom_personnage.png`
- [ ] Ajouté dans `characters` array dans `main.js`
- [ ] Défini dans `CHARACTERS` dans `Characters.js`
- [ ] Stats configurées (maxHp, speed, multiplicateurs)
- [ ] Arme de départ choisie (`startWeapon`)
- [ ] Description définie
- [ ] Testé dans le jeu (sélection de personnage)

## Notes importantes

1. **ID du personnage** : Utilisez des minuscules et underscores (`_`) pour l'ID. Il doit correspondre au nom du fichier sprite (sans extension).

2. **Sprites directionnels** : Si vous utilisez plusieurs sprites, suivez la convention :
   - `nom.png` : Face (vers le bas)
   - `nom_dos.png` : Dos (vers le haut)
   - `nom_gauche.png` : Gauche
   - `nom_droite.png` : Droite

3. **Balance** : Assurez-vous que les stats sont équilibrées :
   - HP élevé = vitesse ou dégâts réduits
   - Multiplicateurs élevés = autre désavantage
   - Capacités spéciales = stats de base réduites

4. **Unicité** : Chaque personnage devrait avoir une identité unique (tank, assassin, mage, etc.)

