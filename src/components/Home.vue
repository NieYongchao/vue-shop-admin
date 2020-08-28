<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/logo1.png" alt="" />
        <span>东风后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggleMenu" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409bff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="menu.id + ''"
            v-for="menu in menuList"
            :key="menu.id"
          >
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[menu.id]"></i>
              <!-- 文本 -->
              <span>{{ menu.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subMenu.path"
              v-for="subMenu in menu.children"
              :key="subMenu.id"
              @click="saveActive"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-location"></i>
                <!-- 文本 -->
                <span>{{ subMenu.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        /* 一级菜单图标 */
        125: 'iconfont icon-yonghuguanli',
        103: 'iconfont icon-permission',
        101: 'iconfont icon-shangpinguanli',
        102: 'iconfont icon-logooo_huabanfuben',
        145: 'iconfont icon-shuju'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    // nav高亮
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      // 销毁token
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$Message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 菜单折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveActive () {
      window.sessionStorage.setItem('activePath', this.$route.path)
      this.activePath = this.$route.path
    }
  }
}
</script>

<style lang="less" scpoed>
@import url('//at.alicdn.com/t/font_2029874_fvybloprp3s.css');
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      box-shadow: 0 0 4px 2px #ccc;
    }
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  transition: width .2s;
  // 折叠菜单
  .toggleMenu {
    background-color: rgb(44, 41, 41);
    color: #fff;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    cursor: pointer;
  }
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}
</style>
