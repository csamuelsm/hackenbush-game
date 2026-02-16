// Dyadic rational number representation (kept for compatibility)
export interface DyadicNumber {
  numerator: number;
  denominator: number;
}

interface HackenbushPosition {
  edges: Array<{
    id: string;
    from: string;
    to: string;
    color: 'red' | 'blue';
    active: boolean;
  }>;
  vertices: Set<string>;
}

interface GameAnalysis {
  value: DyadicNumber;
  optimalMove: string | null;
  winning: boolean;
}

// Compute connected vertices using BFS
function computeConnectedVertices(position: HackenbushPosition): Set<string> {
  const connected = new Set<string>(['ground']);
  const activeEdges = position.edges.filter(e => e.active);
  
  const adjacencyList = new Map<string, Set<string>>();
  
  for (const edge of activeEdges) {
    if (!adjacencyList.has(edge.from)) {
      adjacencyList.set(edge.from, new Set());
    }
    adjacencyList.get(edge.from)!.add(edge.to);
    
    if (!adjacencyList.has(edge.to)) {
      adjacencyList.set(edge.to, new Set());
    }
    adjacencyList.get(edge.to)!.add(edge.from);
  }
  
  const queue: string[] = ['ground'];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacencyList.get(current);
    
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!connected.has(neighbor)) {
          connected.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }
  
  return connected;
}

// Remove disconnected edges after a move
function removeDisconnectedEdges(position: HackenbushPosition): HackenbushPosition {
  const connected = computeConnectedVertices(position);
  
  return {
    ...position,
    edges: position.edges.map(edge => {
      if (!edge.active) return edge;
      
      const fromConnected = connected.has(edge.from);
      const toConnected = connected.has(edge.to);
      
      return {
        ...edge,
        active: fromConnected && toConnected
      };
    })
  };
}

// Simple heuristic evaluation: count edges
// Positive = Blue advantage, Negative = Red advantage
function evaluatePosition(position: HackenbushPosition): number {
  const activeEdges = position.edges.filter(e => e.active);
  
  let blueCount = 0;
  let redCount = 0;
  
  for (const edge of activeEdges) {
    if (edge.color === 'blue') blueCount++;
    else if (edge.color === 'red') redCount++;
  }
  
  return blueCount - redCount;
}

// Check if game is over (no moves for current player)
function isGameOver(position: HackenbushPosition, player: 'red' | 'blue'): boolean {
  const activeEdges = position.edges.filter(e => e.active && e.color === player);
  return activeEdges.length === 0;
}

// Minimax with alpha-beta pruning
function minimax(
  position: HackenbushPosition,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  currentPlayer: 'red' | 'blue'
): number {
  // Base cases
  if (depth === 0) {
    return evaluatePosition(position);
  }
  
  // Check if game is over
  if (isGameOver(position, currentPlayer)) {
    // Current player has no moves - they lose
    return maximizingPlayer ? -10000 : 10000;
  }
  
  const playerEdges = position.edges.filter(
    e => e.active && e.color === currentPlayer
  );
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    
    for (const edge of playerEdges) {
      const newPosition: HackenbushPosition = {
        ...position,
        edges: position.edges.map(e => 
          e.id === edge.id ? { ...e, active: false } : e
        )
      };
      
      const cleanPosition = removeDisconnectedEdges(newPosition);
      const nextPlayer = currentPlayer === 'blue' ? 'red' : 'blue';
      
      const evaluation = minimax(cleanPosition, depth - 1, alpha, beta, false, nextPlayer);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      
      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }
    
    return maxEval;
  } else {
    let minEval = Infinity;
    
    for (const edge of playerEdges) {
      const newPosition: HackenbushPosition = {
        ...position,
        edges: position.edges.map(e => 
          e.id === edge.id ? { ...e, active: false } : e
        )
      };
      
      const cleanPosition = removeDisconnectedEdges(newPosition);
      const nextPlayer = currentPlayer === 'blue' ? 'red' : 'blue';
      
      const evaluation = minimax(cleanPosition, depth - 1, alpha, beta, true, nextPlayer);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      
      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }
    
    return minEval;
  }
}

