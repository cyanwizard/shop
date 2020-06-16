<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告信息 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条 -->
      <el-steps :active="+activeIndex" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Tab栏 + form表单 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 基本信息栏 -->
          <el-tab-pane label="基本信息" name="0">
            <!-- 商品名称 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name" placeholder="请输入内容"></el-input>
            </el-form-item>
            <!-- 商品价格 -->
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" placeholder="请输入内容"></el-input>
            </el-form-item>
            <!-- 商品重量 -->
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" placeholder="请输入内容"></el-input>
            </el-form-item>
            <!-- 商品数量 -->
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" placeholder="请输入内容"></el-input>
            </el-form-item>
            <!-- 商品分类(级联选择框) -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 动态参数栏 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="(item, index) in manyTabData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="val"
                  v-for="(val, i) in checkboxGroup[index].attr_vals"
                  :key="i"
                  border
                  size="small"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 静态属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片组件 -->
            <el-upload
              :action="uploadURL"
              :on-preview="picturePreview"
              :on-remove="pictureRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="pictureSuccess"
            >
              <!-- 上传图片按钮 -->
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品详情介绍 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 代替富文本编辑器 -->
            <el-input
              type="textarea"
              :rows="6"
              placeholder="请输入内容"
              v-model="addGoodsForm.goods_introduce"
            ></el-input>
            <el-button type="primary" class="add-button" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // tab栏和步骤条的选中项(联动)
      activeIndex: '0',

      // 添加商品表单
      addGoodsForm: {
        // 商品名称
        goods_name: '',
        // 价格
        goods_price: '',
        // 重量
        goods_weight: '',
        // 数量
        goods_number: '',
        // 分类列表
        goods_cat: [],
        // 上传的图片临时路径
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 参数和属性
        attrs: []
      },
      // 表单验证规则
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },

      // 商品分类列表
      cateList: [],
      // 级联选择器规则
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },

      // 动态参数
      manyTabData: {},
      // 静态属性
      onlyTabData: {},
      // 用于复选框组的渲染
      checkboxGroup: [],

      // 上传图片的地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 为上传图片配置请求头以设置token
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 是否展示预览图片对话框
      previewDialogVisible: false,
      // 预览的图片地址
      previewPath: ''
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    },
    // 获取分类动态参数(静态属性)
    async getParams(dataType) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: dataType } })
      if (res.meta.status !== 200) return this.$message.error('获取分类参数失败')
      // 如果请求的是动态参数就将attr_vals从字符串转为数组，方便循环展示
      if (dataType === 'many') {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.split(' ')
        })
        // 先深拷贝一个数组用于渲染复选框组
        this.deepClone(this.checkboxGroup, res.data)
        // 默认为未选中(清空数组)
        res.data.forEach(item => { item.attr_vals = [] })
        // 再将动态参数赋值给manyTabData
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
    },

    // 商品分类级联选择框改变时
    handleChange() {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },

    // tab栏切换之前触发
    beforeTabLeave(activeTab, oldActiveTab) {
      if (oldActiveTab === '0' && !this.cateId) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // tab栏切换时触发
    tabClicked() {
      if (this.activeIndex === '1') {
        // 获取动态参数
        this.getParams('many')
      } else if (this.activeIndex === '2') {
        // 获取静态属性
        this.getParams('only')
      }
    },

    // 预览图片时触发
    picturePreview(file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 移除图片时触发
    pictureRemove(file) {
      // 获取图片的临时路径
      const filePath = file.response.data.tmp_path
      // 从addGoodsForm.pics中删除该临时路径
      this.addGoodsForm.pics = this.addGoodsForm.pics.filter(item => item.pic !== filePath)
    },
    // 上传图片成功时触发
    pictureSuccess(res) {
      // 设置为所需格式
      const picInfo = { pic: res.data.tmp_path }
      // push到请求参数中
      this.addGoodsForm.pics.push(picInfo)
    },

    // 添加商品
    addGoods() {
      // 添加前先对请求参数调整格式(goods_cat和attrs)
      // 由于goods_cat与template中的级联选择框绑定了，所以格式化操作必须复制一份数据进行操作
      const newRequestParam = {}
      this.deepClone(newRequestParam, this.addGoodsForm)
      // 格式化goods_cat
      newRequestParam.goods_cat = newRequestParam.goods_cat.join(',')
      // 格式化attrs
      // 动态参数
      this.manyTabData.forEach(item => {
        const newAttr = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        newRequestParam.attrs.push(newAttr)
      })
      // 静态属性
      this.onlyTabData.forEach(item => {
        const newAttr = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        newRequestParam.attrs.push(newAttr)
      })
      // 验证是否符合验证规则
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) return
        // 发送请求
        const { data: res } = await this.$http.post('goods', newRequestParam)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    },

    // 深拷贝
    deepClone(newObj, oldObj) {
      for (const k in oldObj) {
        const item = oldObj[k]
        if (item instanceof Array) {
          newObj[k] = []
          this.deepClone(newObj[k], item)
        } else if (item instanceof Object) {
          newObj[k] = {}
          this.deepClone(newObj[k], item)
        } else {
          newObj[k] = item
        }
      }
    }
  },

  computed: {
    // 将addGoodsForm.goods_cat[2]简化成cateId，用于请求参数
    cateId() {
      return this.addGoodsForm.goods_cat[2]
    }
  }
}
</script>

<style lang="less" scoped>
img {
  width: 100%;
}

.add-button {
  margin-top: 15px;
}
</style>
