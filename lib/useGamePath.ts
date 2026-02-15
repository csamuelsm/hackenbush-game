import { useState, useEffect } from 'react';

// Set your reference date here
export const REFERENCE_DATE = new Date('2026-02-14'); // Adjust this to your desired date

const useGamePath = () => {
  const [gamePath, setGamePath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [gNumber, setGNumber] = useState<number>(-1);

  useEffect(() => {
    const determineGamePath = async () => {
      setLoading(true);

      try {
        // Get game number from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const gameParam = urlParams.get('game');

        if (gameParam) {
          // Game number specified in URL
          const gameNumber = parseInt(gameParam, 10);
          
          // Calculate distance in days from today to REFERENCE_DATE
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - REFERENCE_DATE.getTime());
          const distanceInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Check if game number is valid (not in the future)
          if (gameNumber <= distanceInDays) {
            const numStr = String(gameNumber).padStart(5, '0');
            const path = `/assets/games/game-${numStr}.svg`;
            
            // Verify file exists
            const response = await fetch(path, { method: 'HEAD' });
            if (response.ok) {
              setGamePath(path);
              setGNumber(gameNumber);
              console.log('Loaded game from URL:', path);
              setLoading(false);
              return;
            }
          } else {
            console.warn(`Game ${gameNumber} is not yet available (max: ${distanceInDays})`);
          }
        }

        // No valid game parameter or game doesn't exist - use today's game
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - REFERENCE_DATE.getTime());
        const distance = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log('Distance in days:', distance);

        // Try to fetch game-{distance}.svg
        const distanceNumStr = String(distance).padStart(5, '0');
        const distancePath = `/assets/games/game-${distanceNumStr}.svg`;
        
        const distanceResponse = await fetch(distancePath, { method: 'HEAD' });
        if (distanceResponse.ok) {
          setGamePath(distancePath);
          setGNumber(distance);
          console.log('Loaded today\'s game:', distancePath);
          setLoading(false);
          return;
        }

        // File doesn't exist - find the biggest number
        console.log('Today\'s game not found, finding max game number...');
        
        let maxGameNumber = 1;
        let found = false;

        // Binary search to find the maximum game number efficiently
        let low = 1;
        let high = distance;
        
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const midNumStr = String(mid).padStart(5, '0');
          const midPath = `/assets/games/game-${midNumStr}.svg`;
          
          const midResponse = await fetch(midPath, { method: 'HEAD' });
          
          if (midResponse.ok) {
            maxGameNumber = mid;
            low = mid + 1; // Look for higher numbers
            found = true;
          } else {
            high = mid - 1; // Look for lower numbers
          }
        }

        if (!found) {
          console.error('No games found!');
          setLoading(false);
          return;
        }

        console.log('Max game number found:', maxGameNumber);

        // Calculate game number using modulo
        const actualGameNumber = (distance % maxGameNumber) || maxGameNumber; // Use maxGameNumber if mod is 0
        const actualNumStr = String(actualGameNumber).padStart(5, '0');
        const actualPath = `/assets/games/game-${actualNumStr}.svg`;

        console.log(`Using game ${actualGameNumber} (${distance} % ${maxGameNumber})`);
        setGamePath(actualPath);
        setGNumber(actualGameNumber);

      } catch (error) {
        console.error('Error determining game path:', error);
      } finally {
        setLoading(false);
      }
    };

    determineGamePath();
  }, []); // Run once on mount

  return { gamePath, gNumber, loading };
};

export default useGamePath;