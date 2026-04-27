const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
  x: 100,
  y: 200,
  vy: 0,
  gravity: 0.6,
  jumpPower: -12,
  grounded: true
};

let gaps = [
  { x: 400, width: 80 },
  { x: 700, width: 100 }
];

let speed = 3;
let score = 0;
let gameOver = false;

// DRAW PLAYER
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y - 15, 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 10);
  ctx.lineTo(player.x, player.y + 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x - 5, player.y + 10);
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + 5, player.y + 10);
  ctx.stroke();
}

// DRAW GROUND
function drawGround() {
  ctx.fillStyle = "black";
  let prevX = 0;

  gaps.forEach(gap => {
    ctx.fillRect(prevX, 220, gap.x - prevX, 80);
    prevX = gap.x + gap.width;
  });

  ctx.fillRect(prevX, 220, canvas.width - prevX, 80);
}

// DRAW SCORE
function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

// GAME OVER
function drawGameOver() {
  ctx.fillStyle = "rgba(200,0,0,0.4)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.font = "50px Arial";
  ctx.fillText("YOU ARE DEAD", 180, 150);
}

// GAME LOOP
function update() {
  if (gameOver) {
    drawGameOver();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  score++;

  // move gaps
  gaps.forEach(gap => gap.x -= speed);

  // recycle gap
  if (gaps[0].x + gaps[0].width < 0) {
    gaps.shift();
    gaps.push({
      x: canvas.width + Math.random() * 200,
      width: 60 + Math.random() * 60
    });
  }

  // gravity
  player.vy += player.gravity;
  player.y += player.vy;

  // cek apakah di atas gap
  let overGap = false;
  gaps.forEach(gap => {
    if (player.x > gap.x && player.x < gap.x + gap.width) {
      overGap = true;
    }
  });

  // kalau tidak di atas gap → ada tanah
  if (!overGap && player.y >= 200) {
    player.y = 200;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  // kalau jatuh ke bawah → game over
  if (overGap && player.y > 220) {
    gameOver = true;
  }

  drawGround();
  drawPlayer();
  drawScore();

  requestAnimationFrame(update);
}

// VOICE CONTROL (FIXED JUMP + LOWER SENSITIVITY)
navigator.mediaDevices.getUserMedia({ audio: true })
.then(stream => {
  const audioContext = new AudioContext();
  const mic = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();

  mic.connect(analyser);
  analyser.fftSize = 256;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function detectSound() {
    if (gameOver) return;

    analyser.getByteFrequencyData(dataArray);

    let volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

    // threshold dinaikkan → tidak sensitif
    if (volume > 60 && player.grounded) {
      player.vy = player.jumpPower;
      player.grounded = false;
    }

    requestAnimationFrame(detectSound);
  }

  detectSound();
})
.catch(() => {
  alert("Microphone access denied!");
});

update();
