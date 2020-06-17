<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <!-- 清空时重新获取列表 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <!-- 是否付款 -->
        <el-table-column prop="order_pay" label="是否付款">
          <template v-slot="slotProps">
            <el-tag type="success" v-if="slotProps.row.order_pay === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <!-- 下单时间 -->
        <el-table-column label="下单时间">
          <template v-slot="slotProps">{{slotProps.row.create_time | dateFormat}}</template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" min-width="120">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="editLocationDialogVisible = true"
          ></el-button>
          <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressDialog"></el-button>
        </el-table-column>
      </el-table>

      <!-- 页码区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="+queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editLocationDialogVisible"
      width="50%"
      @close="editLocationDialogClosed"
    >
      <!-- 修改地址表单 -->
      <el-form
        :model="editLocationForm"
        :rules="editLocationFormRules"
        ref="editLocationFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="location">
          <el-cascader
            v-model="editLocationForm.location"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="careful">
          <el-input v-model="editLocationForm.careful"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确认和取消按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editLocationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editLocationDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
      <!-- 时间线组件 -->
      <el-timeline reverse>
        <el-timeline-item
          v-for="(item, index) in progressInfo"
          :key="index"
          :timestamp="item.time"
        >{{item.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      // 订单列表查询信息
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单数据总计，用于分页组件
      total: 0,
      // 订单列表
      orderList: [],

      // 是否显示修改地址对话框
      editLocationDialogVisible: false,
      // 修改地址表单
      editLocationForm: {
        location: [],
        careful: ''
      },
      // 修改地址规则
      editLocationFormRules: {
        location: [
          { required: true, message: '请选择地址', trigger: 'blur' }
        ],
        careful: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 城市数据
      cityData,

      // 是否显示物流进度对话框
      progressDialogVisible: false,
      // 物流信息
      progressInfo: []
    }
  },

  created() {
    this.getOrderList()
  },

  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) this.$message.error('获取订单列表失败')
      scroll(0, 0)
      // 将获取的列表数据赋值给orderList
      this.orderList = res.data.goods
      // 赋值订单条数
      this.total = res.data.total
      // 赋值页码值
      this.queryInfo.pagenum = res.data.pagenum
    },

    // 监听页码大小改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },

    // 监听修改地址对话框的关闭
    editLocationDialogClosed() {
      this.$refs.editLocationFormRef.resetFields()
    },

    // 显示物流进度对话框
    async showProgressDialog() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      this.progressInfo = res.data
      // 显示对话框
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
