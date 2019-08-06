const book = {
  state: {
    fileName: '',
    menuVisible: false,
    settingVisible: -1 // -1:不显示，0：字号设置,1:主题设置，2:进度设置，3:目录显示
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
    }
  },
  actions: {
    
  }

}
export default book
