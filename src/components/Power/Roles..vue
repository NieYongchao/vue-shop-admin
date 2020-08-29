<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 角色列表区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" stripe border>
        <el-table-column type="expand">
          <!-- 下拉权限列表 -->
          <template slot-scope="scope">
            <el-row
              :class="['bd-bottom', index1 === 0 ? 'bd-top' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeById(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级,三级权限 -->
              <el-col :span="19">
                <!-- 渲染二三级权限 -->
                <el-row
                  :class="[index2 === 0 ? '' : 'bd-top', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="400px">
          <template slot-scope="prop">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="showEditRole(prop.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="deleteRole(prop.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              size="small"
              icon="el-icon-setting"
              @click="showSetDialog(prop.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色窗口 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="40%"
        @close="addDialogClosed"
      >
        <!-- 添加角色对话框的表单 -->
        <el-form
          :model="rolesForm"
          :rules="rolesFormRules"
          ref="addRolesFormRef"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="rolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="rolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 取消与确定按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑角色窗口 -->
      <el-dialog
        title="添加用户"
        :visible.sync="editDialogVisible"
        width="40%"
        @close="editDialogClosed"
      >
        <!-- 编辑角色对话框的表单 -->
        <el-form
          :model="editForm"
          :rules="rolesFormRules"
          ref="editRolesFormRef"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 取消与确定按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配权限对话窗口 -->
      <el-dialog title="分配权限" :visible.sync="setDialogVisible" width="50%" @close="setClose">
        <!-- 树形控件 -->
        <el-tree
          :data="rightsList"
          :props="rightsProps"
          ref="treeRightsRef"
          node-key="id"
          show-checkbox
          default-expand-all
          :default-checked-keys="defKeys"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRights"
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
      // 角色列表
      rolesList: [],
      // 添加角色对话框
      rolesForm: {
        roleName: '',
        roleDesc: ''
      },
      rolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      addDialogVisible: false,
      // 编辑角色
      editForm: {},
      editDialogVisible: false,
      // 分配权限
      setDialogVisible: false,
      rightsList: [],
      rightsProps: {
        label: 'authName',
        children: 'children'
      },
      roleId: '',
      // 分配权限对话窗口默认的权限, 只保存三级权限
      defKeys: []
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$Message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    // 关闭角色对话框重置表单
    addDialogClosed() {
      this.$refs.addRolesFormRef.resetFields()
    },
    // 添加角色
    addRole() {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('roles', this.rolesForm)
          if (res.meta.status !== 201) {
            return this.$Message.error('添加角色失败!')
          }
          this.$Message.success('添加角色成功!')
          // 重新请求列表数据
          this.getRolesList()
          this.addDialogVisible = false
        }
      })
    },
    // 删除角色
    async deleteRole(id) {
      const result = await this.$confirm('确定删除该角色吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        return this.$Message.info('取消删除!')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$Message.error('删除角色失败!')
      this.$Message.success('删除角色成功!')
      this.getRolesList()
    },
    // 关闭编辑角色对话框
    editDialogClosed() {
      this.$refs.editRolesFormRef.resetFields()
    },
    // 打开编辑角色对话框
    async showEditRole(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$Message.error('获取角色数据失败!')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 提交编辑角色信息
    editRole() {
      this.$refs.editRolesFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'roles/' + this.editForm.roleId,
            {
              roleName: this.editForm.roleName,
              roleDesc: this.roleDesc
            }
          )
          if (res.meta.status !== 200) {
            return this.$Message.error('编辑角色数据失败!')
          }
          console.log(res)
          this.$Message.success('修改角色数据成功!')
          this.editDialogVisible = false
        }
      })
    },
    // 删除权限
    async removeById(role, rightId) {
      const result = await this.$confirm('确认删除该权限吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        return this.$Message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$Message.error('删除失败！')
      }
      // 直接把返回值赋值给当前权限列表，不必刷新页面重新请求
      role.children = res.data
      this.$Message.success('已成功删除')
    },
    // 显示分配权限对话窗口
    async showSetDialog(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$Message.error('获取权限数据失败！')
      }
      this.rightsList = res.data
      this.roleId = role.id
      // 获取展示默认显示的权限
      this.getLeafKeys(role, this.defKeys)
      console.log(this.defKeys)
      this.setDialogVisible = true
    },
    // 递归保存对应角色的三级权限
    getLeafKeys(role, arr) {
      if (!role.children) {
        return arr.push(role.id)
      }

      role.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭分配权限对话窗口后清空 defkeys
    setClose() {
      this.defKeys = []
      this.roleId = ''
    },
    // 分配权限
    async setRights() {
      const rights = [
        ...this.$refs.treeRightsRef.getCheckedKeys(),
        ...this.$refs.treeRightsRef.getHalfCheckedKeys()
      ]
      const idStr = rights.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$Message.error('权限分配失败!')
      }
      this.$Message.success('权限分配成功!')
      this.getRolesList()
      this.setDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bd-top {
  border-top: 1px solid #eee;
}

.bd-bottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
