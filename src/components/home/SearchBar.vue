<template>
<div class="search-bar" :class="{'hide-title':!titleVisible}">
 <transition name="title-move">
   <div class="search-bar-title-warpper" v-show="titleVisible">
      <div class="title-icon-back-wrapper">
        <span class="icon-back icon"></span>
      </div>
      <div class="title-text-wrapper">
        <span class="title-text title">{{$t('home.title')}}</span>
      </div>
      <div class="title-icon-shake-wrapper">
        <span class="icon-shake icon"></span>
      </div>
   </div>
  </transition>
   <div class="search-bar-input-wrapper">
     <div class="search-bar-input">
       <span class="icon-search icon">
       <input class="input" type="text" :placeholder="$t('home.hint')" v-model="searchText">
     </div>
   </div>
</div>
<template>
<script>
import {storeHomeMixin} from '../../utils/mixin'
export default {
minxins: [storeHomeMinxin],
  data () {
    return {
      searchText: '',
      titleVisible: true
    }
  },
  watch: {
    offsetY(offsetY){
       if (offsetY > 0) { // 向下滚动页面
             this.hideTitle()
       } else {
         this.showTitle()
       }
    }
  },
  methods: {
    hideTitle() {
      this.titleVisible = false
    },
    showTitle() {
       this.titleVisible = true
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";
 .search-bar {
 position:relative;
 z-index:100;
 width:100%;
 height: px2rem(94);
 &.hide-title {
 height: px2rem(52);
 }
   .search-bar-title-warpper {
     position:absolute;
     top:0;
     left:0;
     width:100%；
     height:px2rem(42);
     .title-icon-back-wrapper {
        position:absolute;
        left:px2rem(15);
        top:0;
        height:px2rem(42);
        @include center;
        
     }
     .title-text-wrapper {
       width:100%;
       height:px2rem(42);
       @include center;
       
     }
     .title-icon-shake-wrapper{
       position:absolute;
        right:px2rem(15);
        top:0;
        height:px2rem(42);
        @include center;
        
     }
   }
   .search-bar-input-wrapper {
     width:100%;
     height:px2rem(52);
     padding:px2rem(10);
     box-sizing: border-box;
     .search-bar-input{
        width:100%;
        background-color:#f4f4f4;
        boder-radius:px2rem(20);
        padding: px2rem(5) px2rem(15);
        border-sizing: border-box;
        border: px2rem(1) solid #eee;
        @include left;
        .icon-search {
           color:#999;
        }
        .input{
           width:100%;
           height: px2rem(22);
           border:none;
           background:transparent;
           margin-left:px2rem(10);
           font-size:px2rem(12);
           color:#666;
           &:focus{
             outline:none
           }
           $::-webkit-input-placeholder{
             color:#ccc;
           }
        }
     }
   }
 }
</style>
