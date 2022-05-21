// Used for finding a goal node;

const findShortestPath = function () {
    const goal = 'G'
    let shortenedAlgorithm = ''
    let nextNodeFunction = '';

    if(algorithm === aStarSearch) {
        return aStarSearchFindShortestPath();
    }

    // Get the correct frontier algorithm
    switch(algorithm) {
        case breadthFirstSearch: nextNodeFunction = breadthFirstSearchFrontier; break;
        case depthFirstSearch: nextNodeFunction = depthFirstSearchFrontier; break;
        case uniformCostSearch: nextNodeFunction = uniformCostSearchFrontier; shortenedAlgorithm = 'ucs'; break;
        case greedySearch: nextNodeFunction = greedySearchFrontier; shortenedAlgorithm = 'greedy'; break;
    }

    if(typeof nextNodeFunction !== "function" ) {
        alert('No algorithm selected');
        return;
    }

    const shortestPath = {
        path: [],
        cost: 0
    };
    let expandedNodes = ''

    let graphCopy = JSON.parse(JSON.stringify(graph));
    if(shortenedAlgorithm === 'greedy') {
        graphCopy = reweightEdges(graphCopy);
        updateGraphEdgeWeights(graphCopy);
    }

    const problem = new GraphProblem(graphCopy.nodes, graphCopy.edges, 'S', null);
    //Make a new problem from the graph and solve it using the given nextNodeFunction
    const agent = new GraphAgent(problem, shortenedAlgorithm);
    while (problem.frontier.length > 0) {
        let next = nextNodeFunction(problem);
        agent.expand(next);
        expandedNodes += next + ', ';
        state ++;
        //Exit if final node reached
        if (next === goal) {
            break;
        }
    }
    shortestPath.cost = problem.nodes[goal].cost;
    let current = goal;
    //Iterate from the final to initial node using parent property to find the path
    while (current !== problem.initialKey) {
        let prev = problem.nodes[current].parent;
        let currentCost = problem.nodes[current].cost - problem.nodes[prev].cost;
        shortestPath.path.push({
            key: current,
            cost: currentCost
        });
        current = prev;
    }
    //Push the initial node to the path array
    shortestPath.path.push({
        key: problem.initialKey,
        cost: 0
    })


    let shortestPathString = ''
    shortestPath.path.forEach(node => {
        graphCopy.nodes[node.key].state = 'path';
        shortestPathString = ', ' + node.key + shortestPathString;
    })
    document.getElementById('pathFound').value = shortestPathString.substring(2);
    document.getElementById('expandedNodes').value = expandedNodes.substring(0, expandedNodes.length - 2);
    updateGraphNodeStyles(graphCopy);
    displayState(true);
    state = 0;
    return shortestPath;
};
