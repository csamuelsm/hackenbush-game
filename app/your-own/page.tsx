'use client';

import React, { useEffect, useState } from 'react';
import { Badge, Box, Button, Container, Drawer, Field, Fieldset, FileUpload, Flex, HStack, Icon, IconButton, Link, Portal, RadioGroup, SegmentGroup, Spinner, Switch, Text, useFileUpload, VStack } from "@chakra-ui/react";
import { MdOutlineSettings, MdQuestionMark } from 'react-icons/md';
import { FaGithubAlt, FaPaypal } from "react-icons/fa";

import SocialClipboard from '@/components/clipboard';

import Instructions from '@/components/instructions';
import { Tooltip } from "@/components/ui/tooltip";
import SvgHackenbush, { GameState } from '@/components/svgHackenbush';
//import { formatDyadicFancy } from '@/lib/hackenbush';
import OldGames from '@/components/olderGames';
import useGameVersion from '@/lib/useGameVersion';
import { addOrUpdateUrlParam } from '@/lib/hrefUtil';

import confetti from 'canvas-confetti';

import { translations } from '@/lib/translations';
import ColorModeToggle from '@/components/colorModeToggle';
import { SiBuymeacoffee, SiPix } from 'react-icons/si';
import { LuUpload } from 'react-icons/lu';

type Player = 'red' | 'blue';

