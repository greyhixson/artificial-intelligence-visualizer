let state = 0;
let playing = false;
let interval = null;
let animationSpeed = 1000;
let iterationType = ''

function enableControls(selectedAlgorithm) {
    iterationType = selectedAlgorithm;
    // Render edge weights for the user if they selected greedy or a*
    document.getElementById('controls').hidden = false;
    displayState();
}


function displayState() {
    if(state < 0) {
        state = 0;
    }
    document.getElementById('state').textContent = `State: ${state}`;
    iterationType();
}

function nextState() {
    state++;
    displayState();
}

function previousState() {
    if(state > 0){
        state--;
    }
    displayState();
}

function playPause() {
    playing = !playing;
    if(playing) {
        interval = setInterval(function(){
            state++;
            displayState();
        }, animationSpeed);
    } else if(!playing) {
        clearInterval(interval);
    }
}

function updateAnimationSpeed() {
    const slider = document.getElementById('animationSlider');
    animationSpeed = slider.value;
    if(interval) {
        clearInterval(interval);
    }
    if(playing) {
        interval = setInterval(function(){
            state++;
            displayState();
        }, animationSpeed);
    } else if(!playing) {
        clearInterval(interval);
    }
}
