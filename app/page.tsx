'use client';

import React, { useEffect, useState } from 'react';
import { Badge, Button, Container, Drawer, Field, Fieldset, Flex, HStack, IconButton, Link, Portal, RadioGroup, SegmentGroup, Spinner, Switch, Text, VStack } from "@chakra-ui/react";
import { FaBackward, FaRedoAlt, FaLightbulb } from "react-icons/fa";
import { MdInfoOutline, MdOutlineSettings, MdQuestionMark } from 'react-icons/md';

import Instructions from '@/components/instructions';
import ColorModeToggle from '@/components/colorModeToggle';
import { Tooltip } from "@/components/ui/tooltip";
import SvgHackenbush, { GameState } from '@/components/svgHackenbush';
import { formatDyadicFancy } from '@/lib/hackenbush';
import OldGames from '@/components/olderGames';
import useGamePath from '@/lib/useGamePath';

import confetti from 'canvas-confetti';

import { translations } from '@/lib/translations';

type Player = 'red' | 'blue';

export default function Hackenbush() {
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [dyadicValue, setDyadicValue] = useState<string>("");
  const [player1Color, setPlayer1Color] = useState<string>("red");
  const [computerPlays, setComputerPlays] = useState<boolean>(true);
  const [lang, setLang] = useState<"English" | "Português" | "Français">("English");

  const t = translations[lang];

  const [open, setOpen] = useState<boolean>(() => {
    // Check if user has visited before
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('hackenbush-visited');
      return !hasVisited; // Open dialog if NOT visited before
    }
    return false; // Default to open on server-side render
  });

  // Set the visited flag when component mounts
  useEffect(() => {
    if (open) {
      localStorage.setItem('hackenbush-visited', 'true');
    }
  }, [open]);

  // Trigger confetti when player 1 wins
  useEffect(() => {
    if (gameOver && winner === player1Color) {
      // Fire confetti from both sides
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 40,
          origin: { x: 0 },
          colors: ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff']
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 40,
          origin: { x: 1 },
          colors: ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [gameOver, winner, player1Color]);

  useEffect(() => {
    // Detecta a linguagem apenas no cliente
    const browserLang = navigator.language.split('-')[0];
    
    const langMap: { [key: string]: "English" | "Português" | "Français" } = {
      'pt': "Português",
      'en': "English",
      'fr': "Français"
    };
    
    setLang(langMap[browserLang] || "English");
  }, []);

  const { gamePath, gNumber, loading } = useGamePath();

  // Handle game state updates from the SVG component
  const handleGameStateChange = (state: GameState) => {
    console.log('Game value:', state.gameValueDecimal);
    console.log('Optimal move:', state.optimalMove);
    console.log('Current player winning?', state.isWinning);

    setCurrentPlayer(state.currentPlayer);
    setGameOver(state.gameOver);
    setWinner(state.winner);

    if (state.gameValue != null) {
      setDyadicValue(formatDyadicFancy(state.gameValue));
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
                    <Drawer.Title>{t.settings_title}</Drawer.Title>
                  </Drawer.Header>

                  <Drawer.Body>
                    <VStack gap={6} alignItems="start">
                      <Fieldset.Root>
                        <Fieldset.Legend >{t.player1_color}</Fieldset.Legend>
                        <RadioGroup.Root marginY={1} 
                          value={player1Color}
                          onValueChange={(e) => setPlayer1Color(e.value != null ? e.value : "red")}
                          colorPalette={player1Color}
                        >
                          <HStack gap={6}>
                            <RadioGroup.Item value="red">
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText>{t.red}</RadioGroup.ItemText>
                            </RadioGroup.Item>

                            <RadioGroup.Item value="blue">
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText>{t.blue}</RadioGroup.ItemText>
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
                          {t.computer_play}
                        </Switch.Label>
                      </Switch.Root>

                      <Field.Root>
                        <Field.Label>{t.language}</Field.Label>
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
                      {t.description}
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
            <Tooltip content={t.how_to_play}>
              <MdQuestionMark />
            </Tooltip>
          </IconButton>
          <OldGames 
            tooltipContent={t.old_games} 
            title={t.old_games}
            loading={t.loading}
            notFound={t.not_found}
            game={t.game}
          />
        </HStack>
      </Container>

      <Container centerContent={true}>

        <Flex direction="column" alignItems="center" paddingY={3} align="stretch" justifyContent="space-between" height="100%">
          
          {/* Game Board - SVG Component */}
          {loading ? 
            (
              <HStack gap={3}>
                <Spinner color="blue.500" borderWidth="4px" />
                <Text fontSize="xs" color="fg.muted">{t.loading}</Text>
              </HStack>
            ) 
            : 
            (
              <SvgHackenbush
                svgPath={gamePath}
                onGameStateChange={handleGameStateChange}
                currentPlayer={currentPlayer}
                resetTrigger={resetTrigger}
              />
            )}

          {gNumber > 0 &&
            <>
            <Text textStyle="xs" color="fg.muted" marginY={2}>
              {`${t.game} #${gNumber}`}
            </Text>
            {!gameOver ? (
              <>
                <Text textStyle="md">{t.current_player} 
                  <Badge 
                    variant="surface"
                    marginX={1}
                    size="md"
                    colorPalette={currentPlayer}
                  >
                    <b>{
                      currentPlayer == 'red' ?
                      (<>{t.red.toUpperCase()}</>) : 
                      (<>{t.blue.toUpperCase()}</>)
                    }</b>
                  </Badge>
                </Text>
                <Text textStyle="xs" color="fg.muted" marginY={2}>
                  {t.current_value} <b>{dyadicValue}</b>
                </Text>
              </>
            ) : (
              <Badge 
                size="md"
                variant="surface"
                colorPalette={winner ?? undefined}
              >
                <b>{winner? t[winner].toUpperCase() : ''} 
                  {t.wins} 🎉</b>
              </Badge>
            )}
            </>
          }

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
          {t.under_dev}
        </Badge>
        <Text fontSize="xs" color="fg.muted">
          {t.dev_by} {" "} 
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
          </Link> {t.created_by} {" "}
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
      <Instructions open={open} setOpen={setOpen} 
        title={t.instructions_title}
        instructions_1={t.instructions_1}
        instructions_2={t.instructions_2}
        instructions_3={t.instructions_3}
        instructions_4={t.instructions_4}
        instructions_5={t.instructions_5}
        instructions_6={t.instructions_6}
        red={t.red}
        blue={t.blue}
      />
    </Flex>
  );
}