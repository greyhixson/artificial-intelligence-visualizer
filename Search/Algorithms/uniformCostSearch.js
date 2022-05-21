// Code for Uniform Cost Search
const uniformCostSearchFrontier = function (problem) {
    const frontier = problem.frontier;
    let minNode = frontier[0];
    let minCost = Number.POSITIVE_INFINITY;
    for (let i = 0; i < frontier.length; i++) {
        if (problem.nodes[frontier[i]].cost < minCost) {
            minCost = problem.nodes[frontier[i]].cost;
            minNode = frontier[i];
        }
    }
    return minNode;
};

//Calculate the costs of the default graph and return a dictionary with the costs of all the nodes
const precomputedCosts = function () {
    const graphCopy = JSON.parse(JSON.stringify(graph))
    const problem = new GraphProblem(graphCopy.nodes, graphCopy.edges, 'S', 'S');
    const agent = new GraphAgent(problem);
    while (problem.frontier.length > 0) {
        let next = uniformCostSearchFrontier(problem);
        agent.expand(next);
    }
    const costMap = {};
    for (let key in problem.nodes) {
        let node = problem.nodes[key];
        costMap[key] = node.cost;
    }
    return costMap;
};

function uniformCostSearch() {
    let n = state;
    const costMap = precomputedCosts();
    const drawState = function (n) {
        let graphCopy = JSON.parse(JSON.stringify(graph))
        const graphProblem = new GraphProblem(graphCopy.nodes, graphCopy.edges, 'S', 'S');
        const graphAgent = new GraphAgent(graphProblem);
        for (let key in graphProblem.nodes) {
            graphProblem.nodes[key].text = costMap[graphProblem.nodes[key].id];
        }

        let maxCost;
        let nextNode = uniformCostSearchFrontier(graphProblem);
        graphProblem.nodes[nextNode].state = "next";

        while (n--) {
            if (graphProblem.frontier.length > 0) {
                graphAgent.expand(nextNode);
                nextNode = uniformCostSearchFrontier(graphProblem);
                if(graphProblem.nodes[nextNode]) {
                    graphProblem.nodes[nextNode].state = "next";
                    //If frontier is still present, find the next node to be expanded
                    if (graphProblem.frontier.length > 0) {
                        graphProblem.nextToExpand = uniformCostSearchFrontier(graphProblem);
                        maxCost = graphProblem.nodes[graphProblem.nextToExpand].cost;
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
