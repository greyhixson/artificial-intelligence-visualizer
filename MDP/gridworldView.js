const width = 100;
const height = 100;
let canvas = null;

window.onload = function() {
    canvas = SVG()
        .addTo('#canvas')
        .size(window.innerWidth, window.innerHeight-10)
        .viewbox(0, 0, window.innerWidth, window.innerHeight - 10);
    createGrid();
    const playPause = document.querySelector('.playPause');
    playPause.addEventListener('click', (e) => {
        e.target.classList.toggle('pause');
    })
}

function createGrid() {
    for(let i = 0; i < 3; i++) {
        tiles.push([]);
        for(let j = 0; j < 4; j++) {
            const tileGroup = canvas.group().attr({
                id: `Tile-${i}${j}`,
            });

            const tile = tileGroup.rect(width, height).attr({
                fill: 'white',
                stroke: 'black',
                'stroke-width': 3,
                x: (window.innerWidth / 2.5) + j * width,
                y: window.innerHeight / 2 - i * height,
            });

            // Draw the wall and the text
            if(j === 1 && i === 1) {
                tile.fill('lightgray')
                tiles[i].push('Wall');
            } else {
                tileGroup.text('0.00').attr({
                    x: (window.innerWidth / 2.5) + j * width + (width / 2),
                    y: window.innerHeight / 2 - i * height + (height / 3.25),
                }).font({
                    family:   'Helvetica',
                    size:     20,
                    anchor:   'middle',
                })
                tiles[i].push('0.00');
            }
        }
    }
}

function updateTileVales(tileCopy) {
    tileCopy.forEach((tileArr, i) =>{
        tileArr.forEach((tileVal, j) => {
            const tile = canvas.findOne(`#Tile-${i}${j}`);
            const tileText = tile.find('text');
            tileText.text(tileVal);
            if(tileVal === '1.00') {
                const rect = tile.find('rect')
                rect.fill('LightGreen');
            } else if(tileVal === '-1.00') {
                const rect = tile.find('rect')
                rect.fill('Salmon');
            }
        })
    })
}
