import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式表
import './assets/css/global.css'
// 引入字体图标
import './assets/fonts/iconfont.css'
// 引入axios
import axios from 'axios'
// 引入树形表格组件
import TreeTable from 'vue-table-with-tree-grid'

// 设置axios的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 生成axios请求拦截器为请求添加token令牌
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 将axios挂载到Vue的原型对象上，以便在所有组件上使用
Vue.prototype.$http = axios

// 将树形表格组件注册为vue全局组件
Vue.component('tree-table', TreeTable)

// 注册全局过滤器(时间格式)
Vue.filter('dateFormat', function (value) {
  const dt = new Date(value)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 开启错误提示(常用于开发环境)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
