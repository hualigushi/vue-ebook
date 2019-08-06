const actions = {
    setFileName: ({ commit }, fileName) => {
      return commit('SET_FILENAME', fileName)
    },
    setMenuVisible: ({commit},menuVisible) => {
        return commit('SET_MENUVISIBLE', menuVisible)
    },
  setSettingVisible: ({commit}, settingVisible) => {
         return commit('SET_SETTINGVISIBLE', settingVisible)
  }
}
export default actions
