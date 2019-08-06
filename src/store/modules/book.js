const book = {
  state: {
    fileName: '',
    menuVisible: false,
    settingVisible: -1, // -1:不显示，0：字号设置,1:主题设置，2:进度设置，3:目录显示
    defaultFontSize: 16,
    defaultFontFamily: 'Default',
    fontFamilyVisible: false,
    defaultTheme: 'default',
    bookAvailable: false,
    progress: 0,
    section: 0,
    isPagination: true,
    currentBook: null, // 当前显示的电子书
    navigation: null,
    cover: null,
    metadata: null,
    paginate: '',
    offsetY: 0,
    isBookmark: null
  },
  mutations: {
    'SET_FILENAME': (state, fileName) => {
      state.fileName = fileName
    },
    'SET_MENUVISIBLE': (state, menuVisible) => {
       state.menuVisible = menuVisible
    },
    'SET_SETTINGVISIBLE': (state, settingVisible) => {
       state.settingVisible = settingVisible
    },
    'SET_DEFAULTFONTSIZE': (state, defaultFontSize) => {
        state.defaultFontSize = defaultFontSize
    },
    'SET_CURRENTBOOK': (state, currentBook) => {
         state.currentBook = currentBook
     }
  },
  actions: {
    
  }

}
export default book
