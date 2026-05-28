const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  fs: {
    readDir: (dirPath) => ipcRenderer.invoke('fs:readDir', dirPath),
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  },
  os: {
    getMemoryStats: () => ipcRenderer.invoke('os:getMemoryStats')
  },
  dialog: {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
  },
  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args)
  },
  onInferenceRequest: (callback) => ipcRenderer.on('execute-inference', (event, data) => callback(data)),
  sendInferenceResult: (requestId, response) => ipcRenderer.send('inference-result', { requestId, response })
});
