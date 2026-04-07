import React, { useState } from 'react';
import Tetris from './games/Tetris';
import Snake from './games/Snake';
import Racer from './games/Racer';
import './index.css';

function App() {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div className="app-root">
      {!activeGame && (
        <div className="home-scroll-wrapper">
          <div className="home-container">
            <h1 className="home-title">NEO GAMES PORTAL</h1>
            <div className="cards-grid">
              
              <div className="game-card card-tetris" onClick={() => setActiveGame('tetris')}>
                <i className="fas fa-cubes"></i>
                <h2>TETRIS</h2>
                <p>Classic block puzzle</p>
              </div>

              <div className="game-card card-snake" onClick={() => setActiveGame('snake')}>
                <i className="fas fa-staff-snake"></i>
                <h2>SNAKE</h2>
                <p>Retro survival</p>
              </div>

              <div className="game-card card-racer" onClick={() => setActiveGame('racer')}>
                <i className="fas fa-car-side"></i>
                <h2>RACER</h2>
                <p>Top-down dodging</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeGame === 'tetris' && <Tetris onBack={() => setActiveGame(null)} />}
      {activeGame === 'snake' && <Snake onBack={() => setActiveGame(null)} />}
      {activeGame === 'racer' && <Racer onBack={() => setActiveGame(null)} />}
    </div>
  );
}

export default App;