'use client';

import React, { useState } from 'react';
import { Badge, Button, Container, Flex, HStack, IconButton, Link, Text } from "@chakra-ui/react";
import { FaBackward, FaRedoAlt, FaLightbulb, FaQuestion } from "react-icons/fa";

import Instructions from '@/components/instructions';
import ColorModeToggle from '@/components/colorModeToggle';
import { MdInfoOutline, MdQuestionMark } from 'react-icons/md';

// Type definitions
interface Edge {
  id: number;
  from: string;
  to: string;
  color: 'red' | 'blue';
  active: boolean;
}

interface Vertex {
  x: number;
  y: number;
}

type Vertices = {
  [key: string]: Vertex;
};

type Player = 'red' | 'blue';

// Simple Hackenbush game
export default function Hackenbush() {
  // Game state
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);

  const [open, setOpen] = useState<boolean>(true);
  
  // Initial graph structure
  // Each edge has: id, from (vertex), to (vertex), color, and active status
  const [edges, setEdges] = useState<Edge[]>([
    { id: 1, from: 'ground', to: 'a', color: 'blue', active: true },
    { id: 2, from: 'ground', to: 'b', color: 'red', active: true },
    { id: 3, from: 'a', to: 'c', color: 'red', active: true },
    { id: 4, from: 'b', to: 'c', color: 'blue', active: true },
    { id: 5, from: 'c', to: 'd', color: 'red', active: true },
    { id: 6, from: 'b', to: 'e', color: 'blue', active: true },
  ]);
  
  // Vertex positions (x, y coordinates)
  const vertices: Vertices = {
    ground: { x: 200, y: 350 },
    a: { x: 150, y: 250 },
    b: { x: 250, y: 250 },
    c: { x: 200, y: 150 },
    d: { x: 200, y: 50 },
    e: { x: 300, y: 150 },
  };
  
  // Find all vertices connected to ground (using BFS)
  const getConnectedVertices = (edgeList: Edge[]): Set<string> => {
    const connected = new Set<string>(['ground']);
    const activeEdges = edgeList.filter(e => e.active);
    
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
  
  // Handle edge click
  const handleEdgeClick = (edgeId: number): void => {
    if (gameOver) return;
    
    const edge = edges.find(e => e.id === edgeId);
    if (!edge || !edge.active) return;
    
    // Check if player can remove this edge (must match their color)
    if (edge.color !== currentPlayer) {
      return; // Can't remove opponent's edge
    }
    
    // Remove the edge
    const newEdges = edges.map(e => 
      e.id === edgeId ? { ...e, active: false } : e
    );
    
    // Find connected vertices and deactivate disconnected edges
    const connected = getConnectedVertices(newEdges);
    const finalEdges = newEdges.map(e => ({
      ...e,
      active: e.active && connected.has(e.from) && connected.has(e.to)
    }));
    
    setEdges(finalEdges);
    
    // Check if current player has any moves left
    const opponentColor: Player = currentPlayer === 'red' ? 'blue' : 'red';
    const opponentHasMoves = finalEdges.some(e => e.active && e.color === opponentColor);
    
    if (!opponentHasMoves) {
      setGameOver(true);
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer(opponentColor);
    }
  };
  
  // Reset game
  const resetGame = (): void => {
    setEdges(edges.map(e => ({ ...e, active: true })));
    setCurrentPlayer('red');
    setGameOver(false);
    setWinner(null);
  };
  
  return (
    <Flex direction="column" h="100vh" align="stretch" justifyContent="space-between">
      <Container centerContent={true} paddingY={3}>
        <HStack alignItems="center" gap={5}>
          <Text fontWeight="bold" textStyle="xl">Hackenbush</Text>
          <ColorModeToggle />
          <IconButton 
            variant="outline" size="sm"
            onClick={() => setOpen(true)}
          >
            <MdQuestionMark />
          </IconButton>
          <IconButton variant="outline" size="sm">
            <MdInfoOutline />
          </IconButton>
        </HStack>
      </Container>

      <Container centerContent={true}>

        <Text textStyle="xs" color="fg.muted" marginY={2}>
          Jogo do dia: 13 de fevereiro de 2026.
        </Text>
        {!gameOver ? (
          <Text textStyle="md">Jogador atual: 
            <Badge 
              variant="surface"
              marginX={1}
              size="md"
              colorPalette={currentPlayer}
            >
              <b>{currentPlayer.toUpperCase()}</b>
            </Badge>
          </Text>
        ) : (
          <Badge 
            size="md"
            variant="surface"
            colorPalette={winner ?? undefined}
          >
            <b>{winner?.toUpperCase()} WINS! 🎉</b>
          </Badge>
        )}

      
      <Flex direction="column" alignItems="center" paddingY={3} align="stretch" justifyContent="space-between" height="100%">
        
        {/* Game Board */}
        <svg 
          width="400" 
          height="400" 
          className="border-2 border-slate-300 rounded-lg bg-slate-50"
        >
          {/* Ground line */}
          <line
            x1="0"
            y1="350"
            x2="400"
            y2="350"
            stroke="#374151"
            strokeWidth="4"
          />
          
          {/* Draw edges */}
          {edges.map(edge => {
            const from = vertices[edge.from];
            const to = vertices[edge.to];
            
            return (
              <line
                key={edge.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={edge.active ? edge.color : '#d1d5db'}
                strokeWidth="6"
                strokeLinecap="round"
                opacity={edge.active ? 1 : 0.3}
                style={{
                  cursor: edge.active && edge.color === currentPlayer && !gameOver ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleEdgeClick(edge.id)}
                onMouseEnter={(e) => {
                  if (edge.active && edge.color === currentPlayer && !gameOver) {
                    (e.target as SVGLineElement).style.strokeWidth = '8';
                    (e.target as SVGLineElement).style.opacity = '0.7';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.target as SVGLineElement).style.strokeWidth = '6';
                  (e.target as SVGLineElement).style.opacity = edge.active ? '1' : '0.3';
                }}
              />
            );
          })}
          
          {/* Draw vertices (optional, for visualization) */}
          {Object.entries(vertices).map(([name, pos]) => {
            if (name === 'ground') return null;
            const connected = getConnectedVertices(edges);
            return (
              <circle
                key={name}
                cx={pos.x}
                cy={pos.y}
                r="7"
                fill={connected.has(name) ? 'black' : '#cbd5e1'}
                opacity="1"
              />
            );
          })}
        </svg>

        <HStack gap={3}>
          <Button variant="surface" colorPalette="gray">
            <FaBackward /> Voltar
          </Button>
          <Button variant="surface" colorPalette="yellow">
            <FaLightbulb /> Dica
          </Button>
          <Button 
            variant="surface" colorPalette="red"
            onClick={resetGame}
          >
            <FaRedoAlt /> Reiniciar
          </Button>
        </HStack>

        {/* Instructions */}
        <Instructions open={open} setOpen={setOpen} />
      </Flex>
      </Container>

      <Container centerContent={true} paddingY={3} marginBottom={1}>
        <Text fontSize="xs" color="fg.muted">Jogo desenvolvido para web por {" "} 
          <Link
            href="https://csamuelssm.vercel.app/"
            variant="underline"
            colorPalette='teal'
          >
            Samuel Santos
          </Link> - {new Date().getFullYear()}.</Text>
        <Text fontSize="xs" color="fg.muted">
          <Link
            href="https://en.wikipedia.org/wiki/Hackenbush"
            variant="underline"
            colorPalette='teal'
          >
            Hackenbush
          </Link> foi criado por {" "}
          <Link
            href="https://pt.wikipedia.org/wiki/John_Conway"
            variant="underline"
            colorPalette='teal'
          >
            John Conway
          </Link>.</Text>
      </Container>
    </Flex>
  );
}