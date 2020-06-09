<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }" @click.native="gobackHome">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 权限列表表格 -->
      <el-table :data="rightsList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <!-- 通过作用域插槽展示权限等级 -->
          <template v-slot="slotProps">
            <!-- 通过if指令展示相应的等级 -->
            <el-tag v-if="slotProps.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="slotProps.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 权限列表
      rightsList: []
    }
  },
  created() {
    // 页面加载时获取列表
    this.getRightsList()
  },
  methods: {
    // 获取权限列表
    async getRightsList() {
      // 发送请求
      const { data: res } = await this.$http.get('rights/list')

      // 请求失败则提示获取失败
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')

      this.rightsList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
</style>
