const greedySearchFrontier = function (problem) {
    const frontier = problem.frontier;
    let minNode = frontier[0];
    if(problem.explored.length === 0) {
        return minNode;
    }
    if(problem.frontier.includes('G')){
        return 'G';
    }
    let minCost = Number.POSITIVE_INFINITY;
    problem.frontier.forEach(frontierNode => {
        problem.edges.forEach(edge => {
            if(edge[0] === frontierNode && problem.explored.includes(edge[1]) || edge[1] === frontierNode && problem.explored.includes(edge[0])) {
                if(minCost > edge[2]) {
                    minCost = edge[2];
                    minNode = frontierNode;
                }
            }
        })
    })
    return minNode;
};

function greedySearch() {
    let n = state;
    const drawState = function (n) {
        let graphCopy = JSON.parse(JSON.stringify(graph))
        graphCopy = reweightEdges(graphCopy);
        updateGraphEdgeWeights(graphCopy);
        const graphProblem = new GraphProblem(graphCopy.nodes, graphCopy.edges, 'S', 'S');
        const graphAgent = new GraphAgent(graphProblem, 'greedy');
        let nextNode = greedySearchFrontier(graphProblem);
        graphProblem.nodes[nextNode].state = "next";
        while (n--) {
            if (graphProblem.frontier.length > 0) {
                graphAgent.expand(nextNode);
                nextNode = greedySearchFrontier(graphProblem);
                if(graphProblem.nodes[nextNode]) {
                    graphProblem.nodes[nextNode].state = "next";
                    //If frontier is still present, find the next node to be expanded
                    if (graphProblem.frontier.length > 0) {
                        graphProblem.nextToExpand = greedySearchFrontier(graphProblem);
                    } else {
                        graphProblem.nextToExpand = null;
                    }
                } else {
                    state = -1;
                }
            } else {
                break;
            }
        }
        updateGraphNodeStyles(graphCopy);
    }
    drawState(n);
}
