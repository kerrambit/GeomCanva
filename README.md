<div align="center">

# GeomCanva

[About](#about) · [Download](#download) · [Getting Started](#getting-started) · [Development](#development)

</div>

---

## About

Application for visualization of basic geometric algorithms.

## Download

You can download the application on the [Relases tab](https://github.com/kerrambit/GeomCanva/releases).

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS)
-   Git

### Install & Run

**1. Install TS dependencies**

```bash
npm install
```

**2. Package the app**

Windows:

```bash
npm run dist:win
```

Linux:

```bash
npm run dist:linux
```

macOS:

```bash
npm run dist:mac
```

Installers are written to the `dist_electron/` output directory.

## Development

Run the app in dev mode with hot reloading powered by Vite:

```bash
npm install
npm run dev
```

Useful scripts:

| Script          | Description                                |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Run Electron + React UI with hot reloading |
| `npm run build` | Type-check and build the renderer bundle   |
| `npm run lint`  | Run ESLint                                 |

## License

Licensed under the [license](LICENSE) license.

Copyright (c) 2026– present, GeomCanva contributors.
