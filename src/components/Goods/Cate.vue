<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 商品分类 -->
    <el-card class="box-card">
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类表格 -->
      <tree-table
        :data="goodsCateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot-scope="scope" slot="isok">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: #409eff"
          ></i>
          <i class="el-icon-error" v-else style="color: #409eff"></i>
        </template>
        <!-- 排序 -->
        <template slot-scope="scope" slot="order">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot-scope="scope" slot="opt">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 添加分类会话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="40%"
        @close="addDialogClose"
      >
        <!-- 表单 -->
        <el-form
          :model="addForm"
          :rules="addRules"
          ref="addRuleFormRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父类分级：">
            <el-cascader
              v-model="selectedKeys"
              :options="parCateList"
              :props="optProps"
              clearable
              @change="selectKeysChange"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑窗口 -->
      <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="40%" @close="editDialogClose">
        <!-- 分类名称 -->
        <el-form ref="editFormRef" :model="editForm" :rules="editProps" label-width="100px">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCateName"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品数据列表
      goodsCateList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 表格配置
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt', width: '200px' }
      ],
      // 添加分类会话框
      addCateDialogVisible: false,
      // 添加分类表单
      addForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parCateList: [],
      optProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      // 编辑窗口
      editDialogVisible: false,
      editForm: [],
      editProps: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 获取食品分类数据
    this.getGoodsCate()
  },
  methods: {
    // 获取食品分类数据
    async getGoodsCate() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$Message.error('获取数据失败！')
      }
      this.goodsCateList = res.data.result
      this.total = res.data.total
    },
    // 监听分页size改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsCate()
    },
    // 监听页码改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsCate()
    },
    // 展示添加分类会话框
    showAddCate() {
      this.getParCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类
    async getParCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$Message.error('获取父级分类失败！')
      }
      this.parCateList = res.data
    },
    // 监听级联选择器选中id的变化
    selectKeysChange() {
      if (this.selectedKeys.length > 0) {
        // 设置addForm中的pid为selectedKeys中的最后一个
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 设置addForm中的level
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // 添加分类表单确定操作
    addCate() {
      this.$refs.addRuleFormRef.validate(async valid => {
        if (valid) {
          console.log(this.addForm, 'sad')
          const { data: res } = await this.$http.post(
            'categories',
            this.addForm
          )
          if (res.meta.status !== 201) {
            return this.$Message.error('添加分类失败！')
          }
          this.$Message.success('添加分类成功')
          this.getGoodsCate()
          this.addCateDialogVisible = false
        }
      })
    },
    // 添加分类会话框关闭清空表单
    addDialogClose() {
      this.$refs.addRuleFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    // 显示编辑窗口
    showEditDialog(row) {
      this.editForm = row
      console.log(row)
      this.editDialogVisible = true
    },
    // 关闭编辑窗口
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //  提交编辑信息
    editCateName() {
      this.$refs.editFormRef.validate(async valid => {
        console.log(valid)
        if (valid) {
          console.log(valid)
          const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, {
            cat_name: this.editForm.cat_name
          })
          if (res.meta.status !== 200) {
            return this.$Message.error('编辑信息失败！')
          }
          this.$Message.success('编辑信息成功')
          this.editDialogVisible = false
          this.getGoodsCate()
        } else {
          return false
        }
      })
    },
    // 删除
    async deleteCate(cateId) {
      const resConfirm = await this.$confirm('是否删除该分类？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (resConfirm !== 'confirm') {
        return this.$Message.info('取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + cateId)
      if (res.meta.status !== 200) {
        return this.$Message.warning('删除失败!')
      }
      this.$Message.success('删除成功！')
      this.getGoodsCate()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}

.el-popper {
  .el-cascader-panel {
    display: flex;
    border-radius: 4px;
    font-size: 14px;
    height: 300px !important;
  }
}
</style>
