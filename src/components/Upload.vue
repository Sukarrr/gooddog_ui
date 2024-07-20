<!--<script src="../store/index.js"></script>-->
<!--<template>-->
<!--  <div class="tab-container">-->
<!--    <div>-->
<!--      <div>-->
<!--        <i class="el-icon-s-home" @click="$router.push({name: `Home`})"></i>-->
<!--      </div>-->
<!--      <el-form-->
<!--        :model="formData"-->
<!--        ref="dataForm"-->
<!--        label-position="left"-->
<!--        label-width="90px"-->
<!--        style="width: 400px; margin-left:50px;"-->
<!--      >-->
<!--        <el-form-item label="商品名" prop="name">-->
<!--          <el-input v-model="formData.name" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="卖家 id" prop="seller_id">-->
<!--          <el-input v-model="formData.seller_id" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="价格" prop="price">-->
<!--          <el-input v-model="formData.price" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="道具">-->
<!--          <el-cascader-->
<!--            v-model="formData.tool_id"-->
<!--            :options="tools"-->
<!--            :props="{ expandTrigger: 'hover' }" clearable filterable>-->
<!--          </el-cascader>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="服务器">-->
<!--          <el-radio-group v-model="formData.server_id">-->
<!--            <el-radio-button-->
<!--              v-for="server in servers"-->
<!--              :key="server.id"-->
<!--              :label="server.id">-->
<!--              {{server.name}}-->
<!--            </el-radio-button>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="商品图片">-->
<!--          <el-upload-->
<!--            action=""-->
<!--            :http-request="UnloadImg"-->
<!--            :before-upload="beforeUpload"-->
<!--            :on-remove="handleRemove"-->
<!--            :on-exceed="handleExceed"-->
<!--            accept="image/png,image/gif,image/jpg,image/jpeg"-->
<!--            :file-list="fileList"-->
<!--            list-type="picture">-->
<!--            <el-button size="small" type="primary">点击上传</el-button>-->
<!--            <div slot="tip" class="el-upload__tip">不超过500kb</div>-->
<!--          </el-upload>-->
<!--        </el-form-item>-->
<!--        <el-form-item>-->
<!--          <el-button @click=" handleClear() ">清空</el-button>-->
<!--          <el-button type="primary" @click=" createData() ">确定</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->
<!--<script>-->
<!--// 调用接口-->
<!--import { createItem } from '../api/index'-->
<!--import { Servers, Tools } from '../../static/data'-->
<!--import storage from '../store/index'-->

<!--export default {-->
<!--  data () {-->
<!--    return {-->
<!--      imageUrl: '',-->
<!--      formData: {},-->
<!--      servers: Servers,-->
<!--      tools: Tools,-->
<!--      fileList: []-->
<!--    }-->
<!--  },-->
<!--  created () {-->
<!--    if (!storage.getUsername()) {-->
<!--      this.$router.push({name: `Login`})-->
<!--    }-->
<!--  },-->
<!--  methods: {-->
<!--    handleClear () {-->
<!--      this.formData = {}-->
<!--    },-->
<!--    checkForm () {-->
<!--      if (!this.formData.name ||-->
<!--        !this.formData.seller_id ||-->
<!--        !this.formData.price ||-->
<!--        !this.formData.tool_id ||-->
<!--        !this.formData.server_id ||-->
<!--        !this.formData.file) {-->
<!--        this.$message({-->
<!--          type: 'error',-->
<!--          message: '请填写完整信息'-->
<!--        })-->
<!--        return false-->
<!--      }-->
<!--      return true-->
<!--    },-->
<!--    // 添加增加题目-->
<!--    createData () {-->
<!--      if (!this.checkForm()) {-->
<!--        return-->
<!--      }-->
<!--      let that = this-->
<!--      let fd = new FormData()-->
<!--      fd.append('server_id', that.formData.server_id)-->
<!--      fd.append('tool_id', that.formData.tool_id[that.formData.tool_id.length - 1])-->
<!--      fd.append('seller_id', that.formData.seller_id)-->
<!--      fd.append('price', that.formData.price)-->
<!--      fd.append('name', that.formData.name)-->
<!--      fd.append('file', that.formData.file)-->
<!--      console.log('formData ', this.formData)-->
<!--      createItem(fd).then(res => {-->
<!--        if (res.data === 'OK') {-->
<!--          this.$message({-->
<!--            type: 'info',-->
<!--            message: '保存成功'-->
<!--          })-->
<!--          this.handleClear()-->
<!--        } else {-->
<!--          this.$message({-->
<!--            type: 'error',-->
<!--            message: '保存失败'-->
<!--          })-->
<!--        }-->
<!--      }).catch(err => {-->
<!--        this.$message({-->
<!--          type: 'error',-->
<!--          message: '保存失败: ' + err.message-->
<!--        })-->
<!--      })-->
<!--    },-->
<!--    beforeUpload (file) {-->
<!--      const isLt500KB = file.size / 1024 / 1024 < 0.5-->
<!--      if (isLt500KB) {-->
<!--        return true-->
<!--      }-->
<!--      this.$message.error('上传图片大小不能超过 500kb!')-->
<!--      return false-->
<!--    },-->
<!--    handleExceed (files, fileList) {-->
<!--      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)-->
<!--    },-->
<!--    handleRemove () {-->
<!--      URL.revokeObjectURL(this.imageUrl)-->
<!--      this.imageUrl = ''-->
<!--      this.formData.file = ''-->
<!--      this.fileList = []-->
<!--    },-->
<!--    UnloadImg (file) {-->
<!--      this.imageUrl = URL.createObjectURL(file.file)-->
<!--      this.formData.file = file.file-->
<!--      this.fileList.push({-->
<!--        name: file.file.name,-->
<!--        url: this.imageUrl-->
<!--      })-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</script>-->
<!--<style scoped>-->
<!--.tab-container {-->
<!--  margin: 30px;-->
<!--}-->

<!--.el-icon-s-home {-->
<!--  display: flex;-->
<!--  justify-content: flex-start;-->
<!--  margin-right: 20px;-->
<!--  margin-top: 20px;-->
<!--  font-size: 30px;-->
<!--}-->
<!--</style>-->
