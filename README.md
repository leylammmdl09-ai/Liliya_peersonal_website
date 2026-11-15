# Leyla.Space — A Gamified Portfolio

A responsive, pixel-art-inspired space portfolio built with plain HTML, CSS, and JavaScript. The mission map uses the supplied animated galaxy GIF, the ship's interior uses the supplied control-room image, and a pixel-art Earth sits at the bottom of the map. A chosen-astronaut HUD and joystick-style flight pad complete the arcade layout.

## Run locally

No build step or package installation is required. Open `index.html` in a modern browser, or serve this folder with a local static web server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`. A local server is recommended for the embedded project video and browser storage behavior.

## Structure

```text
.
├── index.html                 # Mission control and interactive game
├── about.html                 # About Leyla (always accessible)
├── projects.html              # Project archive (always accessible)
├── styles/
│   └── site.css               # Shared responsive design system
├── scripts/
│   ├── app.js                 # Saved mission state and shared player status
│   └── game.js                # Avatar selection, clues, scoring, and victory
└── assets/
    └── images/                # Portrait, avatars, map background, and planet art
```

## How to play

1. Select an astronaut when prompted.
2. Click the glowing note in the ship to read the mission briefing. The Home link returns you to the ship so you can reopen the note.
3. Start the mission and drag the spaceship over a planet to open its clue. Planet signals open on contact; they do not open by clicking the planet, and remaining over a planet will not reopen its clue. Move away and return to reopen it. Origin shares Leyla's background; Academia Prime covers her education; Cyber-Core highlights her technical abilities; Nebula-Interests shares her personal interests. The credits tracker appears in the galaxy view after the mission starts. After discovery, the `(!)` changes to a check mark.
4. Drag the spaceship directly, use the on-screen directional pad, or press the keyboard arrow keys to fly; planet clues open when the ship moves onto them. Hold a directional button to keep moving; the ship stays inside the map. The center of the directional pad is decorative.
5. Each planet awards 100 credits on its first visit only. Collect all 400 credits to unlock Earth; after the final clue closes, autopilot flies the spaceship to Earth and triggers the victory celebration once. The landing is saved: returning to the map keeps the ship at Earth, where you can move it manually without replaying the celebration. About and Projects are always accessible from the navigation. Use **RESTART** on the map (or victory screen) to return to the ship with zero credits and undiscovered planets.

Progress is stored under `leyla-space-mission-v1` in the browser's local storage. Your chosen astronaut is kept when you restart.

## Personalize

- Replace `assets/images/leyla-mammadli.jpeg` with an updated portrait if needed.
- The About page hero uses `assets/images/about-hero-background.jpg`; the four “Getting to know Leyla” cards use `assets/images/about-cards-background.jpg` beneath a dark readability overlay. The “Outside the lab” card also includes the separate `assets/images/spiderman-outside-lab.jpg` image.
- The four planet thumbnails are `assets/images/planet-origin.png`, `planet-code.png`, `planet-robotics.png`, and `planet-beyond.png`. The circular Earth icon uses `assets/images/earth-icon.jpg`, enlarged to crop away its surrounding space background.
- Add verified project copy, Hour of Code screenshots, robotics photos, and additional activities where the current labeled placeholders appear.
- The page header icons and footer links lead to the GitHub repository at `https://github.com/leylammmdl09-ai/Liliya_peersonal_website`; the footer email link uses `leylammmdl09@gmail.com`.
- Update the embedded YouTube video and its link in `projects.html` and the Origin clue in `scripts/game.js` if the project demonstration changes.

The project intentionally uses no framework or external JavaScript dependencies. Google Fonts and the YouTube embed require an internet connection; the rest of the site runs as static files.
