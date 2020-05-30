import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/Login' },
    { path: '/login', component: Login },
    // 加载Home组件，并且重定向到二级(嵌套)路由 /welcome 中
    { path: '/home', component: Home, redirect: '/welcome', children: [{ path: '/welcome', component: Welcome }] }
  ]
})

// 为路由对象添加 beforeEach 导航守卫 to：到哪去、from：从哪来、next：没参数表示放行，有参数表示重定向到该地址
router.beforeEach((to, from, next) => {
  // 如果访问的是登录页则直接放行
  if (to.path === '/login') return next()
  // 访问登录页之外的页面则查看本地有无token，有则放行，无则重定向到登录页面
  const tokenStr = window.sessionStorage.getItem('token')
  if (tokenStr) return next()
  next('/login')
})

export default router
