# SunShot - Beautiful Screen Recordings

- Electron / Next.js
- Windows Only (for now)

## Getting Started

### Clone Repos

Make sure to follow the README in both repos. 
Follow the `sunshot-recorder` README first!
Clone these repos next to eachother.

- https://github.com/alexthegoodman/sunshot
- https://github.com/alexthegoodman/sunshot-recorder

### Install Dependencies

```
`choco install ffmpeg`
`volta install node@16.16.0`
`npm install`
`npm link sunshot-recorder`
`./node_modules/.bin/electron-rebuild`
```

### Try App

```
# development mode
`npm run dev`

# production build
`npm run build`
```