export default function Hackenbush() {
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  //const [dyadicValue, setDyadicValue] = useState<string>("");
  const [player1Color, setPlayer1Color] = useState<Player>("red");
  const [computerPlays, setComputerPlays] = useState<boolean>(true);
  const [lang, setLang] = useState<"English" | "Português" | "Français">("English");
  const [loadedSvg, setLoadedSvg] = useState<string | null>(null);

  const t = translations[lang];

  const fileUpload = useFileUpload({
    maxFiles: 1,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    accept: {
        "image/svg+xml": [".svg"],
    },
    onFileReject(details) {
      console.error("File rejected:", details)
    },
  })

  const onLoadClick = () => {
    const file = fileUpload.acceptedFiles[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setLoadedSvg(url);
  }

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

  const { version } = useGameVersion();
  
  // Handle game state updates from the SVG component
  const handleGameStateChange = (state: GameState) => {
    console.log('Game value:', state.gameValueDecimal);
    console.log('Optimal move:', state.optimalMove);
    console.log('Current player winning?', state.isWinning);

    setCurrentPlayer(state.currentPlayer);
    setGameOver(state.gameOver);
    setWinner(state.winner);

    /*if (state.gameValue != null) {
      setDyadicValue(formatDyadicFancy(state.gameValue));
    } else {
      setDyadicValue("");
    }*/

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
          <ColorModeToggle />
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
                          // @ts-ignore
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

                      <Box>
                        <Link variant="underline" 
                          colorPalette={version == 'normal' ? 'red' : 'blue'}
                          onClick={() => {
                            if (version === 'normal') {
                              addOrUpdateUrlParam('misere', 'true');
                            } else {
                              addOrUpdateUrlParam('misere', 'false');
                            }
                          }}
                        >
                            <b>{version == 'normal' ? t.misere_link : t.normal_link}</b>
                        </Link>
                        <Text fontSize="xs" color="fg.subtle" lineHeight="short">
                          {version == 'normal' ? t.misere_decription : t.normal_description}
                        </Text>
                      </Box>

                        <Box>
                            <Link variant="underline" 
                            colorPalette="teal"
                            href="/"
                            >
                                <b>{t.return_base}</b>
                            </Link>
                        </Box>
                    </VStack>
                  </Drawer.Body>

                  <Drawer.Footer>
                    {/*<Text fontSize="xs" color="fg.subtle" lineHeight="short">
                      {t.description}
                    </Text>*/}
                    <VStack textAlign="left">
                      <Text fontSize="sm" color="fg.subtle" lineHeight="short">
                        <b>{t.contribute}</b>
                      </Text>

                      <HStack flexWrap="wrap">
                        <Link href="https://www.paypal.com/donate/?hosted_button_id=DE9ZRCNT78QW4">
                          <Button colorPalette="blue"><FaPaypal/> PayPal</Button>
                        </Link>
                        <Link href="https://buymeacoffee.com/csamuelssm">
                          <Button colorPalette="orange"><SiBuymeacoffee /> Buy me a coffee</Button>
                        </Link>
                        
                        <Tooltip content="b93565ad-4c77-473d-87bf-7964c15cf6d2">
                            <Button colorPalette="teal"><SiPix /> Pix</Button>
                        </Tooltip>
                        
                        <Link href="https://github.com/csamuelsm/hackenbush-game">
                            <Button colorPalette="black"><FaGithubAlt /> Github</Button>
                        </Link>
                      </HStack>
                    </VStack>
                  </Drawer.Footer>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
          <Text fontWeight="bold" textStyle="xl">
            Hackenbush {" "}
            <Badge
              colorPalette={version == 'normal' ? 'blue' : 'red'}
            >
              {version == 'normal' ? 'NORMAL' : 'MISÈRE'}
            </Badge>
          </Text>
          <IconButton 
            variant="outline" size="sm"
            onClick={() => setOpen(true)}
          >
            <Tooltip content={t.how_to_play}>
              <MdQuestionMark />
            </Tooltip>
          </IconButton>
          {/*<OldGames 
            tooltipContent={t.old_games} 
            title={t.old_games}
            loading={t.loading}
            notFound={t.not_found}
            game={t.game}
          />*/}
        </HStack>
      </Container>

      <Container centerContent={true}>

        <Flex direction="column" alignItems="center" paddingY={3} align="stretch" justifyContent="space-between" height="100%">
          
          {/* Game Board - SVG Component */}
          {loadedSvg ? 
          (
            <>
            <SvgHackenbush
                svgPath={loadedSvg}
                onGameStateChange={handleGameStateChange}
                currentPlayer={currentPlayer}
                resetTrigger={resetTrigger}
            />
            </>
          ) : (
            <>
            <Link colorPalette="blue" variant="underline" 
                href={lang == "Português" ? "https://github.com/csamuelsm/hackenbush-game/blob/main/README_pt.md" : "https://github.com/csamuelsm/hackenbush-game/blob/main/README.md"}
            >
                <Text marginBottom={3} fontWeight="bold">
                    {t.guide}
                </Text>
            </Link>
            <FileUpload.RootProvider maxW="2xl" alignItems="stretch" value={fileUpload}>
                <FileUpload.HiddenInput />
                <FileUpload.Dropzone>
                    <Icon size="md" color="fg.muted">
                        <LuUpload />
                    </Icon>
                    <FileUpload.DropzoneContent>
                    <Box>{t.drag_drop}</Box>
                    <Box color="fg.muted">{t.svg_desc}</Box>
                    </FileUpload.DropzoneContent>
                </FileUpload.Dropzone>
                <FileUpload.List />
            </FileUpload.RootProvider>
            <Button 
                marginTop={3}
                disabled={
                    !(fileUpload.acceptedFiles.length > 0)
                }
                onClick={onLoadClick}
                colorPalette="blue"
            >
                <LuUpload /> {t.load_game}
            </Button>
            </>
          )
        }

          {loadedSvg &&
            <>
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
              </>
            ) : (
              <>
              <Badge 
                size="md"
                variant="surface"
                colorPalette={winner ?? undefined}
              >
                <b>{winner? t[winner].toUpperCase() : ''} 
                  {t.wins} 🎉</b>
              </Badge>

              {/*<SocialClipboard 
                lang={lang} won={gameOver && winner === player1Color}
                color={player1Color}
                version={version}
              />*/}
              </>
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
        instructions_6={version === 'normal' ? t.instructions_6 : t.intructions_6_misere}
        red={t.red}
        blue={t.blue}
      />
    </Flex>
  );
}