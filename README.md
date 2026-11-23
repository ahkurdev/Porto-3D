# Porto-3D — 3D Portfolio

Bahasa Indonesia version: [readme.id.md](readme.id.md)

Porto-3D is the 3D portfolio website of Ahmad Kurniawan — an interactive, single-page portfolio rendered in 3D with React, Three.js, and Vite.

## Features

- Interactive 3D scene built with Three.js via @react-three/fiber and @react-three/drei
- Post-processing effects with @react-three/postprocessing
- Smooth scrolling with Lenis
- Portfolio content driven by a central configuration (`src/config.ts`)
- Built with React 19, TypeScript, and Vite

## Getting Started

Prerequisites: Node.js and npm.

```bash
npm install
npm run dev      # development server on http://localhost:3000
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # type check
```

## Project Structure

```
src/
  App.tsx        # application entry and layout
  Scene.tsx      # 3D scene
  components/    # 3D and UI components
  config.ts      # portfolio content configuration
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file.
