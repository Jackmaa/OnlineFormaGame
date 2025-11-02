# Documentation du projet OnlineFormaGame

Bienvenue dans la documentation du projet ! Ce guide vous aidera à comprendre comment ajouter du contenu au jeu.

## 📚 Guides disponibles

### 1. [Ajouter une arme](./01_AJOUTER_UNE_ARME.md)
Guide complet pour créer et intégrer une nouvelle arme au jeu.
- Structure d'une arme
- Types d'armes (Burst, DPS, Projectile)
- Intégration dans GameScene
- Exemples complets

### 2. [Ajouter un ennemi](./02_AJOUTER_UN_ENNEMI.md)
Guide pour créer de nouveaux types d'ennemis.
- Structure d'un ennemi
- Comportements (suiveur, aléatoire, boss)
- Intégration dans WaveManager
- Système de spawn

### 3. [Ajouter un power-up](./03_AJOUTER_UN_POWERUP.md)
Guide pour créer de nouveaux power-ups.
- Structure d'un power-up
- Types de power-ups (offensif, défensif, utilitaire)
- Système de rareté
- Propriétés du joueur modifiables

### 4. [Ajouter des sprites](./04_AJOUTER_DES_SPRITES.md)
Guide pour ajouter et utiliser des sprites/ressources.
- Organisation des assets
- Chargement des sprites
- Sprites animés
- Tilesets

### 5. [Ajouter un personnage](./05_AJOUTER_UN_PERSONNAGE.md)
Guide pour créer un nouveau personnage jouable.
- Stats et multiplicateurs
- Armes de départ
- Sprites directionnels
- Exemples de builds

## 🚀 Quick Start

### Ajouter rapidement une arme

1. Créer `src/weapons/MaArme.js`
2. Ajouter dans `GameScene.createWeapon()`
3. Charger le sprite dans `main.js`

Voir [Guide Armes](./01_AJOUTER_UNE_ARME.md) pour les détails.

### Ajouter rapidement un power-up

1. Créer la classe dans `PowerUpRegistry.js`
2. Enregistrer dans `_initPowerUps()`
3. Implémenter `apply(player)`

Voir [Guide Power-ups](./03_AJOUTER_UN_POWERUP.md) pour les détails.

## 📁 Structure du projet

```
src/
  data/
    Characters.js          # Définition des personnages
  entities/
    Bug.js                 # Classe de base des ennemis
    Player.js              # Classe du joueur
    XPGem.js               # Gems d'XP
  weapons/
    BaseWeapon.js          # Classe de base des armes
    Sword.js               # Exemple : épée
    OrbitalWeapon.js       # Exemple : orbitales
    ProjectileWeapon.js     # Exemple : projectiles
  powerups/
    PowerUpRegistry.js     # Registre des power-ups
    RaritySystem.js        # Système de rareté
  scenes/
    GameScene.js           # Scène principale du jeu
    CharacterSelectScene.js # Sélection de personnage
  systems/
    LevelUpSystem.js       # Système de level up
    WaveManager.js         # Gestion des vagues d'ennemis
  engine/
    Game.js                # Moteur de jeu
    AssetLoader.js         # Chargement des assets
```

## 🔧 Concepts clés

### Système de multiplicateurs

Le jeu utilise plusieurs multiplicateurs qui s'appliquent automatiquement :
- `damageMultiplier` : Multiplie les dégâts
- `cooldownMultiplier` : Modifie la vitesse d'attaque (<1.0 = plus rapide)
- `areaMultiplier` : Multiplie la portée/taille des armes
- `xpMultiplier` : Multiplie l'XP gagnée
- `luckMultiplier` : Multiplie la chance de drop

### Système de rareté

Les power-ups peuvent apparaître avec différentes raretés :
- ⚪ Commun (×1.0)
- 🟢 Peu commun (×1.5)
- 🔵 Rare (×2.0)
- 🟣 Épique (×3.0)
- 🟠 Légendaire (×5.0)
- 🔴 Mythique (×10.0)

### Types d'armes

- **Burst** (`isDPS = false`) : Dégâts par hit (épée, lance)
- **DPS** (`isDPS = true`) : Dégâts continus (orbitales, aura)
- **Projectile** : Projectiles qui se déplacent (flèches, boules de feu)

## 🎮 Personnages disponibles

Voir [Characters.js](../src/data/Characters.js) pour la liste complète.

Types de builds :
- **Tank** : HP élevé, défense
- **Assassin** : Vitesse, attaque rapide
- **Mage** : Dégâts élevés
- **Support** : XP boost, utilitaires
- **Critique** : Chance de critique élevée
- **Régénération** : HP regen

## 📝 Bonnes pratiques

1. **Noms de fichiers** : Utilisez des minuscules et underscores (`_`)
2. **Initialisation** : Toujours vérifier si une propriété existe avant de l'utiliser
3. **Multiplicateurs** : Ne pas multiplier dans les armes, `GameScene` le fait automatiquement
4. **Performance** : Éviter de créer trop d'objets dans `update()`
5. **Balance** : Tester l'équilibrage des stats

## 🐛 Dépannage

### Le sprite ne s'affiche pas
- Vérifier le chemin dans `main.js`
- Vérifier que le fichier existe
- Vérifier la console pour les erreurs

### L'arme ne fonctionne pas
- Vérifier que `getHitboxes()` retourne bien un tableau
- Vérifier que `super.update(dt)` est appelé
- Vérifier l'intégration dans `GameScene`

### Le power-up ne s'applique pas
- Vérifier que le power-up est enregistré dans `_initPowerUps()`
- Vérifier que `apply(player)` modifie bien les propriétés
- Vérifier l'initialisation des propriétés (`if (!player.prop)`)

## 📞 Support

Pour toute question ou problème, consultez :
1. Le guide correspondant à votre besoin
2. Les fichiers d'exemple dans le code
3. Les commentaires dans le code source

Bonne chance pour votre développement ! 🎮

