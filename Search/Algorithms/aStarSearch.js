class GraphProblemAStarSearch extends GraphProblem {
    constructor(nodes, edges, initialKey, nextToExpand, goalKey) {
        super(nodes, edges, initialKey, nextToExpand);
        this.goalKey = goalKey;
    }
    isGoal(nodeKey) {
        return this.goalKey === nodeKey;
    }
    distance(nodeKeyA, nodeKeyB) {
        for (const [keyA, keyB, cost] of this.edges) {
            if (
                GraphProblemAStarSearch.isEqualNodeKeyPair(
                    nodeKeyA,
                    nodeKeyB,
                    keyA,
                    keyB
                )
            ) {
                return cost;
            }
        }
        return Number.POSITIVE_INFINITY;
    }
    estimate(nodeKey, goalKey = this.goalKey) {
        const nodeA = this.nodes[nodeKey];
        const nodeB = this.nodes[goalKey];
        const point1 = [nodeA.x, nodeA.y];
        const point2 = [nodeB.x, nodeB.y];
        const estimated = euclideanDistance(point1, point2);
        return Math.round(estimated);
    }
    getSuccessors(nodeKey) {
        return this.getAdjacent(nodeKey).map(item => this.nodes[item.nodeKey]);
    }
    reset() {
        super.reset();
        for (const node of GraphProblemAStarSearch.toArray(this.nodes)) {
            node.totalCost = 0;
        }
    }
    isQueuedNode(nodeKey) {
        return this.frontier.indexOf(nodeKey) !== -1;
    }
    isExploredNode(nodeKey) {
        return this.explored.indexOf(nodeKey) !== -1;
    }
    static isEqualNodeKeyPair(nodeKeyA1, nodeKeyB1, nodeKeyA2, nodeKeyB2) {
        return (
            (nodeKeyA1 === nodeKeyA2 && nodeKeyB1 === nodeKeyB2) ||
            (nodeKeyA1 === nodeKeyB2 && nodeKeyB1 === nodeKeyA2)
        );
    }
    static toArray(obj) {
        let stack = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                stack.push(obj[key]);
            }
        }
        return stack;
    }
}

class GraphAgentAStarSearch extends GraphAgent {
    expand(nodeKey) {
        const parentNode = this.problem.nodes[nodeKey];
        if (this.problem.isGoal(parentNode.id)) {
            return;
        }
        this.problem.removeFromFrontier(parentNode.id);
        this.problem.addToExplored(parentNode.id);

        for (const successorNode of this.problem.getSuccessors(parentNode.id)) {
            if (this.problem.isExploredNode(successorNode.id)) {
                continue;
            }
            successorNode.depth = parentNode.depth + 1;
            successorNode.parent = parentNode.id;

            // The distance from start to a successor
            const tentativeGScore =
                parentNode.cost +
                this.problem.distance(parentNode.id, successorNode.id);

            // This is not a better path
            if (tentativeGScore >= successorNode.cost) {
                continue;
            }

            // This path is the best until now. We should save it.
            successorNode.cost = tentativeGScore;
            successorNode.estimatedCost = this.problem.estimate(successorNode.id);
            successorNode.totalCost =
                successorNode.cost + successorNode.estimatedCost;
            if (!this.problem.isQueuedNode(successorNode.id)) {
                this.problem.addToFrontier(successorNode.id);
            }
        }

        // Prioritize the queue items
        this.problem.frontier.sort((keyA, keyB) => {
            return (
                this.problem.nodes[keyA].totalCost - this.problem.nodes[keyB].totalCost
            );
        });
    }

    solve(iterationsCount = Number.POSITIVE_INFINITY) {
        let k = 0;
        while (
            iterationsCount > 0 &&
            !this.problem.isGoal(this.problem.frontier[0])
            ) {
            // Expands next node
            this.expand(this.problem.frontier[0]);
            this.problem.nextToExpand = this.problem.frontier[0];
            const nextIterationNodeKey = this.problem.frontier[0];
            const nextIterationNode = this.problem.nodes[nextIterationNodeKey];
            nextIterationNode.state = "next";
            iterationsCount -= 1;
            k += 1;
        }
        return k;
    }
}

