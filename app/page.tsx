'use client';

import React, { useEffect, useState } from 'react';
import { Badge, Button, Container, Drawer, Field, Fieldset, Flex, HStack, IconButton, Link, Portal, RadioGroup, SegmentGroup, Switch, Text, VStack } from "@chakra-ui/react";
import { FaBackward, FaRedoAlt, FaLightbulb } from "react-icons/fa";
import { MdInfoOutline, MdOutlineSettings, MdQuestionMark } from 'react-icons/md';

import Instructions from '@/components/instructions';
import ColorModeToggle from '@/components/colorModeToggle';
import SvgHackenbush, { GameState } from '@/components/svgHackenbush';
import { formatDyadic } from '@/lib/hackenbush';

type Player = 'red' | 'blue';

export default function Hackenbush() {
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [dyadicValue, setDyadicValue] = useState<string>("");
  const [player1Color, setPlayer1Color] = useState<string>("red");
  const [computerPlays, setComputerPlays] = useState<boolean>(true);
  const [lang, setLang] = useState<"English" | "Português" | "Français">("Português");

  // Handle game state updates from the SVG component
  const handleGameStateChange = (state: GameState) => {
    console.log('Game value:', state.gameValueDecimal);
    console.log('Optimal move:', state.optimalMove);
    console.log('Current player winning?', state.isWinning);

    setCurrentPlayer(state.currentPlayer);
    setGameOver(state.gameOver);
    setWinner(state.winner);

    if (state.gameValue != null) {
      setDyadicValue(formatDyadic(state.gameValue));
    } else {
      setDyadicValue("");
    }

    if (state.currentPlayer != player1Color && computerPlays && !state.gameOver) {
      // next player to make a move is the computer
      let nextEdge = state.optimalMove;
      let computerMove = document.querySelector(`#${nextEdge}`) as SVGGElement;
      if (computerMove) {
          // Create and dispatch a click event
        setTimeout(() => {
            const clickEvent = new MouseEvent('click', {
            bubbles: true,      // Important! Event needs to bubble up to the SVG container
            cancelable: true,
            view: window
          });
          
          computerMove.dispatchEvent(clickEvent);
          console.log('Computer move executed:', nextEdge);
        }, 800); // 800ms - quick enough but feels deliberate
      } else {
        console.log('Edge not found:', nextEdge);
      }
    }
    
  };

  // Reset game
  const resetGame = () => {
    setResetTrigger(prev => prev + 1);
  };

  return (
    <Flex direction="column" h="100vh" align="stretch" justifyContent="space-between">
      <Container centerContent={true} paddingY={3}>
        <HStack alignItems="center" gap={5}>
          {/* Config Drawer */}
          <Drawer.Root placement="start">
            <Drawer.Trigger asChild>
              <IconButton variant="outline" size="sm">
                <MdOutlineSettings />
              </IconButton>
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Header>
                    <Drawer.Title>Configurações</Drawer.Title>
                  </Drawer.Header>

                  <Drawer.Body>
                    <VStack gap={6} alignItems="start">
                      <Fieldset.Root>
                        <Fieldset.Legend >Cor do Jogador 1:</Fieldset.Legend>
                        <RadioGroup.Root marginY={1} 
                          value={player1Color}
                          onValueChange={(e) => setPlayer1Color(e.value != null ? e.value : "red")}
                          colorPalette={player1Color}
                        >
                          <HStack gap={6}>
                            <RadioGroup.Item value="red">
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText>Vermelho</RadioGroup.ItemText>
                            </RadioGroup.Item>

                            <RadioGroup.Item value="blue">
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText>Azul</RadioGroup.ItemText>
                            </RadioGroup.Item>
                          </HStack>
                        </RadioGroup.Root>
                      </Fieldset.Root>

                      <Switch.Root 
                        checked={computerPlays}
                        onCheckedChange={(e) => setComputerPlays(e.checked)}
                        colorPalette="blue"
                        size="md"
                      >
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        <Switch.Label>
                          Jogar contra computador
                        </Switch.Label>
                      </Switch.Root>

                      <Field.Root>
                        <Field.Label>Língua</Field.Label>
                        <SegmentGroup.Root value={lang}
                          onValueChange={
                            // @ts-ignore
                            (e) => setLang(e.value)
                          }>
                          <SegmentGroup.Indicator />
                          <SegmentGroup.Items items={["Português", "English", "Français"]} />
                        </SegmentGroup.Root>
                      </Field.Root>
                    </VStack>
                  </Drawer.Body>

                  <Drawer.Footer>
                    <Text fontSize="xs" color="fg.subtle" lineHeight="short">
                      Hackenbush é um jogo criado pelo matemático John Conway e uma das bases da Teoria dos Jogos Combinatórios, bastante estudada na matemática e na ciência da computação.
                    </Text>
                  </Drawer.Footer>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
          <Text fontWeight="bold" textStyle="xl">Hackenbush</Text>
          <IconButton 
            variant="outline" size="sm"
            onClick={() => setOpen(true)}
          >
            <MdQuestionMark />
          </IconButton>
        </HStack>
      </Container>

      <Container centerContent={true}>

        <Flex direction="column" alignItems="center" paddingY={3} align="stretch" justifyContent="space-between" height="100%">
          
          {/* Game Board - SVG Component */}
          <SvgHackenbush
            svgPath="/assets/games/test2.svg"
            onGameStateChange={handleGameStateChange}
            currentPlayer={currentPlayer}
            resetTrigger={resetTrigger}
          />

          <Text textStyle="xs" color="fg.muted" marginY={2}>
            Jogo #1
          </Text>
        
          {!gameOver ? (
            <>
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
              <Text textStyle="xs" color="fg.muted" marginY={2}>
                Valor atual do jogo: <b>{dyadicValue}</b>
              </Text>
            </>
          ) : (
            <Badge 
              size="md"
              variant="surface"
              colorPalette={winner ?? undefined}
            >
              <b>{winner?.toUpperCase()} WINS! 🎉</b>
            </Badge>
          )}

          {/*<HStack gap={3} marginTop={4} wrap="wrap">
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
          </HStack>*/}

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

      {/* Instructions */}
      <Instructions open={open} setOpen={setOpen} />
    </Flex>
  );
}