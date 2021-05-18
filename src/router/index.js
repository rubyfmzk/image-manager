import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component:() => import('@/views/Home.vue'),
  },
  {
    path: '/sabian/upload',
    name: 'sabian_upload',
    component:() => import('@/views/SabianUpload.vue'),
  },
  {
    path: '/collage',
    name: 'collage',
    component:() => import('@/views/Collage.vue'),
  },
  {
    path: '/collage/drawing',
    name: 'collage_drawing',
    component:() => import('@/views/CollageDrawing.vue'),
  },
  {
    path: '/collage/object',
    name: 'collage_object',
    component:() => import('@/views/CollageObject.vue'),
  },
  {
    path: '/collage/object/upload',
    name: 'collage_object_upload',
    component:() => import('@/views/CollageObjectUpload.vue'),
  },

]

const router = new VueRouter({
  mode: 'history',
//  base: process.env.BASE_URL,
  routes,
})

export default router
