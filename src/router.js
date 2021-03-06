import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/store'
    },
    {
      path: '/ebook',
      name: 'ebook',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/ebook/index.vue'),
      children: [
        {
          path: ':fileName',
          component: () => import('./components/ebook/EbookReader.vue')
        }
      ]
    },
    {
      path: '/store',
      component: () => import('./views/store/index.vue'),
      redirect: '/store/home',
      children: [
        {
          path: 'shelf',
          component: () => import('./views/store/StoreShelf.vue')
        },
        {
          path: 'category',
          component: () => import('./views/store/StoreCategory.vue')
        },
        {
          path: 'home',
          component: () => import('./views/store/StoreHome.vue')
        },
        {
          path: 'list',
          component: () => import('./views/store/StoreList.vue')
        },
        {
          path: 'detail',
          component: () => import('./views/store/StoreDetail.vue')
        },
        {
          path: 'speaking',
          component: () => import('./views/store/StoreSpeaking.vue')
        }
      ]
    }
  ]
})
