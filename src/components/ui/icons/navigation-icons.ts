import type { CimaIconDefinition } from './types'

export const navigationIcons: Record<string, CimaIconDefinition> = {
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
  "ExternalLink": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"42\" d=\"M11 5h-6v14h14v-6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"42;0\"/></path><path stroke-dasharray=\"12\" stroke-dashoffset=\"12\" d=\"M13 11l7 -7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M21 3h-6M21 3v6\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "external-link"
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
  "Link2": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"28\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M13 6l2 -2c1 -1 3 -1 4 0l1 1c1 1 1 3 0 4l-5 5c-1 1 -3 1 -4 0M11 18l-2 2c-1 1 -3 1 -4 0l-1 -1c-1 -1 -1 -3 0 -4l5 -5c1 -1 3 -1 4 0\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"28;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "link"
  },
  "LocateFixed": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z\"/><path d=\"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z\"/><path d=\"M2 12L4 12\"/><path d=\"M20 12L22 12\"/><path d=\"M12 4V2\"/><path d=\"M12 22V20\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "gps-linear"
  },
  "Menu": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"16\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M5 5h14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"16;0\"/></path><path stroke-dashoffset=\"16\" d=\"M5 12h14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.3s\" to=\"0\"/></path><path stroke-dashoffset=\"16\" d=\"M5 19h14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.3s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "menu"
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
}
