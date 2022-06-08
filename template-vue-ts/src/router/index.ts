import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '', redirect: 'index' },
    {
      name: 'index',
      path: '/index',
      component: () => import('@/views/home/index.vue'),
    },
    {
      name: 'hello',
      path: '/hello',
      component: () => import('@/components/HelloWorld.vue'),
    },
  ],
})

export default router
