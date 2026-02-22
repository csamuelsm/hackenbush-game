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
function evaluatePosition(
  position: HackenbushPosition, 
  gameVersion: 'normal' | 'misere'): number {

  const activeEdges = position.edges.filter(e => e.active);
  
  let blueCount = 0;
  let redCount = 0;
  
  for (const edge of activeEdges) {
    if (edge.color === 'blue') blueCount++;
    else if (edge.color === 'red') redCount++;
  }

  const edgeDifference = blueCount - redCount;

  // In Misère, we want to AVOID being the last to move
  // So we invert the evaluation when total edges are low
  if (gameVersion === 'misere') {
    const totalEdges = blueCount + redCount;
    
    // When getting close to endgame, invert the evaluation
    // The player who will be forced to take the last move loses
    if (totalEdges <= 8) {
      return -edgeDifference;
    }
  }
  
  return edgeDifference;
}

// Check if game is over (no moves for current player)
function isGameOver(position: HackenbushPosition, player: 'red' | 'blue'): boolean {
  const activeEdges = position.edges.filter(e => e.active && e.color === player);
  return activeEdges.length === 0;
}

// Check if someone won in Misère mode
function checkMisereWin(
  position: HackenbushPosition, 
  lastPlayer: 'red' | 'blue'
): { gameOver: boolean; winner: 'red' | 'blue' | null } {
  const activeEdges = position.edges.filter(e => e.active);
  const blueEdges = activeEdges.filter(e => e.color === 'blue');
  const redEdges = activeEdges.filter(e => e.color === 'red');
  
  // In Misère: you WIN if you have no moves left BUT opponent still has moves
  if (blueEdges.length === 0 && redEdges.length > 0) {
    return { gameOver: true, winner: 'blue' };
  }
  
  if (redEdges.length === 0 && blueEdges.length > 0) {
    return { gameOver: true, winner: 'red' };
  }
  
  // Both have no moves = last player to move took everything
  // In Misère: last player to move LOSES
  if (blueEdges.length === 0 && redEdges.length === 0) {
    const winner = lastPlayer === 'blue' ? 'red' : 'blue';
    return { gameOver: true, winner };
  }
  
  return { gameOver: false, winner: null };
}

// Minimax with alpha-beta pruning
function minimax(
  position: HackenbushPosition,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  currentPlayer: 'red' | 'blue',
  gameVersion: 'normal' | 'misere',
  lastPlayer: 'red' | 'blue'
): number {
  // Base cases
  if (depth === 0) {
    return evaluatePosition(position, gameVersion);
  }

  // Check for Misère win conditions
  if (gameVersion === 'misere') {
    const misereCheck = checkMisereWin(position, lastPlayer);
    if (misereCheck.gameOver) {
      if (misereCheck.winner === currentPlayer) {
        return maximizingPlayer ? 10000 : -10000;
      } else {
        return maximizingPlayer ? -10000 : 10000;
      }
    }
  }

  // Check for game over in Normal mode
  if (gameVersion === 'normal') {
    const activeEdges = position.edges.filter(e => e.active);
    const blueEdges = activeEdges.filter(e => e.color === 'blue');
    const redEdges = activeEdges.filter(e => e.color === 'red');
    
    // If both players have no moves, last player to move WINS in normal
    if (blueEdges.length === 0 && redEdges.length === 0) {
      const winner = lastPlayer;  // <-- lastPlayer venceu (fez último movimento)
      if (winner === currentPlayer) {
        return maximizingPlayer ? 10000 : -10000;
      } else {
        return maximizingPlayer ? -10000 : 10000;
      }
    }
    
    // If current player has no moves but opponent still has, current player loses
    if (isGameOver(position, currentPlayer)) {
      return maximizingPlayer ? -10000 : 10000;
    }
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
      
      const evaluation = minimax(cleanPosition, depth - 1, alpha, beta, false, nextPlayer, gameVersion, currentPlayer);
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
      
      const evaluation = minimax(cleanPosition, depth - 1, alpha, beta, true, nextPlayer, gameVersion, currentPlayer);
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
  currentPlayer: 'red' | 'blue',
  gameVersion: 'normal' | 'misere'
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
      nextPlayer,
      gameVersion,
      currentPlayer
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
  
  const currentEval = evaluatePosition(position, gameVersion);
  let isWinning : boolean;

  if (gameVersion === 'misere') {
    const otherPlayer = currentPlayer === 'blue' ? 'red' : 'blue';
    const misereCheck = checkMisereWin(position, otherPlayer);
    if (misereCheck.gameOver) {
      isWinning = misereCheck.winner === currentPlayer;
    } else {
      // In misère during mid-game, having fewer edges is better
      isWinning = (currentPlayer === 'blue' && currentEval < 0) || 
                (currentPlayer === 'red' && currentEval > 0);
    }
  } else {
    isWinning = (currentPlayer === 'blue' && currentEval > 0) || 
              (currentPlayer === 'red' && currentEval < 0);
  }
  
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