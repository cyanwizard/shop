<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 二、创建echarts的dom -->
      <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// echarts的使用步骤
// 一、引入echarts
import echarts from 'echarts'
// 引入lodash
import _ from 'lodash'

export default {
  data() {
    return {
      // 报表的配置
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },

  async mounted() {
    // 三、基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    // 四、指定图表的配置项和数据
    // 获取报表的数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) return this.$message('获取报表数据失败')
    // 利用lodash.merge合并配置对象和数据对象
    const result = _.merge(res.data, this.options)

    // 五、使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  }
}
</script>

<style lang="less" scoped>
</style>
