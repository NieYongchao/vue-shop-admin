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
      <!-- 消息提示 -->
      <el-alert title="消息提示的文案" type="info" center show-icon> </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeStep - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧导航标签 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeStep"
          :tab-position="'left'"
          :before-leave="beforeLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品数分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="selectProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary" disabled>点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
              :options="editorOption"
            />
            <!-- 按钮 -->
            <el-button type="primary" class="addBtn" @click="addGoods"
              >添加</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览窗口 -->
      <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
        <img :src="previewUrl" alt="" style="width: 100%" />
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 当前激活的步骤条
      activeStep: '0',
      // 添加商品的表单对象
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类数据
      cateList: [],
      // 级联选择器配置对象
      selectProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 图片上传地址
      uploadURL: 'https://rambuild.cn/api/private/v1/upload',
      // 图片上传请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览地址
      previewUrl: '',
      picDialogVisible: false,
      // 富文本编辑器配置对象
      editorOption: {}
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$Message.error('获取商品分类失败!')
      }
      this.cateList = res.data
    },
    // 级联选择器变化
    handleChange() {
      // 只允许选择三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      // console.log(this.addForm.goods_cat)
    },
    // 标签页切换时的钩子函数
    beforeLeave(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length !== 3 && activeName !== '0') {
        this.$Message.error('请先选择商品分类！')
        return false
      }
    },
    // 标签页点击事件
    async tabClicked() {
      // 切换到商品参数页时发起请求
      if (this.activeStep === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$Message.error('获取动态参数列表失败！')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
      } else if (this.activeStep === '2') {
        // 切换到商品属性页时发起请求
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$Message.error('获取静态属性列表失败！')
        }
        this.onlyTableData = res.data
        // console.log(this.onlyTableData)
      }
    },
    // 图片预览
    handlePreview(file) {
      this.previewUrl = file.response.data.url
      this.picDialogVisible = true
    },
    // 移除图片
    handleRemove(file) {
      // 1.找到将要移除的图片在pics中的索引
      const path = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(item => item.pic === path)
      // 2. 删除
      this.addForm.pics.splice(index, 1)
    },
    // 图片上传成功的回调
    handleSuccess(res) {
      const picInfo = { pic: res.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$Message.error('请填写必要的表单项！')
        }
        // 处理数据
        const newForm = JSON.parse(JSON.stringify(this.addForm))
        newForm.goods_cat = newForm.goods_cat.join(',')
        // console.log(newForm)
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const attrInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          newForm.attrs.push(attrInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const attrInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          newForm.attrs.push(attrInfo)
        })
        // newForm.attrs = this.addForm.attrs
        // console.log(this.addForm, '===')
        // console.log(newForm, '---')
        const { data: res } = await this.$http.post('goods', newForm)
        // console.log(res)
        if (res.meta.status === 400) {
          return this.$Message.error('商品已存在！')
        } else if (res.meta.status === 201) {
          this.$router.push('/goods')
        } else {
          return this.$Message.error('添加商品失败！')
        }
      })
    }
  },
  computed: {
    // 商品分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.addBtn {
  margin-top: 15px;
}
</style>
