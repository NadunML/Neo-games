import React, { useEffect } from 'react';

export default function Racer({ onBack }) {
  useEffect(() => {
    let isMounted = true;
    const canvas = document.getElementById('racerCanvas');
    const ctx = canvas.getContext('2d');
    const scoreSpan = document.getElementById('scoreValue');
    const statusLed = document.getElementById('statusLed');
    const statusMsg = document.getElementById('statusMessage');

    const CAR_W = 46; const CAR_H = 80; const LANE_W = 100;
    let score = 0; let active = true; let gameOver = false; let animFrame = null;
    let baseSpeed = 4; let roadOffset = 0;
    let player = { x: 127, y: 380, speed: 5 };
    let keys = { ArrowLeft: false, ArrowRight: false };
    let enemies = []; let framesSinceSpawn = 0; let spawnRate = 80;
    const colors = ['#ff00ff', '#ff4a4a', '#f5dd42', '#a8ff78'];

    function updateUI() {
      if(scoreSpan) scoreSpan.innerText = score;
      let level = Math.floor(score / 10);
      baseSpeed = 4 + (level * 1.5); spawnRate = Math.max(30, 80 - (level * 5));
    }
    function updateStatusUI() {
      if(!statusLed || !statusMsg) return;
      if (gameOver) { statusLed.className = 'status-led gameover'; statusMsg.innerText = 'CRASHED'; } 
      else if (!active) { statusLed.className = 'status-led paused'; statusMsg.innerText = 'PAUSED'; } 
      else { statusLed.className = 'status-led'; statusMsg.innerText = 'RACING'; }
    }

    function updateGame() {
      roadOffset += baseSpeed; if (roadOffset >= 40) roadOffset = 0;
      if (keys.ArrowLeft && player.x > 5) player.x -= player.speed;
      if (keys.ArrowRight && player.x < canvas.width - CAR_W - 5) player.x += player.speed;

      if (++framesSinceSpawn > spawnRate) {
        enemies.push({ x: (Math.floor(Math.random() * 3) * LANE_W) + 27, y: -100, color: colors[Math.floor(Math.random()*colors.length)], mod: Math.random()*2 });
        framesSinceSpawn = 0;
      }

      for (let i = 0; i < enemies.length; i++) {
        let e = enemies[i]; e.y += baseSpeed + e.mod;
        if (player.x < e.x+CAR_W && player.x+CAR_W > e.x && player.y < e.y+CAR_H && player.y+CAR_H > e.y) {
          gameOver = true; active = false; updateStatusUI(); return;
        }
        if (e.y > canvas.height) { enemies.splice(i, 1); score++; updateUI(); i--; }
      }
    }

    function drawCar(x, y, isPlayer, color) {
      ctx.shadowBlur = 15; ctx.shadowColor = color; ctx.fillStyle = color; ctx.fillRect(x, y, CAR_W, CAR_H); ctx.shadowBlur = 0;
      ctx.fillStyle = '#05060a'; ctx.fillRect(x+6, y+20, CAR_W-12, CAR_H-40);
      ctx.fillStyle = isPlayer ? '#00ffff' : '#111'; ctx.fillRect(x+8, y+22, CAR_W-16, 12); ctx.fillRect(x+8, y+CAR_H-32, CAR_W-16, 10);
      ctx.fillStyle = isPlayer ? '#fff' : '#ff0000'; let ly = isPlayer ? y : y+CAR_H-4;
      ctx.fillRect(x+4, ly, 8, 4); ctx.fillRect(x+CAR_W-12, ly, 8, 4);
    }

    function draw() {
      ctx.fillStyle = '#111424'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for(let l=1; l<3; l++) for(let y=-40; y<canvas.height+40; y+=40) ctx.fillRect(l*LANE_W-2, y+roadOffset, 4, 20);
      enemies.forEach(e => drawCar(e.x, e.y, false, e.color));
      drawCar(player.x, player.y, true, '#00ffff');

      if (gameOver || !active) {
        ctx.globalAlpha = 0.85; ctx.fillStyle = '#01040e'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1;
        ctx.font = 'bold 24px "Inter"'; ctx.fillStyle = gameOver ? '#ff00ff' : '#00ffff'; ctx.textAlign = 'center';
        ctx.fillText(gameOver ? 'CRASHED' : 'PAUSED', canvas.width/2, canvas.height/2); ctx.textAlign = 'left';
      }
    }

    function gameLoop() {
      if (!isMounted) return;
      if (active && !gameOver) updateGame();
      draw(); animFrame = requestAnimationFrame(gameLoop);
    }

    function fullReset() {
      player.x = 127; score = 0; enemies = []; framesSinceSpawn = 0; baseSpeed = 4; spawnRate = 80;
      gameOver = false; active = true; keys.ArrowLeft = false; keys.ArrowRight = false;
      updateUI(); updateStatusUI();
    }

    function handleKeyDown(e) {
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (gameOver) fullReset(); else active = !active; updateStatusUI(); }
      else if (e.key === 'Enter') { e.preventDefault(); fullReset(); }
      else if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    }
    function handleKeyUp(e) { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; }

    document.getElementById('playBtn').onclick = () => { if(gameOver) fullReset(); else {active=true; updateStatusUI();} };
    document.getElementById('pauseBtn').onclick = () => { if(!gameOver){active=false; updateStatusUI();} };
    document.getElementById('restartBtn').onclick = fullReset;
    
    ['mLeft', 'mRight'].forEach(id => {
      const btn = document.getElementById(id);
      const key = id === 'mLeft' ? 'ArrowLeft' : 'ArrowRight';
      btn.onpointerdown = (e) => { e.preventDefault(); if(active && !gameOver) keys[key] = true; };
      btn.onpointerup = btn.onpointerleave = (e) => { e.preventDefault(); keys[key] = false; };
    });

    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    fullReset(); animFrame = requestAnimationFrame(gameLoop);

    return () => { isMounted = false; window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); cancelAnimationFrame(animFrame); };
  }, []);

  return (
    <div className="game-container theme-racer">
      <div className="game-wrapper">
        <aside className="game-info">
          
          <div className="header-row">
            <button onClick={onBack} className="back-btn" title="Back to Menu"><i className="fas fa-arrow-left"></i></button>
            <div className="logo-area"><h1>RACER<span>neo</span></h1></div>
          </div>

          <div className="score-module">
            <div className="score-label">CARS PASSED</div>
            <div className="score-value" id="scoreValue">0</div>
          </div>

          <div className="bottom-section">
            <div className="action-group">
              <button className="action-btn play-btn" id="playBtn"><i className="fas fa-play"></i></button>
              <button className="action-btn pause-btn" id="pauseBtn"><i className="fas fa-pause"></i></button>
              <button className="action-btn restart-btn" id="restartBtn"><i className="fas fa-redo"></i></button>
            </div>
            <div className="controls-panel desktop-only">
              <p><i className="fas fa-arrow-left"></i> <i className="fas fa-arrow-right"></i> Steer</p>
              <p><i className="fas fa-redo"></i> Enter → Restart</p>
              <p><i className="fas fa-play"></i> Space → Pause</p>
            </div>
            <div className="status-area"><div className="status-led" id="statusLed"></div><span id="statusMessage">READY</span></div>
          </div>

        </aside>

        <div className="main-play-area">
          <div className="canvas-stage"><canvas id="racerCanvas" width="300" height="500"></canvas></div>
          <div className="mobile-gamepad">
            <div className="d-pad-horizontal"><button className="m-btn" id="mLeft"><i className="fas fa-arrow-left"></i></button><button className="m-btn" id="mRight"><i className="fas fa-arrow-right"></i></button></div>
          </div>
        </div>

      </div>
    </div>
  );
}