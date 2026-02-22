const startBtn = document.getElementById('startBtn');
const noteDisplay = document.getElementById('noteDisplay');
const progressDisplay = document.getElementById('progress');
const themeSelect = document.getElementById('themeSelect');
const tierSelect = document.getElementById('tierSelect');

let audioContext;
let analyser;
let dataArray;
let currentNote = null;
let tier = 1;
let totalNotes = 10; // notes per level
let correctCount = 0;

// Tier Notes
const tier1Notes = ["A", "B", "C", "D", "E", "F", "G"];
const tier2Notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];

// THEME SWITCHING
themeSelect.onchange = () => {
  const theme = themeSelect.value;
  document.body.style.backgroundImage = `url(assets/themes/${theme}/background.png)`;

  if(theme === "dinosaur") startBtn.style.backgroundColor = "#8B4513";
  if(theme === "butterfly") startBtn.style.backgroundColor = "#FFB6C1";
};

// START LEVEL
startBtn.onclick = async () => {
  tier = parseInt(tierSelect.value); // 1 or 2
  correctCount = 0;
  pickRandomNote(tier);
  progressDisplay.innerText = `Progress: 0/${totalNotes}`;

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      dataArray = new Float32Array(analyser.fftSize);

      detectPitch();
    } catch (err) {
      noteDisplay.innerText = "Microphone access denied or unavailable.";
      console.error(err);
    }
  }
};

// PICK RANDOM NOTE
function pickRandomNote(tier) {
  if(tier === 1) {
    currentNote = tier1Notes[Math.floor(Math.random() * tier1Notes.length)];
  } else if(tier === 2) {
    currentNote = tier2Notes[Math.floor(Math.random() * tier2Notes.length)];
  }
  noteDisplay.innerText = `🎵 Play: ${currentNote}`;
}

// PLACEHOLDER PITCH DETECTION
function detectPitch() {
  analyser.getFloatTimeDomainData(dataArray);

  let max = 0;
  for (let i = 0; i < dataArray.length; i++) {
    if (Math.abs(dataArray[i]) > max) max = Math.abs(dataArray[i]);
  }

  if (max > 0.05) { // sound detected
    const detectedNote = simulateDetectedNote();
    checkAnswer(detectedNote);
  }

  requestAnimationFrame(detectPitch);
}

// PLACEHOLDER: simulate detected note randomly for testing
function simulateDetectedNote() {
  const allNotes = tier === 1 ? tier1Notes : tier2Notes;
  return allNotes[Math.floor(Math.random() * allNotes.length)];
}

// CHECK CORRECT/INCORRECT
function checkAnswer(detectedNote) {
  if(detectedNote === currentNote) {
    noteDisplay.innerText = `✅ Correct! (${currentNote})`;
    correctCount++;
    progressDisplay.innerText = `Progress: ${correctCount}/${totalNotes}`;

    if(correctCount < totalNotes) {
      setTimeout(() => pickRandomNote(tier), 1000);
    } else {
      noteDisplay.innerText = `🎉 Level Complete!`;
    }
  } else {
    noteDisplay.innerText = `❌ Incorrect! Try again (${currentNote})`;
  }
}