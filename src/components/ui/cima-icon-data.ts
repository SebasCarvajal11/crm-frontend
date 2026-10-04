// Catálogo Oficial de Iconografía CIMA CRM (136 Iconos Curados y Optimizados)
// Provee vectores nativos animados y lineales sin dependencias de red en runtime.

export interface CimaIconDefinition {
  body: string;
  width: number;
  height: number;
  prefix: 'line-md' | 'solar' | 'tabler';
  name: string;
}

export const CIMA_ICONS_DATA: Record<string, CimaIconDefinition> = {
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
  "Archive": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M9 12C9 11.5341 9 11.3011 9.07612 11.1173C9.17761 10.8723 9.37229 10.6776 9.61732 10.5761C9.80109 10.5 10.0341 10.5 10.5 10.5H13.5C13.9659 10.5 14.1989 10.5 14.3827 10.5761C14.6277 10.6776 14.8224 10.8723 14.9239 11.1173C15 11.3011 15 11.5341 15 12C15 12.4659 15 12.6989 14.9239 12.8827C14.8224 13.1277 14.6277 13.3224 14.3827 13.4239C14.1989 13.5 13.9659 13.5 13.5 13.5H10.5C10.0341 13.5 9.80109 13.5 9.61732 13.4239C9.37229 13.3224 9.17761 13.1277 9.07612 12.8827C9 12.6989 9 12.4659 9 12Z\"/><path d=\"M20.5 7V13C20.5 16.7712 20.5 18.6569 19.3284 19.8284C18.1569 21 16.2712 21 12.5 21H11.5C7.72876 21 5.84315 21 4.67157 19.8284C3.5 18.6569 3.5 16.7712 3.5 13V7\"/><path d=\"M2 5C2 4.05719 2 3.58579 2.29289 3.29289C2.58579 3 3.05719 3 4 3H20C20.9428 3 21.4142 3 21.7071 3.29289C22 3.58579 22 4.05719 22 5C22 5.94281 22 6.41421 21.7071 6.70711C21.4142 7 20.9428 7 20 7H4C3.05719 7 2.58579 7 2.29289 6.70711C2 6.41421 2 5.94281 2 5Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "archive-linear"
  },
  "ArrowLeft": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"20\" d=\"M21 12h-17.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"20;0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" d=\"M3 12l7 7M3 12l7 -7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "arrow-left"
  },
  "ArrowRight": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"20\" d=\"M3 12h17.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"20;0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" d=\"M21 12l-7 7M21 12l-7 -7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "arrow-right"
  },
  "Award": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M12.0002 16C6.24021 16 5.21983 10.2595 5.03907 5.70647C4.98879 4.43998 4.96365 3.80673 5.43937 3.22083C5.91508 2.63494 6.48445 2.53887 7.62318 2.34674C8.74724 2.15709 10.2166 2 12.0002 2C13.7837 2 15.2531 2.15709 16.3771 2.34674C17.5159 2.53887 18.0852 2.63494 18.5609 3.22083C19.0367 3.80673 19.0115 4.43998 18.9612 5.70647C18.7805 10.2595 17.7601 16 12.0002 16Z\"/><path d=\"M12 16V19\"/><path stroke-linejoin=\"round\" d=\"M15.5 22H8.5L8.83922 20.3039C8.93271 19.8365 9.34312 19.5 9.8198 19.5H14.1802C14.6569 19.5 15.0673 19.8365 15.1608 20.3039L15.5 22Z\"/><path d=\"M11.1459 6.02251C11.5259 5.34084 11.7159 5 12 5C12.2841 5 12.4741 5.34084 12.8541 6.02251L12.9524 6.19887C13.0603 6.39258 13.1143 6.48944 13.1985 6.55334C13.2827 6.61725 13.3875 6.64097 13.5972 6.68841L13.7881 6.73161C14.526 6.89857 14.895 6.98205 14.9828 7.26432C15.0706 7.54659 14.819 7.84072 14.316 8.42898L14.1858 8.58117C14.0429 8.74833 13.9714 8.83191 13.9392 8.93531C13.9071 9.03872 13.9179 9.15023 13.9395 9.37327L13.9592 9.57632C14.0352 10.3612 14.0733 10.7536 13.8435 10.9281C13.6136 11.1025 13.2682 10.9435 12.5773 10.6254L12.3986 10.5431C12.2022 10.4527 12.1041 10.4075 12 10.4075C11.8959 10.4075 11.7978 10.4527 11.6014 10.5431L11.4227 10.6254C10.7318 10.9435 10.3864 11.1025 10.1565 10.9281C9.92674 10.7536 9.96476 10.3612 10.0408 9.57632L10.0605 9.37327C10.0821 9.15023 10.0929 9.03872 10.0608 8.93531C10.0286 8.83191 9.95713 8.74833 9.81418 8.58117L9.68403 8.42898C9.18097 7.84072 8.92945 7.54659 9.01723 7.26432C9.10501 6.98205 9.47396 6.89857 10.2119 6.73161L10.4028 6.68841C10.6125 6.64097 10.7173 6.61725 10.8015 6.55334C10.8857 6.48944 10.9397 6.39258 11.0476 6.19887L11.1459 6.02251Z\"/><path d=\"M18 22H6\"/><path d=\"M17.6401 12.422C18.579 11.9004 19.5178 11.3788 20.4567 10.8572C21.2091 10.4392 21.5853 10.2302 21.7925 9.87809C21.9997 9.52598 21.9997 9.09561 21.9997 8.23487L21.9997 8.16234C21.9998 7.11873 21.9998 6.59692 21.7166 6.20408C21.4335 5.81124 20.9385 5.64623 19.9484 5.31621L18.9998 5\"/><path d=\"M6.36008 12.4223C5.42107 11.9006 4.48206 11.3789 3.54305 10.8572C2.79063 10.4392 2.41442 10.2302 2.20723 9.87809C2.00004 9.52598 2.00003 9.09561 2 8.23487L2 8.16234C1.99997 7.11873 1.99996 6.59692 2.2831 6.20408C2.56623 5.81124 3.06126 5.64623 4.05132 5.31621L4.99994 5\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "cup-star-linear"
  },
  "BadgeDollarSign": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6V18\"/><path d=\"M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "dollar-linear"
  },
  "BarChart3": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M3 22H21\"/><path d=\"M3 11C3 10.0572 3 9.58579 3.29289 9.29289C3.58579 9 4.05719 9 5 9C5.94281 9 6.41421 9 6.70711 9.29289C7 9.58579 7 10.0572 7 11V17C7 17.9428 7 18.4142 6.70711 18.7071C6.41421 19 5.94281 19 5 19C4.05719 19 3.58579 19 3.29289 18.7071C3 18.4142 3 17.9428 3 17V11Z\"/><path d=\"M10 7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5C12.9428 5 13.4142 5 13.7071 5.29289C14 5.58579 14 6.05719 14 7V17C14 17.9428 14 18.4142 13.7071 18.7071C13.4142 19 12.9428 19 12 19C11.0572 19 10.5858 19 10.2929 18.7071C10 18.4142 10 17.9428 10 17V7Z\"/><path d=\"M17 4C17 3.05719 17 2.58579 17.2929 2.29289C17.5858 2 18.0572 2 19 2C19.9428 2 20.4142 2 20.7071 2.29289C21 2.58579 21 3.05719 21 4V17C21 17.9428 21 18.4142 20.7071 18.7071C20.4142 19 19.9428 19 19 19C18.0572 19 17.5858 19 17.2929 18.7071C17 18.4142 17 17.9428 17 17V4Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "chart-2-linear"
  },
  "Bell": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"4\" d=\"M12 3v2\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.2s\" values=\"4;0\"/><animateTransform attributeName=\"transform\" dur=\"6s\" keyTimes=\"0;0.05;0.15;0.2;1\" repeatCount=\"indefinite\" type=\"rotate\" values=\"0 12 3;3 12 3;-3 12 3;0 12 3;0 12 3\"/></path><path stroke-dasharray=\"30\" stroke-dashoffset=\"30\" d=\"M12 5c-3.31 0 -6 2.69 -6 6l0 6c-1 0 -2 1 -2 2h8M12 5c3.31 0 6 2.69 6 6l0 6c1 0 2 1 2 2h-8\"><animateTransform attributeName=\"transform\" dur=\"6s\" keyTimes=\"0;0.05;0.15;0.2;1\" repeatCount=\"indefinite\" type=\"rotate\" values=\"0 12 3;3 12 3;-3 12 3;0 12 3;0 12 3\"/><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.2s\" dur=\"0.4s\" to=\"0\"/></path><path stroke-dasharray=\"10\" stroke-dashoffset=\"10\" d=\"M10 20c0 1.1 0.9 2 2 2c1.1 0 2 -0.9 2 -2\"><animateTransform attributeName=\"transform\" begin=\"0.2s\" dur=\"6s\" keyTimes=\"0;0.05;0.15;0.2;1\" repeatCount=\"indefinite\" type=\"rotate\" values=\"0 12 8;6 12 8;-6 12 8;0 12 8;0 12 8\"/><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"6\" stroke-dashoffset=\"6\" d=\"M22 6v4\"><animate attributeName=\"stroke-width\" begin=\"0.9s\" dur=\"3s\" keyTimes=\"0;0.1;0.2;0.3;1\" repeatCount=\"indefinite\" values=\"2;3;3;2;2\"/><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"4\" stroke-dashoffset=\"4\" d=\"M22 14v0.01\"><animate attributeName=\"stroke-width\" begin=\"1.1s\" dur=\"3s\" keyTimes=\"0;0.1;0.2;0.3;1\" repeatCount=\"indefinite\" values=\"2;3;3;2;2\"/><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"1.1s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "bell-alert-loop"
  },
  "Bot": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm6-4v2m-3 8v9m6-9v9M5 16l4-2m6 0l4 2M9 18h6M10 8v.01M14 8v.01\"/>",
    width: 24,
    height: 24,
    prefix: "tabler",
    name: "robot"
  },
  "Briefcase": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"64\" d=\"M9 7h11c0.55 0 1 0.45 1 1v11c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-11c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"64;0\"/></path><path stroke-dasharray=\"16\" stroke-dashoffset=\"16\" d=\"M9 7v-3c0 -0.55 0.45 -1 1 -1h4c0.55 0 1 0.45 1 1v3\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.3s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "briefcase"
  },
  "BriefcaseBusiness": {
    body: "<g stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path fill=\"currentColor\" fill-opacity=\"0\" stroke-dasharray=\"64\" d=\"M9 7h11c0.55 0 1 0.45 1 1v11c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-11c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"64;0\"/><animate fill=\"freeze\" attributeName=\"fill-opacity\" begin=\"1s\" dur=\"0.15s\" to=\".3\"/></path><path fill=\"none\" stroke-dasharray=\"16\" stroke-dashoffset=\"16\" d=\"M9 7v-3c0 -0.55 0.45 -1 1 -1h4c0.55 0 1 0.45 1 1v3\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.3s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "briefcase-twotone"
  },
  "Building2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M3 22V12C3 10.1144 3 9.17157 3.58579 8.58579C4.17157 8 5.11438 8 7 8C8.88562 8 9.82843 8 10.4142 8.58579C11 9.17157 11 10.1144 11 12\"/><path d=\"M17 22V16C17 14.1144 17 13.1716 16.4142 12.5858C15.8284 12 14.8856 12 13 12H11C9.11438 12 8.17157 12 7.58579 12.5858C7 13.1716 7 14.1144 7 16V22\"/><path d=\"M21 21.9999V7.77195C21 6.4311 21 5.76068 20.6439 5.24676C20.2877 4.73283 19.66 4.49743 18.4045 4.02663C15.9492 3.10591 14.7216 2.64555 13.8608 3.2421C13 3.83864 13 5.14974 13 7.77195V11.9999\"/><path d=\"M4 8V6.5C4 5.55719 4 5.08579 4.29289 4.79289C4.58579 4.5 5.05719 4.5 6 4.5H8C8.94281 4.5 9.41421 4.5 9.70711 4.79289C10 5.08579 10 5.55719 10 6.5V8\"/><path d=\"M7 4V2\"/><path d=\"M22 22L2 22\"/><path d=\"M10 15H14\"/><path d=\"M10 18H14\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "city-linear"
  },
  "Calendar": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"66\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 4h7c0.55 0 1 0.45 1 1v14c0 0.55 -0.45 1 -1 1h-14c-0.55 0 -1 -0.45 -1 -1v-14c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"66;0\"/></path><path fill=\"currentColor\" d=\"M5 5h14v0h-14Z\"><animate fill=\"freeze\" attributeName=\"d\" begin=\"0.6s\" dur=\"0.2s\" to=\"M5 5h14v3h-14Z\"/></path><g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"4\" stroke-dashoffset=\"4\" d=\"M7 4v-2M17 4v-2\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" d=\"M7 11h10\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"10\" stroke-dashoffset=\"10\" d=\"M7 15h7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "calendar"
  },
  "CalendarClock": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12Z\"/><path d=\"M7 4V2.5\"/><path d=\"M17 4V2.5\"/><path stroke-linejoin=\"round\" d=\"M9 14.5L10.5 13V17\"/><path d=\"M13 16V14C13 13.4477 13.4477 13 14 13C14.5523 13 15 13.4477 15 14V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16Z\"/><path d=\"M2.5 9H21.5\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "calendar-date-linear"
  },
  "CalendarRange": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M22 14V12C22 8.22876 22 6.34315 20.8284 5.17157C19.6569 4 17.7712 4 14 4H10C6.22876 4 4.34315 4 3.17157 5.17157C2 6.34315 2 8.22876 2 12V14C2 17.7712 2 19.6569 3.17157 20.8284C4.34315 22 6.22876 22 10 22H14\"/><path d=\"M7 4V2.5\"/><path d=\"M17 4V2.5\"/><circle cx=\"18\" cy=\"18\" r=\"3\"/><path d=\"M20.5 20.5L22 22\"/><path d=\"M2.5 9H21.5\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "calendar-search-linear"
  },
  "Camera": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"13\" r=\"3\"/><path d=\"M9.77778 21H14.2222C17.3433 21 18.9038 21 20.0248 20.2646C20.51 19.9462 20.9267 19.5371 21.251 19.0607C22 17.9601 22 16.4279 22 13.3636C22 10.2994 22 8.76721 21.251 7.6666C20.9267 7.19014 20.51 6.78104 20.0248 6.46268C19.3044 5.99013 18.4027 5.82123 17.022 5.76086C16.3631 5.76086 15.7959 5.27068 15.6667 4.63636C15.4728 3.68489 14.6219 3 13.6337 3H10.3663C9.37805 3 8.52715 3.68489 8.33333 4.63636C8.20412 5.27068 7.63685 5.76086 6.978 5.76086C5.59733 5.82123 4.69555 5.99013 3.97524 6.46268C3.48995 6.78104 3.07328 7.19014 2.74902 7.6666C2 8.76721 2 10.2994 2 13.3636C2 16.4279 2 17.9601 2.74902 19.0607C3.07328 19.5371 3.48995 19.9462 3.97524 20.2646C5.09624 21 6.65675 21 9.77778 21Z\"/><path d=\"M19 10H18\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "camera-linear"
  },
  "ChartAreaIcon": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z\"/><path d=\"M7 14L8.79689 11.8437C9.50894 10.9893 9.86496 10.562 10.3333 10.562C10.8017 10.562 11.1577 10.9893 11.8698 11.8437L12.1302 12.1563C12.8423 13.0107 13.1983 13.438 13.6667 13.438C14.135 13.438 14.4911 13.0107 15.2031 12.1563L17 10\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "graph-linear"
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
  "ChevronDownIcon": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"12\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 16l-7 -7M12 16l7 -7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"12;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "chevron-down"
  },
  "ChevronLeft": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"12\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 12l7 -7M8 12l7 7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"12;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "chevron-left"
  },
  "ChevronRight": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"12\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16 12l-7 -7M16 12l-7 7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"12;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "chevron-right"
  },
  "ChevronRightIcon": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"12\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16 12l-7 -7M16 12l-7 7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"12;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "chevron-right"
  },
  "ChevronUp": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"12\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8l-7 7M12 8l7 7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"12;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "chevron-up"
  },
  "ChevronUpIcon": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"12\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8l-7 7M12 8l7 7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"12;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "chevron-up"
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
  "Crown": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M5 17.5H19\" opacity=\".5\"/><path d=\"M19.9823 10.4999L20 10.5C20.8284 10.5 21.5 9.82843 21.5 9C21.5 8.17157 20.8284 7.5 20 7.5C19.1716 7.5 18.5 8.17157 18.5 9C18.5 9.37466 18.6374 9.71724 18.8645 9.98013C19.1359 10.2944 19.5357 10.4947 19.9823 10.4999Z\"/><path d=\"M19.9823 10.5C20.033 10.8784 19.9684 11.479 19.8706 12.3885L19.6872 14.0932C19.3851 16.902 19.234 19.3064 18.2879 20.1533C17.3418 21.0001 15.9239 21.0001 13.0879 21.0001H10.9121C8.07613 21.0001 6.65817 21.0001 5.71208 20.1533C4.76598 19.3064 4.61492 16.902 4.3128 14.0932L4.12945 12.3885C4.03162 11.479 3.96702 10.8784 4.01771 10.5\"/><path d=\"M4 10.5L4.01771 10.4999C4.46434 10.4947 4.86406 10.2944 5.13553 9.98012C5.36264 9.71724 5.5 9.37466 5.5 9C5.5 8.17157 4.82843 7.5 4 7.5C3.17157 7.5 2.5 8.17157 2.5 9C2.5 9.82843 3.17157 10.5 4 10.5Z\"/><path d=\"M11.0925 6.78271C10.9345 7.03566 10.7592 7.34991 10.5498 7.72547L8.76027 10.934C8.42077 11.5427 8.25102 11.8471 7.99642 11.9592C7.85535 12.0213 7.69969 12.0431 7.54691 12.0219C7.27118 11.9838 7.02403 11.7376 6.52971 11.2452C5.88806 10.6061 5.46178 10.1814 5.13574 9.98019\"/><path d=\"M11.0923 6.78265C11.3647 6.92163 11.6732 7 12 7C12.3268 7 12.6353 6.92163 12.9077 6.78265C13.556 6.45187 14 5.77778 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 5.77778 10.444 6.45187 11.0923 6.78265Z\"/><path d=\"M12.9077 6.78271C13.0658 7.03565 13.241 7.34991 13.4505 7.72546L15.24 10.934C15.5795 11.5427 15.7492 11.8471 16.0038 11.9592C16.1449 12.0213 16.3006 12.0431 16.4533 12.0219C16.7291 11.9838 16.9762 11.7376 17.4705 11.2452C18.1122 10.6061 18.5385 10.1814 18.8645 9.98019\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "crown-line-duotone"
  },
  "Database": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 17C2 15.1144 2 14.1716 2.58579 13.5858C3.17157 13 4.11438 13 6 13H18C19.8856 13 20.8284 13 21.4142 13.5858C22 14.1716 22 15.1144 22 17C22 18.8856 22 19.8284 21.4142 20.4142C20.8284 21 19.8856 21 18 21H6C4.11438 21 3.17157 21 2.58579 20.4142C2 19.8284 2 18.8856 2 17Z\"/><path d=\"M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2H18C19.8856 2 20.8284 2 21.4142 2.58579C22 3.17157 22 4.11438 22 6C22 7.88562 22 8.82843 21.4142 9.41421C20.8284 10 19.8856 10 18 10H6C4.11438 10 3.17157 10 2.58579 9.41421C2 8.82843 2 7.88562 2 6Z\"/><path d=\"M13.5 6L18 6\"/><path d=\"M6 7L6 5\"/><path d=\"M9 7L9 5\"/><path d=\"M13.5 17H18\"/><path d=\"M6 18L6 16\"/><path d=\"M9 18L9 16\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "server-2-linear"
  },
  "Download": {
    body: "<g stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path fill=\"currentColor\" fill-opacity=\"0\" stroke-dasharray=\"20\" d=\"M12 4h2v6h2.5l-4.5 4.5M12 4h-2v6h-2.5l4.5 4.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"20;0\"/><animate fill=\"freeze\" attributeName=\"fill-opacity\" begin=\"0.7s\" dur=\"0.4s\" to=\"1\"/></path><path fill=\"none\" stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M6 19h12\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "download"
  },
  "Copy": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><rect width=\"13\" height=\"13\" x=\"9\" y=\"9\" rx=\"2\" ry=\"2\"/><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "copy-linear"
  },
  "Edit2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"44\" stroke-dashoffset=\"44\" d=\"M7 17v-4l10 -10l4 4l-10 10h-4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.5s\" to=\"0\"/></path><path stroke-dasharray=\"20\" d=\"M3 21h18\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"20;0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M14 6l4 4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "edit"
  },
  "ExternalLink": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"42\" d=\"M11 5h-6v14h14v-6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"42;0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" d=\"M13 11l7 -7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M21 3h-6M21 3v6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "external-link"
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
  "File": {
    body: "<g stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path fill=\"none\" stroke-dasharray=\"62\" d=\"M13.5 3l5.5 5.5v11.5c0 0.55 -0.45 1 -1 1h-12c-0.55 0 -1 -0.45 -1 -1v-16c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"62;0\"/></path><path fill=\"currentColor\" d=\"M14 3.5l0 4.5l4.5 0Z\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.6s\" to=\"1\"/><animate fill=\"freeze\" attributeName=\"d\" begin=\"0.6s\" dur=\"0.2s\" values=\"M14 3.5l2.25 2.25l2.25 2.25Z;M14 3.5l0 4.5l4.5 0Z\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "file"
  },
  "FileCheck": {
    body: "<g stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path fill=\"none\" stroke-dasharray=\"62\" d=\"M13.5 3l5.5 5.5v11.5c0 0.55 -0.45 1 -1 1h-12c-0.55 0 -1 -0.45 -1 -1v-16c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"62;0\"/></path><path fill=\"currentColor\" d=\"M14 3.5l0 4.5l4.5 0Z\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.6s\" to=\"1\"/><animate fill=\"freeze\" attributeName=\"d\" begin=\"0.6s\" dur=\"0.2s\" values=\"M14 3.5l2.25 2.25l2.25 2.25Z;M14 3.5l0 4.5l4.5 0Z\"/></path><g fill=\"none\"><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M9 13h6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"6\" stroke-dashoffset=\"6\" d=\"M9 17h3\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"1s\" dur=\"0.2s\" to=\"0\"/></path></g></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "file-document"
  },
  "FileCode": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke-dasharray=\"64\" stroke-width=\"2\" d=\"M13 3l6 6v12h-14v-18h8\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"64;0\"/></path><path stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M12.5 3v5.5h6.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><g stroke-dasharray=\"8\" stroke-dashoffset=\"8\" stroke-width=\"2\"><path d=\"M10 13l-2 2l2 2\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path><path d=\"M14 13l2 2l-2 2\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"1.1s\" dur=\"0.2s\" to=\"0\"/></path></g></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "document-code"
  },
  "FileImage": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"62\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M13.5 3l5.5 5.5v11.5c0 0.55 -0.45 1 -1 1h-12c-0.55 0 -1 -0.45 -1 -1v-16c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"62;0\"/></path><g fill=\"currentColor\"><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M14 3.5l0 4.5l4.5 0Z\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.6s\" to=\"1\"/><animate fill=\"freeze\" attributeName=\"d\" begin=\"0.6s\" dur=\"0.2s\" values=\"M14 3.5l2.25 2.25l2.25 2.25Z;M14 3.5l0 4.5l4.5 0Z\"/></path><path d=\"M12 11l4 4h-2.5v3h-3v-3h-2.5Z\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.8s\" to=\"1\"/><animate fill=\"freeze\" attributeName=\"d\" begin=\"0.8s\" dur=\"0.2s\" values=\"M12 18l4 0h-2.5v0h-3v0h-2.5Z;M12 11l4 4h-2.5v3h-3v-3h-2.5Z\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "file-upload"
  },
  "FileSignature": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5\"/><path d=\"M16.652 3.45506L17.3009 2.80624C18.3759 1.73125 20.1188 1.73125 21.1938 2.80624C22.2687 3.88124 22.2687 5.62415 21.1938 6.69914L20.5449 7.34795M16.652 3.45506C16.652 3.45506 16.7331 4.83379 17.9497 6.05032C19.1662 7.26685 20.5449 7.34795 20.5449 7.34795M16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9M8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795M10.1 15.5876L8.41242 13.9\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "pen-new-square-linear"
  },
  "FileSpreadsheet": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M6 14.5H14\"/><path d=\"M6 18H11.5\"/><path d=\"M13 2.2627V5.0003C13 7.35732 13 8.53583 13.7322 9.26806C14.4645 10.0003 15.643 10.0003 18 10.0003H21.58\"/><path stroke-linejoin=\"round\" d=\"M3.17139 3.17157C4.34296 2 6.23851 2 10.0296 2C11.5546 2 12.3173 2.00011 13.0093 2.26562C13.7012 2.53114 14.2651 3.03857 15.3929 4.05365L19.3516 7.61621C20.6558 8.78998 21.3078 9.3774 21.6538 10.1543C21.9998 10.9312 22 11.8079 22 13.5625V14C22 17.7712 22 19.6566 20.8284 20.8281C19.6569 21.9997 17.7712 22 14 22L9.9969 21.9997C6.22761 21.9997 4.34284 21.9997 3.17157 20.8284C2 19.6569 2 17.7712 2 14V9.9982C2 6.22817 2 4.34296 3.17139 3.17157Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "file-text-linear"
  },
  "FileText": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke-dasharray=\"64\" stroke-width=\"2\" d=\"M13 3l6 6v12h-14v-18h8\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"64;0\"/></path><path stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M12.5 3v5.5h6.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><g stroke-width=\"2\"><path stroke-dasharray=\"6\" stroke-dashoffset=\"6\" d=\"M9 13h4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M9 16h6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"1.1s\" dur=\"0.2s\" to=\"0\"/></path></g></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "document-list"
  },
  "FileUp": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"62\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M13.5 3l5.5 5.5v11.5c0 0.55 -0.45 1 -1 1h-12c-0.55 0 -1 -0.45 -1 -1v-16c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"62;0\"/></path><g fill=\"currentColor\"><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M14 3.5l0 4.5l4.5 0Z\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.6s\" to=\"1\"/><animate fill=\"freeze\" attributeName=\"d\" begin=\"0.6s\" dur=\"0.2s\" values=\"M14 3.5l2.25 2.25l2.25 2.25Z;M14 3.5l0 4.5l4.5 0Z\"/></path><path d=\"M12 11l4 4h-2.5v3h-3v-3h-2.5Z\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.8s\" to=\"1\"/><animate fill=\"freeze\" attributeName=\"d\" begin=\"0.8s\" dur=\"0.2s\" values=\"M12 18l4 0h-2.5v0h-3v0h-2.5Z;M12 11l4 4h-2.5v3h-3v-3h-2.5Z\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "file-upload"
  },
  "FileVideo": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M17 9.50019L17.6584 9.17101C19.6042 8.19807 20.5772 7.7116 21.2886 8.15127C22 8.59094 22 9.67872 22 11.8543V12.1461C22 14.3217 22 15.4094 21.2886 15.8491C20.5772 16.2888 19.6042 15.8023 17.6584 14.8294L17 14.5002V9.50019Z\"/><path d=\"M13.5607 7.43934C14.1464 8.02513 14.1464 8.97487 13.5607 9.56066C12.9749 10.1464 12.0251 10.1464 11.4393 9.56066C10.8536 8.97487 10.8536 8.02513 11.4393 7.43934C12.0251 6.85355 12.9749 6.85355 13.5607 7.43934Z\"/><path d=\"M2 11.5C2 8.21252 2 6.56878 2.90796 5.46243C3.07418 5.25989 3.25989 5.07418 3.46243 4.90796C4.56878 4 6.21252 4 9.5 4C12.7875 4 14.4312 4 15.5376 4.90796C15.7401 5.07418 15.9258 5.25989 16.092 5.46243C17 6.56878 17 8.21252 17 11.5V12.5C17 15.7875 17 17.4312 16.092 18.5376C15.9258 18.7401 15.7401 18.9258 15.5376 19.092C14.4312 20 12.7875 20 9.5 20C6.21252 20 4.56878 20 3.46243 19.092C3.25989 18.9258 3.07418 18.7401 2.90796 18.5376C2 17.4312 2 15.7875 2 12.5V11.5Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "videocamera-record-linear"
  },
  "Filter": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"54\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 4h14l-5 6.5v9.5l-4 -4v-5.5Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"54;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "filter"
  },
  "FolderArchive": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M18 6.0135V10.8529C18 11.1429 18 11.288 17.9051 11.3466C17.8103 11.4052 17.6806 11.3404 17.4211 11.2106L16.1789 10.5895C16.0911 10.5456 16.0472 10.5237 16 10.5237C15.9528 10.5237 15.9089 10.5456 15.8211 10.5895L14.5789 11.2106C14.3194 11.3404 14.1897 11.4052 14.0949 11.3466C14 11.288 14 11.1429 14 10.8529V5.93832\"/><path d=\"M2 6.94975C2 6.06722 2 5.62595 2.06935 5.25839C2.37464 3.64031 3.64031 2.37464 5.25839 2.06935C5.62595 2 6.06722 2 6.94975 2C7.33642 2 7.52976 2 7.71557 2.01738C8.51665 2.09229 9.27652 2.40704 9.89594 2.92051C10.0396 3.03961 10.1763 3.17633 10.4497 3.44975L11 4C11.8158 4.81578 12.2237 5.22367 12.7121 5.49543C12.9804 5.64471 13.2651 5.7626 13.5604 5.84678C14.0979 6 14.6747 6 15.8284 6H16.2021C18.8345 6 20.1506 6 21.0062 6.76946C21.0849 6.84024 21.1598 6.91514 21.2305 6.99383C22 7.84935 22 9.16554 22 11.7979V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V6.94975Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "folder-favourite-bookmark-linear"
  },
  "FolderCheck": {
    body: "<defs><mask id=\"SVGKwOJFbLC\"><g fill=\"none\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"62\" d=\"M12 7h8c0.55 0 1 0.45 1 1v10c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-11Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"62;0\"/></path><path d=\"M12 7h-9v-1c0 -0.55 0.45 -1 1 -1h6Z\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.6s\" to=\"1\"/><animate fill=\"freeze\" attributeName=\"d\" begin=\"0.6s\" dur=\"0.2s\" values=\"M12 7h-9v0c0 0 0.45 0 1 0h6Z;M12 7h-9v-1c0 -0.55 0.45 -1 1 -1h6Z\"/></path></g><path d=\"M19 13c3.31 0 6 2.69 6 6c0 3.31 -2.69 6 -6 6c-3.31 0 -6 -2.69 -6 -6c0 -3.31 2.69 -6 6 -6Z\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.8s\" to=\"1\"/></path></mask></defs><path fill=\"currentColor\" d=\"M0 0h24v24H0z\" mask=\"url(#SVGKwOJFbLC)\"/><path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"10\" stroke-dashoffset=\"10\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16 19l1.75 1.75l3.75 -3.75\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "folder-check"
  },
  "FolderGit2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M16.5 7.5L13.5 7.5\"/><path d=\"M5 5.21734C5 4.64369 5 4.35687 5.04855 4.11795C5.26225 3.0662 6.14822 2.24352 7.28087 2.04508C7.53817 2 7.84705 2 8.46482 2C8.7355 2 8.87083 2 9.0009 2.01129C9.56166 2.05999 10.0936 2.26457 10.5272 2.59833C10.6277 2.67575 10.7234 2.76461 10.9148 2.94234L11.3 3.3C11.871 3.83026 12.1566 4.09538 12.4985 4.27203C12.6863 4.36906 12.8855 4.44569 13.0922 4.5004C13.4685 4.6 13.8723 4.6 14.6799 4.6H14.9415C16.7841 4.6 17.7055 4.6 18.3043 5.10015C18.3594 5.14616 18.4118 5.19484 18.4614 5.24599C19 5.80208 19 6.6576 19 8.36864V9.8C19 12.2513 19 13.477 18.1799 14.2385C17.3598 15 16.0399 15 13.4 15H10.6C7.96013 15 6.6402 15 5.8201 14.2385C5 13.477 5 12.2513 5 9.8V5.21734Z\"/><path d=\"M22 20H14M2 20H10\"/><path d=\"M12 18V15\"/><circle cx=\"12\" cy=\"20\" r=\"2\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "folder-path-connect-linear"
  },
  "FolderKanban": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M18 10L13 10\"/><path d=\"M19.9998 6.23751C19.9989 5.94017 19.9946 5.76263 19.9743 5.60842C19.7971 4.26222 18.7378 3.2029 17.3916 3.02567C17.1966 3 16.9644 3 16.5 3H10\"/><path d=\"M2 6.94975C2 6.06722 2 5.62595 2.06935 5.25839C2.37464 3.64031 3.64031 2.37464 5.25839 2.06935C5.62595 2 6.06722 2 6.94975 2C7.33642 2 7.52976 2 7.71557 2.01738C8.51665 2.09229 9.27652 2.40704 9.89594 2.92051C10.0396 3.03961 10.1763 3.17633 10.4497 3.44975L11 4C11.8158 4.81578 12.2237 5.22367 12.7121 5.49543C12.9804 5.64471 13.2651 5.7626 13.5604 5.84678C14.0979 6 14.6747 6 15.8284 6H16.2021C17.9811 6 19.159 6 19.9998 6.23751C20.4031 6.35144 20.7288 6.52002 21.0062 6.76946C21.0849 6.84024 21.1598 6.91514 21.2305 6.99383C22 7.84935 22 9.16554 22 11.7979V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V6.94975Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "folder-with-files-linear"
  },
  "FolderOpen": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M4 11.5V5.71231C4 5.05041 4 4.71946 4.05548 4.44379C4.29971 3.23023 5.31225 2.28098 6.60671 2.05201C6.90076 2 7.25377 2 7.9598 2C8.26914 2 8.42381 2 8.57246 2.01303C9.21332 2.06921 9.82122 2.30528 10.3168 2.69039C10.4317 2.77971 10.5411 2.88224 10.7598 3.08731L11.2 3.5C11.8526 4.11183 12.1789 4.41775 12.5697 4.62157C12.7844 4.73353 13.012 4.82195 13.2483 4.88508C13.6783 5 14.1398 5 15.0627 5H15.3617C17.4676 5 18.5205 5 19.2049 5.5771C19.2679 5.63018 19.3278 5.68635 19.3844 5.74537C20 6.38701 20 7.37415 20 9.34843V11.5\"/><path d=\"M10 17H14\"/><path d=\"M3.47674 17.4839C2.99958 14.7678 2.761 13.4097 3.33908 12.433C3.4866 12.1838 3.66852 11.9582 3.87908 11.7634C4.7042 11 6.0379 11 8.7053 11H15.2947C17.9621 11 19.2958 11 20.1209 11.7634C20.3315 11.9582 20.5134 12.1838 20.6609 12.433C21.239 13.4097 21.0004 14.7678 20.5233 17.4839C20.1798 19.4391 20.008 20.4167 19.4129 21.0655C19.2585 21.2338 19.0858 21.383 18.8982 21.5101C18.175 22 17.2149 22 15.2947 22H8.70531C6.7851 22 5.825 22 5.10183 21.5101C4.9142 21.383 4.74145 21.2338 4.58706 21.0655C3.99198 20.4167 3.82024 19.4391 3.47674 17.4839Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "folder-open-linear"
  },
  "FolderSync": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 6.94975C2 6.06722 2 5.62595 2.06935 5.25839C2.37464 3.64031 3.64031 2.37464 5.25839 2.06935C5.62595 2 6.06722 2 6.94975 2C7.33642 2 7.52976 2 7.71557 2.01738C8.51665 2.09229 9.27652 2.40704 9.89594 2.92051C10.0396 3.03961 10.1763 3.17633 10.4497 3.44975L11 4C11.8158 4.81578 12.2237 5.22367 12.7121 5.49543C12.9804 5.64471 13.2651 5.7626 13.5604 5.84678C14.0979 6 14.6747 6 15.8284 6H16.2021C18.8345 6 20.1506 6 21.0062 6.76946C21.0849 6.84024 21.1598 6.91514 21.2305 6.99383C22 7.84935 22 9.16554 22 11.7979V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V6.94975Z\"/><circle cx=\"12\" cy=\"13\" r=\"2\"/><path d=\"M12 15V17.5\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "folder-security-linear"
  },
  "FolderTree": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 6.94975C2 6.06722 2 5.62595 2.06935 5.25839C2.37464 3.64031 3.64031 2.37464 5.25839 2.06935C5.62595 2 6.06722 2 6.94975 2C7.33642 2 7.52976 2 7.71557 2.01738C8.51665 2.09229 9.27652 2.40704 9.89594 2.92051C10.0396 3.03961 10.1763 3.17633 10.4497 3.44975L11 4C11.8158 4.81578 12.2237 5.22367 12.7121 5.49543C12.9804 5.64471 13.2651 5.7626 13.5604 5.84678C14.0979 6 14.6747 6 15.8284 6H16.2021C18.8345 6 20.1506 6 21.0062 6.76946C21.0849 6.84024 21.1598 6.91514 21.2305 6.99383C22 7.84935 22 9.16554 22 11.7979V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V6.94975Z\"/><path d=\"M12.9524 11.8852C13.1907 11.8072 13.4471 11.7647 13.7143 11.7647C13.9762 11.7647 14.2277 11.8055 14.462 11.8806M10.6667 13.091C10.4821 12.9765 10.2722 12.8944 10.0465 12.8533C9.939 12.8338 9.82793 12.8235 9.71429 12.8235C8.76751 12.8235 8 13.5346 8 14.4118C8 15.2889 8.76751 16 9.71429 16H13.7143C14.9767 16 16 15.0519 16 13.8824C16 12.9554 15.3572 12.1676 14.462 11.8806M10.0465 12.8533C9.95482 12.6242 9.90476 12.3763 9.90476 12.1176C9.90476 10.9481 10.9281 10 12.1905 10C13.3664 10 14.3348 10.8226 14.462 11.8806\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "folder-cloud-linear"
  },
  "GalleryHorizontalEnd": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 14C2 10.2288 2 8.34315 3.17157 7.17157C4.34315 6 6.22876 6 10 6H14C17.7712 6 19.6569 6 20.8284 7.17157C22 8.34315 22 10.2288 22 14C22 17.4959 22 19.3715 21.0667 20.56C20.9932 20.6536 20.914 20.7429 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14Z\"/><path d=\"M19.8372 6.51084C19.8372 6.34056 19.8372 6.17028 19.8372 6C19.7248 5.06898 19.4901 4.42559 19 3.93726C18.0595 3 16.5457 3 13.5181 3H10.3069C7.27932 3 5.76553 3 4.82498 3.93726C4.33494 4.42559 4.10022 5.06898 3.98779 6C3.99018 6.19577 3.99257 6.39155 3.99496 6.58732\"/><circle cx=\"17.5\" cy=\"10.5\" r=\"1.5\"/><path d=\"M21.0667 20.56L17.7764 17.5986C16.7368 16.6631 15.1888 16.5702 14.0446 17.3744L13.7464 17.5839C12.9512 18.1428 11.8694 18.0491 11.1822 17.3618L6.89249 13.0721C6.03628 12.2159 4.66286 12.1702 3.75159 12.9675L2 14.5001\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "gallery-wide-linear"
  },
  "Gem": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M6 5h12l3 5l-8.5 9.5a.7.7 0 0 1-1 0L3 10z\"/><path d=\"M10 12L8 9.8l.6-1\"/></g>",
    width: 24,
    height: 24,
    prefix: "tabler",
    name: "diamond"
  },
  "GitPullRequest": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M14 14.5C14 12.8431 15.3431 11.5 17 11.5C18.6568 11.5 20 12.8431 20 14.5C20 16.1569 18.6568 17.5 17 17.5C15.3431 17.5 14 16.1569 14 14.5Z\"/><path d=\"M3.99998 9.5C3.99998 11.1569 5.34312 12.5 6.99998 12.5C8.65683 12.5 9.99998 11.1569 9.99998 9.5C9.99998 7.84315 8.65683 6.5 6.99998 6.5C5.34312 6.5 3.99998 7.84315 3.99998 9.5Z\"/><path d=\"M16.9585 9L16.9585 2\"/><path d=\"M6.9585 15L6.9585 22\"/><path d=\"M16.9585 22L16.9585 20\"/><path d=\"M6.9585 2L6.9585 4\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "tuning-linear"
  },
  "GitPullRequestArrow": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z\"/><path stroke-linejoin=\"round\" d=\"M16 8H18M16.5 6.5L18 8L16.5 9.5\"/><path d=\"M16 8C13.7909 8 12 9.79086 12 12V18\"/><path stroke-linejoin=\"round\" d=\"M8 8H6M7.5 6.5L6 8L7.5 9.5\"/><path d=\"M8 8C10.2091 8 12 9.79086 12 12V18\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "branching-paths-up-linear"
  },
  "GitPullRequestClosed": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z\"/><path stroke-linejoin=\"round\" d=\"M16 16.5H18M16.5 18L18 16.5L16.5 15\"/><path d=\"M16 16.5C13.7909 16.5 12 14.7091 12 12.5V6.5\"/><path stroke-linejoin=\"round\" d=\"M8 16.5H6M7.5 18L6 16.5L7.5 15\"/><path d=\"M8 16.5C10.2091 16.5 12 14.7091 12 12.5V6.5\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "branching-paths-down-linear"
  },
  "Globe": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M22 12C22 13.3132 21.7413 14.6136 21.2388 15.8268C20.7362 17.0401 19.9997 18.1425 19.0711 19.0711C18.1425 19.9997 17.0401 20.7362 15.8268 21.2388C14.6136 21.7413 13.3132 22 12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C4.00035 18.1425 3.26375 17.0401 2.7612 15.8268C2.25866 14.6136 2 13.3132 2 12C2 10.6868 2.25866 9.38642 2.76121 8.17316C3.26375 6.95991 4.00035 5.85752 4.92893 4.92893C5.85752 4.00035 6.95991 3.26375 8.17317 2.7612C9.38642 2.25866 10.6868 2 12 2C13.3132 2 14.6136 2.25866 15.8268 2.76121C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12L22 12Z\"/><path d=\"M16 12C16 13.3132 15.8965 14.6136 15.6955 15.8268C15.4945 17.0401 15.1999 18.1425 14.8284 19.0711C14.457 19.9997 14.016 20.7362 13.5307 21.2388C13.0454 21.7413 12.5253 22 12 22C11.4747 22 10.9546 21.7413 10.4693 21.2388C9.98396 20.7362 9.54301 19.9997 9.17157 19.0711C8.80014 18.1425 8.5055 17.0401 8.30448 15.8268C8.10346 14.6136 8 13.3132 8 12C8 10.6868 8.10346 9.38642 8.30448 8.17316C8.5055 6.95991 8.80014 5.85752 9.17157 4.92893C9.54301 4.00035 9.98396 3.26375 10.4693 2.7612C10.9546 2.25866 11.4747 2 12 2C12.5253 2 13.0454 2.25866 13.5307 2.76121C14.016 3.26375 14.457 4.00035 14.8284 4.92893C15.1999 5.85752 15.4945 6.95991 15.6955 8.17317C15.8965 9.38642 16 10.6868 16 12L16 12Z\"/><path d=\"M2 12H22\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "global-linear"
  },
  "GripVertical": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M19 10L5 10\"/><path d=\"M19 14L5 14\"/><path d=\"M19 6L5 6\"/><path d=\"M19 18L5 18\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "reorder-linear"
  },
  "Handshake": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M19.5 12.572L12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572\"/><path d=\"M12 6L8.707 9.293a1 1 0 0 0 0 1.414l.543.543c.69.69 1.81.69 2.5 0l1-1a3.18 3.18 0 0 1 4.5 0l2.25 2.25m-7 3l2 2M15 13l2 2\"/></g>",
    width: 24,
    height: 24,
    prefix: "tabler",
    name: "heart-handshake"
  },
  "HardDrive": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M3.46447 20.5355C4.92893 22 7.28595 22 12 22C16.714 22 19.0711 22 20.5355 20.5355C22 19.0711 22 16.714 22 12C22 11.6585 22 11.4878 21.9848 11.3142C21.9142 10.5049 21.586 9.71257 21.0637 9.09034C20.9516 8.95687 20.828 8.83317 20.5806 8.58578L15.4142 3.41944C15.1668 3.17206 15.0431 3.04835 14.9097 2.93631C14.2874 2.414 13.4951 2.08581 12.6858 2.01515C12.5122 2 12.3415 2 12 2C7.28595 2 4.92893 2 3.46447 3.46447C2 4.92893 2 7.28595 2 12C2 16.714 2 19.0711 3.46447 20.5355Z\"/><path d=\"M17 21.8731V21C17 19.1144 17 18.1716 16.4142 17.5858C15.8284 17 14.8856 17 13 17H11C9.11438 17 8.17157 17 7.58579 17.5858C7 18.1716 7 19.1144 7 21V21.8731\"/><path d=\"M7 8H13\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "diskette-linear"
  },
  "HardHat": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 17.6294 16.761 20.3655 14.1014 21.5273C13.38 21.8424 13.0193 22 12 22C10.9807 22 10.62 21.8424 9.89856 21.5273C7.23896 20.3655 3 17.6294 3 11.9914C3 11.4234 3 10.8996 3 10.4167Z\"/><circle cx=\"12\" cy=\"9\" r=\"2\"/><path d=\"M16 15C16 16.1046 16 17 12 17C8 17 8 16.1046 8 15C8 13.8954 9.79086 13 12 13C14.2091 13 16 13.8954 16 15Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "shield-user-linear"
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
  "Image": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke-dasharray=\"66\" stroke-width=\"2\" d=\"M3 14v-9h18v14h-18v-5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"66;0\"/></path><path stroke-dasharray=\"26\" stroke-dashoffset=\"26\" d=\"M3 16l4 -3l3 2l6 -5l5 4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.4s\" to=\"0\"/></path></g><circle cx=\"7.5\" cy=\"9.5\" r=\"1.5\" fill=\"currentColor\" opacity=\"0\"><animate fill=\"freeze\" attributeName=\"opacity\" begin=\"1s\" dur=\"0.2s\" to=\"1\"/></circle>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "image"
  },
  "KanbanSquare": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M10 4C10 3.05719 10 2.58579 10.2929 2.29289C10.5858 2 11.0572 2 12 2C12.9428 2 13.4142 2 13.7071 2.29289C14 2.58579 14 3.05719 14 4V10C14 10.9428 14 11.4142 13.7071 11.7071C13.4142 12 12.9428 12 12 12C11.0572 12 10.5858 12 10.2929 11.7071C10 11.4142 10 10.9428 10 10V4Z\"/><path d=\"M3 4C3 3.05719 3 2.58579 3.29289 2.29289C3.58579 2 4.05719 2 5 2C5.94281 2 6.41421 2 6.70711 2.29289C7 2.58579 7 3.05719 7 4V14C7 14.9428 7 15.4142 6.70711 15.7071C6.41421 16 5.94281 16 5 16C4.05719 16 3.58579 16 3.29289 15.7071C3 15.4142 3 14.9428 3 14V4Z\"/><path d=\"M17 4C17 3.05719 17 2.58579 17.2929 2.29289C17.5858 2 18.0572 2 19 2C19.9428 2 20.4142 2 20.7071 2.29289C21 2.58579 21 3.05719 21 4V17C21 17.9428 21 18.4142 20.7071 18.7071C20.4142 19 19.9428 19 19 19C18.0572 19 17.5858 19 17.2929 18.7071C17 18.4142 17 17.9428 17 17V4Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "kanban-linear"
  },
  "KeyRound": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M15.6807 14.5869C19.1708 14.5869 22 11.7692 22 8.29344C22 4.81767 19.1708 2 15.6807 2C12.1907 2 9.3615 4.81767 9.3615 8.29344C9.3615 9.90338 10.0963 11.0743 10.0963 11.0743L2.45441 18.6849C2.1115 19.0264 1.63143 19.9143 2.45441 20.7339L3.33616 21.6121C3.67905 21.9048 4.54119 22.3146 5.2466 21.6121L6.27531 20.5876C7.30403 21.6121 8.4797 21.0267 8.92058 20.4412C9.65538 19.4167 8.77362 18.3922 8.77362 18.3922L9.06754 18.0995C10.4783 19.5045 11.7128 18.6849 12.1537 18.0995C12.8885 17.075 12.1537 16.0505 12.1537 16.0505C11.8598 15.465 11.272 15.465 12.0067 14.7333L12.8885 13.8551C13.5939 14.4405 15.0439 14.5869 15.6807 14.5869Z\"/><path d=\"M17.8853 8.29353C17.8853 9.50601 16.8984 10.4889 15.681 10.4889C14.4635 10.4889 13.4766 9.50601 13.4766 8.29353C13.4766 7.08105 14.4635 6.09814 15.681 6.09814C16.8984 6.09814 17.8853 7.08105 17.8853 8.29353Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "key-linear"
  },
  "LaptopMinimal": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M19.6471 15.5357H4.35294M19.6471 15.5357V8C19.6471 6.11438 19.6471 5.17157 19.0613 4.58579C18.4755 4 17.5327 4 15.6471 4H8.35294C6.46732 4 5.52451 4 4.93873 4.58579C4.35294 5.17157 4.35294 6.11438 4.35294 8V15.5357M19.6471 15.5357L21.3911 17.3358C21.4356 17.3818 21.4579 17.4048 21.4787 17.4276C21.7998 17.7802 21.9843 18.2358 21.999 18.7124C22 18.7433 22 18.7753 22 18.8393C22 18.9885 22 19.0631 21.996 19.1261C21.9325 20.1314 21.1314 20.9325 20.1261 20.996C20.0631 21 19.9885 21 19.8393 21H4.16068C4.01148 21 3.93688 21 3.87388 20.996C2.86865 20.9325 2.06749 20.1314 2.00398 19.1261C2 19.0631 2 18.9885 2 18.8393C2 18.7753 2 18.7433 2.00096 18.7124C2.01569 18.2358 2.20022 17.7802 2.52127 17.4276C2.54208 17.4048 2.56438 17.3818 2.60888 17.3358L4.35294 15.5357\"/><path d=\"M9.5 18.5H14.5\"/><path stroke-linejoin=\"round\" d=\"M12 6.75H12.0001\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "laptop-linear"
  },
  "Layers": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M4.97883 9.68508C2.99294 8.89073 2 8.49355 2 8C2 7.50645 2.99294 7.10927 4.97883 6.31492L7.7873 5.19153C9.77318 4.39718 10.7661 4 12 4C13.2339 4 14.2268 4.39718 16.2127 5.19153L19.0212 6.31492C21.0071 7.10927 22 7.50645 22 8C22 8.49355 21.0071 8.89073 19.0212 9.68508L16.2127 10.8085C14.2268 11.6028 13.2339 12 12 12C10.7661 12 9.77318 11.6028 7.7873 10.8085L4.97883 9.68508Z\"/><path d=\"M5.76613 10L4.97883 10.3149C2.99294 11.1093 2 11.5065 2 12C2 12.4935 2.99294 12.8907 4.97883 13.6851L7.7873 14.8085C9.77318 15.6028 10.7661 16 12 16C13.2339 16 14.2268 15.6028 16.2127 14.8085L19.0212 13.6851C21.0071 12.8907 22 12.4935 22 12C22 11.5065 21.0071 11.1093 19.0212 10.3149L18.2339 10\"/><path d=\"M5.76613 14L4.97883 14.3149C2.99294 15.1093 2 15.5065 2 16C2 16.4935 2.99294 16.8907 4.97883 17.6851L7.7873 18.8085C9.77318 19.6028 10.7661 20 12 20C13.2339 20 14.2268 19.6028 16.2127 18.8085L19.0212 17.6851C21.0071 16.8907 22 16.4935 22 16C22 15.5065 21.0071 15.1093 19.0212 14.3149L18.2339 14\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "layers-linear"
  },
  "Link2": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"28\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M13 6l2 -2c1 -1 3 -1 4 0l1 1c1 1 1 3 0 4l-5 5c-1 1 -3 1 -4 0M11 18l-2 2c-1 1 -3 1 -4 0l-1 -1c-1 -1 -1 -3 0 -4l5 -5c1 -1 3 -1 4 0\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"28;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "link"
  },
  "ListTodo": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g stroke-dasharray=\"24\"><path d=\"M11.5 5c0 -0.83 0.67 -1.5 1.5 -1.5h6c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5h-6c-0.83 0 -1.5 -0.67 -1.5 -1.5Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"24;0\"/></path><path stroke-dashoffset=\"24\" d=\"M11.5 12c0 -0.83 0.67 -1.5 1.5 -1.5h6c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5h-6c-0.83 0 -1.5 -0.67 -1.5 -1.5Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.4s\" dur=\"0.3s\" to=\"0\"/></path><path stroke-dashoffset=\"24\" d=\"M11.5 19c0 -0.83 0.67 -1.5 1.5 -1.5h6c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5h-6c-0.83 0 -1.5 -0.67 -1.5 -1.5Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.3s\" to=\"0\"/></path></g><g stroke-dasharray=\"12\" stroke-dashoffset=\"12\" stroke-width=\"2\"><path d=\"M3 5l2 2l4 -4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.2s\" dur=\"0.2s\" to=\"0\"/></path><path d=\"M3 12l2 2l4 -4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.2s\" to=\"0\"/></path><path d=\"M3 19l2 2l4 -4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"1s\" dur=\"0.2s\" to=\"0\"/></path></g></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "check-list-3"
  },
  "Loader2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"18\" d=\"M12 3c4.97 0 9 4.03 9 9\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"18;0\"/><animateTransform attributeName=\"transform\" dur=\"1.5s\" repeatCount=\"indefinite\" type=\"rotate\" values=\"0 12 12;360 12 12\"/></path><path stroke-dasharray=\"60\" d=\"M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z\" opacity=\".3\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"1.2s\" values=\"60;0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "loading-twotone-loop"
  },
  "LocateFixed": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z\"/><path d=\"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z\"/><path d=\"M2 12L4 12\"/><path d=\"M20 12L22 12\"/><path d=\"M12 4V2\"/><path d=\"M12 22V20\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "gps-linear"
  },
  "Lock": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16Z\"/><circle cx=\"12\" cy=\"16\" r=\"2\"/><path d=\"M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "lock-keyhole-linear"
  },
  "LogOut": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"46\" d=\"M16 5v-1c0 -0.55 -0.45 -1 -1 -1h-9c-0.55 0 -1 0.45 -1 1v16c0 0.55 0.45 1 1 1h9c0.55 0 1 -0.45 1 -1v-1\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"46;0\"/></path><path stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M10 12h11\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M21 12l-3.5 -3.5M21 12l-3.5 3.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "log-out"
  },
  "Mail": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"66\" d=\"M4 5h16c0.55 0 1 0.45 1 1v12c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-12c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"66;0\"/></path><path stroke-dasharray=\"24\" stroke-dashoffset=\"24\" d=\"M3 6.5l9 5.5l9 -5.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.3s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "email"
  },
  "MailCheck": {
    body: "<defs><mask id=\"SVGPdizBdBa\"><g fill=\"none\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"66\" d=\"M4 5h16c0.55 0 1 0.45 1 1v12c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-12c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"66;0\"/></path><path stroke-dasharray=\"24\" stroke-dashoffset=\"24\" d=\"M3 6.5l9 5.5l9 -5.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.3s\" to=\"0\"/></path></g><path d=\"M19 13c3.31 0 6 2.69 6 6c0 3.31 -2.69 6 -6 6c-3.31 0 -6 -2.69 -6 -6c0 -3.31 2.69 -6 6 -6Z\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.9s\" to=\"1\"/></path></mask></defs><path fill=\"currentColor\" d=\"M0 0h24v24H0z\" mask=\"url(#SVGPdizBdBa)\"/><path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"10\" stroke-dashoffset=\"10\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16 19l1.75 1.75l3.75 -3.75\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "email-check"
  },
  "MailWarning": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"66\" d=\"M2 5h16c0.55 0 1 0.45 1 1v12c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-12c0 -0.55 0.45 -1 1 -1Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"66;0\"/></path><path stroke-dasharray=\"24\" stroke-dashoffset=\"24\" d=\"M1 6.5l9 5.5l9 -5.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.3s\" to=\"0\"/></path><path stroke-dasharray=\"6\" stroke-dashoffset=\"6\" d=\"M23 8v4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"4\" stroke-dashoffset=\"4\" d=\"M23 16v0.01\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"1.1s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "email-alert"
  },
  "Megaphone": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M18 8a3 3 0 0 1 0 6m-8-6v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-5\"/><path d=\"m12 8l4.524-3.77A.9.9 0 0 1 18 4.922v12.156a.9.9 0 0 1-1.476.692L12 14H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z\"/></g>",
    width: 24,
    height: 24,
    prefix: "tabler",
    name: "speakerphone"
  },
  "Menu": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"16\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M5 5h14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"16;0\"/></path><path stroke-dashoffset=\"16\" d=\"M5 12h14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.3s\" to=\"0\"/></path><path stroke-dashoffset=\"16\" d=\"M5 19h14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.3s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "menu"
  },
  "MessageSquare": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"70\" d=\"M3 19.5v-15.5c0 -0.55 0.45 -1 1 -1h16c0.55 0 1 0.45 1 1v12c0 0.55 -0.45 1 -1 1h-14.5Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"70;0\"/></path><g stroke-dasharray=\"10\" stroke-dashoffset=\"10\"><path d=\"M8 7h8\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path d=\"M8 10h8\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g><path stroke-dasharray=\"6\" stroke-dashoffset=\"6\" d=\"M8 13h4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "chat"
  },
  "MessageSquarePlus": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 9h8m-8 4h6m-1.99 5.594L8 21v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5.5M16 19h6m-3-3v6\"/>",
    width: 24,
    height: 24,
    prefix: "tabler",
    name: "message-plus"
  },
  "Minimize2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"14\" d=\"M15 7h-11.5M9 17h11.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"14;0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M3 7l4 4M3 7l4 -4M21 17l-4 4M21 17l-4 -4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.4s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "arrows-horizontal"
  },
  "MoreHorizontal": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><circle cx=\"5\" cy=\"12\" r=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"19\" cy=\"12\" r=\"2\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "menu-dots-linear"
  },
  "MoreVertical": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M8 12H8.00901M12.0045 12H12.0135M15.991 12H16\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "menu-dots-circle-linear"
  },
  "PanelLeftClose": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"16\" d=\"M19 5h-14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"16;0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" d=\"M19 12h-9\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"16\" stroke-dashoffset=\"16\" d=\"M19 19h-14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.3s\" to=\"0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" d=\"M7 9l-3 3l3 3\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "menu-fold-left"
  },
  "PanelLeftOpen": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"12\" d=\"M21 9l-3 3l3 3\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.2s\" values=\"12;0\"/></path><path stroke-dasharray=\"16\" stroke-dashoffset=\"16\" d=\"M19 5h-14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.2s\" dur=\"0.3s\" to=\"0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" d=\"M14 12h-9\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"16\" stroke-dashoffset=\"16\" d=\"M19 19h-14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.3s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "menu-unfold-left"
  },
  "Paperclip": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M7.9175 17.8068L15.8084 10.2535C16.7558 9.34668 16.7558 7.87637 15.8084 6.96951C14.861 6.06265 13.325 6.06265 12.3776 6.96951L4.54387 14.4681C2.74382 16.1911 2.74382 18.9847 4.54387 20.7077C6.34391 22.4308 9.26237 22.4308 11.0624 20.7077L19.0105 13.0997C21.6632 10.5605 21.6632 6.44362 19.0105 3.90441C16.3578 1.3652 12.0569 1.3652 9.40419 3.90441L3 10.0346\"/>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "paperclip-linear"
  },
  "PenLine": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M14.3601 4.07866L15.2869 3.15178C16.8226 1.61607 19.3125 1.61607 20.8482 3.15178C22.3839 4.68748 22.3839 7.17735 20.8482 8.71306L19.9213 9.63993M14.3601 4.07866C14.3601 4.07866 14.4759 6.04828 16.2138 7.78618C17.9517 9.52407 19.9213 9.63993 19.9213 9.63993M19.9213 9.63993L11.4001 18.1612C10.8229 18.7383 10.5344 19.0269 10.2162 19.2751C9.84082 19.5679 9.43469 19.8189 9.00498 20.0237C8.6407 20.1973 8.25352 20.3263 7.47918 20.5844L4.19792 21.6782L3.39584 21.9456C3.01478 22.0726 2.59466 21.9734 2.31063 21.6894C2.0266 21.4053 1.92743 20.9852 2.05445 20.6042L2.32181 19.8021L3.41556 16.5208C3.67368 15.7465 3.80273 15.3593 3.97634 14.995C4.18114 14.5653 4.43213 14.1592 4.7249 13.7838C4.97308 13.4656 5.26166 13.1771 5.83882 12.5999L14.3601 4.07866M4.19792 21.6782L2.32181 19.8021\"/>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "pen-linear"
  },
  "Pencil": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g stroke-width=\"2\"><path stroke-dasharray=\"56\" d=\"M3 21l2 -6l11 -11c1 -1 3 -1 4 0c1 1 1 3 0 4l-11 11l-6 2\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"56;0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M15 5l4 4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.2s\" to=\"0\"/></path></g><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M6 15l3 3\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "pencil"
  },
  "PhoneCall": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"62\" d=\"M8 3c0.5 0 2.5 4.5 2.5 5c0 1 -1.5 2 -2 3c-0.5 1 0.5 2 1.5 3c0.39 0.39 2 2 3 1.5c1 -0.5 2 -2 3 -2c0.5 0 5 2 5 2.5c0 2 -1.5 3.5 -3 4c-1.5 0.5 -2.5 0.5 -4.5 0c-2 -0.5 -3.5 -1 -6 -3.5c-2.5 -2.5 -3 -4 -3.5 -6c-0.5 -2 -0.5 -3 0 -4.5c0.5 -1.5 2 -3 4 -3Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"62;0\"/><animateTransform attributeName=\"transform\" dur=\"2.7s\" keyTimes=\"0;0.035;0.07;0.105;0.14;0.175;0.21;0.245;0.28;1\" repeatCount=\"indefinite\" type=\"rotate\" values=\"0 12 12;15 12 12;0 12 12;-12 12 12;0 12 12;12 12 12;0 12 12;-15 12 12;0 12 12;0 12 12\"/></path><path stroke-dasharray=\"6\" stroke-dashoffset=\"6\" d=\"M15.76 8.28c-0.5 -0.51 -1.1 -0.93 -1.76 -1.24M15.76 8.28c0.49 0.49 0.9 1.08 1.2 1.72\"><animate attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"2.7s\" keyTimes=\"0;0.15;0.3;1\" repeatCount=\"indefinite\" values=\"6;0;6;6\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M18.67 5.35c-1 -1 -2.26 -1.73 -3.67 -2.1M18.67 5.35c0.99 1 1.72 2.25 2.08 3.65\"><animate attributeName=\"stroke-dashoffset\" begin=\"1s\" dur=\"2.7s\" keyTimes=\"0;0.15;0.3;1\" repeatCount=\"indefinite\" values=\"8;0;8;8\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "phone-call-loop"
  },
  "Play": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"38\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 6l10 6l-10 6Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"38;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "play"
  },
  "PlayCircle": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868L9 9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "play-circle-linear"
  },
  "Plus": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"16\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M5 12h14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"16;0\"/></path><path stroke-dashoffset=\"16\" d=\"M12 5v14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.5s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "plus"
  },
  "PlusCircle": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "add-circle-linear"
  },
  "RefreshCw": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M18.364 8.04928L17.6569 7.34217C14.5327 4.21798 9.46734 4.21798 6.34315 7.34217C3.21895 10.4664 3.21895 15.5317 6.34315 18.6559C9.46734 21.7801 14.5327 21.7801 17.6569 18.6559C19.4737 16.8391 20.234 14.3658 19.9377 11.9995M18.364 3.80664V8.04928H14.1213\"/>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "restart-linear"
  },
  "RotateCcw": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M4 7H15C16.8692 7 17.8039 7 18.5 7.40193C18.9561 7.66523 19.3348 8.04394 19.5981 8.49999C20 9.19615 20 10.1308 20 12C20 13.8692 20 14.8038 19.5981 15.5C19.3348 15.9561 18.9561 16.3348 18.5 16.5981C17.8039 17 16.8692 17 15 17H8.00001M7 10L4 7L7 4\"/>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "undo-left-linear"
  },
  "Scale": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z\"/><path d=\"M8 18H16\"/><path d=\"M16.4117 9.97078L17.0774 8.30671C17.5516 7.12125 16.8086 5.80104 15.5492 5.59114L15.1238 5.52023C13.0557 5.17555 10.9447 5.17555 8.87663 5.52023L8.45119 5.59114C7.19178 5.80104 6.44885 7.12125 6.92303 8.30671L7.58866 9.97078C7.82443 10.5602 8.45936 10.8848 9.07523 10.7309C10.9957 10.2508 13.0047 10.2508 14.9252 10.7309C15.5411 10.8848 16.176 10.5602 16.4117 9.97078Z\"/><path d=\"M10.1794 9.92856L9.50439 8.0459\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "scale-linear"
  },
  "Search": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"40\" d=\"M10.76 13.24c-2.34 -2.34 -2.34 -6.14 0 -8.49c2.34 -2.34 6.14 -2.34 8.49 0c2.34 2.34 2.34 6.14 0 8.49c-2.34 2.34 -6.14 2.34 -8.49 0Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"40;0\"/></path><path stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M10.5 13.5l-7.5 7.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "search"
  },
  "Send": {
    body: "<g fill=\"none\"><path stroke=\"currentColor\" stroke-width=\"1.5\" d=\"m18.636 15.67l1.716-5.15c1.5-4.498 2.25-6.747 1.062-7.934s-3.436-.438-7.935 1.062L8.33 5.364C4.7 6.574 2.885 7.18 2.37 8.067a2.72 2.72 0 0 0 0 2.73c.515.888 2.33 1.493 5.96 2.704c.584.194.875.291 1.119.454c.236.158.439.361.597.597c.163.244.26.535.454 1.118c1.21 3.63 1.816 5.446 2.703 5.962a2.72 2.72 0 0 0 2.731 0c.887-.516 1.492-2.331 2.703-5.962Z\"/><path fill=\"currentColor\" d=\"M16.212 8.848a.75.75 0 0 0-1.055-1.066zm-5.55 5.488l5.55-5.488l-1.055-1.066l-5.55 5.488z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "plain-linear"
  },
  "Share2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M19.5 5.5C19.5 6.88071 18.3807 8 17 8C15.6193 8 14.5 6.88071 14.5 5.5C14.5 4.11929 15.6193 3 17 3C18.3807 3 19.5 4.11929 19.5 5.5Z\"/><path d=\"M17 16C15.6193 16 14.5 17.1193 14.5 18.5C14.5 19.8807 15.6193 21 17 21C18.3807 21 19.5 19.8807 19.5 18.5C19.5 17.1193 18.3807 16 17 16Z\"/><path d=\"M7 9.5C5.61929 9.5 4.5 10.6193 4.5 12C4.5 13.3807 5.61929 14.5 7 14.5C8.38071 14.5 9.5 13.3807 9.5 12C9.5 10.6193 8.38071 9.5 7 9.5Z\"/><path d=\"M9.09668 13.3628C11.0324 14.621 12.9681 15.8792 14.9038 17.1374\"/><path d=\"M9.09668 10.6372C11.0324 9.379 12.9681 8.12079 14.9039 6.86258\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "share-linear"
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
  "Sparkles": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M8.03339 3.65784C8.37932 2.78072 9.62068 2.78072 9.96661 3.65785L11.0386 6.37599C11.1442 6.64378 11.3562 6.85576 11.624 6.96137L14.3422 8.03339C15.2193 8.37932 15.2193 9.62068 14.3422 9.96661L11.624 11.0386C11.3562 11.1442 11.1442 11.3562 11.0386 11.624L9.96661 14.3422C9.62067 15.2193 8.37932 15.2193 8.03339 14.3422L6.96137 11.624C6.85575 11.3562 6.64378 11.1442 6.37599 11.0386L3.65784 9.96661C2.78072 9.62067 2.78072 8.37932 3.65785 8.03339L6.37599 6.96137C6.64378 6.85575 6.85576 6.64378 6.96137 6.37599L8.03339 3.65784Z\"/><path d=\"M16.4885 13.3481C16.6715 12.884 17.3285 12.884 17.5115 13.3481L18.3121 15.3781C18.368 15.5198 18.4802 15.632 18.6219 15.6879L20.6519 16.4885C21.116 16.6715 21.116 17.3285 20.6519 17.5115L18.6219 18.3121C18.4802 18.368 18.368 18.4802 18.3121 18.6219L17.5115 20.6519C17.3285 21.116 16.6715 21.116 16.4885 20.6519L15.6879 18.6219C15.632 18.4802 15.5198 18.368 15.3781 18.3121L13.3481 17.5115C12.884 17.3285 12.884 16.6715 13.3481 16.4885L15.3781 15.6879C15.5198 15.632 15.632 15.5198 15.6879 15.3781L16.4885 13.3481Z\" opacity=\".5\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "stars-line-duotone"
  },
  "Table": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2.5 6.5C2.5 4.29086 4.29086 2.5 6.5 2.5C8.70914 2.5 10.5 4.29086 10.5 6.5C10.5 8.70914 8.70914 10.5 6.5 10.5C4.29086 10.5 2.5 8.70914 2.5 6.5Z\"/><path d=\"M13.5 17.5C13.5 15.2909 15.2909 13.5 17.5 13.5C19.7091 13.5 21.5 15.2909 21.5 17.5C21.5 19.7091 19.7091 21.5 17.5 21.5C15.2909 21.5 13.5 19.7091 13.5 17.5Z\"/><path d=\"M21.5 6.5C21.5 4.61438 21.5 3.67157 20.9142 3.08579C20.3284 2.5 19.3856 2.5 17.5 2.5C15.6144 2.5 14.6716 2.5 14.0858 3.08579C13.5 3.67157 13.5 4.61438 13.5 6.5C13.5 8.38562 13.5 9.32843 14.0858 9.91421C14.6716 10.5 15.6144 10.5 17.5 10.5C19.3856 10.5 20.3284 10.5 20.9142 9.91421C21.5 9.32843 21.5 8.38562 21.5 6.5Z\"/><path d=\"M10.5 17.5C10.5 15.6144 10.5 14.6716 9.91421 14.0858C9.32843 13.5 8.38562 13.5 6.5 13.5C4.61438 13.5 3.67157 13.5 3.08579 14.0858C2.5 14.6716 2.5 15.6144 2.5 17.5C2.5 19.3856 2.5 20.3284 3.08579 20.9142C3.67157 21.5 4.61438 21.5 6.5 21.5C8.38562 21.5 9.32843 21.5 9.91421 20.9142C10.5 20.3284 10.5 19.3856 10.5 17.5Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "widget-2-linear"
  },
  "Tag": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M4.72848 16.1369C3.18295 14.5914 2.41018 13.8186 2.12264 12.816C1.83509 11.8134 2.08083 10.7485 2.57231 8.61875L2.85574 7.39057C3.26922 5.59881 3.47597 4.70292 4.08944 4.08944C4.70292 3.47597 5.59881 3.26922 7.39057 2.85574L8.61875 2.57231C10.7485 2.08083 11.8134 1.83509 12.816 2.12264C13.8186 2.41018 14.5914 3.18295 16.1369 4.72848L17.9665 6.55812C20.6555 9.24711 22 10.5916 22 12.2623C22 13.933 20.6555 15.2775 17.9665 17.9665C15.2775 20.6555 13.933 22 12.2623 22C10.5916 22 9.24711 20.6555 6.55812 17.9665L4.72848 16.1369Z\"/><circle cx=\"8.607\" cy=\"8.879\" r=\"2\" transform=\"rotate(-45 8.607 8.879)\"/><path d=\"M11.5417 18.5L18.5208 11.5208\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "tag-linear"
  },
  "Target": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z\"/><path d=\"M2 12L5 12\"/><path d=\"M19 12L22 12\"/><path d=\"M12 22L12 19\"/><path d=\"M12 5L12 2\"/><path stroke-linejoin=\"round\" d=\"M10 12H12H14\"/><path stroke-linejoin=\"round\" d=\"M12 14L12 12L12 10\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "target-linear"
  },
  "Trash2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"24\" d=\"M12 20h5c0.5 0 1 -0.5 1 -1v-14M12 20h-5c-0.5 0 -1 -0.5 -1 -1v-14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"24;0\"/></path><path stroke-dasharray=\"18\" stroke-dashoffset=\"18\" d=\"M4 5h16\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.3s\" to=\"0\"/></path><path stroke-dasharray=\"10\" stroke-dashoffset=\"10\" d=\"M10 4h4M10 9v7M14 9v7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "trash"
  },
  "TrendingUp": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z\"/><path d=\"M7 18V9\"/><path d=\"M12 18V6\"/><path d=\"M17 18V13\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "chart-square-linear"
  },
  "Type": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M12 7H10C9.05719 7 8.58579 7 8.29289 7.32544C8 7.65087 8 8.17466 8 9.22222V9.75M12 7H14C14.9428 7 15.4142 7 15.7071 7.32544C16 7.65087 16 8.17466 16 9.22222V9.75M12 7V17M9.5 17H15\"/><path d=\"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "text-square-linear"
  },
  "Upload": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"32\" d=\"M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"32;0\"/></path><path stroke-dasharray=\"2 4\" stroke-dashoffset=\"6\" d=\"M12 21c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9\" opacity=\"0\"><set fill=\"freeze\" attributeName=\"opacity\" begin=\"0.45s\" to=\"1\"/><animateTransform fill=\"freeze\" attributeName=\"transform\" begin=\"0.45s\" dur=\"0.6s\" type=\"rotate\" values=\"-180 12 12;0 12 12\"/><animate attributeName=\"stroke-dashoffset\" begin=\"0.85s\" dur=\"0.6s\" repeatCount=\"indefinite\" to=\"0\"/></path><path stroke-dasharray=\"10\" stroke-dashoffset=\"10\" d=\"M12 16v-7.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.85s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M12 8.5l3.5 3.5M12 8.5l-3.5 3.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"1.05s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "uploading-loop"
  },
  "User": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"28\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M4 21v-1c0 -3.31 2.69 -6 6 -6h4c3.31 0 6 2.69 6 6v1\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"28;0\"/></path><path stroke-dashoffset=\"28\" d=\"M12 11c-2.21 0 -4 -1.79 -4 -4c0 -2.21 1.79 -4 4 -4c2.21 0 4 1.79 4 4c0 2.21 -1.79 4 -4 4Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.4s\" dur=\"0.4s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "account"
  },
  "UserCheck": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><g stroke-dasharray=\"22\"><path d=\"M5 21v-1c0 -2.21 1.79 -4 4 -4h4c2.21 0 4 1.79 4 4v1\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"22;0\"/></path><path stroke-dashoffset=\"22\" d=\"M11 13c-1.66 0 -3 -1.34 -3 -3c0 -1.66 1.34 -3 3 -3c1.66 0 3 1.34 3 3c0 1.66 -1.34 3 -3 3Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.3s\" to=\"0\"/></path></g><path stroke-dasharray=\"6\" stroke-dashoffset=\"6\" d=\"M20 3v4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"4\" stroke-dashoffset=\"4\" d=\"M20 11v0.01\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "account-alert"
  },
  "UserCircle2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"28\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M4 21v-1c0 -3.31 2.69 -6 6 -6h4c3.31 0 6 2.69 6 6v1\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"28;0\"/></path><path stroke-dashoffset=\"28\" d=\"M12 11c-2.21 0 -4 -1.79 -4 -4c0 -2.21 1.79 -4 4 -4c2.21 0 4 1.79 4 4c0 2.21 -1.79 4 -4 4Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.4s\" dur=\"0.4s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "account"
  },
  "UserPlus": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><g stroke-dasharray=\"22\"><path d=\"M3 21v-1c0 -2.21 1.79 -4 4 -4h4c2.21 0 4 1.79 4 4v1\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"22;0\"/></path><path stroke-dashoffset=\"22\" d=\"M9 13c-1.66 0 -3 -1.34 -3 -3c0 -1.66 1.34 -3 3 -3c1.66 0 3 1.34 3 3c0 1.66 -1.34 3 -3 3Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.3s\" to=\"0\"/></path></g><g stroke-dasharray=\"8\" stroke-dashoffset=\"8\"><path d=\"M15 6h6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path d=\"M18 3v6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path></g></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "account-add"
  },
  "UserRound": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"28\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M4 21v-1c0 -3.31 2.69 -6 6 -6h4c3.31 0 6 2.69 6 6v1\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.4s\" values=\"28;0\"/></path><path stroke-dashoffset=\"28\" d=\"M12 11c-2.21 0 -4 -1.79 -4 -4c0 -2.21 1.79 -4 4 -4c2.21 0 4 1.79 4 4c0 2.21 -1.79 4 -4 4Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.4s\" dur=\"0.4s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "account"
  },
  "UserX": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><g stroke-dasharray=\"22\"><path d=\"M3 21v-1c0 -2.21 1.79 -4 4 -4h4c2.21 0 4 1.79 4 4v1\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"22;0\"/></path><path stroke-dashoffset=\"22\" d=\"M9 13c-1.66 0 -3 -1.34 -3 -3c0 -1.66 1.34 -3 3 -3c1.66 0 3 1.34 3 3c0 1.66 -1.34 3 -3 3Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.3s\" to=\"0\"/></path></g><g stroke-dasharray=\"12\" stroke-dashoffset=\"12\"><path d=\"M15 3l6 6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path><path d=\"M21 3l-6 6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.9s\" dur=\"0.2s\" to=\"0\"/></path></g></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "account-delete"
  },
  "Users": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"6\" r=\"4\"/><path d=\"M18 9C19.6569 9 21 7.88071 21 6.5C21 5.11929 19.6569 4 18 4\"/><path d=\"M6 9C4.34315 9 3 7.88071 3 6.5C3 5.11929 4.34315 4 6 4\"/><ellipse cx=\"12\" cy=\"17\" rx=\"6\" ry=\"4\"/><path d=\"M20 19C21.7542 18.6153 23 17.6411 23 16.5C23 15.3589 21.7542 14.3847 20 14\"/><path d=\"M4 19C2.24575 18.6153 1 17.6411 1 16.5C1 15.3589 2.24575 14.3847 4 14\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "users-group-two-rounded-linear"
  },
  "UsersRound": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><circle cx=\"9\" cy=\"6\" r=\"4\"/><path d=\"M15 9C16.6569 9 18 7.65685 18 6C18 4.34315 16.6569 3 15 3\"/><ellipse cx=\"9\" cy=\"17\" rx=\"7\" ry=\"4\"/><path d=\"M18 14C19.7542 14.3847 21 15.3589 21 16.5C21 17.5293 19.9863 18.4229 18.5 18.8704\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "users-group-rounded-linear"
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
  "ZoomIn": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><circle cx=\"11.5\" cy=\"11.5\" r=\"9.5\"/><path d=\"M9 11.5H11.5M11.5 11.5H14M11.5 11.5V14M11.5 11.5V9\"/><path d=\"M18.2173 18.2178L21.9999 22.0004\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "magnifer-zoom-in-linear"
  },
  "ZoomOut": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><circle cx=\"11.5\" cy=\"11.5\" r=\"9.5\"/><path d=\"M9 11.5H11.5H14\"/><path d=\"M18.2173 18.2178L21.9999 22.0004\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "magnifer-zoom-out-linear"
  },
};
