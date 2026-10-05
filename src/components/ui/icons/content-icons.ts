import type { CimaIconDefinition } from './types'

export const contentIcons: Record<string, CimaIconDefinition> = {
  "Archive": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M9 12C9 11.5341 9 11.3011 9.07612 11.1173C9.17761 10.8723 9.37229 10.6776 9.61732 10.5761C9.80109 10.5 10.0341 10.5 10.5 10.5H13.5C13.9659 10.5 14.1989 10.5 14.3827 10.5761C14.6277 10.6776 14.8224 10.8723 14.9239 11.1173C15 11.3011 15 11.5341 15 12C15 12.4659 15 12.6989 14.9239 12.8827C14.8224 13.1277 14.6277 13.3224 14.3827 13.4239C14.1989 13.5 13.9659 13.5 13.5 13.5H10.5C10.0341 13.5 9.80109 13.5 9.61732 13.4239C9.37229 13.3224 9.17761 13.1277 9.07612 12.8827C9 12.6989 9 12.4659 9 12Z\"/><path d=\"M20.5 7V13C20.5 16.7712 20.5 18.6569 19.3284 19.8284C18.1569 21 16.2712 21 12.5 21H11.5C7.72876 21 5.84315 21 4.67157 19.8284C3.5 18.6569 3.5 16.7712 3.5 13V7\"/><path d=\"M2 5C2 4.05719 2 3.58579 2.29289 3.29289C2.58579 3 3.05719 3 4 3H20C20.9428 3 21.4142 3 21.7071 3.29289C22 3.58579 22 4.05719 22 5C22 5.94281 22 6.41421 21.7071 6.70711C21.4142 7 20.9428 7 20 7H4C3.05719 7 2.58579 7 2.29289 6.70711C2 6.41421 2 5.94281 2 5Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "archive-linear"
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
  "Image": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke-dasharray=\"66\" stroke-width=\"2\" d=\"M3 14v-9h18v14h-18v-5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"66;0\"/></path><path stroke-dasharray=\"26\" stroke-dashoffset=\"26\" d=\"M3 16l4 -3l3 2l6 -5l5 4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.4s\" to=\"0\"/></path></g><circle cx=\"7.5\" cy=\"9.5\" r=\"1.5\" fill=\"currentColor\" opacity=\"0\"><animate fill=\"freeze\" attributeName=\"opacity\" begin=\"1s\" dur=\"0.2s\" to=\"1\"/></circle>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "image"
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
  "Paperclip": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M7.9175 17.8068L15.8084 10.2535C16.7558 9.34668 16.7558 7.87637 15.8084 6.96951C14.861 6.06265 13.325 6.06265 12.3776 6.96951L4.54387 14.4681C2.74382 16.1911 2.74382 18.9847 4.54387 20.7077C6.34391 22.4308 9.26237 22.4308 11.0624 20.7077L19.0105 13.0997C21.6632 10.5605 21.6632 6.44362 19.0105 3.90441C16.3578 1.3652 12.0569 1.3652 9.40419 3.90441L3 10.0346\"/>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "paperclip-linear"
  },
  "PhoneCall": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"62\" d=\"M8 3c0.5 0 2.5 4.5 2.5 5c0 1 -1.5 2 -2 3c-0.5 1 0.5 2 1.5 3c0.39 0.39 2 2 3 1.5c1 -0.5 2 -2 3 -2c0.5 0 5 2 5 2.5c0 2 -1.5 3.5 -3 4c-1.5 0.5 -2.5 0.5 -4.5 0c-2 -0.5 -3.5 -1 -6 -3.5c-2.5 -2.5 -3 -4 -3.5 -6c-0.5 -2 -0.5 -3 0 -4.5c0.5 -1.5 2 -3 4 -3Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"62;0\"/><animateTransform attributeName=\"transform\" dur=\"2.7s\" keyTimes=\"0;0.035;0.07;0.105;0.14;0.175;0.21;0.245;0.28;1\" repeatCount=\"indefinite\" type=\"rotate\" values=\"0 12 12;15 12 12;0 12 12;-12 12 12;0 12 12;12 12 12;0 12 12;-15 12 12;0 12 12;0 12 12\"/></path><path stroke-dasharray=\"6\" stroke-dashoffset=\"6\" d=\"M15.76 8.28c-0.5 -0.51 -1.1 -0.93 -1.76 -1.24M15.76 8.28c0.49 0.49 0.9 1.08 1.2 1.72\"><animate attributeName=\"stroke-dashoffset\" begin=\"0.7s\" dur=\"2.7s\" keyTimes=\"0;0.15;0.3;1\" repeatCount=\"indefinite\" values=\"6;0;6;6\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M18.67 5.35c-1 -1 -2.26 -1.73 -3.67 -2.1M18.67 5.35c0.99 1 1.72 2.25 2.08 3.65\"><animate attributeName=\"stroke-dashoffset\" begin=\"1s\" dur=\"2.7s\" keyTimes=\"0;0.15;0.3;1\" repeatCount=\"indefinite\" values=\"8;0;8;8\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "phone-call-loop"
  },
}
