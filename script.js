const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
  x: 100,
  y: 200,
  vy: 0,
  gravity: 0.6,
  jumpPower: -10,
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

// GAME OVER SCREEN
function drawGameOver() {
  // blood effect
  ctx.fillStyle = "rgba(200,0,0,0.3)";
  for (let i = 0; i < 50; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 5, 10);
  }

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

  // increase difficulty
  speed += 0.001;
  score += 1;

  gaps.forEach(gap => gap.x -= speed);

  if (gaps[0].x + gaps[0].width < 0) {
    gaps.shift();
    gaps.push({
      x: canvas.width + Math.random() * 200,
      width: 60 + Math.random() * 60
    });
  }

  player.vy += player.gravity;
  player.y += player.vy;

  // cek jatuh ke jurang
  let onGround = false;
  gaps.forEach(gap => {
    if (player.x > gap.x && player.x < gap.x + gap.width) {
      onGround = false;
    }
  });

  if (player.y >= 200) {
    player.y = 200;
    player.vy = 0;
    player.grounded = true;
  }

  // jatuh = game over
  if (player.y > canvas.height) {
    gameOver = true;
  }

  drawGround();
  drawPlayer();
  drawScore();

  requestAnimationFrame(update);
}

// VOICE CONTROL (POWER BASED)
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

    if (volume > 30 && player.grounded) {
      // semakin besar suara → lompat makin tinggi
      let dynamicJump = - (volume / 5);
      if (dynamicJump < -20) dynamicJump = -20; // limit biar ga terlalu OP

      player.vy = dynamicJump;
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
