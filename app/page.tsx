'use client';

import React, { useState } from 'react';
import { Badge, Button, Container, Flex, HStack, IconButton, Link, Text } from "@chakra-ui/react";
import { FaBackward, FaRedoAlt, FaLightbulb } from "react-icons/fa";
import { MdInfoOutline, MdQuestionMark } from 'react-icons/md';

import Instructions from '@/components/instructions';
import ColorModeToggle from '@/components/colorModeToggle';
import SvgHackenbush, { GameState } from '@/components/svgHackenbush';

type Player = 'red' | 'blue';

export default function Hackenbush() {
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Handle game state updates from the SVG component
  const handleGameStateChange = (state: GameState) => {
    setCurrentPlayer(state.currentPlayer);
    setGameOver(state.gameOver);
    setWinner(state.winner);
  };

  // Reset game
  const resetGame = () => {
    setResetTrigger(prev => prev + 1);
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

        <Flex direction="column" alignItems="center" paddingY={3} align="stretch" justifyContent="space-between" height="100%">
          
          {/* Game Board - SVG Component */}
          <SvgHackenbush
            svgPath="/assets/games/test.svg"
            onGameStateChange={handleGameStateChange}
            currentPlayer={currentPlayer}
            resetTrigger={resetTrigger}
          />

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

          <HStack gap={3} marginTop={4} wrap="wrap">
            <Button variant="surface" colorPalette="gray">
              <FaBackward /> Voltar
            </Button>
            <Button variant="surface" colorPalette="yellow">
              <FaLightbulb /> Dica
            </Button>
            <Button 
              variant="surface" 
              colorPalette="red"
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
        <Badge colorPalette="yellow" variant="surface">
          JOGO AINDA EM DESENVOLVIMENTO
        </Badge>
        <Text fontSize="xs" color="fg.muted">
          Jogo desenvolvido para web por {" "} 
          <Link
            href="https://csamuelssm.vercel.app/"
            variant="underline"
            colorPalette='teal'
          >
            Samuel Santos
          </Link> - {new Date().getFullYear()}.
        </Text>
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
          </Link>.
        </Text>
      </Container>
    </Flex>
  );
}