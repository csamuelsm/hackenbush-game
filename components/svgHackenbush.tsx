'use client';

import React, { useState, useEffect, useRef } from 'react';
import { analyzeBlueRedHackenbush, formatDyadic, dyadicToDecimal, DyadicNumber } from '@/lib/hackenbush';

// Type definitions
export interface Edge {
  id: string;
  from: string;
  to: string;
  color: 'red' | 'blue' | 'green';
  active: boolean;
}

export interface GameState {
  edges: Edge[];
  currentPlayer: 'red' | 'blue';
  gameOver: boolean;
  winner: 'red' | 'blue' | null;
  // Game analysis fields
  gameValue: DyadicNumber | null;
  gameValueDecimal: number | null;
  optimalMove: string | null;
  isWinning: boolean;
}

interface SvgHackenbushProps {
  svgPath: string;
  onGameStateChange?: (state: GameState) => void;
  currentPlayer?: 'red' | 'blue';
  onPlayerChange?: (player: 'red' | 'blue') => void;
  resetTrigger?: number;
}

export default function SvgHackenbush({
  svgPath,
  onGameStateChange,
  currentPlayer: externalCurrentPlayer,
  onPlayerChange,
  resetTrigger = 0,
}: SvgHackenbushProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [edges, setEdges] = useState<Edge[]>([]);
  const [vertices, setVertices] = useState<Set<string>>(new Set());
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'blue'>('red');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'red' | 'blue' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure component only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load SVG file
  useEffect(() => {
    console.log('=== LOAD SVG EFFECT TRIGGERED ===');
    console.log('svgPath:', svgPath);
    
    const loadSvg = async () => {
      try {
        console.log('Fetching SVG from:', svgPath);
        const response = await fetch(svgPath);
        const text = await response.text();
        console.log('SVG loaded, length:', text.length);
        setSvgContent(text);
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };
    loadSvg();
  }, [svgPath]);

  // Inject SVG content only once
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;
    
    console.log('=== INJECTING SVG INTO DOM ===');
    // Only inject if container is empty
    if (containerRef.current.innerHTML === '') {
      containerRef.current.innerHTML = svgContent;
      console.log('✓ SVG injected into DOM');

      // Apply vector-effect to all SVG elements to keep stroke width consistent
      const svgContainer = containerRef.current.querySelector('svg');
      if (svgContainer) {
        const allElements = svgContainer.querySelectorAll('*');
        allElements.forEach((element) => {
          const svgElement = element as SVGElement;
          svgElement.style.vectorEffect = 'non-scaling-stroke';
        });
        console.log('✓ Applied non-scaling-stroke to all SVG elements');
      }
    } else {
      console.log('SVG already in DOM, skipping injection');
    }
  }, [svgContent]);

  // Parse SVG and extract game elements ONCE when SVG content loads
  useEffect(() => {
    console.log('=== PARSE SVG EFFECT TRIGGERED ===');
    console.log('svgContent length:', svgContent.length);
    console.log('containerRef.current:', !!containerRef.current);
    
    if (!svgContent || !containerRef.current) {
      console.log('Skipping parse - missing svgContent or containerRef');
      return;
    }

    // Wait a bit for DOM to be ready
    setTimeout(() => {
      console.log('Parse timeout fired');
      const svgContainer = containerRef.current?.querySelector('svg');
      console.log('SVG container found:', !!svgContainer);
      
      if (!svgContainer) {
        console.error('SVG container not found!');
        return;
      }

      console.log('Starting to parse SVG elements...');

      // Extract vertices
      const vertexElements = svgContainer.querySelectorAll('[id^="vertex-"]');
      console.log('Found vertex elements:', vertexElements.length);
      const vertexSet = new Set<string>();
      vertexElements.forEach((vertex) => {
        const id = vertex.id.replace('vertex-', '');
        vertexSet.add(id);
      });
      setVertices(vertexSet);
      console.log('Vertices set:', vertexSet);

      // Extract edges
      const edgeElements = svgContainer.querySelectorAll('[id^="edge-"]');
      console.log('Found edge elements:', edgeElements.length);
      const edgeList: Edge[] = [];
      
      edgeElements.forEach((edgeGroup) => {
        let id = edgeGroup.id;
        
        // Clean up Adobe Illustrator's automatic ID suffixes
        // e.g., "edge-blue-ground-02_00000124851..." -> "edge-blue-ground-02"
        id = id.replace(/_\d+_$/, ''); // Remove trailing _digits_
        id = id.replace(/_[0-9a-fA-F]{30,}_?$/, ''); // Remove long hex suffixes
        
        const parts = id.split('-');
        if (parts.length >= 4) {
          const color = parts[1] as 'red' | 'blue' | 'green';
          const from = parts[2];
          const to = parts[3];
          
          edgeList.push({
            id: edgeGroup.id, // Keep original ID for DOM queries
            from,
            to,
            color,
            active: true,
          });
        }
      });
      
      console.log('Edge list created:', edgeList);
      setEdges(edgeList);
      console.log('=== PARSE COMPLETE ===');
    }, 100);
  }, [svgContent]);

  // BFS to find all vertices connected to ground
  // This version handles multiple edges correctly by building adjacency list first
  const getConnectedVertices = (edgeList: Edge[]): Set<string> => {
    const connected = new Set<string>(['ground']);
    const activeEdges = edgeList.filter((e) => e.active);

    // Build adjacency list considering multiple edges
    // A connection exists if there's at least one active edge between vertices
    const adjacencyList = new Map<string, Set<string>>();
    
    for (const edge of activeEdges) {
      // Add edge from -> to
      if (!adjacencyList.has(edge.from)) {
        adjacencyList.set(edge.from, new Set());
      }
      adjacencyList.get(edge.from)!.add(edge.to);
      
      // Add edge to -> from (undirected graph)
      if (!adjacencyList.has(edge.to)) {
        adjacencyList.set(edge.to, new Set());
      }
      adjacencyList.get(edge.to)!.add(edge.from);
    }

    // BFS from ground using the adjacency list
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

    console.log('Connected vertices after BFS:', connected);
    return connected;
  };

  // Single click handler using event delegation
  useEffect(() => {
    console.log('=== CLICK HANDLER EFFECT TRIGGERED ===');
    console.log('containerRef.current:', !!containerRef.current);
    console.log('edges.length:', edges.length);
    console.log('currentPlayer:', currentPlayer);
    console.log('gameOver:', gameOver);
    
    if (!containerRef.current || edges.length === 0) {
      console.log('Skipping click handler setup - missing container or no edges');
      return;
    }

    const svgContainer = containerRef.current.querySelector('svg');
    console.log('SVG container found for click handler:', !!svgContainer);
    
    if (!svgContainer) {
      console.log('No SVG container, cannot setup click handler');
      return;
    }

    console.log('Setting up click and hover handlers on SVG container...');

    const handleSvgClick = (e: MouseEvent) => {
      console.log('>>> CLICK EVENT FIRED <<<');
      const target = e.target as SVGElement;
      console.log('Click target:', target.tagName, target.id);
      
      // Find the edge group this element belongs to
      let edgeGroup = target.closest('[id^="edge-"]') as SVGGElement;
      console.log('Found edge group:', edgeGroup?.id);
      
      if (!edgeGroup) {
        console.log('Click was not on an edge');
        return;
      }

      const edgeId = edgeGroup.id;
      console.log('Edge ID:', edgeId);
      console.log('Current state - edges:', edges.length, 'player:', currentPlayer, 'gameOver:', gameOver);

      if (gameOver) {
        console.log('Game over, click ignored');
        return;
      }

      const edge = edges.find(e => e.id === edgeId);
      console.log('Edge found in state:', edge);
      
      if (!edge) {
        console.log('Edge not found in state');
        return;
      }

      if (!edge.active) {
        console.log('Edge is inactive');
        return;
      }

      const isAllowed = edge.color === currentPlayer || edge.color === 'green';
      console.log(`Edge color: ${edge.color}, Current player: ${currentPlayer}, Is allowed: ${isAllowed}`);
      
      if (!isAllowed) {
        console.log(`Edge color ${edge.color} not allowed for player ${currentPlayer}`);
        return;
      }

      console.log('✓ Valid click! Processing...');

      // Make edge inactive
      const updatedEdges = edges.map((e) =>
        e.id === edgeId ? { ...e, active: false } : e
      );
      console.log('Updated edges (before BFS):', updatedEdges.filter(e => !e.active).map(e => e.id));

      // Find disconnected edges
      const connected = getConnectedVertices(updatedEdges);
      console.log('Connected vertices:', connected);
      
      const finalEdges = updatedEdges.map((e) => ({
        ...e,
        active: e.active && connected.has(e.from) && connected.has(e.to),
      }));
      console.log('Final edges (after BFS):', finalEdges.filter(e => !e.active).map(e => e.id));

      setEdges(finalEdges);
      console.log(`✓ Edge ${edgeId} removed by ${currentPlayer}`);

      // Check if opponent has any valid moves
      const nextPlayer: 'red' | 'blue' = currentPlayer === 'red' ? 'blue' : 'red';
      const opponentHasMoves = finalEdges.some(
        (e) => e.active && (e.color === nextPlayer || e.color === 'green')
      );

      if (!opponentHasMoves) {
        // Current player wins!
        console.log(`✓ ${currentPlayer.toUpperCase()} WINS! No moves left for ${nextPlayer}`);
        setGameOver(true);
        setWinner(currentPlayer);
      } else {
        // Switch to next player
        setCurrentPlayer(nextPlayer);
        console.log(`✓ Switched to ${nextPlayer}`);
      }
      
      console.log('>>> CLICK PROCESSING COMPLETE <<<');
    };

    const handleSvgMouseMove = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const edgeGroup = target.closest('[id^="edge-"]') as SVGGElement;
      
      if (!edgeGroup) return;

      const edgeId = edgeGroup.id;
      const edge = edges.find(e => e.id === edgeId);
      
      if (!edge || !edge.active || gameOver) return;
      
      const isAllowed = edge.color === currentPlayer || edge.color === 'green';
      if (!isAllowed) return;

      // Apply hover effect
      const children = edgeGroup.querySelectorAll('*');
      children.forEach((child) => {
        const svgChild = child as SVGElement;
        svgChild.setAttribute('opacity', '0.7');
        
        const currentStrokeWidth = svgChild.getAttribute('stroke-width');
        if (currentStrokeWidth) {
          if (!svgChild.hasAttribute('data-original-stroke-width')) {
            svgChild.setAttribute('data-original-stroke-width', currentStrokeWidth);
          }
          svgChild.setAttribute('stroke-width', String(Number(currentStrokeWidth) * 1.3));
        }
      });
    };

    const handleSvgMouseOut = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const edgeGroup = target.closest('[id^="edge-"]') as SVGGElement;
      
      if (!edgeGroup) return;

      const edgeId = edgeGroup.id;
      const edge = edges.find(e => e.id === edgeId);
      
      if (!edge) return;

      // Remove hover effect - restore original values
      const children = edgeGroup.querySelectorAll('*');
      children.forEach((child) => {
        const svgChild = child as SVGElement;
        
        if (edge.active) {
          svgChild.setAttribute('opacity', '1.0');
          
          const originalStrokeWidth = svgChild.getAttribute('data-original-stroke-width');
          if (originalStrokeWidth) {
            svgChild.setAttribute('stroke-width', originalStrokeWidth);
          } else {
            svgChild.setAttribute('stroke-width', '6');
          }
        }
      });
    };

    svgContainer.addEventListener('click', handleSvgClick);
    svgContainer.addEventListener('mouseover', handleSvgMouseMove);
    svgContainer.addEventListener('mouseout', handleSvgMouseOut);
    console.log('✓ Click and hover handlers attached to SVG');

    return () => {
      console.log('=== REMOVING HANDLERS ===');
      svgContainer.removeEventListener('click', handleSvgClick);
      svgContainer.removeEventListener('mouseover', handleSvgMouseMove);
      svgContainer.removeEventListener('mouseout', handleSvgMouseOut);
    };
  }, [edges, currentPlayer, gameOver]);

  // Update visual styles
  useEffect(() => {
    console.log('=== VISUAL STYLES EFFECT TRIGGERED ===');
    console.log('containerRef.current:', !!containerRef.current);
    console.log('edges.length:', edges.length);
    
    if (!containerRef.current || edges.length === 0) {
      console.log('Skipping visual update - missing container or no edges');
      return;
    }

    const svgContainer = containerRef.current.querySelector('svg');
    console.log('SVG container found for styles:', !!svgContainer);
    
    if (!svgContainer) {
      console.log('No SVG container for visual updates');
      return;
    }

    console.log('Updating visual styles for', edges.length, 'edges...');

    edges.forEach((edge) => {
      const edgeGroup = svgContainer.querySelector(`#${edge.id}`) as SVGGElement;
      if (!edgeGroup) {
        console.log('Edge group not found in DOM:', edge.id);
        return;
      }

      const children = edgeGroup.querySelectorAll('*');
      console.log(`Edge ${edge.id}: ${children.length} children, active: ${edge.active}`);
      
      // Store original values once
      children.forEach((child) => {
        const svgChild = child as SVGElement;
        if (!svgChild.hasAttribute('data-original-opacity')) {
          svgChild.setAttribute('data-original-opacity', svgChild.getAttribute('opacity') || '1');
        }
      });

      const isAllowed = edge.color === currentPlayer || edge.color === 'green';

      if (edge.active) {
        children.forEach((child) => {
          const svgChild = child as SVGElement;
          const originalOpacity = svgChild.getAttribute('data-original-opacity') || '1';
          svgChild.setAttribute('opacity', originalOpacity);
          svgChild.removeAttribute('filter');
          svgChild.style.cursor = (isAllowed && !gameOver) ? 'pointer' : 'not-allowed';
        });
      } else {
        children.forEach((child) => {
          const svgChild = child as SVGElement;
          svgChild.setAttribute('opacity', '0.2');
          svgChild.setAttribute('filter', 'grayscale(100%)');
          svgChild.style.cursor = 'not-allowed';
        });
      }
    });
    
    console.log('✓ Visual styles updated');
  }, [edges, currentPlayer, gameOver]);

  /// Analyze game position after every move and update infos
  useEffect(() => {
    console.log('=== ANALYZING GAME POSITION ===');
    
    if (edges.length === 0 || gameOver) {
      console.log('Skipping analysis - no edges or game over');

      const completeGameState: GameState = {
        edges,
        currentPlayer,
        gameOver,
        winner,
        gameValue: {numerator: 0, denominator: 0},
        gameValueDecimal: 0,
        optimalMove: null,
        isWinning: false,
      };

      if (onGameStateChange) {
        onGameStateChange(completeGameState);
      }

      return;
    }

    // Convert current state to position format for analysis
    const position = {
      edges: edges
        .filter(e => e.color === 'red' || e.color === 'blue') // Only red and blue edges
        .map(edge => ({
          id: edge.id,
          from: edge.from,
          to: edge.to,
          color: edge.color as 'red' | 'blue',
          active: edge.active
        })),
      vertices: vertices
    };

    const analysis = analyzeBlueRedHackenbush(position, currentPlayer);
    
    console.log('Game Value:', formatDyadic(analysis.value), '=', dyadicToDecimal(analysis.value));
    console.log('Current Player:', currentPlayer);
    console.log('Is Winning:', analysis.winning);
    console.log('Optimal Move:', analysis.optimalMove);
    
    // Notify parent with complete game state including analysis
    if (onGameStateChange) {
      const completeGameState: GameState = {
        edges,
        currentPlayer,
        gameOver,
        winner,
        gameValue: analysis.value,
        gameValueDecimal: dyadicToDecimal(analysis.value),
        optimalMove: analysis.optimalMove,
        isWinning: analysis.winning
      };
      
      console.log('✓ Sending complete game state to parent');
      onGameStateChange(completeGameState);
    }
    
    console.log('=== ANALYSIS COMPLETE ===');
  }, [edges, currentPlayer, gameOver, vertices, onGameStateChange]);

  // Don't render on server
  if (!mounted) {
    return (
      <div style={{
        width: '100%',
        maxWidth: 'min(95vw, 600px)',
        margin: '0 auto',
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading...
      </div>
    );
  }

  // Don't render until we have SVG content
  if (!svgContent) {
    return (
      <div style={{
        width: '100%',
        maxWidth: 'min(95vw, 600px)',
        margin: '0 auto',
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading SVG...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: 'min(85vw, 400px)',
        margin: '0 auto',
        aspectRatio: '1'
      }}
    />
  );
}