function AStarSearchRenderer() {
    this.state = {
        initialKey: "S",
        goalKey: "G",
        iterationsCount: 0,
        maxIterationsCount: Number.POSITIVE_INFINITY // should be precalculated
    };
    this.initializeProblemAndAgents();
    this.reset();
    this.render();
}

AStarSearchRenderer.prototype.initializeProblemAndAgents = function() {
    this.graphProblem = this.createGraphProblem();
    this.graphAgent = new GraphAgentAStarSearch(this.graphProblem);
};

AStarSearchRenderer.prototype.createGraphProblem = function() {
    // The default graph
    const graphCopy = JSON.parse(JSON.stringify(graph))
    const aStarGraph = reweightEdges(graphCopy);
    const graphProblem = new GraphProblemAStarSearch(
        aStarGraph.nodes,
        aStarGraph.edges,
        this.state.initialKey,
        this.state.initialKey,
        this.state.goalKey
    );
    // It should color this node as "next" one
    graphProblem.nodes[graphProblem.initialKey].state = "next";
    return graphProblem;
};

AStarSearchRenderer.prototype.reset = function() {
    this.graphProblem.reset();
    this.graphProblem.initialKey = this.state.initialKey;
    this.graphProblem.nextToExpand = this.state.initialKey;
    this.graphProblem.goalKey = this.state.goalKey;
    this.state.iterationsCount = 0;
    this.state.maxIterationsCount = this.graphAgent.solve();
    // We have to reset graphProblem because it is already solved in the line above
    this.graphProblem.reset();
    this.graphProblem.initialKey = this.state.initialKey;
    this.graphProblem.nextToExpand = this.state.initialKey;
    this.graphProblem.goalKey = this.state.goalKey;
};

AStarSearchRenderer.prototype.render = function() {
    this.graphProblem.reset();
    this.graphProblem.initialKey = this.state.initialKey;
    this.graphProblem.nextToExpand = this.state.initialKey;
    this.graphProblem.goalKey = this.state.goalKey;
    this.graphProblem.nodes[this.state.initialKey].state = "next";
    this.graphAgent.solve(this.state.iterationsCount);
}
AStarSearchRenderer.helpers = {
    exploredNodes: function(graphProblem) {
        return graphProblem.explored.map(function(nodeKey) {
            return graphProblem.nodes[nodeKey];
        });
    },
    getPathNodes: function(graphProblem) {
        const currentKey = graphProblem.frontier[0];
        let node = graphProblem.nodes[currentKey];
        const stack = [];
        while (node) {
            stack.push(node);
            const parentKey = node.parent;
            node = graphProblem.nodes[parentKey];
        }
        return stack.reverse();
    },
};

function aStarSearch() {
    const astar = new AStarSearchRenderer();
    updateGraphEdgeWeights(astar.graphProblem);
    astar.state.iterationsCount = state;
    astar.render();
    if(state > astar.state.maxIterationsCount) {
        state = 0;
        if(astar.graphProblem.isGoal(astar.graphProblem.frontier[0])) {
            astar.graphProblem.nodes[astar.graphProblem.frontier[0]].state = 'explored';
        }
    }
    updateGraphNodeStyles(astar.graphProblem);
}

function aStarSearchFindShortestPath() {
    let shortestPath = ''
    let expandedNodes = ''
    const astar = new AStarSearchRenderer();
    updateGraphEdgeWeights(astar.graphProblem);
    astar.state.iterationsCount = astar.state.maxIterationsCount;
    astar.render();
    const path = AStarSearchRenderer.helpers.getPathNodes(astar.graphProblem);
    const expanded = AStarSearchRenderer.helpers.exploredNodes(astar.graphProblem);
    Object.values(path).forEach(node => {
        shortestPath += node.id + ', ';
        astar.graphProblem.nodes[node.id].state = 'path';
    })
    Object.values(expanded).forEach(node => {
        expandedNodes += node.id + ', ';
    })
    expandedNodes += astar.state.goalKey

    document.getElementById('pathFound').value = shortestPath.substring(0, shortestPath.length - 2);
    document.getElementById('expandedNodes').value = expandedNodes.substring(0, expandedNodes.length);
    updateGraphNodeStyles(astar.graphProblem);
    state = astar.state.iterationsCount + 1;
    displayState(true);
    return null;
}
