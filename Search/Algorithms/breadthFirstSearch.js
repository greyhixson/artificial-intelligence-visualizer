const breadthFirstSearchFrontier = function (problem) {
    let frontier = problem.frontier;
    return frontier[0];
};

function breadthFirstSearch() {
    let n = state;
    const drawState = function (n) {
        const graphCopy = JSON.parse(JSON.stringify(graph))
        const graphProblem = new GraphProblem(graphCopy.nodes, graphCopy.edges, startNodeId, startNodeId);
        const graphAgent = new GraphAgent(graphProblem);
        let nextNode = breadthFirstSearchFrontier(graphProblem);
        graphProblem.nodes[nextNode].state = "next";
        while (n--) {
            if (graphProblem.frontier.length > 0) {
                graphAgent.expand(nextNode);
                nextNode = breadthFirstSearchFrontier(graphProblem);
                if(graphProblem.nodes[nextNode]) {
                    graphProblem.nodes[nextNode].state = "next";
                    //If frontier is still present, find the next node to be expanded
                    if (graphProblem.frontier.length > 0) {
                        graphProblem.nextToExpand = breadthFirstSearchFrontier(graphProblem);
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
    };
    drawState(n);
}
