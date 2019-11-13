<template>
  <div class="ebook-reader">
    <div id="read">
    <div class="ebook-reader-mask"
      @click="onMaskClick"
      @touchmove="move"
      @touchend="moveEnd"
      @mousedown.left="onMouseEnter"
      @mousemove.left="onMouseMove"
      @mouseup.left="onMouseEnd"></div>
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
    // 思考步骤：清楚的划分鼠标状态，将事件与状态进行关联
    // 1 - 鼠标进入
    // 2 - 鼠标进入后的移动
    // 3 - 鼠标从移动状态松手
    // 4 - 鼠标还原
    onMouseEnd (e) { // 会触发maskclick事件
      if (this.mouseState === 2) {
        this.setOffsetY(0)
        this.firstOffsetY = null
        this.mouseState = 3
      } else {
        this.mouseState = 4
      }
      const time = e.timeStamp - this.mouseStartTime
      if (time < 100) {
        this.mouseState = 4
      }
      e.preventDefault()
      e.stopPropagation()
    },
    onMouseMove (e) { // PC端只有鼠标移动就会触发move事件，所以需要先设置状态
      if (this.mouseState === 1) {
        this.mouseState = 2
      } else if (this.mouseState === 2) {
        let offsetY = 0
        if (this.firstOffsetY) {
          offsetY = e.clientY - this.firstOffsetY
          this.setOffsetY(offsetY)
        } else {
          this.firstOffsetY = e.clientY
        }
      }
      e.preventDefault()
      e.stopPropagation()
    },
    onMouseEnter (e) {
      this.mouseState = 1
      this.mouseStartTime = e.timeStamp
      e.preventDefault()
      e.stopPropagation()
    },
    move (e) { // 移动端move事件必须touchstart
      let offsetY = 0
      if (this.firstOffsetY) {
        offsetY = e.changedTouches[0].clientY - this.firstOffsetY
        this.setOffsetY(offsetY)
      } else {
        this.firstOffsetY = e.changedTouches[0].clientY
      }
      // 阻止事件传播
      e.preventDefault() // 解决微信端下拉闪烁问题
      e.stopPropagation()
    },
    moveEnd (e) {
      this.setOffsetY(0) // 还原偏移量
      this.firstOffsetY = null
    },
    onMaskClick (e) {
      if (this.mouseState && (this.mouseState === 2 || this.mouseState === 3)) {
        return
      }
      const offsetX = e.offsetX
      const width = window.innerWidth
      if (offsetX > 0 && offsetX < width * 0.3) {
        this.prevPage()
      } else if (offsetX > 0 && offsetX > width * 0.7) {
        this.nextPage()
      } else {
        this.toggleTitleAndMenu()
      }
    },
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
        this.rendition.themes.register(theme.name, theme.style) // 注册
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
      this.rendition = this.book.renderTo('read', { // 渲染
        width: innerWidth,
        height: innerHeight,
        method: 'default' // 默认翻页模式，不加该属性，微信端无法显示成功
        // flow: 'scolled' epubjs支持滚动阅读模式
      })
      const location = getLocation(this.fileName)
      this.display(location, () => {
        this.initTheme()
        this.initGlobalStyle()
        this.initFontSize()
        this.initFontFamily()
        this.refreshLocation()
      })
      // 阅读器渲染完成可以获取资源文件时，注册方法
      this.rendition.hooks.content.register(contents => {
        // 向iframe中注入字体文件，从而实现字体切换
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
    initEpub (url) {
      this.book = new Epub(url) // 实例化
      this.setCurrentBook(this.book)
      this.initRendition()
      // this.initGesture()
      this.parseBook()
      this.book.ready.then(() => { // 分页
        return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
      }).then(locations => {
        // 分页,计算每一章节有多少页
        this.navigation.forEach(nav => {
          nav.pagelist = []
        })
        locations.forEach(item => {
          const loc = item.match(/\[(.*)\]!/)[1]
          this.navigation.forEach(nav => {
            if (nav.href) {
              const href = nav.href.match(/^(.*)\.html$/)
              if (href) {
                if (href[1] === loc) {
                  nav.pagelist.push(item)
                }
              }
            }
          })
          let currentPage = 1
          this.navigation.forEach((nav, index) => {
            if (index === 0) {
              nav.page = 1
            } else {
              nav.page = currentPage
            }
            currentPage += nav.pagelist.length + 1
          })
        })
        this.setPagelist(locations)
        this.setBookAvailable(true)
        this.refreshLocation()
      })
    }
  },
  mounted() {
    // 原始路径为   分类名|电子书名称， 处理路径为nginx路径
      const books = this.$route.params.fileName.split('|')
      const fileName = books[1]
      getLocalForage(fileName, (err, blob) => {
        if (!err && blob) {
          this.setFileName(books.join('/')).then(() => {
            this.initEpub(blob)
          })
        } else {
          this.setFileName(books.join('/')).then(() => {
             // 通过nginx服务器来获取电子书路径
            const url = process.env.VUE_APP_EPUB_URL + '/' + this.fileName + '.epub'
            this.initEpub(url)
          })
        }
      })
    }
}
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .ebook-reader{
    width: 100%;
    height: 100%;
    overflow: hidden;
    .ebook-reader-mask{
      position: absolute;
      z-index: 150;
      top:0;
      left:0;
      background: transparent;
      width: 100%;
      height: 100%;
    }
  }
</style>
