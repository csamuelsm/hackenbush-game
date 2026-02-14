'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

// Type definitions
export interface Edge {
  id: string;
  from: string;
  to: string;
  color: 'red' | 'blue' | 'green';
  active: boolean;
  element: Element;
}

export interface GameState {
  edges: Edge[];
  currentPlayer: 'red' | 'blue';
  gameOver: boolean;
  winner: 'red' | 'blue' | null;
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
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure component only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load SVG file
  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch(svgPath);
        const text = await response.text();
        setSvgContent(text);
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };
    loadSvg();
  }, [svgPath]);

  // Parse SVG and extract game elements
  useEffect(() => {
    if (!svgContent || !svgRef.current) return;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Extract vertices
    const vertexElements = svgElement.querySelectorAll('[id^="vertex-"]');
    const vertexSet = new Set<string>();
    vertexElements.forEach((vertex) => {
      const id = vertex.id.replace('vertex-', '');
      vertexSet.add(id);
    });
    setVertices(vertexSet);

    // Extract edges
    const edgeElements = svgElement.querySelectorAll('[id^="edge-"]');
    const edgeList: Edge[] = [];
    
    edgeElements.forEach((edgeGroup) => {
      const id = edgeGroup.id;
      // Parse: edge-{color}-{from}-{to}
      const parts = id.split('-');
      if (parts.length >= 4) {
        const color = parts[1] as 'red' | 'blue' | 'green';
        const from = parts[2];
        const to = parts[3];
        
        edgeList.push({
          id,
          from,
          to,
          color,
          active: true,
          element: edgeGroup,
        });
      }
    });
    
    setEdges(edgeList);
    
    console.log('Parsed vertices:', vertexSet);
    console.log('Parsed edges:', edgeList);
  }, [svgContent]);

  // Apply CSS styles to edges based on game state
  useEffect(() => {
    if (!svgRef.current || edges.length === 0) return;

    // BFS to find all vertices connected to ground
    const getConnectedVertices = (edgeList: Edge[]): Set<string> => {
      const connected = new Set<string>(['ground']);
      const activeEdges = edgeList.filter((e) => e.active);

      let changed = true;
      while (changed) {
        changed = false;
        for (const edge of activeEdges) {
          if (connected.has(edge.from) && !connected.has(edge.to)) {
            connected.add(edge.to);
            changed = true;
          }
          if (connected.has(edge.to) && !connected.has(edge.from)) {
            connected.add(edge.from);
            changed = true;
          }
        }
      }

      return connected;
    };

    const cleanupFunctions: (() => void)[] = [];

    edges.forEach((edge) => {
      const edgeElement = svgRef.current?.querySelector(`#${edge.id}`) as HTMLElement;
      if (!edgeElement) return;

      const children = edgeElement.querySelectorAll('*');
      children.forEach((child) => {
        const element = child as SVGElement;
        
        if (edge.active) {
          // Active edge styles
          element.style.opacity = '1';
          element.style.filter = 'none';
          element.style.transition = 'all 0.3s ease';
          
          // Check if allowed for current player
          const isAllowed = edge.color === currentPlayer || edge.color === 'green';
          element.style.cursor = isAllowed && !gameOver ? 'pointer' : 'not-allowed';
        } else {
          // Inactive edge styles
          element.style.opacity = '0.3';
          element.style.filter = 'grayscale(100%)';
          element.style.cursor = 'not-allowed';
        }
      });

      // CSS hover effect using parent element
      const handleMouseEnter = () => {
        if (!edge.active || gameOver) return;
        const isAllowed = edge.color === currentPlayer || edge.color === 'green';
        if (!isAllowed) return;
        
        children.forEach((child) => {
          const element = child as SVGElement;
          element.style.opacity = '0.7';
        });
      };

      const handleMouseLeave = () => {
        if (!edge.active) return;
        children.forEach((child) => {
          const element = child as SVGElement;
          element.style.opacity = '1';
        });
      };

      // Handle click
      const handleClick = () => {
        if (gameOver || !edge.active) return;
        const isAllowed = edge.color === currentPlayer || edge.color === 'green';
        if (!isAllowed) return;

        // Make edge inactive
        const updatedEdges = edges.map((e) =>
          e.id === edge.id ? { ...e, active: false } : e
        );

        // Find disconnected edges and make them inactive
        const connected = getConnectedVertices(updatedEdges);
        const finalEdges = updatedEdges.map((e) => ({
          ...e,
          active: e.active && connected.has(e.from) && connected.has(e.to),
        }));

        setEdges(finalEdges);
        
        console.log(`Edge ${edge.id} removed by ${currentPlayer}`);
        console.log('Connected vertices:', connected);

        // Switch player
        const nextPlayer: 'red' | 'blue' = currentPlayer === 'red' ? 'blue' : 'red';
        setCurrentPlayer(nextPlayer);
        console.log(`Now it's ${nextPlayer}'s turn`);
      };

      edgeElement.addEventListener('mouseenter', handleMouseEnter);
      edgeElement.addEventListener('mouseleave', handleMouseLeave);
      edgeElement.addEventListener('click', handleClick);

      // Store cleanup function
      cleanupFunctions.push(() => {
        edgeElement.removeEventListener('mouseenter', handleMouseEnter);
        edgeElement.removeEventListener('mouseleave', handleMouseLeave);
        edgeElement.removeEventListener('click', handleClick);
      });
    });

    // Cleanup all event listeners when effect re-runs
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [edges, currentPlayer, gameOver]);

  // Don't render on server to avoid hydration issues
  if (!mounted) {
    return (
      <Box
        width="100%"
        maxWidth={{
          base: "95vw",
          sm: "90vw",
          md: "70vw",
          lg: "60vw",
          xl: "50vw",
          "2xl": "45vw"
        }}
        height="auto"
        margin="0 auto"
        aspectRatio="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box>Loading...</Box>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      width="100%"
      maxWidth={{
        base: "95vw",      // Mobile: almost full width
        sm: "90vw",        // Small tablets
        md: "70vw",        // Medium tablets
        lg: "60vw",        // Laptops
        xl: "50vw",        // Desktops
        "2xl": "45vw"      // Large desktops
      }}
      height="auto"
      margin="0 auto"
      position="relative"
      aspectRatio="1"      // Keep it square
    >
      <Box
        as="svg"
        ref={svgRef}
        width="100%"
        height="100%"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: svgContent }}
        css={{
          '& *': {
            vectorEffect: 'non-scaling-stroke',
          },
        }}
      />
    </Box>
  );
}