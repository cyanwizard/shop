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
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 商品分类表格 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text
        border
      >
        <!-- 是否有效列 -->
        <template #isok="slotProps">
          <i class="el-icon-success" v-if="!slotProps.row.cat_deleted" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序列 -->
        <template #order="slotProps">
          <el-tag v-if="slotProps.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="slotProps.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template #opt="slotProps">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(slotProps.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(slotProps.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- Pagination分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框区域 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogclosed"
    >
      <!-- 添加分类表单 -->
      <el-form :model="addCateForm" label-width="80px" ref="addCateRef" :rules="addCateRules">
        <!-- 名称框 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 父级框 -->
        <el-form-item label="父级分类">
          <!-- options用于指定数据源 props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            checkStrictly="true"
            clearable
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 确认和取消按钮 -->
      <span slot="footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框区域 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 编辑分类表单 -->
      <el-form :model="editCateForm" label-width="80px" :rules="editCateRules" ref="editCateRef">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确认和取消按钮 -->
      <span slot="footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
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
      // 获取商品分类数据时的请求参数
      queryInfo: {
        type: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类总数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          minWidth: '185px',
          type: 'template',
          template: 'opt'
        }
      ],

      // 添加分类
      // 添加分类对话框是否显示
      addCateDialogVisible: false,
      // 添加分类数据
      addCateForm: {
        // 父级id
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类等级
        cat_level: 0
      },
      // 验证规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 父级分类列表
      parentCateList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        // 展开次级菜单的方式
        expandTrigger: 'hover',
        // 是否遵守父子节点不互相关联
        checkStrictly: true,
        // 选中值的属性
        value: 'cat_id',
        // 选中值的展示
        label: 'cat_name',
        // 父子嵌套使用的属性
        children: 'children'
      },

      // 编辑分类
      // 分类对话框
      editCateDialogVisible: false,
      // 分类表单(用于绑定数据和发送请求)
      editCateForm: {},
      // 验证规则
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    // 获取商品分类列表数据
    async getCateList() {
      // 发送请求获取数据
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      // 成功赋值给cataList
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },

    // 分页
    // 监听页码大小变化
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getCateList()
    },
    // 监听页码变化
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getCateList()
    },

    // 添加分类
    // 显示对话框
    async showAddCateDialog() {
      // 发送请求获取父级分类列表
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
      // 成功赋值给parentCateList，由它渲染级联选择器
      this.parentCateList = res.data
      // 显示对话框
      this.addCateDialogVisible = true
    },
    // 父级分类变化(选中)时触发
    parentCateChange() {
      // 如果有选择父级分类就将对应的id和级别赋值给addCateForm作为添加分类请求的参数
      // 由于addCateForm初始化时cat_pid和cat_level都是0，所以这里不用考虑未选择父级分类的情况
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      }
    },
    // 提交添加
    addCate() {
      // 验证是否通过所有验证
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        // 发送请求添加分类
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // 失败提示用户
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        // 成功提示用户
        this.$message.success('添加分类成功')
        // 重置分类列表
        this.getCateList()
        // 影藏对话框
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭
    addCateDialogclosed() {
      // 重置表单(cat_name)
      this.$refs.addCateRef.resetFields()
      // 重置表单(cat_pid、cat_level)
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      // 重置级联选择器
      this.selectedKeys = []
    },

    // 编辑分类
    // 显示编辑
    showEditCateDialog(cate) {
      this.editCateForm = cate
      this.editCateDialogVisible = true
    },
    // 提交编辑
    editCate() {
      // 是否符合所有验证规则
      this.$refs.editCateRef.validate(async valid => {
        // 不符合返回
        if (!valid) return
        // 发送请求
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        // 失败提示用户
        if (res.meta.status !== 200) return this.$message.error('编辑分类失败')
        // 成功提示用户
        this.$message.success('编辑分类成功')
        // 跟新列表
        this.getCateList()
        // 隐藏对话框
        this.editCateDialogVisible = false
      })
    },
    // 监听对话框的关闭
    editDialogClosed() {
      this.$refs.editCateRef.resetFields()
    },

    // 删除分类
    async removeCateById(id) {
      // 利用MessageBox弹出确认框
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 判断是否点击了取消
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除操作')
      // 点击确定后发送删除请求
      const { data: res } = await this.$http.delete('categories/' + id)
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      // 成功提示用户
      this.$message.success('删除分类成功')
      // 当前页是最后一页且只有一条数据时则更新请求参数
      const remainder = this.queryInfo.pagesize === 1 ? 1 : this.total % this.queryInfo.pagesize
      const lastPage = Math.ceil(this.total / this.queryInfo.pagesize)
      if (remainder === 1 && lastPage === this.queryInfo.pagenum) this.queryInfo.pagenum -= 1
      // 更新分类列表
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin: 15px 0;
}

.el-cascader {
  width: 100%;
}
</style>
