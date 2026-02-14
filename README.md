# SVG Hackenbush Component

A fully functional, responsive React/Next.js component for playing Hackenbush games from SVG files.

## Features

✅ **Load games from SVG files** - Parse and play any properly formatted SVG Hackenbush game
✅ **Responsive design** - Works on all screen sizes (mobile, tablet, desktop)
✅ **Green edge support** - Green edges can be chosen by any player
✅ **Theme-aware** - Adapts to Chakra UI light/dark color modes
✅ **Full game logic** - Automatic detection of disconnected edges and win conditions
✅ **Controllable via props** - Full state management and external control
✅ **TypeScript** - Fully typed for better development experience

## Installation

1. Copy `SvgHackenbush.tsx` to your components folder (e.g., `@/components/SvgHackenbush.tsx`)
2. Place your SVG game files in the `public/assets/` folder
3. Import and use in your page

## SVG File Format

Your SVG files must follow this structure:

```xml
<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Ground line (required) -->
  <g id="ground">
    <line x1="0" y1="550" x2="600" y2="550" stroke="#374151" stroke-width="4"/>
  </g>
  
  <!-- Vertices: id format "vertex-{xx}" -->
  <g id="vertex-01">
    <circle cx="200" cy="500" r="8" fill="black"/>
  </g>
  <g id="vertex-02">
    <circle cx="300" cy="500" r="8" fill="black"/>
  </g>
  
  <!-- Edges: id format "edge-{color}-{from}-{to}" -->
  <!-- Colors: red, blue, or green -->
  <g id="edge-blue-ground-01">
    <line x1="200" y1="550" x2="200" y2="500" stroke="blue" stroke-width="6"/>
  </g>
  <g id="edge-red-01-02">
    <line x1="200" y1="500" x2="300" y2="500" stroke="red" stroke-width="6"/>
  </g>
  <g id="edge-green-02-03">
    <!-- Green edges can be chosen by either player -->
    <path d="M300,500 Q350,450 400,500" stroke="green" stroke-width="6" fill="none"/>
  </g>
  
  <!-- Other decorative elements (optional) -->
  <text x="300" y="50" text-anchor="middle">My Game</text>
</svg>
```

### Key Requirements:

- **Canvas**: 600 x 600 with viewBox "0 0 600 600"
- **Ground**: Must have a group with `id="ground"`
- **Vertices**: Groups with `id="vertex-01"`, `id="vertex-02"`, etc. (01-99)
- **Edges**: Groups with `id="edge-{color}-{from}-{to}"` where:
  - `{color}` is `red`, `blue`, or `green`
  - `{from}` and `{to}` are vertex IDs (e.g., "01", "02", "ground")
  - Example: `edge-red-02-33` (red edge from vertex 02 to vertex 33)

### Edge Types:
- **Red edges**: Only red player can remove
- **Blue edges**: Only blue player can remove
- **Green edges**: Either player can remove

## Basic Usage

```tsx
import SvgHackenbush from '@/components/SvgHackenbush';

export default function GamePage() {
  return (
    <SvgHackenbush svgPath="/assets/my-game.svg" />
  );
}
```

## Advanced Usage with State Management

```tsx
'use client';

import { useState } from 'react';
import SvgHackenbush, { GameState } from '@/components/SvgHackenbush';

export default function GamePage() {
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'blue'>('red');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'red' | 'blue' | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleGameStateChange = (state: GameState) => {
    setCurrentPlayer(state.currentPlayer);
    setGameOver(state.gameOver);
    setWinner(state.winner);
  };

  const resetGame = () => {
    setResetTrigger(prev => prev + 1);
  };

  return (
    <div>
      <h1>Current Player: {currentPlayer}</h1>
      {gameOver && <h2>{winner} wins!</h2>}
      
      <SvgHackenbush
        svgPath="/assets/my-game.svg"
        onGameStateChange={handleGameStateChange}
        currentPlayer={currentPlayer}
        resetTrigger={resetTrigger}
      />
      
      <button onClick={resetGame}>Reset Game</button>
    </div>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `svgPath` | `string` | ✅ Yes | - | Path to the SVG file (e.g., "/assets/game.svg") |
| `onGameStateChange` | `(state: GameState) => void` | ❌ No | - | Callback fired when game state changes |
| `currentPlayer` | `'red' \| 'blue'` | ❌ No | `'red'` | Control current player externally |
| `onPlayerChange` | `(player: 'red' \| 'blue') => void` | ❌ No | - | Callback fired when player changes |
| `resetTrigger` | `number` | ❌ No | `0` | Increment to reset the game |

## GameState Interface

```typescript
interface GameState {
  edges: Edge[];
  currentPlayer: 'red' | 'blue';
  gameOver: boolean;
  winner: 'red' | 'blue' | null;
}

interface Edge {
  id: string;
  from: string;
  to: string;
  color: 'red' | 'blue' | 'green';
  active: boolean;
  element: Element;
}
```

## How It Works

1. **SVG Loading**: Component fetches and parses the SVG file
2. **Game Extraction**: Identifies vertices, edges, and ground from SVG groups
3. **Graph Logic**: Uses BFS to track which vertices are connected to ground
4. **Edge Removal**: When a player clicks an edge:
   - Edge is deactivated
   - All disconnected edges are automatically removed
   - Checks if opponent has valid moves
5. **Win Detection**: Game ends when current player's move leaves opponent with no valid moves

## Responsive Behavior

The component automatically scales to fit its container while maintaining the 600x600 aspect ratio. It works perfectly on:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## Theme Support

The component adapts to Chakra UI's color mode:
- **Ground line**: Darker in light mode, lighter in dark mode
- **Connected vertices**: High contrast in current theme
- **Disconnected vertices**: Muted in current theme

## Project Structure

```
your-project/
├── components/
│   └── SvgHackenbush.tsx
├── public/
│   └── assets/
│       ├── game1.svg
│       ├── game2.svg
│       └── ...
└── app/
    └── page.tsx
```

## Tips for Creating SVG Games

1. **Start simple**: Begin with a small graph (5-10 edges)
2. **Test balance**: Ensure both players have reasonable moves
3. **Use curves**: SVG paths make games visually interesting
4. **Include green edges**: Add strategic depth where either player can choose
5. **Label vertices clearly**: Use sequential IDs (01, 02, 03...)
6. **Test connectivity**: Ensure all edges connect properly to ground

## Example Games

Check out `example-game.svg` for a working example that demonstrates:
- Multiple ground connections (red, blue, green)
- Mixed edge types
- Strategic branching
- Balanced gameplay

## Troubleshooting

**Q: Edges aren't clickable**
- Ensure edge groups have correct ID format: `edge-{color}-{from}-{to}`
- Check that stroke-width is set (invisible edges can't be clicked)

**Q: Vertices don't disconnect**
- Verify all edges properly connect vertex IDs
- Check that vertex IDs match in both edge definitions and vertex groups

**Q: SVG not loading**
- Ensure SVG file is in `public/assets/` folder
- Use absolute path starting with `/`: `/assets/game.svg`

**Q: Theme colors not working**
- Make sure Chakra UI provider is set up correctly
- Component will use default colors if theme is unavailable

## License

Free to use in your projects. Created for Hackenbush game development.

## Credits

Based on John Conway's Hackenbush game. Component developed for Samuel Santos's web implementation.
