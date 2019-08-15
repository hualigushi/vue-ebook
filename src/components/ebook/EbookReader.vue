<template>
  <div class="ebook-reader">
    <div id="read">

    </div>
  </div>
</template>
<script>
import { ebookMixin } from '../../utils/mixin'
import { flatten } from '../../utils/book'
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
    parseBook () { // 解析电子书，
      // 获取封面图片链接
      this.book.loaded.cover.then(cover => {
        this.book.archive.createUrl(cover).then(url => {
          console.log(url)
          this.setCover(url)
        })
      })
      // 获取标题和作者
      this.book.loaded.metadata.then(metadata => {
        console.log(metadata)
        this.setMetadata(metadata)
      })
      // 获取目录
      this.book.loaded.navigation.then(nav => {
        console.log(nav)
        const navItem = flatten(nav.toc)
        function find (item, v = 0) {
          const parent = navItem.filter(it => it.id === item.parent)[0]
          return !item.parent ? v : (parent ? find(parent, ++v) : v)
        }

        navItem.forEach(item => {
          item.level = find(item)
          item.total = 0
          item.pagelist = []
          if (item.href.match(/^(.*)\.html$/)) {
            item.idhref = item.href.match(/^(.*)\.html$/)[1]
          } else if (item.href.match(/^(.*)\.xhtml$/)) {
            item.idhref = item.href.match(/^(.*)\.xhtml$/)[1]
          }
        })
        this.setNavigation(navItem)
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
      this.parseBook()
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
