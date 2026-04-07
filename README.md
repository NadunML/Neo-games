# 🎮 Neo Games Portal

A modern, highly responsive Single Page Application (SPA) built with React. This portal features three fully playable, classic arcade games re-imagined with a sleek, neon-infused professional UI. 

## ✨ Featured Games

1. **TETRIS neo:** The classic block puzzle game featuring dynamic speed scaling, score tracking, and smooth HTML5 Canvas rendering.
2. **SNAKE neo:** A retro survival game with a twist—collect regular items to spawn a limited-time 'Golden Dot' for massive points and rapid growth.
3. **RACER neo:** A top-down dodging game where speed and difficulty progressively increase as you navigate through oncoming traffic.

## 🚀 Key Features

* **Single Page Application:** Seamless switching between the main menu and games without page reloads, powered by React state management.
* **100% Mobile Responsive:** Custom mobile gamepads with touch controls (D-pads and Action buttons) dynamically rendered for smaller screens. Prevented overlapping using advanced CSS Flexbox and media queries.
* **Memory Management:** Proper cleanup of `requestAnimationFrame` and event listeners using React `useEffect` hooks to prevent memory leaks when switching games.
* **Modern UI/UX:** Dark mode aesthetics with distinct neon color themes for each game (Cyan for Tetris, Green for Snake, Magenta for Racer).

## 🛠️ Tech Stack

* **Frontend Framework:** React.js (Bootstrapped with Vite)
* **Graphics/Rendering:** HTML5 `<canvas>` API
* **Styling:** Vanilla CSS3 (Flexbox, CSS Variables, Media Queries)
* **Icons:** FontAwesome