// Dyadic rational number representation
export interface DyadicNumber {
  numerator: number;  // Can be negative
  denominator: number; // Always a power of 2
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
  optimalMove: string | null; // edge id or null if losing
  winning: boolean;
}

// Simplify a dyadic number
function simplifyDyadic(d: DyadicNumber): DyadicNumber {
  if (d.numerator === 0) return { numerator: 0, denominator: 1 };
  
  // Reduce by common factors of 2
  let num = d.numerator;
  let den = d.denominator;
  
  while (num % 2 === 0 && den > 1) {
    num /= 2;
    den /= 2;
  }
  
  return { numerator: num, denominator: den };
}

// Compare two dyadic numbers
function compareDyadic(a: DyadicNumber, b: DyadicNumber): number {
  // Convert to common denominator
  const maxDen = Math.max(a.denominator, b.denominator);
  const aNum = a.numerator * (maxDen / a.denominator);
  const bNum = b.numerator * (maxDen / b.denominator);
  
  if (aNum > bNum) return 1;
  if (aNum < bNum) return -1;
  return 0;
}

// Add two dyadic numbers
function addDyadic(a: DyadicNumber, b: DyadicNumber): DyadicNumber {
  const maxDen = Math.max(a.denominator, b.denominator);
  const aNum = a.numerator * (maxDen / a.denominator);
  const bNum = b.numerator * (maxDen / b.denominator);
  
  return simplifyDyadic({
    numerator: aNum + bNum,
    denominator: maxDen
  });
}

// Compute distance from each vertex to ground using BFS
function computeDistances(position: HackenbushPosition): Map<string, number> {
  const distances = new Map<string, number>();
  distances.set('ground', 0);
  
  const queue: string[] = ['ground'];
  const activeEdges = position.edges.filter(e => e.active);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = distances.get(current)!;
    
    // Find all neighbors
    for (const edge of activeEdges) {
      let neighbor: string | null = null;
      
      if (edge.from === current && !distances.has(edge.to)) {
        neighbor = edge.to;
      } else if (edge.to === current && !distances.has(edge.from)) {
        neighbor = edge.from;
      }
      
      if (neighbor) {
        distances.set(neighbor, currentDist + 1);
        queue.push(neighbor);
      }
    }
  }
  
  return distances;
}

// Calculate the value of a single edge based on its distance from ground
function edgeValue(distance: number, color: 'red' | 'blue'): DyadicNumber {
  // Blue edge at distance d has value +1/2^d
  // Red edge at distance d has value -1/2^d
  const sign = color === 'blue' ? 1 : -1;
  const denominator = Math.pow(2, distance);
  
  return { numerator: sign, denominator };
}

// Calculate the game value using the Colon Principle
function calculateGameValue(position: HackenbushPosition): DyadicNumber {
  const distances = computeDistances(position);
  let totalValue: DyadicNumber = { numerator: 0, denominator: 1 };
  
  for (const edge of position.edges) {
    if (!edge.active) continue;
    
    // Find the distance of the edge (use the endpoint farther from ground)
    const distFrom = distances.get(edge.from) ?? Infinity;
    const distTo = distances.get(edge.to) ?? Infinity;
    
    // Edge is at distance of its lower endpoint + 1
    const edgeDist = Math.min(distFrom, distTo) + 1;
    
    if (edgeDist === Infinity) continue; // Disconnected edge
    
    const value = edgeValue(edgeDist, edge.color);
    totalValue = addDyadic(totalValue, value);
  }
  
  return simplifyDyadic(totalValue);
}

// Find the optimal move for the current player
export function analyzeBlueRedHackenbush(
  position: HackenbushPosition,
  currentPlayer: 'red' | 'blue'
): GameAnalysis {
  // Calculate current position value
  const currentValue = calculateGameValue(position);
  
  console.log('Current position value:', currentValue);
  
  // Determine who is winning
  // Positive value = Blue winning
  // Negative value = Red winning
  // Zero = Next player to move loses (previous player wins)
  
  const cmp = compareDyadic(currentValue, { numerator: 0, denominator: 1 });
  
  // If value is 0, the current player (who must move) is losing
  if (cmp === 0) {
    return {
      value: currentValue,
      optimalMove: null,
      winning: false
    };
  }
  
  // If value favors current player, they're winning
  const favorsCurrent = (currentPlayer === 'blue' && cmp > 0) || 
                        (currentPlayer === 'red' && cmp < 0);
  
  if (!favorsCurrent) {
    // Current player is losing, but they still have to move
    // Find the move that gets closest to 0 (minimizes disadvantage)
    return findBestLosingMove(position, currentPlayer, currentValue);
  }
  
  // Current player is winning - find the move that maintains the win
  return findWinningMove(position, currentPlayer, currentValue);
}

