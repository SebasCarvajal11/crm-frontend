import type { CimaIconDefinition } from './types'

export const statusIcons: Record<string, CimaIconDefinition> = {
  "Activity": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 15.0002H5C5.63383 15.0002 5.95074 15.0002 6.23374 15.1215C6.51673 15.2428 6.73529 15.4723 7.17241 15.9313L8.31402 17.13C8.69807 17.5332 8.8901 17.7348 9.12399 17.7191C9.35788 17.7035 9.52124 17.478 9.84796 17.027L13.4781 12.0163C13.8177 11.5476 13.9875 11.3132 14.2282 11.3022C14.4688 11.2911 14.6594 11.5089 15.0405 11.9445L16.8179 13.9758C17.2591 14.48 17.4797 14.7321 17.7751 14.8662C18.0705 15.0002 18.4056 15.0002 19.0756 15.0002H22\"/><path d=\"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "pulse-2-linear"
  },
  "AlertCircle": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"60\" d=\"M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"60;0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M12 7v6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"4\" stroke-dashoffset=\"4\" d=\"M12 17v0.01\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "alert-circle"
  },
  "AlertOctagon": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"60\" d=\"M12 3l9 17h-18l9 -17Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"60;0\"/></path><path stroke-dasharray=\"6\" stroke-dashoffset=\"6\" d=\"M12 10v4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"4\" stroke-dashoffset=\"4\" d=\"M12 17v0.01\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "alert"
  },
  "AlertTriangle": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"60\" d=\"M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"60;0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M12 7v6\"><animate attributeName=\"stroke-width\" begin=\"0.7s\" dur=\"3s\" keyTimes=\"0;0.1;0.2;0.3;1\" repeatCount=\"indefinite\" values=\"2;3;3;2;2\"/><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"4\" stroke-dashoffset=\"4\" d=\"M12 17v0.01\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/><animate attributeName=\"stroke-width\" begin=\"1s\" dur=\"3s\" keyTimes=\"0;0.1;0.2;0.3;1\" repeatCount=\"indefinite\" values=\"2;3;3;2;2\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "alert-circle-loop"
  },
  "Check": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"26\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 11l6 6l10 -10\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"26;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "confirm"
  },
  "CheckCheck": {
    body: "<defs><mask id=\"SVG9LXuEA4n\"><g fill=\"none\" stroke-dasharray=\"24\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke=\"#fff\" stroke-width=\"2\" d=\"M2 13.5l4 4l10.75 -10.75\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"24;0\"/></path><path stroke=\"#000\" stroke-dashoffset=\"24\" stroke-width=\"6\" d=\"M7.5 13.5l4 4l10.75 -10.75\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.3s\" to=\"0\"/></path></g></mask></defs><path fill=\"currentColor\" d=\"M0 0h24v24H0z\" mask=\"url(#SVG9LXuEA4n)\"/><path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"24\" stroke-dashoffset=\"24\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M7.5 13.5l4 4l10.75 -10.75\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.3s\" to=\"0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "check-all"
  },
  "CheckCircle": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"60\" d=\"M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"60;0\"/></path><path stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M8 12l3 3l5 -5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "confirm-circle"
  },
  "CheckCircle2": {
    body: "<defs><mask id=\"SVGCa0448Wh\"><g stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path fill=\"#fff\" fill-opacity=\"0\" stroke=\"#fff\" stroke-dasharray=\"60\" d=\"M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"60;0\"/><animate fill=\"freeze\" attributeName=\"fill-opacity\" begin=\"0.6s\" dur=\"0.4s\" to=\"1\"/></path><path fill=\"none\" stroke=\"#000\" stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M8 12l3 3l5 -5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"1.1s\" dur=\"0.2s\" to=\"0\"/></path></g></mask></defs><path fill=\"currentColor\" d=\"M0 0h24v24H0z\" mask=\"url(#SVGCa0448Wh)\"/>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "confirm-circle-filled"
  },
  "CheckIcon": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"26\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 11l6 6l10 -10\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"26;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "confirm"
  },
  "CheckSquare": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke-dasharray=\"66\" stroke-width=\"2\" d=\"M12 3h7v18h-14v-18h7Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"66;0\"/></path><path stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M14.5 3.5v3h-5v-3\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" stroke-width=\"2\" d=\"M9 13l2 2l4 -4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "clipboard-check"
  },
  "CheckSquare2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke-dasharray=\"66\" stroke-width=\"2\" d=\"M12 3h7v18h-14v-18h7Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"66;0\"/></path><path stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M14.5 3.5v3h-5v-3\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" stroke-width=\"2\" d=\"M9 13l2 2l4 -4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "clipboard-check"
  },
  "Clock": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M2 12c1.72 -3.83 5.53 -6.5 10 -6.5c4.47 0 8.28 2.67 10 6.5c-1.72 3.83 -5.53 6.5 -10 6.5c-4.47 0 -8.28 -2.67 -10 -6.5Z\"><animate fill=\"freeze\" attributeName=\"d\" dur=\"0.5s\" values=\"M4 12c1.38 -0.77 4.42 -1.3 8 -1.3c3.58 0 6.62 0.53 8 1.3c-1.38 0.77 -4.42 1.3 -8 1.3c-3.58 0 -6.62 -0.53 -8 -1.3Z;M2 12c1.72 -3.83 5.53 -6.5 10 -6.5c4.47 0 8.28 2.67 10 6.5c-1.72 3.83 -5.53 6.5 -10 6.5c-4.47 0 -8.28 -2.67 -10 -6.5Z\"/></path><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"currentColor\"><animate fill=\"freeze\" attributeName=\"r\" dur=\"0.2s\" values=\"0;3\"/></circle>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "watch"
  },
  "Clock3": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 12c1.38 -0.77 4.42 -1.3 8 -1.3c3.58 0 6.62 0.53 8 1.3c-1.38 0.77 -4.42 1.3 -8 1.3c-3.58 0 -6.62 -0.53 -8 -1.3Z\"><animate attributeName=\"d\" dur=\"6s\" keyTimes=\"0;0.03;0.97;1\" repeatCount=\"indefinite\" values=\"M4 12c1.38 -0.77 4.42 -1.3 8 -1.3c3.58 0 6.62 0.53 8 1.3c-1.38 0.77 -4.42 1.3 -8 1.3c-3.58 0 -6.62 -0.53 -8 -1.3Z;M2 12c1.72 -3.83 5.53 -6.5 10 -6.5c4.47 0 8.28 2.67 10 6.5c-1.72 3.83 -5.53 6.5 -10 6.5c-4.47 0 -8.28 -2.67 -10 -6.5Z;M2 12c1.72 -3.83 5.53 -6.5 10 -6.5c4.47 0 8.28 2.67 10 6.5c-1.72 3.83 -5.53 6.5 -10 6.5c-4.47 0 -8.28 -2.67 -10 -6.5Z;M4 12c1.38 -0.77 4.42 -1.3 8 -1.3c3.58 0 6.62 0.53 8 1.3c-1.38 0.77 -4.42 1.3 -8 1.3c-3.58 0 -6.62 -0.53 -8 -1.3Z\"/></path><circle cx=\"12\" cy=\"12\" fill=\"currentColor\"><animate attributeName=\"r\" dur=\"6s\" keyTimes=\"0;0.03;0.97;1\" repeatCount=\"indefinite\" values=\"0;3;3;0\"/></circle>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "watch-loop"
  },
  "Cloud": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"60\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M7 19h11c2.21 0 4 -1.79 4 -4c0 -2.21 -1.79 -4 -4 -4h-1v-1c0 -2.76 -2.24 -5 -5 -5c-2.42 0 -4.44 1.72 -4.9 4h-0.1c-2.76 0 -5 2.24 -5 5c0 2.76 2.24 5 5 5Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"60;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "cloud-alt"
  },
  "Database": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 17C2 15.1144 2 14.1716 2.58579 13.5858C3.17157 13 4.11438 13 6 13H18C19.8856 13 20.8284 13 21.4142 13.5858C22 14.1716 22 15.1144 22 17C22 18.8856 22 19.8284 21.4142 20.4142C20.8284 21 19.8856 21 18 21H6C4.11438 21 3.17157 21 2.58579 20.4142C2 19.8284 2 18.8856 2 17Z\"/><path d=\"M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2H18C19.8856 2 20.8284 2 21.4142 2.58579C22 3.17157 22 4.11438 22 6C22 7.88562 22 8.82843 21.4142 9.41421C20.8284 10 19.8856 10 18 10H6C4.11438 10 3.17157 10 2.58579 9.41421C2 8.82843 2 7.88562 2 6Z\"/><path d=\"M13.5 6L18 6\"/><path d=\"M6 7L6 5\"/><path d=\"M9 7L9 5\"/><path d=\"M13.5 17H18\"/><path d=\"M6 18L6 16\"/><path d=\"M9 18L9 16\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "server-2-linear"
  },
  "Eye": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z\"/><path d=\"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "eye-linear"
  },
  "EyeOff": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M12 14C5 14 2 7 2 7M22 7C22 7 21.0586 9.19661 19 11.1288C18.0872 11.9856 16.9547 12.7904 15.5872 13.3287C14.5334 13.7435 13.34 14 12 14M12 14V16.5M15.5872 13.3287L17 15.5M19 11.1288L20.5 12.6288M8.41281 13.3287L7 15.5M5 11.1288L3.5 12.6288\"/>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "eye-closed-linear"
  },
  "HardDrive": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M3.46447 20.5355C4.92893 22 7.28595 22 12 22C16.714 22 19.0711 22 20.5355 20.5355C22 19.0711 22 16.714 22 12C22 11.6585 22 11.4878 21.9848 11.3142C21.9142 10.5049 21.586 9.71257 21.0637 9.09034C20.9516 8.95687 20.828 8.83317 20.5806 8.58578L15.4142 3.41944C15.1668 3.17206 15.0431 3.04835 14.9097 2.93631C14.2874 2.414 13.4951 2.08581 12.6858 2.01515C12.5122 2 12.3415 2 12 2C7.28595 2 4.92893 2 3.46447 3.46447C2 4.92893 2 7.28595 2 12C2 16.714 2 19.0711 3.46447 20.5355Z\"/><path d=\"M17 21.8731V21C17 19.1144 17 18.1716 16.4142 17.5858C15.8284 17 14.8856 17 13 17H11C9.11438 17 8.17157 17 7.58579 17.5858C7 18.1716 7 19.1144 7 21V21.8731\"/><path d=\"M7 8H13\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "diskette-linear"
  },
  "HelpCircle": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"60\" d=\"M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"60;0\"/></path><path stroke-dasharray=\"18\" stroke-dashoffset=\"18\" d=\"M9 10c0 -1.66 1.34 -3 3 -3c1.66 0 3 1.34 3 3c0 0.98 -0.47 1.85 -1.2 2.4c-0.73 0.55 -1.3 0.6 -1.8 1.6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.3s\" to=\"0\"/></path><path stroke-dasharray=\"4\" stroke-dashoffset=\"4\" d=\"M12 17v0.01\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "question-circle"
  },
  "History": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M12 8V12L14.5 14.5\"/><path d=\"M4.33776 6.87052L5.60414 5.60414C9.10115 2.10713 14.7996 2.13576 18.3319 5.6681C21.8642 9.20044 21.8929 14.8988 18.3959 18.3959C14.8988 21.8929 9.20044 21.8642 5.6681 18.3319C3.57589 16.2397 2.71285 13.3876 3.08355 10.6831M4.32497 4.32497L4.33776 6.87052L6.88331 6.88331\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "history-linear"
  },
  "Lock": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16Z\"/><circle cx=\"12\" cy=\"16\" r=\"2\"/><path d=\"M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "lock-keyhole-linear"
  },
  "Shield": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"60\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 2l-8 3.5v6.5c0 3.5 3.5 8 8 10c4.5 -1 8 -6.5 8 -10v-6.5l-8 -3.5Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"60;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "security"
  },
  "ShieldAlert": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 17.6294 16.761 20.3655 14.1014 21.5273C13.38 21.8424 13.0193 22 12 22C10.9807 22 10.62 21.8424 9.89856 21.5273C7.23896 20.3655 3 17.6294 3 11.9914C3 11.4234 3 10.8996 3 10.4167Z\"/><path d=\"M12 8V12\"/><path stroke-linejoin=\"round\" d=\"M12 15H12.0001\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "shield-warning-linear"
  },
  "ShieldCheck": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 17.6294 16.761 20.3655 14.1014 21.5273C13.38 21.8424 13.0193 22 12 22C10.9807 22 10.62 21.8424 9.89856 21.5273C7.23896 20.3655 3 17.6294 3 11.9914C3 11.4234 3 10.8996 3 10.4167Z\"/><path stroke-linejoin=\"round\" d=\"M9.5 12.4L10.9286 14L14.5 10\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "shield-check-linear"
  },
  "ShieldPlus": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 17.6294 16.761 20.3655 14.1014 21.5273C13.38 21.8424 13.0193 22 12 22C10.9807 22 10.62 21.8424 9.89856 21.5273C7.23896 20.3655 3 17.6294 3 11.9914C3 11.4234 3 10.8996 3 10.4167Z\"/><path d=\"M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "shield-plus-linear"
  },
  "WifiOff": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M22 19H14M2 19H10\"/><path d=\"M12 17V14\"/><circle cx=\"12\" cy=\"19\" r=\"2\"/><path d=\"M2 11C2 9.34315 3.34315 8 5 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H5C3.34315 14 2 12.6569 2 11Z\"/><path d=\"M2 5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5C22 6.65685 20.6569 8 19 8H5C3.34315 8 2 6.65685 2 5Z\"/><path d=\"M13 5L19 5\"/><path d=\"M13 11L19 11\"/><path stroke-linejoin=\"round\" d=\"M6 5H6.0001\"/><path stroke-linejoin=\"round\" d=\"M6 11H6.0001\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "server-path-linear"
  },
  "X": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"12\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 12l7 7M12 12l-7 -7M12 12l-7 7M12 12l7 -7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"12;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "close"
  },
  "XCircle": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"60\" d=\"M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"60;0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M12 12l4 4M12 12l-4 -4M12 12l-4 4M12 12l4 -4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "close-circle"
  },
  "XIcon": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"12\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 12l7 7M12 12l-7 -7M12 12l-7 7M12 12l7 -7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"12;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "close"
  },
  "Zap": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M5.66953 9.91436L8.73167 5.77133C10.711 3.09327 11.7007 1.75425 12.6241 2.03721C13.5474 2.32018 13.5474 3.96249 13.5474 7.24712V7.55682C13.5474 8.74151 13.5474 9.33386 13.926 9.70541L13.946 9.72466C14.3327 10.0884 14.9492 10.0884 16.1822 10.0884C18.4011 10.0884 19.5106 10.0884 19.8855 10.7613C19.8917 10.7724 19.8977 10.7837 19.9036 10.795C20.2576 11.4784 19.6152 12.3475 18.3304 14.0857L15.2683 18.2287C13.2889 20.9067 12.2992 22.2458 11.3758 21.9628C10.4525 21.6798 10.4525 20.0375 10.4525 16.7528L10.4526 16.4433C10.4526 15.2585 10.4526 14.6662 10.074 14.2946L10.054 14.2754C9.6673 13.9117 9.05079 13.9117 7.81775 13.9117C5.59888 13.9117 4.48945 13.9117 4.1145 13.2387C4.10829 13.2276 4.10225 13.2164 4.09639 13.205C3.74244 12.5217 4.3848 11.6526 5.66953 9.91436Z\"/>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "bolt-linear"
  },
}
