import React, { useEffect } from 'react';

export default function Snake({ onBack }) {
  useEffect(() => {
    let isMounted = true;
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const scoreSpan = document.getElementById('scoreValue');
    const statusLed = document.getElementById('statusLed');
    const statusMsg = document.getElementById('statusMessage');

    const GRID_SIZE = 20; const TILE_COUNT = 20; const BASE_SPEED = 180; const MIN_SPEED = 60; 
    let snake = []; let food = { x: 0, y: 0 }; let bigFood = { x: -1, y: -1 };
    let dx = 0; let dy = -1; let nextDx = 0; let nextDy = -1;
    let normalFoodCount = 0; let isBigFoodActive = false; let bigFoodTimer = null; let pendingGrowth = 0;
    let score = 0; let active = true; let gameOver = false; let dropInterval = BASE_SPEED;
    let lastTimestamp = 0; let animFrame = null;

    function updateUI() {
      if(scoreSpan) scoreSpan.innerText = score;
      dropInterval = Math.max(MIN_SPEED, BASE_SPEED - (Math.floor(score / 50) * 15));
    }
    function updateStatusUI() {
      if(!statusLed || !statusMsg) return;
      if (gameOver) { statusLed.className = 'status-led gameover'; statusMsg.innerText = 'GAME OVER'; } 
      else if (!active) { statusLed.className = 'status-led paused'; statusMsg.innerText = 'PAUSED'; } 
      else { statusLed.className = 'status-led'; statusMsg.innerText = 'PLAYING'; }
    }

    function spawnFood() {
      let valid = false;
      while (!valid) {
        food = { x: Math.floor(Math.random()*TILE_COUNT), y: Math.floor(Math.random()*TILE_COUNT) };
        valid = !snake.some(s => s.x === food.x && s.y === food.y);
      }
    }

    function spawnBigFood() {
      let valid = false;
      while (!valid) {
        bigFood = { x: Math.floor(Math.random()*TILE_COUNT), y: Math.floor(Math.random()*TILE_COUNT) };
        valid = (bigFood.x !== food.x || bigFood.y !== food.y) && !snake.some(s => s.x === bigFood.x && s.y === bigFood.y);
      }
      isBigFoodActive = true;
      if (bigFoodTimer) clearTimeout(bigFoodTimer);
      bigFoodTimer = setTimeout(() => { isBigFoodActive = false; normalFoodCount = 0; draw(); }, 5000);
    }

    function updateSnake() {
      dx = nextDx; dy = nextDy;
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT || snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver = true; active = false; updateStatusUI(); return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score += 10; normalFoodCount++;
        if (normalFoodCount === 4) spawnBigFood();
        updateUI(); spawnFood();
      } else if (isBigFoodActive && head.x === bigFood.x && head.y === bigFood.y) {
        score += 50; pendingGrowth += 2; isBigFoodActive = false; normalFoodCount = 0;
        if (bigFoodTimer) clearTimeout(bigFoodTimer); updateUI();
      } else {
        if (pendingGrowth > 0) pendingGrowth--; else snake.pop();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(120, 255, 214, 0.05)'; ctx.lineWidth = 1;
      for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath(); ctx.moveTo(0, i*GRID_SIZE); ctx.lineTo(canvas.width, i*GRID_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i*GRID_SIZE, 0); ctx.lineTo(i*GRID_SIZE, canvas.height); ctx.stroke();
      }

      ctx.fillStyle = '#ff4a4a'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff4a4a';
      ctx.fillRect(food.x*GRID_SIZE + 2, food.y*GRID_SIZE + 2, GRID_SIZE-4, GRID_SIZE-4);
      if (isBigFoodActive) {
        ctx.fillStyle = '#f5dd42'; ctx.shadowBlur = 20; ctx.shadowColor = '#f5dd42';
        ctx.fillRect(bigFood.x*GRID_SIZE, bigFood.y*GRID_SIZE, GRID_SIZE, GRID_SIZE);
      }
      ctx.shadowBlur = 0;

      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? '#a8ff78' : '#78ffd6';
        ctx.fillRect(s.x*GRID_SIZE + 1, s.y*GRID_SIZE + 1, GRID_SIZE-2, GRID_SIZE-2);
      });

      if (gameOver || !active) {
        ctx.globalAlpha = 0.85; ctx.fillStyle = '#01040e'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1;
        ctx.font = 'bold 24px "Inter"'; ctx.fillStyle = gameOver ? '#ff4a4a' : '#78ffd6'; ctx.textAlign = 'center';
        ctx.fillText(gameOver ? 'GAME OVER' : 'PAUSED', canvas.width/2, canvas.height/2);
        ctx.textAlign = 'left';
      }
    }

    function gameLoop(now) {
      if (!isMounted) return;
      if (active && !gameOver && lastTimestamp && (now - lastTimestamp >= dropInterval)) {
        lastTimestamp = now; updateSnake();
      }
      if (!lastTimestamp) lastTimestamp = now;
      draw(); animFrame = requestAnimationFrame(gameLoop);
    }

    function fullReset() {
      if (bigFoodTimer) clearTimeout(bigFoodTimer);
      snake = [{x:10,y:10}, {x:10,y:11}, {x:10,y:12}];
      dx = 0; dy = -1; nextDx = 0; nextDy = -1; score = 0; normalFoodCount = 0; isBigFoodActive = false; pendingGrowth = 0;
      gameOver = false; active = true; dropInterval = BASE_SPEED; lastTimestamp = 0;
      spawnFood(); updateUI(); updateStatusUI(); draw();
    }

    function setDir(ndx, ndy) { if(active && !gameOver) { if(dx===0 && ndx!==0){nextDx=ndx; nextDy=0;} else if(dy===0 && ndy!==0){nextDx=0; nextDy=ndy;} } }

    function handleKey(e) {
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (gameOver) fullReset(); else active = !active; updateStatusUI(); }
      else if (e.key === 'Enter') { e.preventDefault(); fullReset(); }
      else if (active && !gameOver) {
        if(e.key === 'ArrowLeft') setDir(-1,0); else if(e.key === 'ArrowRight') setDir(1,0);
        else if(e.key === 'ArrowUp') setDir(0,-1); else if(e.key === 'ArrowDown') setDir(0,1);
      }
    }

    document.getElementById('playBtn').onclick = () => { if(gameOver) fullReset(); else {active=true; updateStatusUI();} };
    document.getElementById('pauseBtn').onclick = () => { if(!gameOver){active=false; updateStatusUI();} };
    document.getElementById('restartBtn').onclick = fullReset;
    document.getElementById('mLeft').onpointerdown = () => setDir(-1,0);
    document.getElementById('mRight').onpointerdown = () => setDir(1,0);
    document.getElementById('mUp').onpointerdown = () => setDir(0,-1);
    document.getElementById('mDown').onpointerdown = () => setDir(0,1);

    window.addEventListener('keydown', handleKey);
    fullReset(); animFrame = requestAnimationFrame(gameLoop);

    return () => { isMounted = false; window.removeEventListener('keydown', handleKey); cancelAnimationFrame(animFrame); if(bigFoodTimer) clearTimeout(bigFoodTimer); };
  }, []);

  return (
    <div className="game-container theme-snake">
      <div className="game-wrapper">
        <aside className="game-info">
          
          <div className="header-row">
            <button onClick={onBack} className="back-btn" title="Back to Menu"><i className="fas fa-arrow-left"></i></button>
            <div className="logo-area"><h1>SNAKE<span>neo</span></h1></div>
          </div>

          <div className="score-module">
            <div className="score-label">SCORE</div>
            <div className="score-value" id="scoreValue">0</div>
          </div>

          <div className="bottom-section">
            <div className="action-group">
              <button className="action-btn play-btn" id="playBtn"><i className="fas fa-play"></i></button>
              <button className="action-btn pause-btn" id="pauseBtn"><i className="fas fa-pause"></i></button>
              <button className="action-btn restart-btn" id="restartBtn"><i className="fas fa-redo"></i></button>
            </div>
            <div className="controls-panel desktop-only">
              <p><i className="fas fa-arrows-alt"></i> Arrow Keys</p>
              <p><i className="fas fa-redo"></i> Enter → Restart</p>
              <p><i className="fas fa-play"></i> Space → Pause</p>
            </div>
            <div className="status-area"><div className="status-led" id="statusLed"></div><span id="statusMessage">READY</span></div>
          </div>

        </aside>

        <div className="main-play-area">
          <div className="canvas-stage"><canvas id="snakeCanvas" width="400" height="400"></canvas></div>
          <div className="mobile-gamepad">
            <div className="d-pad-cross">
              <button className="m-btn" id="mUp"><i className="fas fa-arrow-up"></i></button>
              <div className="middle-row"><button className="m-btn" id="mLeft"><i className="fas fa-arrow-left"></i></button><button className="m-btn" id="mRight"><i className="fas fa-arrow-right"></i></button></div>
              <button className="m-btn" id="mDown"><i className="fas fa-arrow-down"></i></button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}