# :droplet: SprayBottle 
**A simple tool for supercharging your scripts** -
The aim of this app, is to provide a GUI for admins to easily run scripts, and deliver those scripts to non-technical end users in a simple, non-threating way. :baby_chick:

**Admin Mode**
![adminScreenshot](https://github.com/jooshkins/SprayBottle/blob/master/3.png)

**Simple Mode** - for end users
![simpleScreenshot](https://github.com/jooshkins/SprayBottle/blob/master/4.png)

:floppy_disk: [Releases](https://github.com/jooshkins/SprayBottle/releases) :tada:

### Features

- [x] Simple Self-Service mode for end-users
- [x] Admin mode with optional parameters and console
- [x] Optional launching scripts with admin rights
- [x] Info section for storing documentation
- [x] Support of Non Powershell Scripts
- [x] OSX support ** Requires [PowerShell Core](https://github.com/PowerShell/PowerShell) installed **

### Planned Features
- [ ] Support for Linux
- [ ] Saved sets of tasks
- [ ] Pushing remote cmds

#### To Install from Source:
`npm install`

#### To Develop, Use:
Runs local server and opens electron.
`npm run-script electron-dev`

#### To Build Executables and Installers:
You will need to run on your intended target OS i.e. windows builds windows apps, mac builds mac apps, etc
`npm run-script dist`

### Built with:
* [Electron](https://github.com/electron/electron)
* [React](https://github.com/facebook/react)

### License
[MIT](https://github.com/jooshkins/SprayBottle/blob/master/LICENSE)
