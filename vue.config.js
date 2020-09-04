module.exports = {
  /* 配置生产环境和开发环境打包入口 */
  chainWebpack: config => {
    /* 生产模式 */
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')
      config.set('externals', {
        echarts: 'echarts'
      })
    })
    /* 开发模式 */
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')
    })
  },
  css: {
    extract: false
  }
}
