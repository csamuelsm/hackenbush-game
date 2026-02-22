# Hackenbush Web Game

## Features

- ✅ **Play against the computer or with a (in-person) friend**
- ✅ **Choose between the Normal version and the Misère version**
- ✅ **Load your own games from SVG files** - Parse and play any properly formatted SVG Hackenbush game (see below how to create your own games)
- ✅ **Support for several languages** - English, Portuguese and Frech

## Creating your own games

You can play [Hackenbush](https://hackenbush.vercel.app/) with your own games, that you created! You just need to design your games into a .svg file properly formatted as below. To do so, you only need a good software for vector designing, such as Inkscape or Adobe Illustrator.

Your SVG files must follow this structure:

### Key Requirements for your SVG:

- **Canvas**: 600 x 600 with viewBox "0 0 600 600"
- **Ground**: Must have a group with `id="ground"`
- **Vertices**: Groups with `id="vertex-01"`, `id="vertex-02"`, etc. (01-99)
- **Edges**: Groups with `id="edge-{color}-{endpoint1}-{endpoint2}"` where:
  - `{color}` is `red`, or `blue`
  - `{endpoint1}` and `{endpoint2}` are vertex IDs (e.g., "01", "02", "ground")
  - Example: `edge-red-02-33` (red edge from vertex 02 to vertex 33)

### Edge Types:
  - **Red edges**: Only red player can remove
  - **Blue edges**: Only blue player can remove

Here is an example of a properly formatted SVG file.

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
  <!-- Colors: red, blue -->
  <g id="edge-blue-ground-01">
    <line x1="200" y1="550" x2="200" y2="500" stroke="blue" stroke-width="9"/>
  </g>
  <g id="edge-red-01-02">
    <line x1="200" y1="500" x2="300" y2="500" stroke="red" stroke-width="9"/>
  </g>
  <g id="edge-red-02-03">
    <path d="M300,500 Q350,450 400,500" stroke="red" stroke-width="9" fill="none"/>
  </g>
  
  <!-- Other decorative elements (optional) -->
  <text x="300" y="50" text-anchor="middle">My Game</text>
</svg>
```

### More Information
  - Pay attention on each `vertex`, `edge`, or `ground` element in your SVG. Every one of them must be *groups* (even if the group is made of only one element). The SVG parser looks for `<g></g>` tags with the IDs as described above, so this is very important. Remember to label vertices and edges correctly.
  - You can add other elements that are not vertices or edges, such as text or other shapes. They will be displayed in the game, however they will not be interactable for the players.

### Tips

1. **Start simple**: Begin with a small graph (5-10 edges).
2. **Test balance**: Ensure both players have reasonable moves.
3. **Use curves**: SVG paths make games visually interesting. Curves are specially suitable for edges
4. **Add other elements**: Add new shapes or scenarios to your games. Have fun!
5. **Check Winning Ways book**: Winning Ways for your Mathematical Plays is a book in which Elwyn Berlekamp, John Conway e Richard Guy develop a lot of the theory behind Hackenbush and Combinatorial Game Theory. There are lots of examples of Hackenbush games there and a lot of fun stuff to learn!
6. **Share your games**: Consider sharing the games you create with other, by making a Pull Request to this repository or submitting an issue. Whenever it is possible, I will check the games and add it to the main page of [Hackenbush](https://hackenbush.vercel.app).
7. **Share the game with your friends**: Spread the word of Combinatorial Game Theory and Hackenbush with your friends!!

## Credits

Based on John Conway's Hackenbush game.
