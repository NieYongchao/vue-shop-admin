import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 树形控件表格
import ZkTable from 'vue-table-with-tree-grid'

// 全局样式
import './assets/css/global.css'

// 引入（发起请求时）进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import axios from 'axios'
// axios.defaults.baseURL = 'http://47.115.124.102:8888/api/private/v1/'
axios.defaults.baseURL = 'https://rambuild.cn/api/private/v1'
axios.interceptors.request.use(config => {
  /* 发起请求时启动进度条 */
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 响应拦截中取消进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.component('tree-table', ZkTable)
Vue.use(VueQuillEditor)
/* 自定义时间格式化过滤器 */
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date()

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
