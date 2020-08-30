import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 树形控件表格
import ZkTable from 'vue-table-with-tree-grid'

// 全局样式
import './assets/css/global.css'

import axios from 'axios'
// axios.defaults.baseURL = 'http://47.115.124.102:8888/api/private/v1/'
axios.defaults.baseURL = 'https://rambuild.cn/api/private/v1'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.component('tree-table', ZkTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
