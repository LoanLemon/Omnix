const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  fs: {
    readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
    readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path, content) => ipcRenderer.invoke('fs:writeFile', path, content),
  },
  dialog: {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
  }
});
