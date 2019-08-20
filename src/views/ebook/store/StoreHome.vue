<template>
<div class="store-home">
  <search-bar></search-bar>
  <scroll :top="94" @onScroll="onScroll">
    <div></div
  </scroll>
</div>
<template>
<script>
import SearchBar from '../../components/home/SearchBar'
import Scroll from '../../components/common/Scroll'
import {storeHomeMixin} from '../../utils/mixin'
export default {
   minxins: [storeHomeMinxin],
  compoents:{
    SearchBar,
    Scroll
  },
  methods: {
    onScroll(offsetY) {
       this.setOffsetY(offsetY)
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";
.store-home {
width: 100%;
height:100%;
}
</style>
