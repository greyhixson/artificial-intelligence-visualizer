const nodeIds = 'ABCDEFHIJKLMNOPQRTUVWXYZ'.split('');
const circleRadius = 30;
let renderWeights = false;
let selectedEdgeWeight = null;
let currentNodeLetter = 0;
let lastSelectedNode = null;
let canvas = null;
let startNodeId = 'S';
let goalNodeId = 'G';


window.onload = function() {
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            deleteSelectedNode()
        }
        if(selectedEdgeWeight) {
            updateWeightHandler(e);
        }
    });
    document.addEventListener('click', (e) => {
        if(selectedEdgeWeight) {
            saveEdgeWeight();
            e.stopPropagation();
        }
    }, true);

    const playPause = document.querySelector('.playPause');
    playPause.addEventListener('click', (e) => {
        e.target.classList.toggle('pause');
    })
    canvas = SVG()
        .addTo('#canvas')
        .size(window.innerWidth, window.innerHeight-10)
        .viewbox(0, 0, window.innerWidth, window.innerHeight - 10)
        .click(drawNode);
}

function nodeOrEdgeClick(e) {
    // Prevent canvas click from executing
    e.stopPropagation();
    // Shift-clicking a node either create a goal node or set a node as the new goal node
    if(e.shiftKey) {
        const previousGoalNode = getNodeFromId(goalNodeId);
        if(previousGoalNode) {
            swapNodeType(previousGoalNode, this, 'goal');
            return;
        }
    }
    // Double selection should unselect the node (different from double click)
    if (lastSelectedNode === this) {
        unhighlightNode(this);
        return;
    }
    // Highlight the selected node
    if (this.hasClass('GraphNode')) {
        this.attr('stroke', 'blue');
    } else if (this.hasClass('GraphEdge')) {
        const line = this.find('line');
        line.attr('stroke', 'blue');
    }
    // Check if an edge can be drawn
    if (lastSelectedNode && this.hasClass('GraphNode') && lastSelectedNode.hasClass('GraphNode')){
        drawEdge(lastSelectedNode, this);
        unhighlightNode(this);
        unhighlightNode(lastSelectedNode);
        return;
    }
    //Unhighlight the previously selected node
    if(lastSelectedNode) {
        unhighlightNode(lastSelectedNode);
    }
    lastSelectedNode = this;
}

function nodeDblClick(e) {
    // Prevent canvas click from executing
    e.stopPropagation();
    const previousStartNode = getNodeFromId(startNodeId);
    if(previousStartNode) {
        swapNodeType(previousStartNode, this, 'start');
    }
}

function edgeDblClick() {
    const edgeWeight = this.findOne('text');
    edgeWeight.attr('stroke', 'blue');
    selectedEdgeWeight = edgeWeight;
}

function deleteSelectedNode() {
    if(lastSelectedNode) {
        // Remove the rendered node or edge
        lastSelectedNode.remove();
        // Node object
        if (lastSelectedNode.hasClass('GraphNode')) {
            const id = lastSelectedNode.attr('id').slice(-1);
            // Remove the node from the graph object
            delete graph.nodes[id];
            // Remove all associated edges from the graph object
            const edgesToRemove = [];
            graph.edges.forEach((edge, index) => {
                if (edge[0] === id) {
                    edgesToRemove.push(index);
                    const edgeNode = getEdgeFromId(id, edge[1]);
                    edgeNode.remove();
                } else if (edge[1] === id) {
                    edgesToRemove.push(index);
                    const edgeNode = getEdgeFromId(edge[0], id);
                    edgeNode.remove();
                }
            });
            edgesToRemove.forEach(edge => {
                graph.edges.splice(edge, 1);
            })
        // Edge object
        } else if (lastSelectedNode.hasClass('GraphEdge')) {
            const originId = lastSelectedNode.attr('id').slice(5, 6);
            const targetId = lastSelectedNode.attr('id').slice(-1);
            // Remove edge from the graph
            let edgeToRemove = null;
            graph.edges.forEach((edge, index) => {
                if (edge[0] === originId && edge[1] === targetId) {
                    edgeToRemove = index;
                }
            });
            graph.edges.splice(edgeToRemove, 1);
        }
        lastSelectedNode = null;
    }
}