function findWinningMove(
  position: HackenbushPosition,
  currentPlayer: 'red' | 'blue',
  currentValue: DyadicNumber
): GameAnalysis {
  const playerEdges = position.edges.filter(
    e => e.active && e.color === currentPlayer
  );
  
  let bestMove: string | null = null;
  let bestResultValue = currentValue;
  
  for (const edge of playerEdges) {
    // Simulate removing this edge
    const newPosition = {
      ...position,
      edges: position.edges.map(e => 
        e.id === edge.id ? { ...e, active: false } : e
      )
    };
    
    // Recalculate connected components
    newPosition.edges = removeDisconnectedEdges(newPosition);
    
    const newValue = calculateGameValue(newPosition);
    
    // After our move, opponent will move, so we want a position that's still favorable
    // For a winning move, the position should still favor us after opponent's best response
    
    // Simple heuristic: choose the move that results in the smallest absolute value
    // (closest to zero while maintaining advantage)
    const currentAbs = Math.abs(currentValue.numerator / currentValue.denominator);
    const newAbs = Math.abs(newValue.numerator / newValue.denominator);
    
    const stillWinning = (currentPlayer === 'blue' && compareDyadic(newValue, { numerator: 0, denominator: 1 }) >= 0) ||
                         (currentPlayer === 'red' && compareDyadic(newValue, { numerator: 0, denominator: 1 }) <= 0);
    
    if (stillWinning && (bestMove === null || newAbs < Math.abs(bestResultValue.numerator / bestResultValue.denominator))) {
      bestMove = edge.id;
      bestResultValue = newValue;
    }
  }
  
  return {
    value: currentValue,
    optimalMove: bestMove,
    winning: true
  };
}

function findBestLosingMove(
  position: HackenbushPosition,
  currentPlayer: 'red' | 'blue',
  currentValue: DyadicNumber
): GameAnalysis {
  const playerEdges = position.edges.filter(
    e => e.active && e.color === currentPlayer
  );
  
  // If no moves available, we lose immediately
  if (playerEdges.length === 0) {
    return {
      value: currentValue,
      optimalMove: null,
      winning: false
    };
  }
  
  // Heuristic for losing player:
  // Choose the move that gets the game value closest to 0
  // This minimizes opponent's advantage and maximizes resistance
  
  let bestMove = playerEdges[0].id;
  let bestValue: DyadicNumber | null = null;
  let bestDistance = Infinity;
  
  for (const edge of playerEdges) {
    const newPosition = {
      ...position,
      edges: position.edges.map(e => 
        e.id === edge.id ? { ...e, active: false } : e
      )
    };
    
    newPosition.edges = removeDisconnectedEdges(newPosition);
    const newValue = calculateGameValue(newPosition);
    const newDecimal = newValue.numerator / newValue.denominator;
    
    // Distance to zero (smaller is better - we want to make it harder for opponent)
    const distanceToZero = Math.abs(newDecimal);
    
    // Choose move that gets closest to zero
    if (distanceToZero < bestDistance) {
      bestDistance = distanceToZero;
      bestMove = edge.id;
      bestValue = newValue;
    }
  }
  
  console.log(`Losing player ${currentPlayer} choosing move that minimizes disadvantage`);
  if (bestValue) {
    console.log(`Best move gets value to ${formatDyadic(bestValue)} (distance to 0: ${bestDistance.toFixed(4)})`);
  }
  
  return {
    value: currentValue,
    optimalMove: bestMove, // Always returns a move if moves exist
    winning: false
  };
}

// Remove edges that are disconnected from ground after a move
function removeDisconnectedEdges(position: HackenbushPosition): Array<{
  id: string;
  from: string;
  to: string;
  color: 'red' | 'blue';
  active: boolean;
}> {
  const distances = computeDistances(position);
  
  return position.edges.map(edge => {
    if (!edge.active) return edge;
    
    const fromConnected = distances.has(edge.from);
    const toConnected = distances.has(edge.to);
    
    return {
      ...edge,
      active: fromConnected && toConnected
    };
  });
}

// Helper to convert dyadic to decimal for display
export function dyadicToDecimal(d: DyadicNumber): number {
  return d.numerator / d.denominator;
}

// Helper to format dyadic as a string
export function formatDyadic(d: DyadicNumber): string {
  if (d.numerator === 0) return "0";
  if (d.denominator === 1) return d.numerator.toString();
  return `${d.numerator}/${d.denominator}`;
}