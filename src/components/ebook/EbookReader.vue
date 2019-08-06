<template>
    <div class="ebook-reader">
        <div id="read">

        </div>
    </div>
</template>
<script>
import {mapActions} from 'vuex'
import {ebookMixin} from '../../utils/mixin'
import Epub from 'epubjs'
global.ePub = Epub
export default {
  mixins: [ebookMixin],
  methods: {
  ...mapActions(['setMenuVisible'])
  // 上一页
  prevPage () {
    if (this.rendition) {
      this.rendition.prev()
      this.hideTitleAndMenu()
    }
  },
  // 下一页
  nextPage() {
  if(this.rendition) {
      this.rendition.next()
      this.hideTitleAndMenu()
  }
  },
  toggleTitleAndMenu () {
      this.setMenuVisible(!this.menuVisible)
  },
  hideTitleAndMenu () {
     this.setMenuVisible(false)
  },
    initEpub () {
    // 通过nginx服务器来获取电子书路径 
      const url = 'http://192.168.43.199:8081/epub/' + this.fileName + '.epub'
      console.log(url)
      this.book = new Epub(url)
      console.log(this.book)
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        method: 'default'
      })
      this.rendition.display()
      // 绑定事件到iframe
      this.rendition.on('touchstart', event => {
       console.log(event)
       this.touchStartX = event.changedTouched[0].clientX
       this.touchStartTime = event.timeStamp
      })
      this.rendition.on('touchend', event => {
       const offsetX = event.changesTouched[0].clientX - this.touchStartX
       const time = event.timeStamp - this.touchStartTime
       // 触摸时间小于500毫秒，从右往左划过的距离大于40px时，进入上一页
       if (time > 500 && offsetX > 40) {
           this.prevPage()
       } else if (time > 500 && offsetX 《 -40) {
           this.nextPage()
       } else {
           this.toggleTitleAndMenu() // 不满足条件就显示标题和菜单栏
       }
       event.preventDefault() //禁止默认事件
       event.stopPropagation() // 禁止传播事件
      })
    }
  },
  mounted () {
    this.$store.dispatch('setFileName', this.$route.params.fileName.split('|').join('/')).then(() => {
      this.initEpub()
    })
  }
}
</script>
<style lang="sass" scoped>

</style>