function updateGraphNodeStyles(graph) {
    Object.values(graph.nodes).forEach(node  => {
        const graphNode = getNodeFromId(node.id);
        const circle = graphNode.find('circle');
        if(node.id === goalNodeId && algorithm) {
            circle.attr('stroke-width', '3');
            circle.attr('stroke', 'Indigo');
        }
        if(node.id === startNodeId && algorithm) {
            circle.attr('stroke-width', '3');
            circle.attr('stroke', 'DarkOliveGreen');
        }
        if(node.state === 'explored') {
            circle.attr('fill', 'Khaki');
        } else if (node.state === 'unexplored') {
            circle.attr('fill', 'white');
            if(node.id === startNodeId) {
                const text = graphNode.find('text');
                circle.attr('fill', 'LightGreen');
                circle.attr('stroke-width', '2');
                circle.attr('stroke', 'Black');
                text.attr('fill', 'Black')
                text.attr('stroke', 'Black');
            } else if(node.id === goalNodeId) {
                const text = graphNode.find('text');
                circle.attr('fill', 'Thistle');
                circle.attr('stroke-width', '2');
                circle.attr('stroke', 'Black');
                text.attr('fill', 'Black')
                text.attr('stroke', 'Black');
            }
        } else if (node.state === 'next') {
            circle.attr('fill', 'LightBlue');
        } else if (node.state === 'frontier') {
            circle.attr('fill', 'LightCoral');
        } else if (node.state === 'path') {
            circle.attr('fill', 'MistyRose');
            circle.attr('stroke-width', '2');
            circle.attr('stroke', 'black');
        }
    })
}

function updateGraphEdgeWeights(graph) {
    Object.values(graph.edges).forEach(edge => {
        const graphEdge = getEdgeFromId(edge[0], edge[1]);
        const weight = graphEdge.find('text');
        weight.text(edge[2].toString());
    })
}

function drawNode(e, nodeId) {
    // If the canvas is clicked with another node selected, unselect the node and return
    if(lastSelectedNode) {
        unhighlightNode(lastSelectedNode)
        return;
    }
    let id = nodeId;
    // If shift click on the canvas occurs, create a goal node
    if(e.shiftKey) {
        id = 'G';
        const previousGoalNode = getNodeFromId(goalNodeId);
        if(previousGoalNode) {
            return;
        }
    }

    if(!getNodeFromId(startNodeId)) {
        id = 'S';
    }

    // Add the node to the graph object
    const x = e.clientX;
    const y = e.clientY;
    if(!id) {
        id = nodeIds[currentNodeLetter];
        currentNodeLetter++;
    }
    graph.nodes[id] = new GraphNode(x, y, id, id);

    // Render the node to the user
    const node = canvas.group().attr({
        stroke: 'black',
    })
        .id(`Node-${id}`)
        .addClass('GraphNode')
        .click(nodeOrEdgeClick)
        .dblclick(nodeDblClick)

    node.circle(circleRadius * 2)
        .attr({
            cx: x,
            cy: y,
            fill: (id === 'S') ? 'LightGreen' : (id === 'G') ? 'Thistle' : 'white',
            'stroke-width': 2,
        });

    node.text(id)
        .attr({
            x: x,
            y: y + (circleRadius * 0.25),
        })
        .font({
            family: 'Helvetica',
            size: circleRadius * 0.75,
            anchor: 'middle',
            leading: '0em'
        });
}

