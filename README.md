# 🪵 Gilli Danda — Digitalizing Tamil Culture Heritage Through 2D Game Development

> **Kitti Pul (கிட்டி புல்) / Killi Thandu (கில்லி தண்டு)**  
> *A high-performance 2D web application designed to preserve, celebrate, and digitalize ancient Tamil sports heritage through interactive gameplay, realistic physics, and acoustic sound synthesis.*

---

## 🌾 Project Overview

**Gilli Danda: Heritage Strike** is a modern 2D browser game built to digitalize and preserve the traditional South Asian street sport known in Tamil Nadu as **Kitti Pul (கிட்டி புல்)**. Played for over 2,500 years in Tamil villages and towns, Gilli Danda is an ancestor of modern bat-and-ball sports like cricket and baseball.

This application translates the authentic physical mechanics of the traditional sport into an intuitive, visually rich 2D web experience featuring authentic wind dynamics, breakable terracotta targets (*Uri*), local 2-player multiplayer, equipment crafting, and educational heritage storytelling.

---

## 🛠️ Technology Stack & Tools Used

| Layer | Technology / Tool | Purpose & Usage |
| :--- | :--- | :--- |
| **Core Architecture** | **HTML5 Canvas 2D API** | High-frame-rate 2D graphics rendering, custom particles, and parallax landscape drawing |
| **Logic & Engine** | **Vanilla JavaScript (ES6+)** | Modular object-oriented game logic using ES Modules (`main.js`, `PhysicsEngine.js`, `Renderer.js`, `GameModes.js`) |
| **UI & Styling** | **Vanilla CSS3 (Glassmorphism)** | Custom design system using HSL color tokens, dark terracotta glassmorphic panels, responsive flex layouts, and keyframe micro-animations |
| **Build & Tooling** | **Vite (v5.4.21)** | Next-generation fast development server, ES module hot reloading, and optimized production bundler |
| **Audio Synthesizer** | **Web Audio API** | Procedural acoustic sound synthesis (`SoundManager.js`) generating wood strikes, ceramic pot smashes, ground bounce thuds, and Tamil pentatonic victory chords |
| **Persistence** | **Browser LocalStorage API** | Client-side state persistence for equipment crafting unlocks, player stats, and high score tracking (`StorageManager.js`) |
| **Typography** | **Google Fonts** | *Rozha One* (Traditional Serif headings) and *Outfit* (Modern Sans UI body text) |

---

## 🎯 Key Features & Game Mechanics

### 1. Authentic Two-Step Physics Engine (`PhysicsEngine.js`)
- **Phase 1 (Pit Flick Aim)**: Click and drag backwards from the ground oval pit (*Dhar*) to aim the initial Gilli pop-up flick.
- **Phase 2 (Airborne Strike Timing)**: Track the floating Gilli in mid-air using cursor Danda alignment. Press `SPACE` or click to swing with precision timing ($0.25 - 1.0$ accuracy scale).
- **Phase 3 (Flight & Restitution Roll)**: Simulates 2D flight dynamics combining gravity ($g = 480 \text{px/s}^2$), drag coefficients, rotational spin ($v_\theta$), ground restitution bounce physics, and momentum deflection on impact.

### 2. Aerodynamic Wind Dynamics Engine
- **Tailwind ($+ \text{m/s}$)**: Pushes the Gilli forward, displaying golden airflow streams accelerating along with the Gilli.
- **Headwind ($- \text{m/s}$)**: Resists horizontal motion, displaying cyan air resistance shockwaves pressing against the Gilli's flight.

### 3. Uri Adi (Pot Smash) Targets & Pendulum Sway Physics (`GameModes.js`)
- **200-Meter Target Field**: 18 hanging terracotta pots (*Uri*) placed along the field from 10m up to 200m.
- **Wind-Driven Sway**: Pots sway dynamically on their rope anchors based on real-time wind speed and direction.
- **Breakable Shard Physics**: Direct Gilli collisions trigger 25-shard clay fragment particle explosions, ceramic chime sound effects, and momentum energy loss.

