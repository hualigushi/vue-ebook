<template>
    <div class="ebook">
        <ebook-title></ebook-title>
        <ebook-reader></ebook-reader>
        <ebook-menu></ebook-menu>
    </div>
</template>
<script>
import EbookReader from '../../components/ebook/EbookReader'
import EbookTitle from '../../components/ebook/EbookTitle'
import EbookMenu from '../../components/ebook/EbookMenu'
import { getReadTime, saveReadTime } from '../../utils/localStorage'
import { setInterval, clearInterval } from 'timers'
import { ebookMixin } from '../../utils/mixin'
export default {
  mixins: [ebookMixin],
  components: {
    EbookReader,
    EbookTitle,
    EbookMenu
  },
  methods: {
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
<style lang="sass" scoped>

</style>
