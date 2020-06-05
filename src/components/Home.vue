<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏部分 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 收缩按钮 -->
        <div @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#369"
          text-color="#fff"
          active-text-color="#39c"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="index + ''" v-for="(item, index) in menuList" :key="index">
            <template slot="title">
              <i class="iconfont" :class="menuIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="(subItem, target) in item.children"
              :key="target"
              @click="menuActive(index, target, '/' + subItem.path)"
            >
              <template slot="title">
                <!-- 动态绑定style属性用js提供的样式改变当前项的icon图标颜色 -->
                <i class="el-icon-menu" :style="menuList[index].children[target].style"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体部分 -->
      <el-main>
        <!-- 二级(嵌套)路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 菜单栏数据(由created生命周期钩子函数通过axios请求动态获取)
      menuList: [],
      // 用于控制菜单栏折叠后的宽度
      isCollapse: false,
      // 用于为每个动态生成的菜单添加icon图标
      menuIcon: {
        125: 'icon-user',
        103: 'icon-tijikongjian',
        101: 'icon-shangpin',
        102: 'icon-danju',
        145: 'icon-baobiao'
      },
      // 用于将当前项的index属性赋值给default-active属性
      activePath: ''
    }
  },
  methods: {
    // 用于退出登录
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 用于发送axios请求向后台获取菜单栏数据
    async getMenuList(callback) {
      const { data: res } = await this.$http.get('menus')
      // 获取数据失败提示用户
      if (res.meta.status !== 200) return this.$message.error('请求失败')
      this.menuList = res.data
      // 利用回调函数初始化icon图标样式
      callback()
    },
    // 用于控制菜单栏折叠后的宽度
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 用于(点击时)改变当前项的icon图标样式 和选中状态
    menuActive(index, target, path) {
      // icon图标
      // 先初始化所有
      for (let i = 0; i < this.menuList.length; i++) {
        for (let j = 0; j < this.menuList[i].length; j++) {
          this.menuList[i].children[j].style = { color: '#000' }
        }
      }
      // 再给当前项添加样式
      this.menuList[index].children[target].style = { color: '#39c' }
      // 再将当前项的下标存在sessionStorage中用于页面刷新时初始化icon图标样式
      window.sessionStorage.setItem('defaultActive', [index, target])
      // 选中状态
      // 如果path形参存在表示是点击操作，直接赋值给activePath 如果path形参不存在则表示是刷新操作(created钩子函数的调用)，从sessionStorage取值赋给defaultActive
      this.activePath = path || window.sessionStorage.getItem('activePath')
      // 如果是点击操作就将当前项的path存进sessionStorage中
      path && window.sessionStorage.setItem('activePath', path)
    }
  },
  // created生命周期钩子函数用于在实例创建完成后，但还未挂载到页面时向后台请求数据
  created() {
    // this.activePath = window.sessionStorage.getItem('activePath')  初始化操作在menuActive方法中完成
    // 获取menuList数据并且初始化icon图标样式和选中状态 由于icon图标样式存储在menuList数据中，而获取menuList数据用的是异步函数属于异步操作所以采用回调函数方式初始化icon图标样式
    this.getMenuList(() => {
      let param = window.sessionStorage.getItem('defaultActive')
      // 判断是刷新操作还是登录操作
      if (param) {
        param = param.split(',')
        this.menuActive(param[0], param[1])
      }
    })
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  display: flex;
  background-color: #036;
  justify-content: space-between;
  align-items: center;

  div {
    display: flex;
    color: #fff;
    font-size: 20px;
    align-items: center;
    img {
      width: 56px;
    }
  }
  .el-button {
    background-color: #39c;
    border-color: #39c;
  }
}

.el-aside {
  background-color: #369;
  div {
    background-color: #39c;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

  .el-menu {
    border-right-style: none;
    .iconfont {
      margin-right: 10px;
    }
    i {
      color: #fff;
    }
  }
}

.el-main {
  background-color: #eee;
}
</style>
