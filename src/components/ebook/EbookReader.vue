<template>
  <div class="ebook-reader">
    <div id="read">

    </div>
  </div>
</template>
<script>
import { ebookMixin } from '../../utils/mixin'
import Epub from 'epubjs'
import { getFontSize,
  saveFontSize,
  getFontFamily,
  saveFontFamily,
  getTheme,
  saveTheme,
  getLocation }
  from '../../utils/localStorage'
global.ePub = Epub
export default {
  mixins: [ebookMixin],
  methods: {
    // 上一页
    prevPage () {
      if (this.rendition) {
        this.rendition.prev().then(() => {
          this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
    },
    // 下一页
    nextPage () {
      if (this.rendition) {
        this.rendition.next().then(() => {
          this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
    },
    toggleTitleAndMenu () {
      if (this.menuVisible) {
        this.setSettingVisible(-1)
        this.setFontFamilyVisible(false)
      }
      this.setMenuVisible(!this.menuVisible)
    },
    hideTitleAndMenu () {
      this.setMenuVisible(false)
      this.setSettingVisible(-1)
      this.setFontFamilyVisible(false)
    },
    initTheme () {
      let defaultTheme = getTheme(this.fileName)
      if (!defaultTheme) {
        defaultTheme = this.themeList[0].name
        saveTheme(this.fileName, defaultTheme)
      }
      this.setDefaultTheme(defaultTheme)
      this.themeList.forEach(theme => {
        this.rendition.themes.register(theme.name, theme.style)
      })
      this.rendition.themes.select(defaultTheme)
    },
    initFontSize () {
      let fontSize = getFontSize(this.fileName)
      if (!fontSize) {
        saveFontSize(this.fileName, this.defaultFontSize)
      } else {
        this.rendition.themes.font(fontSize)
        this.setDefaultFontSize(fontSize)
      }
    },
    initFontFamily () {
      let font = getFontFamily(this.fileName)
      if (!font) {
        saveFontFamily(this.fileName, this.defaultFontFamily)
      } else {
        this.rendition.themes.font(font)
        this.setDefaultFontFamily(font)
      }
    },
    initRedition () {
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        method: 'default'
      })
      const location = getLocation(this.fileName)
      this.display(location, false, () => {
        this.initTheme()
        this.initGlobalStyle()
        this.initFontSize()
        this.initFontFamily()
        this.refreshLocation()
      })
      // 阅读器渲染完成可以获取资源文件时，注册方法
      this.rendition.hooks.content.register(contents => {
        Promise.all([
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`), // 手动添加样式文件,在.env.development  /  .env.production中配置路径
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
        ]).then(() => {

        })
      })
    },
    // 初始化手势
    initGesture () {
      // 绑定事件到iframe
      this.rendition.on('touchstart', event => {
        console.log(event)
        this.touchStartX = event.changedTouches[0].clientX
        this.touchStartTime = event.timeStamp
      })
      this.rendition.on('touchend', event => {
        const offsetX = event.changedTouches[0].clientX - this.touchStartX
        const time = event.timeStamp - this.touchStartTime
        // 触摸时间小于500毫秒，从右往左划过的距离大于40px时，进入上一页
        if (time < 500 && offsetX > 40) {
          this.prevPage()
        } else if (time < 500 && offsetX < -40) {
          this.nextPage()
        } else {
          this.toggleTitleAndMenu() // 不满足条件就显示标题和菜单栏
        }
        event.preventDefault() // 禁止默认事件
        event.stopPropagation() // 禁止传播事件
      })
    },
    initEpub () {
    // 通过nginx服务器来获取电子书路径
      const url = `${process.env.VUE_APP_RES_URL}/epub/` + this.fileName + '.epub'
      console.log(url)
      this.book = new Epub(url)
      console.log(this.book)
      this.setCurrentBook(this.book)
      this.initRedition()
      this.initGesture()
      this.book.ready.then(() => {
        return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
      }).then(locations => {
        this.setBookAvailable(true)
        this.refreshLocation()
      })
    }
  },
  mounted () {
    this.setFileName(this.$route.params.fileName.split('|').join('/')).then(() => {
      this.initEpub()
    })
  }
}
</script>
<style lang="sass" scoped>

</style>
