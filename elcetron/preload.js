const { contextBridge, ipcRenderer } = require("electron");

/**
 * Secure bridge between the renderer and the main process.
 * The renderer never touches Node/Electron APIs directly.
 */
contextBridge.exposeInMainWorld("atomcode", {
  /**
   * Proxied fetch to the AtomCode backend.
   * req: { serverUrl, path, method?, token?, body?, timeout? }
   * res: { ok, status, data }
   */
  api: (req) => ipcRenderer.invoke("api:fetch", req),

  openExternal: (url) => ipcRenderer.invoke("app:openExternal", url),

  info: () => ipcRenderer.invoke("app:info"),
});
