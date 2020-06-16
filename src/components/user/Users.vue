<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- <el-breadcrumb-item :to="{ path: '/home' }" @click.native="gobackHome">首页</el-breadcrumb-item> -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表展示区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 利用作用域插槽来获取当前行的数据 -->
          <template v-slot="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStateChange(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="175">
          <template v-slot="slotProps">
            <!-- 修改用户按钮 -->
            <el-button
              type="primary"
              class="el-icon-edit"
              size="mini"
              @click="showEditDialog(slotProps.row.id)"
            ></el-button>
            <!-- 删除用户按钮 -->
            <el-button
              type="danger"
              class="el-icon-delete"
              size="mini"
              @click="removeUserById(slotProps.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="设置" placement="top" :enterable="false">
              <el-button
                type="warning"
                class="el-icon-setting"
                size="mini"
                @click="showSetRoledialog(slotProps.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框区域 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 输入表单 -->
      <el-form :model="addForm" :rules="addUserRules" ref="addUserRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确定和取消按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框区域 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 输入表单 -->
      <el-form :model="editForm" :rules="editUserRules" ref="editUserRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确定和取消按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框区域 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
      <!-- 用户信息展示 -->
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          <!-- 下拉选择框 -->
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <!-- 确定和取消按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义验证规则
    const checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) callback()
      callback(new Error('邮箱格式不正确'))
    }
    const checkMobile = (rule, value, callback) => {
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/
      if (regMobile.test(value)) callback()
      callback(new Error('手机格式不正确'))
    }
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
      total: 0,
      // 控制是否弹出添加、修改用户的对话框
      addDialogVisible: false,
      editDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户的表单数据
      editForm: {},
      // 添加用户的验证规则
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户的验证规则
      editUserRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },

      // 分配角色
      // 是否展示分配角色对话框
      setRoleDialogVisible: false,
      // 角色列表
      roleList: [],
      // 选中的角色(值)
      selectedRoleId: '',
      // 需要被分配角色的用户信息
      userInfo: {}
    }
  },
  methods: {
    // 获取用户列表
    async getUserList(callback) {
      const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('请求用户数据失败')
      // 返回顶部(用于更改页码大小时使用)
      callback instanceof Function && callback()
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
      this.getUserList(function () { scroll(0, 0) })
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听添加用户对话框的关闭
    addDialogClosed() {
      this.$refs.addUserRef.resetFields()
    },
    // 监听确认添加用户
    addUser() {
      // 验证是否所有项都符合规则 当且仅当所有项符合规则时valid才会返回true
      this.$refs.addUserRef.validate(async valid => {
        // 只要有一项不符合就中止此添加操作
        if (!valid) return
        // 添加用户
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 关闭对话框
        this.addDialogVisible = false
        // 更新用户列表
        this.getUserList()
      })
    },
    // 监听修改用户按钮
    async showEditDialog(id) {
      // 展示修改用户对话框
      this.editDialogVisible = true
      // 根据id获取当前用户信息
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
      // 将用户信息展示在表单中
      this.editForm = res.data
    },
    // 监听修改用户对话框的关闭
    editDialogClosed() {
      this.$refs.editUserRef.resetFields()
    },
    // 监听确认修改用户
    editUser() {
      // 验证是否所有项都符合规则 当且仅当所有项符合规则时valid才会返回true
      this.$refs.editUserRef.validate(async valid => {
        // 只要有一项不符合就中止此修改操作
        if (!valid) return
        // 修改用户
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户失败')
        }
        this.$message.success('修改用户成功')
        // 关闭对话框
        this.editDialogVisible = false
        // 更新用户列表
        this.getUserList()
      })
    },
    // 根据id删除对应的用户信息
    async removeUserById(id) {
      // 利用MessageBox组件来提示是否要删除用户 MessageBox.confirm是promise对象
      // 用await处理后如果是确认按钮返回字符串confirm、取消按钮则会报错
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // 利用.catch来捕获异常使程序继续执行，此时会返回字符串cancel
      }).catch(err => err)
      // 如果是取消按钮则提示用户
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 确认按钮则发送请求删除该用户
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      // 删除成功后更新用户列表
      // 当前页是最后一页且只有一条数据时则更新请求参数
      const remainder = this.queryInfo.pagesize === 1 ? 1 : this.total % this.queryInfo.pagesize
      const lastPage = Math.ceil(this.total / this.queryInfo.pagesize)
      if (remainder === 1 && lastPage === this.queryInfo.pagenum) this.queryInfo.pagenum -= 1
      // 更新列表
      this.getUserList()
    },

    // 给用户分配角色
    // 展示用户信息
    async showSetRoledialog(userInfo) {
      // 将当前用户信息保存到data中，以便其他地方使用
      this.userInfo = userInfo
      // 发送请求获取角色列表
      const { data: res } = await this.$http.get('roles')
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      // 成功将数据赋值给roleList
      this.roleList = res.data
      // 显示对话框
      this.setRoleDialogVisible = true
    },
    // 分配角色
    async setRole() {
      // 判断用户有无选择角色
      if (!this.selectedRoleId) return this.$message.info('请选择要分配的角色')
      // 发送请求分配角色
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      // 失败提示用户
      if (res.meta.status !== 200) return this.$message.error('分配角色失败')
      // 成功提示用户
      this.$message.success('分配角色成功')
      // 隐藏对话框
      this.setRoleDialogVisible = false
      // 更新用户列表
      this.getUserList()
    }

    // // 监听返回首页按钮
    // , gobackHome() {
    //   // 清空sessionStorage中的defaultActive和activePath
    //   window.sessionStorage.removeItem('defaultActive')
    //   window.sessionStorage.removeItem('activePath')
    //   // 刷新页面以实现菜单栏选中状态的复原(此方案响应较慢，会影响用户体验)
    //   // this.$router.go(0)
    // }
  },
  created() {
    // 页面加载时获取用户列表
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
</style>
