<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告提示 -->
      <el-alert
        title="注意：只允许给三级分类设置相关参数"
        type="warning"
        show-icon
      >
      </el-alert>
      <!-- 级联选择器 -->
      <el-row class="sel-cate">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tags标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="showAddDialog"
            >添加参数</el-button
          >
          <!-- 表格 -->
          <el-table :data="manyTableData">
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="deleteTag(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加新标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column>
              <template slot-scope="scope">
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
                  @click="deleteAttrName(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="showAddDialog"
            >添加属性</el-button
          >
          <!-- 表格 -->
          <el-table :data="onlyTableData">
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 标签 -->
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加新标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column>
              <template slot-scope="scope">
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
                  @click="deleteAttrName(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加属性对话框 -->
    <el-dialog
      :title="'添加' + dialogTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 表单 -->
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addRuleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑属性对话框 -->
    <el-dialog
      :title="'编辑' + dialogTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 表单 -->
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editRuleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submiteditForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择器选到的参数id
      selectedKeys: [],
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 导航标签
      activeName: 'many',
      // 表格数据
      manyTableData: [],
      onlyTableData: [],
      // 添加对话框
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 编辑对话框
      editDialogVisible: false,
      editForm: {
        attr_name: ''
      },
      editRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      attr_id: {}
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$Message.error('获取商品分类失败！')
      }
      this.cateList = res.data
    },
    // 级联选择器选中值的变化
    handleChange() {
      this.getParamsCate()
    },
    // 选中的导航标签变化
    handleClick() {
      this.getParamsCate()
    },
    async getParamsCate() {
      // 只允许选择三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // if (this.manyTableData.length !== 0 && this.onlyTableData.length !== 0) {
      //   return
      // }
      // 选中三级分类发起请求获取三级分类的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$Message.error('获取分类参数失败！')
      }
      // console.log(res.data)
      // 把展开行所需要的数据改变为数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每条数据添加一个inputVisible和inputValue
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 打开添加对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 关闭对话框重置表单
    addDialogClose() {
      this.addDialogVisible = false
      this.$refs.addRuleForm.resetFields()
    },
    // 提交添加表单
    submitAddForm() {
      this.$refs.addRuleForm.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$Message.error('添加失败！')
        }
        this.$Message.success('添加成功！')
        this.getParamsCate()
        this.addDialogVisible = false
      })
    },
    // 打开编辑对话框
    showEditDialog(row) {
      this.editForm.attr_name = row.attr_name
      this.attr_id = row.attr_id
      this.editDialogVisible = true
    },
    // 关闭编辑对话框重置表单
    editDialogClose() {
      this.$refs.editRuleForm.resetFields()
    },
    // 提交编辑信息
    submiteditForm() {
      this.$refs.editRuleForm.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$Message.error('编辑失败！')
        }
        this.$Message.success('编辑成功！')
        this.getParamsCate()
        this.editDialogVisible = false
      })
    },
    // 删除
    async deleteAttrName(attrId) {
      const result = await this.$confirm('是否删除此条参数？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        return this.$Message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$Message.error('删除失败！')
      }
      this.$Message.success('删除成功！')
      this.getParamsCate()
      this.editDialogVisible = false
    },
    // el-tag添加新标签
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return true
      }
      // 有值的话加进attr_vals中
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false
      // 添加到后台
      this.saveAttrVals(row)
    },
    // 删除el-tag标签
    deleteTag(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$Message.error('添加失败！')
      }
      this.$Message.success('添加成功！')
    },
    // 显示输入框按钮
    showInput(row) {
      row.inputVisible = true
      // 输入框自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    // 按钮是否禁用
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 选中的商品分类id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 对话框title
    dialogTitle() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else if (this.activeName === 'only') {
        return '静态属性'
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.sel-cate {
  margin: 15px 0;
}
.el-tag {
  margin: 0 15px;
}
.input-new-tag {
  width: 120px;
}
</style>
