# Hanafuda Koi-Koi Example Web App

This is a simple web application demonstrating the usage of the Hanafuda library. It provides a basic interface for playing Hanafuda Koi-Koi, with features for managing game state and visualizing the game board.

## Features

- Initialize new games
- Save and load game state using local storage
- Display game board, player hands, and captured cards
- Show current game information (current player, month, weather)
- Display completed yaku (scoring combinations)

## Running the Example

First, build the library to create the distribution files:

```bash
# Using Deno (recommended)
deno task build

# Or using npm as an alternative
# npm install
# npm run build
```

Then you can run the example using Deno:

```bash
deno run --allow-read --allow-net example/server.js
```

Then open your browser and navigate to:

- `http://localhost:8000`

Alternatively, due to ES modules being used, you can serve the files through any web server:

```bash
# Using Python 3
python -m http.server

# Using Node.js's http-server (install first with: npm install -g http-server)
http-server

# Using PHP
php -S localhost:8000
```

Note: The example requires the built library files in the `dist/` directory. Make sure to run the build step before serving the example.

## Structure

- `index.html`: The main HTML file containing the game interface
- `app.js`: The JavaScript file handling game logic and UI interactions
- `server.js`: Deno server implementation for serving the example

## Usage

1. Click "New Game" to start a fresh game
2. The interface will show:
   - The field cards in the center
   - Each player's hand and captured cards
   - Current game information (player turn, month, weather)
   - Any completed yaku (scoring combinations)
3. Use "Save Game" to store the current game state in local storage
4. Use "Load Game" to restore a previously saved game state

## Implementation Notes

- The example uses vanilla JavaScript and TailwindCSS for styling
- Game state is managed using the Hanafuda library's state management functions
- Card collections (hands, field, captured cards) are rendered as simple divs with card names
- The interface is responsive and works on both desktop and mobile devices

## Future Enhancements

- Add card selection and move validation
- Implement full game loop with player turns
- Add animations for card movements
- Improve card visualization with proper card images
- Add sound effects for card interactions
- Implement multiplayer support
