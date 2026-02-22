// ----------------------
// Notes for tiers
// ----------------------
const tier1TrebleNotes = ["C4","D4","E4","F4","G4","A4","B4"];
const tier1BassNotes   = ["C3","D3","E3","F3","G3","A3","B3"];
const tier2TrebleNotes = ["E4","F4","G4","A4","B4","C5","D5","F5"];
const tier2BassNotes   = ["G2","A2","B2","C3","D3","E3","F3","A3"];
const tier4Sharps = ["F#4","C#5","G#4"];
const tier5Flats  = ["Bb3","Eb4","Ab4"];

// ----------------------
// Global state
// ----------------------
let currentNote = "";
let tier = 1;
let correctCount = 0;
const totalNotes = 10;
let waitingForNote = false;

// DOM elements
const noteDisplay = document.getElementById("noteDisplay");
const feedbackDisplay = document.getElementById("feedbackDisplay");
const progressDisplay = document.getElementById("progress");
const tierSelect = document.getElementById("tierSelect");
const startBtn = document.getElementById("startBtn");

// ----------------------
// Start level
// ----------------------
startBtn.addEventListener("click", () => {
    // Resume AudioContext if suspended
    if(audioContext && audioContext.state === 'suspended'){
        audioContext.resume();
    }

    tier = parseInt(tierSelect.value);
    correctCount = 0;
    progressDisplay.innerText = `Progress: ${correctCount}/${totalNotes}`;
    pickRandomNote(tier);
});

// ----------------------
// Keyboard input mapping
// ----------------------
const keyMap = {
  "a":"C4","s":"D4","d":"E4","f":"F4","g":"G4","h":"A4","j":"B4",
  "q":"C3","w":"D3","e":"E3","r":"F3","t":"G3","y":"A3","u":"B3"
};

document.addEventListener("keydown",(e)=>{
    if(waitingForNote){
        const pressedNote = keyMap[e.key.toLowerCase()];
        if(pressedNote) checkAnswer(pressedNote);
    }
});

// ----------------------
// Random note picker
// ----------------------
function pickRandomNote(tier) {
    waitingForNote = true;
    feedbackDisplay.innerText = "";

    if(tier === 1){
        // Tier 1: Clef label only, no staff
        let clefType, noteOptions;
        if(Math.random() < 0.5){
            clefType = "Treble";
            noteOptions = tier1TrebleNotes;
        } else {
            clefType = "Bass";
            noteOptions = tier1BassNotes;
        }
        currentNote = noteOptions[Math.floor(Math.random()*noteOptions.length)];

        noteDisplay.innerHTML = `
            <div style="font-size:24px; margin-bottom:10px">
                ${clefType} Clef: 🎵 Play ${currentNote}
            </div>
        `;
    }
    else if(tier === 2){
        const allNotes = [...tier2TrebleNotes, ...tier2BassNotes];
        currentNote = allNotes[Math.floor(Math.random()*allNotes.length)];
        showStaffNote(currentNote);
    }
    else if(tier === 4){
        currentNote = tier4Sharps[Math.floor(Math.random()*tier4Sharps.length)];
        showStaffNote(currentNote,true);
    }
    else if(tier === 5){
        currentNote = tier5Flats[Math.floor(Math.random()*tier5Flats.length)];
        showStaffNote(currentNote,true);
    }
}

// ----------------------
// Note positions on staff
// ----------------------
const notePositions = {
    "E4":80,"F4":75,"G4":70,"A4":65,"B4":60,"C5":55,"D5":50,"F5":45,
    "G2":140,"A2":135,"B2":130,"C3":125,"D3":120,"E3":115,"F3":110,"A3":105,
    "F#4":75,"C#5":55,"G#4":70,"Bb3":130,"Eb4":70,"Ab4":60
};

