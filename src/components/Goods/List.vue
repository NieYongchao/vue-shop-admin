<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框及按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="clearInput"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goGoodsAdd">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#">
          <template slot-scope="scope">
            {{
              (queryInfo.pagenum - 1) * queryInfo.pagesize + scope.$index + 1
            }}
          </template>
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格(元)"
        ></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="190px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteGoods(scope.row.goods_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagesize: 5,
        pagenum: 1
      },
      total: 0,
      // 商品数据列表
      goodsList: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取列表数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$Message.error('获取商品数据失败！')
      }
      this.goodsList = res.data.goods
      // console.log(this.goodsList)
      this.total = res.data.total
    },
    // 分页size改变
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getGoodsList()
    },
    // 分页页码改变
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getGoodsList()
    },
    // 清空输入框
    clearInput() {
      this.queryInfo.pagenum = 1
      this.getGoodsList()
    },
    // 删除商品
    async deleteGoods(goodsId) {
      const isConfirm = await this.$confirm('确定删除该商品吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (isConfirm !== 'confirm') {
        return this.$Message.info('取消删除！')
      }
      const { data: res } = await this.$http.delete('goods/' + goodsId)
      if (res.meta.status !== 200) {
        return this.$Message.error('删除失败！')
      }
      this.$Message.success('删除成功！')
      this.getGoodsList()
    },
    // 前往添加商品页面
    goGoodsAdd() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped></style>
