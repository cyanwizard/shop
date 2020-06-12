<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示框 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>

      <!-- 搜索商品分类 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 标签页(Tab栏) -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="!this.selectedCateKeys.length"
            @click="addParamDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <!-- 渲染动态参数下的tag标签 -->
                <el-tag
                  v-for="(item, index) in slotProps.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, slotProps.row)"
                >{{item}}</el-tag>
                <el-input
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                  style="width: 89px;"
                ></el-input>
                <el-button v-else size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引行 -->
            <el-table-column type="index"></el-table-column>
            <!-- 参数名称 -->
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <!-- 操作 -->
            <el-table-column label="操作" min-width="70">
              <template v-slot="slotProps">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditParamDialog(slotProps.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamById(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加静态属性按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="!this.selectedCateKeys.length"
            @click="addParamDialogVisible = true"
          >添加参数</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <!-- 渲染静态属性下的tag标签 -->
                <el-tag
                  v-for="(item, index) in slotProps.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, slotProps.row)"
                >{{item}}</el-tag>
                <el-input
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                  style="width: 89px;"
                ></el-input>
                <el-button v-else size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引行 -->
            <el-table-column type="index"></el-table-column>
            <!-- 参数名称 -->
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <!-- 操作 -->
            <el-table-column label="操作" min-width="70">
              <template v-slot="slotProps">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditParamDialog(slotProps.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamById(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框区域 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamDialogVisible"
      @close="addParamDialogClosed"
      width="50%"
    >
      <!-- 添加参数表单 -->
      <el-form
        :model="addParamForm"
        :rules="addParamFormRules"
        ref="addParamFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确认和取消按钮 -->
      <span slot="footer">
        <el-button @click="addParamDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParam">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框区域 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editParamDialogVisible"
      @close="editParamDialogClosed"
      width="50%"
    >
      <!-- 修改参数表单 -->
      <el-form
        :model="editParamForm"
        :rules="editParamFormRules"
        ref="editParamFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确认和取消按钮 -->
      <span slot="footer">
        <el-button @click="editParamDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParam">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 级联选择器
      // 分类集合
      cateList: [],
      // 被选中的分类id
      selectedCateKeys: [],
      // 级联选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },

      // tab栏
      // 被选中的项
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],

      // 添加动态参数、静态属性
      // 是否显示对话框
      addParamDialogVisible: false,
      // 表单数据
      addParamForm: {},
      // 验证规则
      addParamFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },

      // 修改动态参数、静态属性
      // 是否显示对话框
      editParamDialogVisible: false,
      // 表单数据
      editParamForm: {},
      // 验证规则
      editParamFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    // 获取列表
    // 分类列表
    async getCateList() {
      // 发送请求获取数据
      const { data: res } = await this.$http.get('categories')
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      // 成功赋值给cataList
      this.cateList = res.data
    },
    // 参数列表
    async getParamList() {
      // 发送请求获取数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error('请求参数列表失败')
      // 成功改造数据
      res.data.forEach(item => {
        // 将attr_vals属性从字符串改为数组，以便循环渲染tag标签
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制tag标签文本框的显示与影藏
        item.inputVisible = false
        // tag标签文本框中输入的值
        item.inputValue = ''
      })
      // 赋值给对应表格
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },

    // 发送请求
    // 修改参数请求
    async handleEditPrarm(row, callback) {
      // 发送
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        // 判断该值是否为字符串，是就直接赋值，否则为数组，通过join转为字符串再赋值
        attr_vals: row.attr_vals instanceof Array ? row.attr_vals.join(' ') : row.attr_vals
      })
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error(`修改${this.titleText}失败`)
      // 成功提示用户
      this.$message.success(`修改${this.titleText}成功`)
      callback && callback()
    },

    // 级联选择器
    // 级联选择器选中分类时触发
    handleChange() {
      // 选择的是三级分类则请求对应参数列表
      if (this.selectedCateKeys.length === 3) return this.getParamList()
      // 否则不生效(清空选中的分类)
      this.selectedCateKeys = []
      // 并且清空(重置)列表数据
      this.manyTableData = []
      this.onlyTableData = []
    },

    // tab栏
    // 切换时触发
    handleTabClick() {
      // 当选中项不为空且对应tab栏没有数据时就发送请求获取数据
      if (this.selectedCateKeys.length && !this[this.activeName + 'TableData'][0]) return this.getParamList()
    },
    // tag输入框按下回车和失去焦点时触发
    handleInputConfirm(row) {
      // 如果输入框内容不为空则将新标签push到attr_vals中，再保存数据(发送请求)
      if (row.inputValue.trim().length) {
        row.attr_vals.push(row.inputValue.trim())
        this.handleEditPrarm(row)
      }
      // 显示button按钮
      row.inputVisible = false
      // 清空输入框
      row.inputValue = ''
    },
    // 删除tag标签时触发
    handleClose(i, row) {
      // 先从attr_vals中删除标签
      row.attr_vals.splice(i, 1)
      // 再保存(更新)到数据库中
      this.handleEditPrarm(row)
    },
    // 点击添加tag按钮时触发
    showInput(row) {
      // 显示tag输入框
      row.inputVisible = true
      // 元素被重新渲染之后会调用$nextTick中的回调
      this.$nextTick(_ => {
        // 让tag输入框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 添加参数
    // 提交添加
    addParam() {
      // 是否通过验证
      this.$refs.addParamFormRef.validate(async valid => {
        // 未通过取消此次操作
        if (!valid) return
        // 通过发送请求添加参数
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamForm.attr_name,
          attr_sel: this.activeName
        })
        // 失败提示用户
        if (res.meta.status !== 201) return this.$message.error(`添加${this.titleText}失败`)
        // 成功提示用户
        this.$message.success(`添加${this.titleText}成功`)
        // 重新渲染参数列表
        this.getParamList()
        // 影藏对话框
        this.addParamDialogVisible = false
      })
    },
    // 关闭对话框时触发
    addParamDialogClosed() {
      // 重置表单
      this.$refs.addParamFormRef.resetFields()
    },

    // 修改参数
    // 显示对话框
    async showEditParamDialog(attrId) {
      // 发送请求获取对应数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { attr_sel: this.activeName })
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error(`查询${this.titleText}失败`)
      // 成功赋值给editParamForm
      this.editParamForm = res.data
      // 显示对话框
      this.editParamDialogVisible = true
    },
    // 提交修改
    editParam() {
      // 是否通过验证
      this.$refs.editParamFormRef.validate(valid => {
        // 未通过取消此次操作
        if (!valid) return
        // 通过发送请求修改参数并且重新渲染参数列表
        this.handleEditPrarm(this.editParamForm, this.getParamList)
        // 影藏对话框
        this.editParamDialogVisible = false
      })
    },
    // 关闭对话框时触发
    editParamDialogClosed() {
      // 重置表单
      this.$refs.editParamFormRef.resetFields()
    },

    // 删除参数
    async removeParamById(cateId) {
      // 询问用户是否要删除
      const confirmResult = await this.$confirm(`此操作将永久删除该${this.titleText}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 取消提示用户
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除操作')
      // 确定发送请求删除参数
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${cateId}`)
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error(`删除${this.titleText}失败`)
      // 成功提示用户
      this.$message.success(`删除${this.titleText}成功`)
      // 刷新参数列表
      this.getParamList()
    }
  },

  computed: {
    // 简化selectedCateKeys[2]为cateId
    cateId() {
      return this.selectedCateKeys[2]
    },
    // tab栏切换(activeName值改变)时返回对应字符串
    titleText() {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin: 15px 0;
}

.el-tag {
  margin: 5px;
}
</style>
