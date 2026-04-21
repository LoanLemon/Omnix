
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_15: IntentMap = new Map([
  ['WINDOWS_OPEN_TASK_MANAGER', {
    keywords: { 'task': 3.5, 'manager': 3.5, 'taskmanager': 4.0, 'open': 2.5, 'start': 2.0, 'run': 2.0, 'processes': 2.0 },
    booster_phrases: { 'open task manager': 5, 'how to start task manager': 5 }
  }],
  ['WINDOWS_CHECK_UPDATES', {
    keywords: { 'windows': 2.0, 'update': 4.0, 'updates': 4.0, 'check': 3.0, 'find': 2.5, 'how to': 2.0 },
    booster_phrases: { 'check for updates': 5, 'how to update windows': 5 }
  }],
  ['WINDOWS_CHANGE_DEFAULT_BROWSER', {
    keywords: { 'default': 3.5, 'browser': 3.5, 'change': 3.0, 'set': 3.0, 'chrome': 2.0, 'firefox': 2.0, 'edge': 2.0 },
    booster_phrases: { 'change default browser': 5, 'set default browser': 5, 'how to change browser': 4 }
  }],
  ['WINDOWS_TAKE_SCREENSHOT', {
    keywords: { 'screenshot': 4.0, 'screen shot': 4.0, 'take': 2.5, 'capture': 3.0, 'screen': 2.5, 'print screen': 3.0, 'snip': 3.0 },
    booster_phrases: { 'take a screenshot': 5, 'how to capture the screen': 5 }
  }],
    ['WINDOWS_TAKE_FULL_SCREENSHOT', {
    keywords: { 'screenshot': 3.0, 'full screen': 4.0, 'entire screen': 4.0, 'take': 2.5, 'capture': 3.0, 'save': 2.5 },
    booster_phrases: { 'screenshot full screen': 5, 'capture entire screen and save': 5 }
  }],
  ['WINDOWS_RESTART_COMPUTER', {
    keywords: { 'restart': 4.0, 'reboot': 4.0, 'computer': 2.5, 'pc': 2.5, 'windows': 2.0, 'how to': 2.0 },
    booster_phrases: { 'how to restart my computer': 5, 'reboot windows': 5 }
  }],
   ['WINDOWS_SHUTDOWN_COMPUTER', {
    keywords: { 'shutdown': 4.0, 'shut down': 4.0, 'turn off': 3.5, 'computer': 2.5, 'pc': 2.5 },
    booster_phrases: { 'how to turn off computer': 5, 'shut down my pc': 5 }
  }],
  ['WINDOWS_LOCK_COMPUTER', {
    keywords: { 'lock': 4.0, 'screen': 2.5, 'computer': 2.5, 'pc': 2.5, 'windows l': 3.0 },
    booster_phrases: { 'lock my computer': 5, 'how to lock the screen': 5 }
  }],
  ['WINDOWS_FIND_IP_ADDRESS', {
    keywords: { 'ip': 4.0, 'address': 3.5, 'find': 3.0, 'what': 1.5, 'my': 1.5, 'ipconfig': 4.0, 'get': 2.5 },
    booster_phrases: { 'find my ip address': 5, "what's my ip": 5, 'how to get ip address': 5 }
  }],
  ['WINDOWS_CONNECT_WIFI', {
    keywords: { 'wifi': 4.0, 'wi-fi': 4.0, 'connect': 3.5, 'network': 3.0, 'internet': 2.5 },
    booster_phrases: { 'connect to wifi': 5, 'how to connect to a new network': 5 }
  }],
  ['WINDOWS_FLUSH_DNS', {
    keywords: { 'flush': 4.0, 'dns': 4.0, 'cache': 3.0, 'reset': 2.5, 'network': 2.0, 'internet': 2.0 },
    booster_phrases: { 'flush dns': 5, 'how to flush dns cache': 5 }
  }],
  ['WINDOWS_FREE_UP_DISK_SPACE', {
    keywords: { 'disk': 3.5, 'space': 3.5, 'free up': 4.0, 'cleanup': 3.5, 'storage': 3.0, 'clean': 3.0, 'full': 2.0 },
    booster_phrases: { 'free up disk space': 5, 'how to clean my disk': 5, 'my storage is full': 4 }
  }],
  ['WINDOWS_SHOW_HIDDEN_FILES', {
    keywords: { 'hidden': 4.0, 'files': 3.0, 'folders': 3.0, 'show': 2.5, 'view': 2.5, 'unhide': 3.0 },
    booster_phrases: { 'show hidden files': 5, 'how to see hidden folders': 5 }
  }],
  ['WINDOWS_CREATE_FOLDER', {
    keywords: { 'create': 3.0, 'make': 3.0, 'new': 2.5, 'folder': 4.0, 'directory': 3.5 },
    booster_phrases: { 'create a new folder': 5, 'how to make a folder': 5 }
  }],
  ['WINDOWS_CHANGE_BACKGROUND', {
    keywords: { 'change': 3.0, 'background': 4.0, 'wallpaper': 4.0, 'desktop': 2.5, 'set': 2.5 },
    booster_phrases: { 'change desktop background': 5, 'how to set wallpaper': 5 }
  }],
  ['WINDOWS_CHANGE_THEME', {
    keywords: { 'change': 3.0, 'theme': 4.0, 'themes': 4.0, 'dark mode': 3.0, 'light mode': 3.0, 'personalize': 2.5 },
    booster_phrases: { 'change windows theme': 5, 'how to enable dark mode': 4 }
  }],
  ['WINDOWS_VIEW_SYSTEM_INFO', {
    keywords: { 'system': 3.0, 'info': 3.0, 'information': 3.0, 'specs': 3.5, 'ram': 2.5, 'cpu': 2.5, 'processor': 2.5 },
    booster_phrases: { 'view system info': 5, 'check my computer specs': 5 }
  }],
  ['WINDOWS_BOOT_SAFE_MODE', {
    keywords: { 'safe mode': 4.0, 'boot': 3.0, 'start in': 3.0, 'troubleshoot': 2.5, 'safemode': 4.0 },
    booster_phrases: { 'how to boot in safe mode': 5, 'start windows in safe mode': 5 }
  }],
  ['WINDOWS_OPEN_CONTROL_PANEL', {
    keywords: { 'control': 3.5, 'panel': 3.5, 'controlpanel': 4.0, 'open': 2.5, 'find': 2.5 },
    booster_phrases: { 'open control panel': 5, 'where is the control panel': 5 }
  }],
  ['WINDOWS_UNINSTALL_PROGRAM', {
    keywords: { 'uninstall': 4.0, 'remove': 3.5, 'delete': 3.0, 'program': 3.0, 'app': 3.0, 'application': 3.0 },
    booster_phrases: { 'how to uninstall a program': 5, 'remove an app': 5 }
  }]
]);