// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const isDev = !app.isPackaged; // 是否是开发模式
const RCInit = require('@rongcloud/electron')
let rcService;
const waitForVite = async (url, timeout = 5000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return false;
};
async function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    }
  })

  const viteUrl = 'http://localhost:5173';

  if (isDev) {
    const viteReady = await waitForVite(viteUrl);
    if (viteReady) {
      mainWindow.loadURL(viteUrl);
    } else {
      console.error("❌ Vite 启动失败，请检查错误日志！");
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, 'webApp/dist/index.html'));
  }

  // // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // 在 app 的 ready 事件通知后进行初始化
  rcService = RCInit({
    /**
     * 【必填】Appkey , 自 5.6.0 版本起，必须填该参数
     * [option]
     */
    appkey: 'mgb7ka1nm2ckg',
    /**
     * 【选填】消息数据库的存储位置，不推荐修改
     * [option]
     */
    dbpath: app.getPath('userData'),
    /**
     * 【选填】日志等级
     * [option] 4 - DEBUG, 3 - INFO, 2(default) - WARN, 1 - ERROR
     */
    logOutputLevel: 2,
    /**
     * 【选填】是否同步空的置顶会话，默认值为 `false`
     * [option]
     */
    enableSyncEmptyTopConversation: false,
    runInMainProcess: true,
    disableLogReport: true,
  });
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('before-quit', () => {
    // 在 app 退出时清理状态
    rcService.destroy()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
