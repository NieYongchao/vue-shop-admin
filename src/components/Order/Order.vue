<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="getOrderList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="orderList" style="width: 100%">
        <el-table-column type="index" label="#">
          <template slot-scope="scope">
            {{
              queryInfo.pagesize * (queryInfo.pagenum - 1) + scope.$index + 1
            }}
          </template>
        </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="120px"
        ></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="120px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="warning" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="120px"
        ></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="success"
              icon="el-icon-info"
              @click="showProgress(scope.row)"
              >物流</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 编辑对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="editDialogVisible"
        width="40%"
        @close="editDialogClose"
      >
        <!-- 表单 -->
        <el-form
          :model="addressForm"
          :rules="addressRules"
          ref="addressFormRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="省市区/县" prop="address">
            <el-cascader
              :options="cityData"
              v-model="addressForm.address"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="detailedAddress">
            <el-input v-model="addressForm.detailedAddress"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>

      <!-- 物流对话框 -->
      <el-dialog
        title="物流信息"
        :visible.sync="progressDialogVisible"
        width="50%"
      >
        <el-timeline :reverse="reverse">
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.ftime"
          >
            {{ activity.context }}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data() {
    return {
      input3: '',
      orderList: [],
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 编辑地址对话框
      editDialogVisible: false,
      // 表单地址
      addressForm: {
        address: [],
        detailedAddress: ''
      },
      addressRules: {
        address: [
          { required: true, message: '请输入省市区/县地址', trigger: 'blur' }
        ],
        detailedAddress: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 城市地址数据
      cityData,
      // 物流窗口
      progressDialogVisible: false,
      progressInfo: [],
      reverse: false
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$Message.error('获取订单列表失败！')
      }
      this.orderList = res.data.goods
      console.log(this.orderList)
      this.total = res.data.total
    },
    // 监听分页size改变
    handleSizeChange(size) {
      this.queryInfo.pagesize = size
      this.getOrderList()
    },
    // 监听分页当前页码改变
    handleCurrentChange(cur) {
      this.queryInfo.pagenum = cur
      this.getOrderList()
    },
    // 打开编辑对话框
    showEditDialog() {
      this.editDialogVisible = true
    },
    // 关闭编辑对话框充值表单
    editDialogClose() {
      this.$refs.addressFormRef.resetFields()
    },
    // 打开物流信息
    async showProgress(row) {
      // 获取物流信息 正常情况下要获取row中的订单编号，现在使用测试编号
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$Message.error('获取物流信息失败！')
      }
      this.progressInfo = res.data
      console.log(this.progressInfo)
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
