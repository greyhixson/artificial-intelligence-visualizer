let state = 0;
let playing = false;
let interval = null;
let animationSpeed = 1000;
let algorithm = ''

function enableControls(selectedAlgorithm) {
    document.getElementById('pathFound').value = '';
    document.getElementById('expandedNodes').value = '';
    if(!graph.nodes['S']) {
        alert('Missing start node');
        return;
    } else if(!graph.nodes['G']) {
        alert('Missing goal node');
        return;
    }
    algorithm = selectedAlgorithm;
    // Render edge weights for the user if they selected greedy or a*
    if(!renderWeights && (algorithm.name === 'uniformCostSearch' || algorithm.name === 'greedySearch' || algorithm.name === 'aStarSearch')){
        renderEdgeWeights();
    }
    document.getElementById('controls').hidden = false;
    document.getElementById('endAlgorithm').hidden = false;
    displayState();
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

function displayState(returnPath = false) {
    if(state < 0) {
        state = 0;
    }
    document.getElementById('state').textContent = `State: ${state}`;
    if(!returnPath){
        // Keep edges alphabetized
        graph.edges.sort();
        algorithm();
    }
}

function clearAlgorithm() {
    state = 0;
    document.getElementById('controls').hidden = true;
    document.getElementById('endAlgorithm').hidden = true;
    algorithm = '';
    updateGraphNodeStyles(graph);
    updateGraphEdgeWeights(graph);
    document.getElementById('pathFound').value = '';
    document.getElementById('expandedNodes').value = '';
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
