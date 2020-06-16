<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="toAddGoodsPage">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 列表表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="100"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="200">
          <template v-slot="slotProps">
            <!-- 使用全局过滤器格式化日期 -->
            {{slotProps.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="toEditGoodsPage(slotProps.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodsById(slotProps.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
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
      // 商品列表
      // 查询信息
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品总数
      total: 0,
      // 列表数据
      goodsList: [],

      // 编辑商品
      editGoodDialogVisible: false
    }
  },

  created() {
    this.getGoodsList()
  },

  methods: {
    // 获取商品列表
    async getGoodsList(callback) {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      // 返回顶部(用于更改页码大小时使用)
      callback instanceof Function && callback()
      this.goodsList = res.data.goods
      this.total = res.data.total
    },

    // pagination分页
    // 每页条数变化触发
    handleSizeChange(newPagesize) {
      this.queryInfo.pagesize = newPagesize
      // 更新列表且定位到页面顶部
      this.getGoodsList(function () { scroll(0, 0) })
    },
    // 页码变化触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    // 删除商品
    async removeGoodsById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败')
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },

    // 添加商品
    toAddGoodsPage() {
      this.$router.push('/goods/add')
    },

    // 修改(编辑)商品
    toEditGoodsPage(id) {
      this.$router.push({ path: '/goods/edit', query: { id } })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
