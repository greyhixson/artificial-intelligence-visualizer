const tiles = []

function resetGridworld() {
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 4; j++) {
            if(i === 1 && j === 1) {
                tiles[i][j] = 'Wall';
            } else {
                tiles[i][j] = '0.00';
            }
        }
    }
    updateTileVales();
    console.log(tiles);
}

function policyIteration() {
}

function valueIteration() {
    const tileCopy = JSON.parse(JSON.stringify(tiles));
    for(let i = 0; i < 100; i ++) {
        if(i === 1) {
            tileCopy[2][3] = '1.00'
            tileCopy[1][3] = '-1.00';
            updateTileVales(tileCopy);
        }
    }

    console.log(tileCopy)

}
