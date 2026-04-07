import React, { useEffect } from 'react';

export default function Tetris({ onBack }) {
  useEffect(() => {
    let isMounted = true;
    const canvas = document.getElementById('tetrisCanvas');
    const ctx = canvas.getContext('2d');
    const scoreSpan = document.getElementById('scoreValue');
    const statusLed = document.getElementById('statusLed');
    const statusMsg = document.getElementById('statusMessage');

    const COLS = 12; const ROWS = 20; const CELL_SIZE = 30;     
    const BASE_SPEED = 500; const MIN_SPEED = 100; 
    const SHAPES = {
      I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], O: [[1,1],[1,1]],
      T: [[0,1,0],[1,1,1],[0,0,0]], S: [[0,1,1],[1,1,0],[0,0,0]],
      Z: [[1,1,0],[0,1,1],[0,0,0]], L: [[1,0,0],[1,0,0],[1,1,0]],
      J: [[0,0,1],[0,0,1],[0,1,1]]
    };
    const COLOR_MAP = [null, '#2bd2ff', '#f5dd42', '#c55ef0', '#4cd964', '#ff7e5e', '#f9a43c', '#5f8eff'];
    const PIECE_IDS = { I:1, O:2, T:3, S:4, Z:5, L:6, J:7 };

    let arena = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let currentPiece = null; let piecePos = { x: 3, y: 0 };
    let score = 0; let active = true; let gameOver = false;
    let dropInterval = BASE_SPEED; let lastTimestamp = 0;
    let accumulator = 0; let animFrame = null;

    function updateUI() {
      if(scoreSpan) scoreSpan.innerText = score;
      let level = Math.floor(score / 200);
      dropInterval = Math.max(MIN_SPEED, BASE_SPEED - (level * 40));
    }

    function updateStatusUI() {
      if(!statusLed || !statusMsg) return;
      if (gameOver) { statusLed.className = 'status-led gameover'; statusMsg.innerText = 'GAME OVER'; } 
      else if (!active) { statusLed.className = 'status-led paused'; statusMsg.innerText = 'PAUSED'; } 
      else { statusLed.className = 'status-led'; statusMsg.innerText = 'PLAYING'; }
    }

    function randomPiece() {
      const types = ['I','O','T','S','Z','L','J'];
      const type = types[Math.floor(Math.random() * types.length)];
      return { matrix: SHAPES[type].map(row => row.map(v => v === 1 ? PIECE_IDS[type] : 0)), typeId: PIECE_IDS[type] };
    }

    function collide(arenaMat, pieceMat, offX, offY) {
      for (let r = 0; r < pieceMat.length; r++) {
        for (let c = 0; c < pieceMat[0].length; c++) {
          if (pieceMat[r][c] !== 0) {
            const x = offX + c; const y = offY + r;
            if (x < 0 || x >= COLS || y >= ROWS || y < 0) return true;
            if (y >= 0 && arenaMat[y][x] !== 0) return true;
          }
        }
      }
      return false;
    }

    function mergePiece() {
      currentPiece.matrix.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val !== 0 && arena[piecePos.y + r]) arena[piecePos.y + r][piecePos.x + c] = val;
        });
      });
    }

    function clearLines() {
      let linesCleared = 0;
      for (let row = ROWS-1; row >= 0; ) {
        if (arena[row].every(val => val !== 0)) {
          for (let r = row; r > 0; r--) arena[r] = [...arena[r-1]];
          arena[0] = Array(COLS).fill(0);
          linesCleared++;
        } else { row--; }
      }
      if (linesCleared > 0) {
        score += {1:100, 2:300, 3:600, 4:1000}[linesCleared] || 100 * linesCleared;
        updateUI();
      }
    }

    function spawnNewPiece() {
      currentPiece = randomPiece();
      piecePos = { x: Math.floor((COLS - currentPiece.matrix[0].length) / 2), y: 0 };
      if (collide(arena, currentPiece.matrix, piecePos.x, piecePos.y)) {
        gameOver = true; active = false;
        updateStatusUI(); draw(); return false;
      }
      return true;
    }

    function lockPiece() { mergePiece(); clearLines(); if(spawnNewPiece()) updateStatusUI(); draw(); }
    
    function move(dx, dy) {
      if (!active || gameOver) return;
      if (!collide(arena, currentPiece.matrix, piecePos.x + dx, piecePos.y + dy)) {
        piecePos.x += dx; piecePos.y += dy; draw();
      } else if (dy === 1) { lockPiece(); }
    }

    function rotatePiece() {
      if (!active || gameOver) return;
      const original = currentPiece.matrix;
      currentPiece.matrix = original[0].map((_, idx) => original.map(row => row[idx]).reverse());
      if (collide(arena, currentPiece.matrix, piecePos.x, piecePos.y)) {
        for (let shift of [-1, 1, -2, 2]) {
          if (!collide(arena, currentPiece.matrix, piecePos.x + shift, piecePos.y)) {
            piecePos.x += shift; draw(); return;
          }
        }
        currentPiece.matrix = original; 
      } else draw();
    }

    function hardDrop() {
      if (!active || gameOver) return;
      while (!collide(arena, currentPiece.matrix, piecePos.x, piecePos.y + 1)) piecePos.y++;
      lockPiece();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(0, 220, 255, 0.2)'; ctx.lineWidth = 0.8;
      for (let i = 0; i <= ROWS; i++) { ctx.beginPath(); ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(canvas.width, i * CELL_SIZE); ctx.stroke(); }
      for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, canvas.height); ctx.stroke(); }

      arena.forEach((row, r) => row.forEach((val, c) => {
        if (val !== 0) {
          ctx.fillStyle = COLOR_MAP[val]; ctx.shadowBlur = 3; ctx.shadowColor = 'rgba(0,200,255,0.5)';
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE-0.8, CELL_SIZE-0.8);
          ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(c * CELL_SIZE + 2, r * CELL_SIZE + 2, CELL_SIZE-5, 4);
        }
      }));

      if (currentPiece && !gameOver) {
        currentPiece.matrix.forEach((row, r) => row.forEach((val, c) => {
          if (val !== 0) {
            ctx.fillStyle = COLOR_MAP[val]; ctx.shadowBlur = 6; ctx.shadowColor = '#0ff';
            ctx.fillRect((piecePos.x + c) * CELL_SIZE, (piecePos.y + r) * CELL_SIZE, CELL_SIZE-0.8, CELL_SIZE-0.8);
            ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,250,0.4)';
            ctx.fillRect((piecePos.x + c) * CELL_SIZE + 2, (piecePos.y + r) * CELL_SIZE + 2, CELL_SIZE-5, 4);
          }
        }));
      }

      if (gameOver || !active) {
        ctx.globalAlpha = 0.85; ctx.fillStyle = '#01040e'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1;
        ctx.font = 'bold 24px "Inter"'; ctx.fillStyle = gameOver ? '#ffbe76' : '#aaffff'; ctx.textAlign = 'center';
        ctx.fillText(gameOver ? 'GAME OVER' : 'PAUSED', canvas.width/2, canvas.height/2);
        ctx.textAlign = 'left';
      }
    }

    function gameLoop(now) {
      if (!isMounted) return;
      if (active && !gameOver && lastTimestamp) {
        accumulator += Math.min(100, now - lastTimestamp);
        while (accumulator >= dropInterval) {
          if (!collide(arena, currentPiece.matrix, piecePos.x, piecePos.y + 1)) piecePos.y++;
          else lockPiece();
          accumulator -= dropInterval;
        }
      }
      lastTimestamp = now; draw(); animFrame = requestAnimationFrame(gameLoop);
    }

    function fullReset() {
      arena = Array(ROWS).fill().map(() => Array(COLS).fill(0));
      score = 0; gameOver = false; active = true; dropInterval = BASE_SPEED; accumulator = 0; lastTimestamp = 0;
      updateUI(); spawnNewPiece(); updateStatusUI(); draw();
    }

    // USER REQUESTED CONTROLS
    function handleKey(e) {
      if (e.key === ' ' || e.key === 'Spacebar') { 
        e.preventDefault(); 
        if (gameOver) fullReset(); else active = !active; 
        updateStatusUI(); 
      }
      else if (e.key === 'Enter') { 
        e.preventDefault(); 
        if (gameOver) fullReset(); else hardDrop(); 
      }
      else if (active && !gameOver) {
        if(e.key === 'ArrowLeft') move(-1,0); else if(e.key === 'ArrowRight') move(1,0);
        else if(e.key === 'ArrowDown') move(0,1); else if(e.key === 'ArrowUp') rotatePiece();
      }
    }

    document.getElementById('playBtn').onclick = () => { if(gameOver) fullReset(); else {active=true; updateStatusUI();} };
    document.getElementById('pauseBtn').onclick = () => { if(!gameOver){active=false; updateStatusUI();} };
    document.getElementById('restartBtn').onclick = fullReset;
    document.getElementById('mLeft').onpointerdown = () => move(-1,0);
    document.getElementById('mRight').onpointerdown = () => move(1,0);
    document.getElementById('mDown').onpointerdown = () => move(0,1);
    document.getElementById('mRotate').onpointerdown = rotatePiece;
    document.getElementById('mDrop').onpointerdown = hardDrop;

    window.addEventListener('keydown', handleKey);
    fullReset(); animFrame = requestAnimationFrame(gameLoop);

    return () => { isMounted = false; window.removeEventListener('keydown', handleKey); cancelAnimationFrame(animFrame); };
  }, []);

  return (
    <div className="game-container theme-tetris">
      <div className="game-wrapper">
        <aside className="game-info">
          <div className="header-row">
            <button onClick={onBack} className="back-btn" title="Back to Menu"><i className="fas fa-arrow-left"></i></button>
            <div className="logo-area"><h1>TETRIS<span>neo</span></h1></div>
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
              <p><i className="fas fa-arrow-left"></i> <i className="fas fa-arrow-right"></i> Move</p>
              <p><i className="fas fa-bolt"></i> Enter → Flash Drop</p>
              <p><i className="fas fa-play"></i> Space → Play / Pause</p>
            </div>
            <div className="status-area"><div className="status-led" id="statusLed"></div><span id="statusMessage">READY</span></div>
          </div>
        </aside>

        <div className="main-play-area">
          <div className="canvas-stage"><canvas id="tetrisCanvas" width="360" height="600"></canvas></div>
          <div className="mobile-gamepad">
            <div className="d-pad">
              <button className="m-btn" id="mLeft"><i className="fas fa-arrow-left"></i></button>
              <button className="m-btn" id="mDown"><i className="fas fa-arrow-down"></i></button>
              <button className="m-btn" id="mRight"><i className="fas fa-arrow-right"></i></button>
            </div>
            <div className="action-pad">
              <button className="m-btn" id="mRotate"><i className="fas fa-rotate-right"></i></button>
              <button className="m-btn drop-btn" id="mDrop"><i className="fas fa-bolt"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}