// Find the best move using minimax
export function analyzeBlueRedHackenbush(
  position: HackenbushPosition,
  currentPlayer: 'red' | 'blue'
): GameAnalysis {
  const playerEdges = position.edges.filter(
    e => e.active && e.color === currentPlayer
  );
  
  if (playerEdges.length === 0) {
    console.log('No moves available - current player loses');
    return {
      value: { numerator: 0, denominator: 1 },
      optimalMove: null,
      winning: false
    };
  }
  
  const isMaximizing = currentPlayer === 'blue';
  const searchDepth = 8; // Adjust depth based on performance needs
  
  let bestMove = playerEdges[0].id;
  let bestValue = isMaximizing ? -Infinity : Infinity;
  
  console.log(`Finding best move for ${currentPlayer} (depth ${searchDepth})...`);
  
  for (const edge of playerEdges) {
    const newPosition: HackenbushPosition = {
      ...position,
      edges: position.edges.map(e => 
        e.id === edge.id ? { ...e, active: false } : e
      )
    };
    
    const cleanPosition = removeDisconnectedEdges(newPosition);
    const nextPlayer = currentPlayer === 'blue' ? 'red' : 'blue';
    
    const evaluation = minimax(
      cleanPosition,
      searchDepth - 1,
      -Infinity,
      Infinity,
      !isMaximizing,
      nextPlayer
    );
    
    console.log(`  Edge ${edge.id}: eval = ${evaluation}`);
    
    if (isMaximizing && evaluation > bestValue) {
      bestValue = evaluation;
      bestMove = edge.id;
    } else if (!isMaximizing && evaluation < bestValue) {
      bestValue = evaluation;
      bestMove = edge.id;
    }
  }
  
  console.log(`Best move: ${bestMove} (eval: ${bestValue})`);
  
  const currentEval = evaluatePosition(position);
  const isWinning = (currentPlayer === 'blue' && currentEval > 0) || 
                    (currentPlayer === 'red' && currentEval < 0);
  
  return {
    value: { numerator: currentEval, denominator: 1 },
    optimalMove: bestMove,
    winning: isWinning
  };
}

// Helper functions for compatibility
export function dyadicToDecimal(d: DyadicNumber): number {
  return d.numerator / d.denominator;
}

export function formatDyadic(d: DyadicNumber): string {
  if (d.numerator === 0) return "0";
  if (d.denominator === 1) return d.numerator.toString();
  
  const absNumerator = Math.abs(d.numerator);
  const sign = d.numerator < 0 ? "-" : "";
  
  if (absNumerator >= d.denominator) {
    const wholePart = Math.floor(absNumerator / d.denominator);
    const remainder = absNumerator % d.denominator;
    
    if (remainder === 0) {
      return `${sign}${wholePart}`;
    }
    
    return `${sign}${wholePart} ${remainder}/${d.denominator}`;
  }
  
  return `${sign}${absNumerator}/${d.denominator}`;
}

export function formatDyadicFancy(d: DyadicNumber): string {
  if (d.numerator === 0) return "0";
  if (d.denominator === 1) return d.numerator.toString();
  
  const absNumerator = Math.abs(d.numerator);
  const sign = d.numerator < 0 ? "−" : "";
  
  if (absNumerator >= d.denominator) {
    const wholePart = Math.floor(absNumerator / d.denominator);
    const remainder = absNumerator % d.denominator;
    
    if (remainder === 0) {
      return `${sign}${wholePart}`;
    }
    
    return `${sign}${wholePart} ${remainder}⁄${d.denominator}`;
  }
  
  return `${sign}${absNumerator}⁄${d.denominator}`;
}