/* eslint-disable node/prefer-global/process */
import path from 'node:path'
import { BrowserWindow, app, nativeTheme } from 'electron'
import { store } from './services/store'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow
let isQuitting = false

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line ts/no-require-imports
if (require('electron-squirrel-startup'))
  app.quit()

function createWindow() {
  const bounds = store.app.get('bounds')
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 900,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#181818' : '#fff',
    ...bounds,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  }
  else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    )
  }

  if (isDev)
    mainWindow.webContents.openDevTools()

  mainWindow.on('move', () => store.app.set('bounds', mainWindow.getBounds()))
  mainWindow.on('resize', () =>
    store.app.set('bounds', mainWindow.getBounds()))

  mainWindow.on('close', (event: Event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    else {
      mainWindow = null
    }
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('activate', () => {
  mainWindow.show()
})
