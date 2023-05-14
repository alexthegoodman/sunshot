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

May need to install GTK 2: https://github.com/Automattic/node-canvas/wiki/Installation:-Windows

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

### Notes

If you need any assistance with setup, feel free to add an Issue or email: alexthegoodman@gmail.com

Building `canvas`

- https://github.com/nodejs/nan/issues/892
- https://github.com/Automattic/node-canvas/issues/1589
- https://github.com/Automattic/node-canvas/issues/923

Concatenating video
`ffmpeg -f concat -i input.txt output2.webm`

input.txt format

```
file 'file.webm'
file 'file2.webm'
```

When working with @spectrum-css, copy needed files installed in node_modules to public/lib
