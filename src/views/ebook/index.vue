<template>
    <div class="ebook" ref="ebook">
        <ebook-title></ebook-title>
        <ebook-reader></ebook-reader>
        <ebook-menu></ebook-menu>
        <ebook-bookmark></ebook-bookmark>
    </div>
</template>
<script>
import EbookReader from '../../components/ebook/EbookReader'
import EbookTitle from '../../components/ebook/EbookTitle'
import EbookMenu from '../../components/ebook/EbookMenu'
import EbookBookmark from '../../components/ebook/EbookBookmark'
import { getReadTime, saveReadTime } from '../../utils/localStorage'
import { setInterval, clearInterval, setTimeout } from 'timers'
import { ebookMixin } from '../../utils/mixin'
export default {
  mixins: [ebookMixin],
  components: {
    EbookReader,
    EbookTitle,
    EbookMenu,
    EbookBookmark
  },
  watch: {
    offsetY (v) { // 监听下拉偏移量，移动阅读器页面
      if (!this.menuVisible && this.bookAvailable) { // 菜单显示或处理分页过程中不能下拉菜单
        if (v > 0) {
          this.move(v)
        } else if (v === 0) {
          this.restore()
        }
      }
    }
  },
  methods: {
    move (v) {
      this.$refs.ebook.style.top = v + 'px'
    },
    restore () {
      this.$refs.ebook.style.top = 0
      this.$refs.ebook.style.transition = 'all .2s linear' // 页面弹回去的时候增加动画
      setTimeout(() => { // 清除动画，否则再次下拉时会有问题
        this.$refs.ebook.style.transition = ''
      }, 200)
    },
    // 载入页面后开始循环计算阅读时间
    startLoopReadTime () {
      let readTime = getReadTime(this.fileName)
      if (!readTime) {
        readTime = 0
      }
      this.task = setInterval(() => {
        readTime++
        if (readTime % 30 === 0) { // 每隔30秒保存
          saveReadTime(this.fileName, readTime)
        }
      }, 1000)
    }
  },
  mounted () {
    this.startLoopReadTime()
  },
  // 组件销毁前，清除定时任务
  beforeDestroy () {
    if (this.task) {
      clearInterval(this.task)
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .ebook {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }
</style>
