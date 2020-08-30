<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 用户列表 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="userList" style="width: 100%" stripe border>
        <el-table-column type="index" label="#">
          <template slot-scope="scope">
            <span>{{(queryInfo.pagenum-1)*queryInfo.pagesize+scope.$index+1}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#409EFF"
              inactive-color="#ff4949"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUserById(scope.row.id)"
            ></el-button>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加用户对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="40%"
        @close="addDialogClosed"
      >
        <!-- 添加用户对话框的表单 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="80px"
        >
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 取消与确定按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="40%"
        @close="editDialogClosed"
      >
        <el-form
          :model="editForm"
          :rules="addFormRules"
          ref="editFormRef"
          label-width="80px"
        >
          <el-form-item label="用户名称">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配角色会话窗口 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoledialogVisible"
        width="40%"
        @close="setRoleClose"
      >
        <div>
          <p>{{ userinfo.username }}</p>
          <p>{{ userinfo.role_name }}</p>
          <el-select v-model="selectedId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoledialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo"
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
    // 校验邮箱是否合法
    const checkEamil = (rule, value, cb) => {
      // 定义校验规则
      const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (reg.test(value)) {
        cb()
      }
      cb(new Error('请输入合法邮箱!'))
    }
    // 校验手机号
    const checkMobile = (rule, value, cb) => {
      // 定义校验规则
      const reg = /^(13[0-9]|14[5|7]|15[0-9]|18[0-9])\d{8}$/
      if (reg.test(value)) {
        cb()
      }
      cb(new Error('请输入正确的手机号!'))
    }

    return {
      // 用户列表
      userList: [],
      rowIndex: 1,
      // 获取用户数据的请求体
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 数据总数
      total: 0,
      // 添加按钮对话框显示与隐藏
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户姓名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEamil, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改按钮对话框显示与隐藏
      editDialogVisible: false,
      editForm: {},
      // 分配角色
      setRoledialogVisible: false,
      userinfo: {},
      rolesList: [],
      // 分配的角色id
      selectedId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    getUserList() {
      this.$http.get('users', { params: this.queryInfo }).then(result => {
        const { data: res } = result
        if (res.meta.status !== 200) {
          return this.$Message.error('获取用户列表失败')
        }
        this.userList = res.data.users
        console.log()
        this.total = res.data.total
      })
    },
    //  监听每页显示多少条数据
    handleSizeChange(pageSize) {
      this.queryInfo.pagesize = pageSize
      this.getUserList()
    },
    // 当前页码变化
    handleCurrentChange(currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getUserList()
    },
    // 监听用户状态改变
    async userStateChange(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$Message.error('更新用户状态失败!')
      }
      this.$Message.success('更新用户状态成功!')
    },
    // 关闭对话框清空对话框数据
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$Message.error('添加用户失败!')
          }
          this.$Message.success('添加用户成功!')
          // 关闭对话框
          this.addDialogVisible = false
          // 重新请求数据
          this.getUserList()
        }
      })
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$Message.error('获取用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭对话框重置
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 更新用户信息
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'users/' + this.editForm.id,
            {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            }
          )
          if (res.meta.status !== 200) {
            this.$Message.error('更新用户信息失败!')
          }
          // 关闭对话框
          this.editDialogVisible = false
          // 重新请求数据
          this.getUserList()
          this.$Message.success('更新用户信息成功!')
        }
      })
    },
    // 删除用户
    async deleteUserById(id) {
      const res = await this.$confirm('确定删除该用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (res !== 'confirm') {
        return this.$Message.info('已取消删除!')
      }

      const { data: result } = await this.$http.delete('users/' + id)
      console.log(result)
      if (result.meta.status !== 200) {
        return this.$Message.error('删除失败!')
      }
      this.$Message.success('已删除!')
      // 重新获取列表
      this.getUserList()
    },
    // 分配角色会话窗口显示隐藏
    async showSetRole(userinfo) {
      this.userinfo = userinfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$Message.error('获取角色列表数据失败!')
      }
      this.rolesList = res.data
      this.setRoledialogVisible = true
    },
    // 更新分配角色信息
    async saveRoleInfo() {
      if (!this.selectedId) return this.$Message.error('请选择要分配的角色!')
      const { data: res } = await this.$http.put(`users/${this.userinfo.id}/role`, { rid: this.selectedId })
      if (res.meta.status !== 200) return this.$Message.error('分配角色失败!')
      this.getUserList()
      this.setRoledialogVisible = false
      this.$Message.success('分配角色成功!')
    },
    // 监听分配角色窗口的关闭事件
    setRoleClose() {
      this.userinfo = {}
      this.selectedId = ''
    }
  }
}
</script>

<style></style>
