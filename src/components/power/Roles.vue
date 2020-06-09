<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表表格 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="slotProps">
            <el-row
              :class="[index1 !== 0 && 'border-top']"
              :key="index1"
              v-for="(item1, index1) in slotProps.row.children"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(slotProps.row, item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 !== 0 && 'border-top']"
                  :key="index2"
                  v-for="(item2, index2) in item1.children"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(slotProps.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      :key="index3"
                      v-for="(item3, index3) in item2.children"
                      type="warning"
                      @close="removeRightById(slotProps.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 编号列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(slotProps.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-edit"
              size="mini"
              @click="removeRoleById(slotProps.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-edit"
              size="mini"
              @click="showSetRightDialog(slotProps.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框区域 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogclosed">
      <!-- 添加角色表单 -->
      <el-form :model="addRoleForm" label-width="80px" :rules="addRoleRules" ref="addRoleRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确认和取消按钮 -->
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框区域 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 修改角色表单 -->
      <el-form :model="editRoleForm" label-width="80px" :rules="editRoleRules" ref="editRoleRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确认和取消按钮 -->
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框区域 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 分配权限树形控件 -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        default-expand-all
        show-checkbox
        node-key="id"
        :default-checked-keys="defaultKyes"
        ref="treeRef"
      ></el-tree>
      <!-- 确认和取消按钮 -->
      <span slot="footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      roleList: [],

      // 添加角色
      // 是否弹出添加角色对话框
      addDialogVisible: false,
      // 添加角色表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 验证规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '角色名称的长度在2~8个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { max: 10, message: '角色描述的最大长度为10个字符', trigger: 'blur' }
        ]
      },

      // 修改角色
      // 是否弹出修改角色对话框
      editDialogVisible: false,
      // 修改角色表单
      editRoleForm: {},
      // 验证规则
      editRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '角色名称的长度在3~8个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { max: 10, message: '角色描述的最大长度为10个字符', trigger: 'blur' }
        ]
      },

      // 分配权限
      // 是否弹出分配权限对话框
      setRightDialogVisible: false,
      // 权限列表(树形)
      rightList: [],
      // 分配权限树形控件的属性类型
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的权限(该角色已有的权限)
      defaultKyes: [],
      // 保存被操作角色的id
      roleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      // 发送请求获取列表
      const { data: res } = await this.$http.get('roles')
      // 获取失败则提示用户
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      // 赋值给roleList(渲染列表)
      this.roleList = res.data
    },

    // 添加角色
    addRole() {
      // 验证是否所有项都符合规则
      this.$refs.addRoleRef.validate(async valid => {
        // 不符合就中止此添加操作
        if (!valid) return
        // 符合就添加用户
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        // 添加失败提示用户
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        // 添加成功提示用户
        this.$message.success('添加角色成功')
        // 关闭对话框
        this.addDialogVisible = false
        // 更新角色列表
        this.negro()
      })
    },
    // 关闭添加角色对话框时触发
    addDialogclosed() {
      // 重置表单内容和验证信息
      this.$refs.addRoleRef.resetFields()
    },

    // 修改角色
    // 显示修改角色对话框
    async showEditDialog(id) {
      // 请求当前项的角色信息
      const { data: res } = await this.$http.get('roles/' + id)
      // 请示失败就提示用户
      if (res.meta.status !== 200) return this.$message.error('查询角色信息失败')
      // 成功就初始化表单数据
      this.editRoleForm = res.data
      // 显示对话框
      this.editDialogVisible = true
    },
    // 修改角色
    editRole() {
      // 验证是否所有项都符合规则
      this.$refs.editRoleRef.validate(async valid => {
        // 不符合就中止此修改操作
        if (!valid) return
        // 符合就修改用户
        const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, { roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc })
        // 修改失败提示用户
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        // 修改成功提示用户
        this.$message.success('修改角色成功')
        // 关闭对话框
        this.editDialogVisible = false
        // 更新角色列表
        this.getRoleList()
      })
    },
    // 关闭修改角色对话框时触发
    editDialogClosed() {
      // 重置表单内容和验证信息
      this.$refs.editRoleRef.resetFields()
    },

    // 删除角色
    async removeRoleById(id) {
      // 利用element-iu的Message Box弹框模块询问用户是否要删除 确认返回confirm字符串
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // 取消会报错，但可以用promise的catchAPI来捕获，返回的错误结果为cancel字符串
      }).catch(err => err)
      // 取消则提示用户已取消
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 确认则发送请求删除角色
      const { data: res } = await this.$http.delete('roles/' + id)
      // 删除失败则提示用户
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      // 删除成功则提示用户
      this.$message.success('删除角色成功')
      // 刷新角色列表
      this.getRoleList()
    },

    // 分配权限
    // 显示分配权限对话框
    async showSetRightDialog(role) {
      // 将该角色的id保存到data数据中，发送角色授权请求时会用到
      this.roleId = role.id
      // 清空上次的id
      this.defaultKyes = []
      // 发送请求获取所有权限(树形)
      const { data: res } = await this.$http.get('rights/tree')
      // 失败就提示用户
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      // 成功就将权限树赋值给data数据
      this.rightList = res.data
      // 利用递归向defaultKeys中push该角色的已有权限
      function getKyes(item, keys) {
        if (!item.children) {
          return keys.push(item.id)
        } else {
          item.children.forEach(item => getKyes(item, keys))
        }
      }
      // 开启递归函数
      getKyes(role, this.defaultKyes)
      // 显示对话框
      this.setRightDialogVisible = true
    },
    // 分配权限
    async setRight() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRoleList()
      this.setRightDialogVisible = false
    },

    // 在展开行内删除权限
    async removeRightById(role, rightId) {
      // 利用element-iu的Message Box弹框模块询问用户是否要删除 确认返回confirm字符串
      const confirmResult = await this.$confirm('此操作将删除此角色的该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // 取消会报错，但可以用promise的catchAPI来捕获，返回的错误结果为cancel字符串
      }).catch(err => err)
      // 取消则提示用户已取消
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 确认则发送请求删除权限(返回值是该角色更新后的权限列表)
      // 这里后台处理不妥，当子权限全部删除后应该同时删除父权限
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      // 成功提示用户
      this.$message.success('删除权限成功')
      // 更新(当前角色)权限列表
      role.children = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.border-top {
  border-top: 1px solid #eee;
}

.el-table {
  .el-tag {
    margin: 7px;
  }
}

.el-row {
  display: flex;
  align-items: center;
}
</style>
