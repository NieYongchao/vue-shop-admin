<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <div id="main"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  data() {
    return {
      // option: {
      //   legend: {},
      //   xAxis: {},
      //   yAxis: {},
      //   series: []
      // }
    }
  },
  async mounted() {
    const myChart = echarts.init(document.getElementById('main'))
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$Message.error('获取数据失败！')
    }
    myChart.setOption(res.data)
  }
}
</script>

<style lang="less" scoped>
#main {
  width: 600px;
  height: 400px;
}
</style>
