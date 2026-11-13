# 🏃 TAMIM RUN: Shoe Escape! (তামিম ও জুতোর তাড়া) 🥿💥

> **"পড়ালেখা বাদ দিয়ে মোবাইলে গেম খেলোস?! দাঁড়া তুই, আজকে তোরে জুতোর বাড়ি দিয়া সোজা বানামু!"** — আম্মু (হাসিনা)

**TAMIM RUN: Shoe Escape!** is a fast-paced, humorous, Bengali-themed 2D retro arcade runner built from scratch using pure vanilla HTML5, CSS3, and JavaScript (Canvas 2D + Web Audio API). 

No external frameworks or heavy assets required—everything is procedurally rendered and synthesized in real time. It works 100% offline, on all mobile and desktop browsers, and deploys immediately to **GitHub Pages**!

---

## 🎮 Playable Demo & Concept

Tamim was busy scrolling Facebook and playing games instead of studying for his BCS/exams. Ammu (Hasina) stormed in with her legendary slipper (জুতো), and the ultimate chase began! Dodge flying chappals, leap over sleeping cats and wet laundry buckets, slide under high-speed turbo slippers, and grab delicious Biryani and Wi-Fi boosters to stay ahead!

---

## 🕹️ Controls

### 💻 Desktop
- **Spacebar / Up Arrow (`⬆️`) / W**: লাফ দাও (Jump)
- **Down Arrow (`⬇️`) / C / Z**: নিচে স্লাইড করো (Slide / Duck)
- **S / E / X / Shift**: ভাতের ঢাকনা শিল্ড (Invincible Rice Pot Lid Shield)
- **P / Escape**: খেলা থামাও (Pause Game)

### 📱 Mobile & Tablet
- **`[ ⬆️ JUMP ]` Button**: Large thumb-friendly jump button on the bottom right.
- **`[ ⬇️ SLIDE ]` Button**: Slide button on the bottom left.
- **`[ 🛡️ SHIELD ]` Button**: Activate invincible shield on demand.
- **Swipe Gestures**:
  - **Swipe Up**: Jump
  - **Swipe Down**: Slide / Duck

---

## 🌟 Key Features & Mechanics

1. **🎭 Expressive Characters & Animations**:
   - **Tamim**: Running leg-swing cycles, dynamic jumping physics, dust clouds, panicked backward glances at Mom, and spinning dizzy stars (`💫`) upon impact.
   - **Outfit Customizer**:
     - 🩳 *Lungi Master (লুঙ্গি)*: Authentic comfortable Bangladeshi attire.
     - 🎒 *School Boy (স্কুল ছাত্র)*: Bouncing backpack and uniform.
     - 🎧 *Pro Gamer (প্রো গেমার)*: RGB hoodie and glowing headset.
   - **Mom (Hasina - আম্মু)**: Fierce saree animation with flying pallu (আঁচল), wind-up throwing arm, angry smoke puffs, and hilarious comic shouting speech bubbles!

2. **🥿 Slipper Physics & Obstacles**:
   - **Low Flying Slipper**: Requires jumping over.
   - **High Slipper**: Requires sliding/ducking underneath!
   - **Turbo Red Slipper**: Faster velocity with motion sparks.
   - **Sleeping Orange Cat (ঘুমন্ত বিড়াল)**: Jumping over gives a cute `Meow! 🐱` easter egg.
   - **Wet Floor & Laundry Bucket (ভেজা বালতি)**: Causes sudden slips.
   - **Heavy Books & Banana Peels**.

3. **🍗 Power-Ups & Collectibles**:
   - **Kacchi Biryani Box (কাচ্চি বিরিয়ানি)**: Steaming aroma, restores +1 Life/Health.
   - **5G Wi-Fi Router (ওয়াইফাই রাউটার)**: Blinking LEDs, gives a 5-second turbo speed boost that pushes Ammu far behind!
   - **Bhaater Handi Shield (ভাতের ঢাকনা)**: Deflects flying slippers with a loud metallic `CLANG!`
   - **Taka Coins (৳ টাকা)**: Scattered arcs of coins for high score multiplier.

4. **🌆 Dynamic Parallax Environments (4 Zones)**:
   - **Zone 1 (0m - 400m)**: *Tamim's Living Room & Bedroom* — "KEEP CALM & বিসিএস দে" posters, wall clock, Persian runner rug.
   - **Zone 2 (400m - 850m)**: *Kitchen & Dining* — Shelves with Masala jars (হলুদ, মরিচ, জিরা), hanging pans.
   - **Zone 3 (850m - 1400m)**: *Balcony & Roof* — Sunset over Dhaka, fluttering lungis & sarees on the clothesline.
   - **Zone 4 (1400m+)**: *Dhaka Street & Alleyway* — Rickshaw silhouettes, tea stall ("রং চা ৫ টাকা"), neon glow.

5. **🔊 Pure Web Audio API Sound Synthesizer**:
   - Zero missing audio files or network delays!
   - Custom synthesized retro comic sound effects: boing jump, friction slide swoosh, slipper throw whistle, shield clang, cat meow, and sad comic game-over trombone.
   - Catchy chiptune retro arcade background music with Bengali folk groove (Dadra/Keherwa beat).

6. **🤣 Bengali Comic Roast Engine**:
   - High score persistence with `localStorage`.
   - Hilarious contextual roast quotes upon getting caught.
   - 1-click clipboard copy to brag and challenge friends on Facebook/WhatsApp!

---

## 🚀 How to Run Locally

You don't need Node.js, Webpack, or any build tools! Simply:

1. Double-click `index.html` in your file explorer to open it directly in any web browser (Chrome, Edge, Firefox, Safari).
2. OR, if using a local development server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser.

---

## 🌐 Deploy to GitHub Pages (In 30 Seconds)

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete TAMIM RUN game"
   git push origin main
   ```
2. On GitHub, navigate to **Settings** > **Pages** (under Code and automation).
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Within 1-2 minutes, your game is live globally at:
   `https://<your-username>.github.io/TamimRun/`

---

## 📁 File Structure

```
TamimRun/
├── index.html       # HTML5 game container, responsive HUD, start/pause/gameover UI, touch buttons
├── style.css        # Retro-arcade & Bengali comic typography, responsive layout, animations
├── script.js        # 2D Canvas engine, procedural graphics, physics, particle system & Web Audio synth
└── README.md        # Documentation, lore, controls & deployment guide
```

---

*Made with ❤️ and humor for Bangladeshi gamers and arcade enthusiasts everywhere!*
