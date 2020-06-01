<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表展示区域 -->
      <el-table :data="userList" border style="width: 100%" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 利用作用域插槽来获取当前行的数据 -->
          <template v-slot="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStateChange(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="175px">
          <template v-slot>
            <el-button type="primary" class="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" class="el-icon-delete" size="mini"></el-button>
            <el-tooltip class="item" effect="dark" content="设置" placement="top" :enterable="false">
              <el-button type="warning" class="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagination分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取用户列表的请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表
      userList: [],
      // 用户总计
      total: 0
    }
  },
  methods: {
    //   获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('请求用户数据失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听搜索框
    searchUser() {
      this.getUserList()
    },
    // 监听Switch开关状态的改变
    userStateChange(userInfo) {
      this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    }
  },
  created() {
    // 页面加载时获取用户列表
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
</style>
