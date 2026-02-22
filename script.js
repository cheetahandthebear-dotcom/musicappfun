const startBtn = document.getElementById('startBtn');
const noteDisplay = document.getElementById('noteDisplay');
const progressDisplay = document.getElementById('progress');
const tierSelect = document.getElementById('tierSelect');

let audioContext;
let analyser;
let dataArray;
let currentNote = null;
let tier = 1;
let totalNotes = 10;
let correctCount = 0;
let waitingForNote = false;

// Tier 1 letters
const tier1Notes = ["A","B","C","D","E","F","G"];
// Tier 2 staff notes
const tier2TrebleNotes = ["E4","F4","G4","A4","B4","C5","D5","F5"];
const tier2BassNotes   = ["G2","A2","B2","C3","D3","E3","F3","A3"];

startBtn.onclick = async () => {
    tier = parseInt(tierSelect.value);
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
        } catch(err) {
            noteDisplay.innerText = "Microphone access denied or unavailable.";
            console.error(err);
        }
    }
};

function pickRandomNote(tier) {
    waitingForNote = true;
    if(tier === 1) {
        currentNote = tier1Notes[Math.floor(Math.random()*tier1Notes.length)];
        noteDisplay.innerText = `🎵 Play: ${currentNote}`;
    } else {
        const allNotes = [...tier2TrebleNotes, ...tier2BassNotes];
        currentNote = allNotes[Math.floor(Math.random()*allNotes.length)];
        showNoteSVG(currentNote);
    }
}

// Draw note on SVG staff
function showNoteSVG(note) {
    const notePositions = {
        "E4":80, "F4":75, "G4":70, "A4":65,
        "B4":60, "C5":55, "D5":50, "F5":45,
        "G2":140, "A2":135, "B2":130, "C3":125,
        "D3":120, "E3":115, "F3":110, "A3":105
    };
    const y = notePositions[note] || 80;

    noteDisplay.innerHTML = `
      <svg width="200" height="150">
        <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="1"/>
        <line x1="10" y1="60" x2="190" y2="60" stroke="black" stroke-width="1"/>
        <line x1="10" y1="70" x2="190" y2="70" stroke="black" stroke-width="1"/>
        <line x1="10" y1="80" x2="190" y2="80" stroke="black" stroke-width="1"/>
        <line x1="10" y1="90" x2="190" y2="90" stroke="black" stroke-width="1"/>
        <ellipse cx="100" cy="${y}" rx="7" ry="5" fill="black"/>
      </svg>
    `;
}

// Pitch detection loop (simulated)
function detectPitch() {
    analyser.getFloatTimeDomainData(dataArray);
    let max = 0;
    for(let i=0;i<dataArray.length;i++){
        if(Math.abs(dataArray[i])>max) max=Math.abs(dataArray[i]);
    }
    if(waitingForNote && max>0.05){
        waitingForNote = false;
        const detectedNote = simulatePianoNote();
        checkAnswer(detectedNote);
    }
    requestAnimationFrame(detectPitch);
}

// Simulate note for testing
function simulatePianoNote() {
    const allNotes = tier===1 ? tier1Notes : [...tier2TrebleNotes, ...tier2BassNotes];
    return allNotes[Math.floor(Math.random()*allNotes.length)];
}

function checkAnswer(detectedNote){
    if(detectedNote===currentNote){
        noteDisplay.innerHTML += "<div>✅ Correct!</div>";
        correctCount++;
        progressDisplay.innerText=`Progress: ${correctCount}/${totalNotes}`;
        if(correctCount<totalNotes){
            setTimeout(()=>pickRandomNote(tier),1000);
        } else {
            noteDisplay.innerHTML += "<div>🎉 Level Complete!</div>";
        }
    } else {
        noteDisplay.innerHTML += `<div>❌ Incorrect! Try again (${currentNote})</div>`;
        waitingForNote = true;
    }
}