### 4. Turn-Based Local Multiplayer & Head-to-Head Scorecards
- **Player Setup Registration**: Modal setup for single-player or 2-player local head-to-head competition.
- **3-Attempt Turn System**: Each player gets exactly 3 distinct attempts per match.
- **Side-by-Side Comparison Scorecard**: End-of-match summary displaying individual attempt breakdowns (`Attempt 1`, `Attempt 2`, `Attempt 3`), best hit distance, total points, and conditional *Pots Smashed* tracking.

### 5. Traditional Danda Craft Shop (`Storage.js`)
- Earn distance points by playing to unlock and equip 4 unique heritage wooden Dandas:
  1. **Classic Bamboo**: Standard balanced stick ($1.0\times$ Power).
  2. **Teakwood Striker**: Durable polished wood ($1.15\times$ Power).
  3. **Rosewood Champion**: Heavy impact density ($1.3\times$ Power).
  4. **Royal Brass Rim**: Sacred brass-encased premium Danda ($1.5\times$ Power).

### 6. "Know About Our Heritage" Educational Storytelling
- Dedicated main menu section featuring the complete 2,500-year history of Gilli Danda, regional Tamil names (**Kitti Pull / கிட்டிப்புள்** & **Killi Thandu / கில்லி தண்டு**), equipment construction, *Dhar* pit rules, and traditional sports preservation context.

---

## 🎨 Visual Architecture & Parallax Environment (`Renderer.js`)

- **Vibrant Daylight Sky & Sun**: Multi-stop sky gradient with soft puffy clouds, radial sun glow, and lens flare circles.
- **Layered Blue Mountain Ridges**: Parallax background mountain ranges rendered with smooth bezier curves.
- **Heritage Village Elements**: Distant ancient South Indian Temple Gopuram silhouette with tiered roofs and top *Kalasam* spire.
- **Flora & Landscape**: 18 detailed Palmyra palm trees (*பனை மரம்*), gnarled fruit trees with red apples/blossoms, thatched clay huts, rustic wooden picket fences, and green shrub bushes.
- **Sandy Field Terrain**: Textured golden sand path with pebbles, wild mushrooms, grass tufts, and traditional Kolam ground art patterns.

---

## 📁 Project Directory Structure

```
gilli-danda-game/
├── README.md                 # Complete project documentation & guide
├── index.html                # Main HTML view containers & Modal overlays
├── style.css                 # Terracotta design system, glassmorphism & UI layout
├── package.json              # Project metadata & Vite scripts
└── src/
    ├── main.js               # App entry point, DOM router & frame render loop
    ├── PhysicsEngine.js      # 2D physics simulation, drag flick & ground bounce
    ├── Renderer.js           # Parallax canvas background, particles & wind effects
    ├── GameModes.js          # Match manager, 2-player turn logic & Uri pots
    ├── SoundManager.js       # Web Audio API synthesizer for acoustic SFX
    └── Storage.js            # LocalStorage state manager for scores & shop unlocks
```

---

## 🚀 How to Run the Project Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Clone or Navigate to Project Directory**:
   ```bash
   cd d:\Raghav\Portfolio\gilli-danda-game
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/` (or the terminal output URL).

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```
   Generates optimized assets in the `dist/` directory.

---

## 📜 Cultural Heritage Credits & Citation

- **Topic**: *Gilli Danda - Digitalizing Tamil Culture Heritage through 2D Game Development*
- **Tamil Nomenclature**: Kitti Pul (கிட்டி புல்), Killi Thandu (கில்லி தண்டு), Dhar (தார் - Pit), Uri Adi (உறி அடி - Pot Smash).
- **Historical Reference**: Over 2,500 years of traditional outdoor sports heritage preserved digitally.
