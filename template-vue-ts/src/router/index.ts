// @ts-expect-error unplugin-vue-router 声明的与 vue-router 冲突
import { createRouter, createWebHashHistory } from 'vue-router/auto'

const router = createRouter({
  history: createWebHashHistory(),
})

export default router