function drawEdge(originNode, targetNode, edgeWeight='0') {
    const weight = edgeWeight;
    // Get target and origin node id's
    let originId = originNode.attr('id').slice(-1);
    let targetId = targetNode.attr('id').slice(-1);
    // Keep ID's in alphabetical order
    if (originId > targetId) {
        [originId, targetId] = [targetId, originId]
    }
    // Check if the edge is a duplicate
    const dupe = isDuplicateEdge(originId, targetId);

    // Add the edge to the graph object
    if(!dupe.edge) {
        graph.edges.push([originId, targetId, weight]);
    }

    if(dupe.edge && dupe.node) {
        return;
    }

    // Draw the edge
    const edge = canvas.group()
        .id(`Edge-${originId}to${targetId}`)
        .addClass('GraphEdge')
        .click(nodeOrEdgeClick)
        .dblclick(edgeDblClick)
        .back();

    edge.polyline([[originNode.cx(),
        originNode.cy()],
        [targetNode.cx(),
            targetNode.cy()]])
        .stroke({
            color: 'lightgray',
            width: 40,
            linecap: 'round',
            opacity: 0,
        });


    // Actual edge
    edge.line(originNode.cx(),
        originNode.cy(),
        targetNode.cx(),
        targetNode.cy())
        .stroke({
            color: 'black',
            width: 4,
            linecap: 'round',
        });

    // Use trigonometry to determine where to place the weight
    const {x, y} = getEdgeCostLocation(originNode.cx(), originNode.cy(), targetNode.cx(), targetNode.cy());
    edge.text(weight)
        .attr({
            x: x,
            y: y,
        })
        .font({
            family:   'Helvetica',
            size:     circleRadius * 0.7,
            anchor:   'middle',
            leading: '0em'
        });

    const weightNode = edge.find('text');


    if(renderWeights) {
        weightNode.show();
    } else if(!renderWeights) {
        weightNode.hide();
    }
}

function getNodeFromId(id) {
    return canvas.findOne(`#Node-${id}`);
}

function getEdgeFromId(originId, targetId) {
    return canvas.findOne(`#Edge-${originId}to${targetId}`);
}

function createDefaultGraph() {
    graph.nodes = {
        'S': new GraphNode(0, 100, 'S'),
        'A': new GraphNode(50, 100, 'A'),
        'B': new GraphNode(20, 150, 'B'),
        'C': new GraphNode(75, 180, 'C'),
        'D': new GraphNode(100, 100, 'D'),
        'E': new GraphNode(230, 100, 'E'),
        'F': new GraphNode(180, 160, 'F'),
        'O': new GraphNode(70, 300, 'O'),
        'H': new GraphNode(120, 240, 'H'),
        'I': new GraphNode(300, 150, 'I'),
        'J': new GraphNode(280, 250, 'J'),
        'K': new GraphNode(400, 220, 'K'),
        'L': new GraphNode(200, 280, 'L'),
        'M': new GraphNode(380, 100, 'M'),
        'N': new GraphNode(350, 300, 'N'),
        'G': new GraphNode(450, 320, 'G')
    };
    graph.edges = [
        ['A', 'S', 1],
        ['A', 'B', 3],
        ['A', 'D', 6],
        ['B', 'C', 1],
        ['C', 'D', 1],
        ['C', 'O', 5],
        ['C', 'H', 2],
        ['D', 'E', 3],
        ['D', 'F', 1],
        ['E', 'I', 5],
        ['F', 'J', 2],
        ['H', 'L', 8],
        ['I', 'J', 1],
        ['I', 'K', 1],
        ['I', 'M', 3],
        ['J', 'L', 5],
        ['J', 'N', 2],
        ['K', 'N', 2],
        ['L', 'N', 6],
        ['G', 'N', 2]
    ];

    Object.values(graph.nodes).forEach(node => {
        const x = (node.x + window.innerWidth / 8) * 2;
        const y = (node.y + window.innerHeight / 50) * 2;
        const id = node.id;
        const e = {
            clientX: x,
            clientY: y,
        }

        drawNode(e, id);
    })
    graph.edges.forEach(edge => {
        const originNode = getNodeFromId(edge[0]);
        const targetNode = getNodeFromId(edge[1]);
        drawEdge(originNode, targetNode, edge[2].toString());
    })
    currentNodeLetter = 14;
}

function renderEdgeWeights() {
    renderWeights = !renderWeights;
    graph.edges.forEach(edge => {
        const edgeNode = getEdgeFromId(edge[0], edge[1])
        if(edgeNode) {
            const weight = edgeNode.find('text');
            if(renderWeights) {
                weight.show();
            } else if(!renderWeights) {
                weight.hide();
            }
        }
    })
}

function isDuplicateEdge(originId, targetId) {
    let dupe = {
        edge: false,
        node: false,
    }

    let edgeId = `#Edge-${originId}to${targetId}`;
    const edgeExists = canvas.findOne(edgeId);
    if(edgeExists) {
        dupe.node = true;
    }
    graph.edges.forEach(edge => {
        if(edge[0] === originId && edge[1] === targetId) {
            dupe.edge = true;
        }
    });
    return dupe;
}