// ----------------------
// Show staff + note (Tier 2–5)
// ----------------------
function showStaffNote(note, hasAccidental=false){
    const y = notePositions[note] || 80;
    const isTreble = tier2TrebleNotes.includes(note) || tier4Sharps.includes(note) || ["Eb4","Ab4"].includes(note);

    let accidentalSymbol = "";
    if(hasAccidental){
        if(note.includes("#")) accidentalSymbol = "#";
        if(note.includes("b")) accidentalSymbol = "♭";
    }

    noteDisplay.innerHTML = `
      <svg width="100%" height="150" viewBox="0 0 250 150" preserveAspectRatio="xMidYMid meet">
        <!-- Staff lines -->
        <line x1="20" y1="50" x2="230" y2="50" stroke="black" stroke-width="1"/>
        <line x1="20" y1="60" x2="230" y2="60" stroke="black" stroke-width="1"/>
        <line x1="20" y1="70" x2="230" y2="70" stroke="black" stroke-width="1"/>
        <line x1="20" y1="80" x2="230" y2="80" stroke="black" stroke-width="1"/>
        <line x1="20" y1="90" x2="230" y2="90" stroke="black" stroke-width="1"/>
        
        <!-- Clef -->
        <g transform="translate(10,0) scale(1.2)">
            ${isTreble ? drawTrebleClefSVG() : drawBassClefSVG()}
        </g>

        <!-- Note head -->
        <ellipse cx="140" cy="${y}" rx="7" ry="5" fill="black"/>
        ${accidentalSymbol ? `<text x="125" y="${y+5}" font-size="18" fill="black">${accidentalSymbol}</text>` : ""}
      </svg>
    `;
}

// ----------------------
// Treble and Bass Clefs (accurate graphics)
// ----------------------
function drawTrebleClefSVG() {
    return `
    <path d="
        M35,95
        C30,65 50,65 50,95
        C50,125 20,115 35,95
        C45,75 55,85 50,105
    " stroke="black" stroke-width="2" fill="none"/>
    `;
}

function drawBassClefSVG() {
    return `
    <path d="M40,70 C30,60 30,90 40,80" stroke="black" stroke-width="2" fill="none"/>
    <circle cx="45" cy="65" r="2" fill="black"/>
    <circle cx="45" cy="75" r="2" fill="black"/>
    `;
}

// ----------------------
// Check answer
// ----------------------
function checkAnswer(detectedNote){
    if(detectedNote === currentNote){
        feedbackDisplay.innerText = "✅ Correct!";
        correctCount++;
        progressDisplay.innerText = `Progress: ${correctCount}/${totalNotes}`;
        waitingForNote = false;
        if(correctCount < totalNotes){
            setTimeout(()=>pickRandomNote(tier),1000);
        } else {
            feedbackDisplay.innerText = "🎉 Level Complete!";
        }
    } else {
        feedbackDisplay.innerText = "❌ Incorrect! Try again";
    }
}

// ----------------------
// MICROPHONE INPUT
// ----------------------
let audioContext, analyser, mediaStreamSource;

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
      audioContext = new AudioContext();
      mediaStreamSource = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      mediaStreamSource.connect(analyser);
      analyser.fftSize = 2048;
      detectPitch();
  })
  .catch(err => console.log("Microphone access denied:", err));

function detectPitch(){
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);

    function update(){
        analyser.getFloatTimeDomainData(dataArray);
        const pitch = autoCorrelate(dataArray, audioContext.sampleRate);
        if(waitingForNote && pitch){
            const detectedNote = frequencyToNote(pitch);
            checkAnswer(detectedNote);
        }
        requestAnimationFrame(update);
    }
    update();
}

// Convert frequency to note name
function frequencyToNote(freq){
    const noteStrings = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    const noteNum = 12 * (Math.log2(freq/440)) + 69;
    const rounded = Math.round(noteNum);
    const octave = Math.floor(rounded / 12) - 1;
    const noteName = noteStrings[rounded % 12];
    return noteName + octave;
}

// Autocorrelation function
function autoCorrelate(buf, sampleRate){
    let SIZE = buf.length;
    let rms = 0;
    for (let i=0;i<SIZE;i++){ let val = buf[i]; rms += val*val; }
    rms = Math.sqrt(rms/SIZE);
    if(rms<0.005) return null; // lowered threshold for quieter piano sounds

    let r1=0, r2=SIZE-1, thres=0.2;
    for(let i=0;i<SIZE/2;i++){ if(Math.abs(buf[i])<thres){ r1=i; break; } }
    for(let i=1;i<SIZE/2;i++){ if(Math.abs(buf[SIZE-i])<thres){ r2=SIZE-i; break; } }
    buf = buf.slice(r1,r2);
    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);
    for(let i=0;i<SIZE;i++)
        for(let j=0;j<SIZE-i;j++)
            c[i] = c[i]+buf[j]*buf[j+i];

    let d=0; while(c[d]>c[d+1]) d++;
    let maxval=-1, maxpos=-1;
    for(let i=d;i<SIZE;i++){ if(c[i]>maxval){ maxval=c[i]; maxpos=i; } }
    let T0 = maxpos;
    return sampleRate/T0;
}