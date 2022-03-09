// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var pattern = [];
var progress = 0; 
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;  //must be between 0.0 and 1.0
var guessCounter = 0;
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var gameLevels = 8;
var strikes = 0;
var clockTimeSeconds = 12;
var stopCLocks = false;
var clockDelay = 0;
var clockID = null;
var tilePressed = false;
var tilePressNum = 0;

function generateRandomPattern(){
    // initialize variables
    var num = 0;
    // generate random numbers
    for (let i=0; i<gameLevels; i++){
        num = Math.ceil(Math.random()* 5); // 5 buttons 
        pattern.push(num);
    }
    console.log("New pattern:["+pattern.toString()+"]");
}


function startGame(){
    //initialize game variables
    pattern = [];
    progress = 0;
    gamePlaying = true;
    strikes = 0;
    // create new pattern
    generateRandomPattern();
    // remove previous strikes
    removeAllStrikes();
    // swap the Start and Stop buttons
    document.getElementById("startBtn").classList.add("hidden");
    document.getElementById("endBtn").classList.remove("hidden");
    playClueSequence();
    console.log("start game");
  
}

function stopGame(){
    //initialize game variables
    progress = 0;
    gamePlaying = false;
    // swap the Start and Stop buttons
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("endBtn").classList.add("hidden");
    stopClock();
    console.log("stop game");
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 525
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)


function lightButton(btn){
  console.log("Lighting Button" + btn)
  document.getElementById("gameBtn"+btn).classList.add("lit");
}
function clearButton(btn){
  document.getElementById("gameBtn"+btn).classList.remove("lit");
}

function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

function playClueSequence(){
  guessCounter = 0;
  context.resume();
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
  console.log("startclock delay="+delay)
  setTimeout(startClock, delay);
  clueHoldTime -= 100
}

function loseGame(){
  stopGame();
  alert("Game Over. You lost.");
}

function winGame(){
  stopGame();
  alert("Congrats! You won!");
}

function guess(btn){
  console.log("user guessed: " + btn);
  if(!gamePlaying){
    return;
  }
  
  // add game logic here
  if (btn != pattern[guessCounter]) {
    stopClock();
    strikes++;
    addStrike();
    alert("Strike "+strikes+"!");
    if (strikes == 3) {
        setTimeout(loseGame,500); // set a timeout to play that clue          
    } else {
        playClueSequence();
    }
  } else {
    if (guessCounter == progress) {
      if (pattern.length-1 == progress) {
        winGame();
        stopClock();
      }
      else {
        progress = progress + 1;
        console.log("Progress:"+progress)
        stopClock();
        playClueSequence();
      }      
    } 
    else {
      guessCounter = guessCounter + 1;
    }
  }
}

function addStrike(){
  document.getElementById("strike"+strikes).classList.remove("hidden");
}

function removeAllStrikes(){
  document.getElementById("strike1").classList.add("hidden");
  document.getElementById("strike2").classList.add("hidden");
  document.getElementById("strike3").classList.add("hidden");
  
}

function printClockTime(){
  var s = document.getElementById("clockTimer").innerHTML
  if (s === "10s"){
    s = "9s"
  } else if (s === "9s"){
    s = "8s"
  } else if (s === "8s"){
    s = "7s"
  } else if (s === "7s"){
    s = "6s"
  } else if (s === "6s"){
    s = "5s"
  } else if (s === "5s"){
    s = "4s"
  } else if (s === "4s"){
    s = "3s"
  } else if (s === "3s"){
    s = "2s"
  } else if (s === "2s"){
    s = "1s"
  } else if (s === "1s"){
    s = "0s"
  } else if (s === "0s"){
    stopClock();
    strikes++;
    addStrike();
    alert("Strike "+strikes+"!");
    if (strikes == 3) {
        setTimeout(loseGame,500); // set a timeout to play that clue          
    } else {
        playClueSequence();    
    }
  } else {
    s = "10s"    
  }
  document.getElementById("clockTimer").innerHTML = s;
}

function startClock(){
  stopCLocks = false;
  document.getElementById("clockTimer").classList.remove("hidden");
  document.getElementById("clockTimer").innerHTML = "Clock";
  clockID = setInterval(printClockTime, 1000);
  console.log("start clock");  
}

function stopClock(){
  stopCLocks = true;
  document.getElementById("clockTimer").classList.add("hidden");
  clearInterval(clockID);
  document.getElementById("clockTimer").innerHTML = "Clock";
  clockID = null;
  console.log("stop clock");
}

function keyPress(event){
  var key = event.key;
  if (key == "a" ||key == "A"){
    guess(1);
  }
  if (key == "s" ||key == "S"){
    guess(2);
  }
  if (key == "d" ||key == "D"){
    guess(3);
  }
  if (key == "k" ||key == "K"){
    guess(4);
  }
  if (key == "l" ||key == "L"){
    guess(5);
  }
}

function keyStartTone(event){
  var key = event.key;
  if (key == "a" ||key == "A"){
    startTone(1);
    tilePressed = true;
    lightButton(1);
    tilePressNum = 1;
  }
  if (key == "s" ||key == "S"){
    startTone(2);
    tilePressed = true;
    lightButton(2);
    tilePressNum = 2;
  }
  if (key == "d" ||key == "D"){
    startTone(3);
    tilePressed = true;
    lightButton(3);
    tilePressNum = 3;
  }
  if (key == "k" ||key == "K"){
    startTone(4);
    tilePressed = true;
    lightButton(4);
    tilePressNum = 4;
  }
  if (key == "l" ||key == "L"){
    startTone(5);
    tilePressed = true;
    lightButton(5);  
    tilePressNum = 5;
  }
}

function keyEndTone(){
  if (tilePressed == true){
    stopTone();
    clearButton(tilePressNum);
    tilePressNum = 0;
  }
  
}