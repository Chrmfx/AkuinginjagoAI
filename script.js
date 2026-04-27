const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player
let player = {
  x: 50,
  y: 200,
  width: 30,
  height: 30,
  dy: 0,
  gravity: 0.6,
  jumpPower: -10,
  grounded: true
};

// Ground + gap
let groundY = 230;
let gapStart = 300;
let gapWidth = 120;

// Audio setup
let audioContext, analyser, microphone, dataArray;

async function initMic() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  microphone = audioContext.createMediaStreamSource(stream);

  microphone.connect(analyser);
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function getVolume() {
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  return sum / dataArray.length;
}

// Game loop
function update() {
  requestAnimationFrame(update);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = "green";
  ctx.fillRect(0, groundY, gapStart, 70);
  ctx.fillRect(gapStart + gapWidth, groundY, canvas.width, 70);

  // Volume detection
  let volume = getVolume();

  if (volume > 40 && player.grounded) {
    player.dy = player.jumpPower - (volume / 20); // louder = higher jump
    player.grounded = false;
  }

  // Physics
  player.dy += player.gravity;
  player.y += player.dy;

  // Ground collision
  if (
    player.y + player.height >= groundY &&
    (player.x < gapStart || player.x > gapStart + gapWidth)
  ) {
    player.y = groundY - player.height;
    player.dy = 0;
    player.grounded = true;
  }

  // Fall into gap
  if (
    player.x > gapStart &&
    player.x < gapStart + gapWidth &&
    player.y > canvas.height
  ) {
    alert("Game Over!");
    location.reload();
  }

  // Draw player
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Move forward
  gapStart -= 2;
}

// Start game after click (browser policy)
document.body.addEventListener("click", async () => {
  await initMic();
  update();
});