function unhighlightNode(node) {
    if(node.hasClass('GraphNode')) {
        node.attr('stroke', 'black');
    } else if (node.hasClass('GraphEdge')) {
        const line = node.find('line');
        line.attr('stroke', 'black');
    }
    if(lastSelectedNode === node) {
        lastSelectedNode = null;
    }
}

function updateWeightHandler(e) {
    if(isFinite(e.key)) {
        let weight = selectedEdgeWeight.text();
        if(weight === '0') {
            weight = e.key;
        } else {
            weight += e.key;
        }
        selectedEdgeWeight.text(weight);
    } else if(e.key === 'Backspace') {
        let weight = selectedEdgeWeight.text().slice(0, -1);
        if(weight === ''){
            weight = '0';
        }
        selectedEdgeWeight.text(weight);
    } else if(e.key === 'Enter') {
        saveEdgeWeight();
    }
}

function swapNodeType(previousNode, newNode, type) {
    let previousNodeId = null;
    let newNodeId = null;
    let color = null;

    if(type === 'start') {
        previousNodeId = startNodeId;
        color = 'LightGreen'
    }

    if(type === 'goal') {
        previousNodeId = goalNodeId;
        color = 'Thistle'
    }

    // Unhighlight the previous start node, and assign it the new start node's old ID
    const previousStartNodeCircle = previousNode.find('circle');
    previousStartNodeCircle.attr('fill', 'white');
    const previousStartNodeText = previousNode.find('text');
    newNodeId = newNode.attr('id').slice(-1);
    previousStartNodeText.text(newNodeId);
    previousNode.attr('id', `Node-${newNodeId}`)

    // Highlight the new start node and assign it the start node ID
    const newStartNodeCircle = newNode.find('circle');
    newStartNodeCircle.attr('fill', color)
    const newStartNodeText = newNode.find('text');
    newStartNodeText.text(previousNodeId);
    newNode.attr('id', `Node-${previousNodeId}`)

    // Update the nodes in the graph
    graph.nodes[previousNodeId].id = newNodeId;
    graph.nodes[previousNodeId].text = newNodeId;
    graph.nodes[newNodeId].id = previousNodeId;
    graph.nodes[newNodeId].text = previousNodeId;

    const temp = graph.nodes[previousNodeId];
    graph.nodes[previousNodeId] = graph.nodes[newNodeId];
    graph.nodes[newNodeId] = temp;

    // Update the edges
    graph.edges.forEach(edge => {
        let updatedOriginId = null;
        let updatedTargetId = null;
        if(edge[0] === previousNodeId) {
            updatedOriginId = newNodeId;
        } else if(edge[1] === previousNodeId) {
            updatedTargetId = newNodeId;
        }
        if(edge[0] === newNodeId) {
            updatedOriginId = previousNodeId;
        } else if(edge[1] === newNodeId) {
            updatedTargetId = previousNodeId;
        }
        const edgeNode = getEdgeFromId(edge[0], edge[1])
        if(updatedOriginId) {
            if (updatedOriginId > edge[1]) {
                [updatedOriginId, edge[1]] = [edge[1], updatedOriginId]
            }
            edge[0] = updatedOriginId;
            edgeNode.attr('id', `Edge-${updatedOriginId}to${edge[1]}`);
        }
        if(updatedTargetId) {
            if (edge[0] > updatedTargetId) {
                [edge[0], updatedTargetId] = [updatedTargetId, edge[0]]
            }
            edge[1] = updatedTargetId;
            edgeNode.attr('id', `Edge-${edge[0]}to${updatedTargetId}`);
        }
    })
}

function saveEdgeWeight() {
    selectedEdgeWeight.attr('stroke', 'clear');
    const selectedEdge = selectedEdgeWeight.parent();
    const originId = selectedEdge.attr('id').slice(5, 6);
    const targetId = selectedEdge.attr('id').slice(-1);
    graph.edges.forEach(edge => {
        if(edge[0] === originId && edge[1] === targetId) {
            edge[2] = parseInt(selectedEdgeWeight.text());
        }
    })
    selectedEdgeWeight = null;
}
