const tier1Notes = ["A","B","C","D","E","F","G"];
const tier2TrebleNotes = ["E4","F4","G4","A4","B4","C5","D5","F5"];
const tier2BassNotes = ["G2","A2","B2","C3","D3","E3","F3","A3"];
const tier4Sharps = ["F#4","C#5","G#4"];
const tier5Flats = ["Bb3","Eb4","Ab4"];

let currentNote = "";
let tier = 1;
let correctCount = 0;
let totalNotes = 10;
let waitingForNote = false;

const noteDisplay = document.getElementById("noteDisplay");
const feedbackDisplay = document.getElementById("feedbackDisplay");
const progressDisplay = document.getElementById("progress");
const tierSelect = document.getElementById("tierSelect");
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {
    tier = parseInt(tierSelect.value);
    correctCount = 0;
    progressDisplay.innerText = `Progress: ${correctCount}/${totalNotes}`;
    pickRandomNote(tier);
});

function pickRandomNote(tier) {
    waitingForNote = true;
    feedbackDisplay.innerText = "";

    if(tier === 1){
        currentNote = tier1Notes[Math.floor(Math.random()*tier1Notes.length)];
        noteDisplay.innerText = `🎵 Play: ${currentNote}`;
    } else if(tier === 2){
        const allNotes = [...tier2TrebleNotes, ...tier2BassNotes];
        currentNote = allNotes[Math.floor(Math.random()*allNotes.length)];
        showNoteSVG(currentNote);
    } else if(tier === 4){
        currentNote = tier4Sharps[Math.floor(Math.random()*tier4Sharps.length)];
        showNoteSVG(currentNote, true);
    } else if(tier === 5){
        currentNote = tier5Flats[Math.floor(Math.random()*tier5Flats.length)];
        showNoteSVG(currentNote, true);
    }
}

function showNoteSVG(note, hasAccidental=false) {
    const notePositions = {
        "E4":80,"F4":75,"F#4":75,"G4":70,"G#4":70,"A4":65,"B4":60,"C5":55,"C#5":55,"D5":50,"F5":45,
        "G2":140,"A2":135,"B2":130,"C3":125,"D3":120,"E3":115,"F3":110,"A3":105,
        "Bb3":130,"Eb4":70,"Ab4":60
    };
    const y = notePositions[note] || 80;

    const isTreble = tier2TrebleNotes.includes(note) || tier4Sharps.includes(note) || ["Eb4","Ab4"].includes(note);

    let accidentalSymbol = "";
    if(hasAccidental){
        if(note.includes("#")) accidentalSymbol = "#";
        if(note.includes("b")) accidentalSymbol = "♭";
    }

    noteDisplay.innerHTML = `
      <svg width="100%" height="150">
        <line x1="40" y1="50" x2="210" y2="50" stroke="black" stroke-width="1"/>
        <line x1="40" y1="60" x2="210" y2="60" stroke="black" stroke-width="1"/>
        <line x1="40" y1="70" x2="210" y2="70" stroke="black" stroke-width="1"/>
        <line x1="40" y1="80" x2="210" y2="80" stroke="black" stroke-width="1"/>
        <line x1="40" y1="90" x2="210" y2="90" stroke="black" stroke-width="1"/>

        ${isTreble ? drawTrebleClefSVG() : drawBassClefSVG()}

        <ellipse cx="140" cy="${y}" rx="7" ry="5" fill="black"/>
        ${accidentalSymbol ? `<text x="125" y="${y+5}" font-size="18" fill="black">${accidentalSymbol}</text>` : ""}
      </svg>
    `;
}

function drawTrebleClefSVG(){
    return `<path d="M20,90 C20,60 40,60 40,90 S20,130 20,90" stroke="black" stroke-width="2" fill="none"/>`;
}

function drawBassClefSVG(){
    return `<circle cx="30" cy="70" r="3" fill="black"/>
            <circle cx="30" cy="80" r="3" fill="black"/>
            <circle cx="30" cy="90" r="3" fill="black"/>
            <line x1="35" y1="60" x2="35" y2="100" stroke="black" stroke-width="2"/>`;
}

document.addEventListener("keydown", (e) => {
    if(waitingForNote){
        const keyMap = {"a":"A","b":"B","c":"C","d":"D","e":"E","f":"F","g":"G"};
        const pressedNote = keyMap[e.key.toLowerCase()];
        if(pressedNote) checkAnswer(pressedNote);
    }
});

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