import type { CimaIconDefinition } from './types'

export const actionIcons: Record<string, CimaIconDefinition> = {
  "Copy": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><rect width=\"13\" height=\"13\" x=\"9\" y=\"9\" rx=\"2\" ry=\"2\"/><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "copy-linear"
  },
  "Download": {
    body: "<g stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path fill=\"currentColor\" fill-opacity=\"0\" stroke-dasharray=\"20\" d=\"M12 4h2v6h2.5l-4.5 4.5M12 4h-2v6h-2.5l4.5 4.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"20;0\"/><animate fill=\"freeze\" attributeName=\"fill-opacity\" begin=\"0.7s\" dur=\"0.4s\" to=\"1\"/></path><path fill=\"none\" stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M6 19h12\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "download"
  },
  "Edit2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"44\" stroke-dashoffset=\"44\" d=\"M7 17v-4l10 -10l4 4l-10 10h-4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.3s\" dur=\"0.5s\" to=\"0\"/></path><path stroke-dasharray=\"20\" d=\"M3 21h18\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.3s\" values=\"20;0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M14 6l4 4\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "edit"
  },
  "Filter": {
    body: "<path fill=\"none\" stroke=\"currentColor\" stroke-dasharray=\"54\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 4h14l-5 6.5v9.5l-4 -4v-5.5Z\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.6s\" values=\"54;0\"/></path>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "filter"
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
  "KeyRound": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M15.6807 14.5869C19.1708 14.5869 22 11.7692 22 8.29344C22 4.81767 19.1708 2 15.6807 2C12.1907 2 9.3615 4.81767 9.3615 8.29344C9.3615 9.90338 10.0963 11.0743 10.0963 11.0743L2.45441 18.6849C2.1115 19.0264 1.63143 19.9143 2.45441 20.7339L3.33616 21.6121C3.67905 21.9048 4.54119 22.3146 5.2466 21.6121L6.27531 20.5876C7.30403 21.6121 8.4797 21.0267 8.92058 20.4412C9.65538 19.4167 8.77362 18.3922 8.77362 18.3922L9.06754 18.0995C10.4783 19.5045 11.7128 18.6849 12.1537 18.0995C12.8885 17.075 12.1537 16.0505 12.1537 16.0505C11.8598 15.465 11.272 15.465 12.0067 14.7333L12.8885 13.8551C13.5939 14.4405 15.0439 14.5869 15.6807 14.5869Z\"/><path d=\"M17.8853 8.29353C17.8853 9.50601 16.8984 10.4889 15.681 10.4889C14.4635 10.4889 13.4766 9.50601 13.4766 8.29353C13.4766 7.08105 14.4635 6.09814 15.681 6.09814C16.8984 6.09814 17.8853 7.08105 17.8853 8.29353Z\"/></g>",
    width: 24,
    height: 24,
    prefix: "solar",
    name: "key-linear"
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
  "LogOut": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"46\" d=\"M16 5v-1c0 -0.55 -0.45 -1 -1 -1h-9c-0.55 0 -1 0.45 -1 1v16c0 0.55 0.45 1 1 1h9c0.55 0 1 -0.45 1 -1v-1\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"46;0\"/></path><path stroke-dasharray=\"14\" stroke-dashoffset=\"14\" d=\"M10 12h11\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.6s\" dur=\"0.2s\" to=\"0\"/></path><path stroke-dasharray=\"8\" stroke-dashoffset=\"8\" d=\"M21 12l-3.5 -3.5M21 12l-3.5 3.5\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "log-out"
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
  "Trash2": {
    body: "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path stroke-dasharray=\"24\" d=\"M12 20h5c0.5 0 1 -0.5 1 -1v-14M12 20h-5c-0.5 0 -1 -0.5 -1 -1v-14\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" dur=\"0.5s\" values=\"24;0\"/></path><path stroke-dasharray=\"18\" stroke-dashoffset=\"18\" d=\"M4 5h16\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.5s\" dur=\"0.3s\" to=\"0\"/></path><path stroke-dasharray=\"10\" stroke-dashoffset=\"10\" d=\"M10 4h4M10 9v7M14 9v7\"><animate fill=\"freeze\" attributeName=\"stroke-dashoffset\" begin=\"0.8s\" dur=\"0.2s\" to=\"0\"/></path></g>",
    width: 24,
    height: 24,
    prefix: "line-md",
    name: "trash"
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
}
