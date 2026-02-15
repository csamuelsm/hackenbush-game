import { Badge, Box, Button, CloseButton, Dialog, Grid, IconButton, List, Portal, Text } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { Dispatch, SetStateAction, useState } from "react";
import { MdCalendarMonth, MdOutlineCalendarMonth } from "react-icons/md";
import { REFERENCE_DATE } from "@/lib/useGamePath";

interface GameFile {
  filename: string;
  number: number;
  path: string;
}

const OldGames = () => {
    const [games, setGames] = useState<GameFile[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Scan for game files when dialog opens
    const scanGameFiles = async () => {
        setLoading(true);
        
        try {
        // Attempt to fetch files in range
        const foundGames: GameFile[] = [];

        // Calculate distance in days from today to REFERENCE_DATE
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - REFERENCE_DATE.getTime());
        const distanceInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Try files from 00001 to `distance_days` (adjust range as needed)
        // We'll do this in batches to not overwhelm the browser
        for (let i = 1; i <= distanceInDays; i++) {
            const numStr = String(i).padStart(5, '0');
            const filename = `game-${numStr}.svg`;
            const path = `/assets/games/${filename}`;
            
            try {
            const response = await fetch(path, { method: 'HEAD' });
            if (response.ok) {
                foundGames.push({
                filename,
                number: i,
                path
                });
            }
            } catch (error) {
                // File doesn't exist, continue
                continue;
            }
            
            // Stop if we haven't found a file in the last `distanceInDays` attempts
            if (i > distanceInDays && foundGames.length === 0) break;
            if (foundGames.length > 0 && i > foundGames[foundGames.length - 1].number + distanceInDays) break;
        }
        
        // Sort from highest to lowest number
        foundGames.sort((a, b) => b.number - a.number);
        setGames(foundGames);
        
        } catch (error) {
            console.error('Error scanning game files:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog.Root 
            lazyMount 
            size="sm"
            placement="center"
            motionPreset="slide-in-bottom"
            onOpenChange={(e) => {
                if (e.open) {
                    scanGameFiles();
                }
            }}
        >
            <Dialog.Trigger asChild>
                    <IconButton variant="outline" size="sm">
                        <Tooltip content="Jogos antigos">
                            <MdOutlineCalendarMonth />
                        </Tooltip>
                    </IconButton>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header>
                    <Dialog.Title>Jogos antigos</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        {loading ? (
                <Text>Carregando jogos...</Text>
              ) : games.length === 0 ? (
                <Text>Nenhum jogo encontrado.</Text>
              ) : (
                <Grid 
                  templateColumns={{
                    base: "repeat(2, 1fr)", // 2 columns on mobile
                    md: "repeat(3, 1fr)"    // 3 columns on larger screens
                  }}
                  gap={4}
                  maxHeight="60vh"
                  overflowY="auto"
                  paddingRight={2}
                >
                  {games.map((game) => (
                            <Box
                            key={game.number}
                            borderWidth="1px"
                            borderRadius="md"
                            padding={3}
                            cursor="pointer"
                            _hover={{ 
                                borderColor: "blue.500",
                                boxShadow: "md"
                            }}
                            transition="all 0.2s"
                            onClick={() => {
                                // Handle game selection
                                console.log('Selected game:', game.number);
                                // You can add navigation or load the game here
                                window.location.href = `/?game=${game.number}`;
                            }}
                            >
                                <img
                                    src={game.path}
                                    alt={`Game ${game.number}`}
                                    style={{
                                    width: '100%',
                                    height: 'auto',
                                    marginBottom: '8px'
                                    }}
                                />
                                <Badge colorPalette="blue" size="sm">
                                    Jogo #{game.number}
                                </Badge>
                                </Box>
                            ))}
                            </Grid>
                        )}
                    </Dialog.Body>
                    <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                    </Dialog.CloseTrigger>
                </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default OldGames;
