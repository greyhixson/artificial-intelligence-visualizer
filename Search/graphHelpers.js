const graph = {
    nodes: {

    },
    edges: [

    ],
};

const GraphNode = function (x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.state = 'unexplored';
    this.cost = Number.POSITIVE_INFINITY;
    this.estimatedCost = Number.POSITIVE_INFINITY;
    this.totalCost = Number.POSITIVE_INFINITY;
    this.parent = null;
    this.depth = Number.POSITIVE_INFINITY;
};

function GraphProblem(nodes, edges, initialKey, nextToExpand) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodes[initialKey].state = 'frontier';
    this.nodes[initialKey].cost = 0;
    this.nodes[initialKey].parent = null;
    this.nodes[initialKey].depth = 0;
    this.initialKey = initialKey;
    this.frontier = [initialKey];
    this.explored = [];
    //Used for BFS, DFS, UCS, etc. where it is important to show the next node which will be expanded from the graph before actually expanding it.
    this.nextToExpand = nextToExpand;
}
// Takes a node and returns a list of its adjacent nodes
GraphProblem.prototype.getAdjacent = function(nodeKey) {
    const edges = this.edges.filter((edge) => edge[0] === nodeKey || edge[1] === nodeKey);
    const adjacent = [];
    edges.forEach((edge, i) => {
        if(edges[i][0] === nodeKey) {
            adjacent.push({
                nodeKey: edges[i][1],
                cost: edges[i][2]
            });
        } else {
            adjacent.push({
                nodeKey: edges[i][0],
                cost: edges[i][2]
            })
        }
    })
    return adjacent;
}
// Check if an edge is already visited
GraphProblem.prototype.ifEdgeVisited = function(edge) {
    return this.nodes[edge[0]].state === 'explored' || this.nodes[edge[1]].state === 'explored';
}
GraphProblem.prototype.removeFromFrontier = function(nodeKey) {
    this.frontier = this.frontier.filter(function(e) {
        return e !== nodeKey;
    });
}
GraphProblem.prototype.addToFrontier = function(nodeKey) {
    this.frontier.push(nodeKey);
    this.nodes[nodeKey].state = 'frontier';
}
GraphProblem.prototype.addToExplored = function(nodeKey) {
    this.explored.push(nodeKey);
    this.nodes[nodeKey].state = 'explored';
}
GraphProblem.prototype.reset = function() {
    // Reset the nodes
    for (i in this.nodes) {
        this.nodes[i].state = 'unexplored';
        this.nodes[i].cost = Number.POSITIVE_INFINITY;
        this.nodes[i].parent = null;
        this.nodes[i].depth = Number.POSITIVE_INFINITY;
    }

    this.nodes[this.initialKey].state = 'frontier';
    this.nodes[this.initialKey].cost = 0;
    this.nodes[this.initialKey].parent = null;
    this.nodes[this.initialKey].depth = 0;

    this.frontier = [this.initialKey];
    this.explored = [];
}

function GraphAgent (problem, algo) {
    this.problem = problem;
    this.algo = algo;
}
GraphAgent.prototype.expand = function (nodeKey) {
    this.problem.removeFromFrontier(nodeKey);
    this.problem.addToExplored(nodeKey);
    let adjacent = this.problem.getAdjacent(nodeKey);
    for (let i = 0; i < adjacent.length; i++) {
        let nextNodeKey = adjacent[i].nodeKey;
        let nextNode = this.problem.nodes[nextNodeKey];
        if (nextNode.state === 'unexplored') {
            this.problem.addToFrontier(nextNodeKey);
            nextNode.cost = adjacent[i].cost + this.problem.nodes[nodeKey].cost;
            nextNode.parent = nodeKey;
            nextNode.depth = this.problem.nodes[nodeKey].depth + 1;
        }
        if (this.algo === 'ucs') {
            if (nextNode.state === 'frontier' && nextNode.cost > adjacent[i].cost + this.problem.nodes[nodeKey].cost) {
                nextNode.cost = adjacent[i].cost + this.problem.nodes[nodeKey].cost;
                nextNode.parent = nodeKey;
            }
        } else if(this.algo === 'greedy') {
            const adjacentCost = parseInt(adjacent[i].cost);
            const currentCost = parseInt(this.problem.nodes[nodeKey].cost);
            if(nextNode.state === 'explored' && currentCost > adjacentCost + nextNode.cost) {
                this.problem.nodes[nodeKey].parent = nextNodeKey;
                this.problem.nodes[nodeKey].cost = adjacentCost + nextNode.cost;
            }
        }
    }
}

// Functions used by the a-star and greedy search algorithm
function euclideanDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
}

// Update edge weight value to be the euclidean distance between each point
function reweightEdges(graph) {
    graph.edges.forEach(edge => {
        const nodeKeyA = edge[0];
        const nodeKeyB = edge[1];
        const nodeA = graph.nodes[nodeKeyA];
        const nodeB = graph.nodes[nodeKeyB];
        const pointA = [nodeA.x, nodeA.y];
        const pointB = [nodeB.x, nodeB.y];
        const distance = euclideanDistance(pointA, pointB);
        edge[2] = Math.round(distance);
    })
    return graph;
}

function getEdgeCostLocation(x1, y1, x2, y2) {
    let paddingConstant = 1
    const midx = (x1 + x2) / 2;
    const midy = (y1 + y2) / 2;
    const angle = Math.atan((x1 - x2) / (y2 - y1));
    if(angle > 0) {
        paddingConstant = 2
    }

    return {
        x: midx + (12 * paddingConstant) * Math.cos(angle),
        y: midy + (12 * paddingConstant) * Math.sin(angle)
    };
}
