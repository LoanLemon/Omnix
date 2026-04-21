
import { FoundationalKnowledge } from '../../types';

export const WINDOWS_UTILITY_KNOWLEDGE: FoundationalKnowledge = [
  // --- Task Manager ---
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "OpenTaskManager", "importance": 1.0,
    "input_pattern": "WINDOWS_OPEN_TASK_MANAGER",
    "output_template": "To open the Task Manager in Windows, you can press Ctrl + Shift + Esc on your keyboard. Alternatively, you can right-click the Start button and select 'Task Manager' from the menu."
  },

  // --- Windows Update ---
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "CheckForUpdates", "importance": 1.0,
    "input_pattern": "WINDOWS_CHECK_UPDATES",
    "output_template": "To check for updates in Windows 11, go to Start > Settings > Windows Update, and then select 'Check for updates'. In Windows 10, it's Start > Settings > Update & Security > Windows Update."
  },

  // --- Default Browser ---
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "ChangeDefaultBrowser", "importance": 1.0,
    "input_pattern": "WINDOWS_CHANGE_DEFAULT_BROWSER",
    "output_template": "To change your default browser in Windows, go to Start > Settings > Apps > Default apps. Select the browser you want to make the default, and then click the 'Set default' button at the top."
  },

  // --- Screenshot ---
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "TakeScreenshot", "importance": 1.0,
    "input_pattern": "WINDOWS_TAKE_SCREENSHOT",
    "output_template": "A quick way to take a screenshot is to press the Windows key + Shift + S. This will open the Snipping Tool, allowing you to select a portion of your screen to capture. The image is copied to your clipboard."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "TakeFullScreenScreenshot", "importance": 0.9,
    "input_pattern": "WINDOWS_TAKE_FULL_SCREENSHOT",
    "output_template": "To take a screenshot of your entire screen and save it automatically, press the Windows key + Print Screen (PrtScn). The screen will dim briefly, and the screenshot will be saved in your Pictures > Screenshots folder."
  },

  // --- System Actions ---
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "RestartComputer", "importance": 1.0,
    "input_pattern": "WINDOWS_RESTART_COMPUTER",
    "output_template": "To restart your computer, click the Start button, then click the Power icon, and select 'Restart'."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "ShutdownComputer", "importance": 1.0,
    "input_pattern": "WINDOWS_SHUTDOWN_COMPUTER",
    "output_template": "To shut down your computer, click the Start button, click the Power icon, and select 'Shut down'."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "LockComputer", "importance": 1.0,
    "input_pattern": "WINDOWS_LOCK_COMPUTER",
    "output_template": "To quickly lock your computer, press the Windows key + L. This will take you to the lock screen, and you will need to enter your password to get back in."
  },

  // --- Network ---
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "FindIpAddress", "importance": 1.0,
    "input_pattern": "WINDOWS_FIND_IP_ADDRESS",
    "output_template": "To find your IP address, open the Command Prompt (search for 'cmd' in the Start menu) and type 'ipconfig', then press Enter. Your IP address will be listed under 'IPv4 Address'."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "ConnectToWiFi", "importance": 1.0,
    "input_pattern": "WINDOWS_CONNECT_WIFI",
    "output_template": "To connect to a Wi-Fi network, select the Network icon on the taskbar. Select the Wi-Fi network you want, then select 'Connect'. Type the network password, and then select 'Next'."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "FlushDns", "importance": 1.0,
    "input_pattern": "WINDOWS_FLUSH_DNS",
    "output_template": "To flush the DNS cache, open Command Prompt as an administrator (search for 'cmd', right-click, and choose 'Run as administrator'), then type 'ipconfig /flushdns' and press Enter."
  },

  // --- File Management ---
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "FreeUpDiskSpace", "importance": 1.0,
    "input_pattern": "WINDOWS_FREE_UP_DISK_SPACE",
    "output_template": "To free up disk space, you can use the Disk Cleanup tool. Search for 'Disk Cleanup' in the Start menu and select the drive you want to clean. It will show you temporary files and other data you can safely delete."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "ShowHiddenFiles", "importance": 1.0,
    "input_pattern": "WINDOWS_SHOW_HIDDEN_FILES",
    "output_template": "To show hidden files, open File Explorer, click the 'View' tab at the top, then check the 'Hidden items' box."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "CreateFolder", "importance": 1.0,
    "input_pattern": "WINDOWS_CREATE_FOLDER",
    "output_template": "To create a new folder on your desktop or in File Explorer, right-click on an empty space, go to 'New', and then select 'Folder'. Type a name for the folder and press Enter."
  },

  // --- Personalization ---
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "ChangeBackground", "importance": 1.0,
    "input_pattern": "WINDOWS_CHANGE_BACKGROUND",
    "output_template": "To change your desktop background, right-click on your desktop, select 'Personalize', and then go to the 'Background' section. You can choose a picture, a solid color, or a slideshow."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "ChangeTheme", "importance": 1.0,
    "input_pattern": "WINDOWS_CHANGE_THEME",
    "output_template": "To change your theme, go to Start > Settings > Personalization > Themes. You can select a default theme or get more from the Microsoft Store."
  },

  // --- Troubleshooting & System Info ---
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "OpenSystemInfo", "importance": 1.0,
    "input_pattern": "WINDOWS_VIEW_SYSTEM_INFO",
    "output_template": "To view your system information, such as your processor and installed RAM, right-click on the Start button, select 'System'. You can also search for 'msinfo32' and run it."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "SafeMode", "importance": 1.0,
    "input_pattern": "WINDOWS_BOOT_SAFE_MODE",
    "output_template": "To boot into Safe Mode, go to Settings > Update & Security > Recovery. Under 'Advanced startup', select 'Restart now'. Once your PC restarts, go to Troubleshoot > Advanced options > Startup Settings > Restart. After it restarts again, you can select option 4 for Safe Mode."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "OpenControlPanel", "importance": 1.0,
    "input_pattern": "WINDOWS_OPEN_CONTROL_PANEL",
    "output_template": "To open the Control Panel, search for 'Control Panel' in the Start menu and select it from the results."
  },
  {
    "category": "WindowsUtility", "type": "Instruction", "topic": "UninstallProgram", "importance": 1.0,
    "input_pattern": "WINDOWS_UNINSTALL_PROGRAM",
    "output_template": "To uninstall a program, go to Start > Settings > Apps > Apps & features. Find the app you want to remove, select it, and then click 'Uninstall'."
  }
];