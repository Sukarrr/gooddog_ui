<template>
    <el-container style="border: 1px solid #dcd1fa; background-color: rgba(209,198,224,0.23); display: flex; flex-direction: column;">
      <el-row>
        <el-col :span="8">
          <img :src="cdnURL+'/assets/logo.png'" alt="Logo" class="logo">
        </el-col>
        <el-col :span="8">
          <img :src="cdnURL+'/assets/title.png'" alt="Title" class="title">
        </el-col>
        <el-col :span="8">
          <div class="login">
            <p v-if="loginUser !== ''" style="margin-right: 10px;">管理员 {{loginUser}}</p>
            <el-button v-if="loginUser !== ''" size="medium" @click.native="handleLogOut">退出</el-button>
            <el-button v-else icon="el-icon-user-solid" size="medium" border="none" @click.native="handleLogin">管理员登录</el-button>
          </div>
        </el-col>
      </el-row>
      <el-form ref="dataForm" label-position="left" label-width="90px" style="display: flex;justify-content: center">
        <el-form-item label="" prop="server" class="serverfilter">
          <el-menu mode="horizontal" default-active="all" @select="handleServerSelect" class="servers">
            <el-menu-item index="all">所有服务器</el-menu-item>
            <el-menu-item v-for="server in servers" :key="server.id" :index="server.id">{{server.name}}</el-menu-item>
          </el-menu>
        </el-form-item>
      </el-form>
      <el-main>
        <el-container style="border: 1px solid #eee">
          <!-- 左侧侧边栏 -->
          <el-aside width="200px" height="100%" style="background-color: #ffffff">
            <el-menu default-active="all" @select="handleToolSelect">
              <el-menu-item index="all">所有道具</el-menu-item>
              <template v-for="tool in tools">
                <el-submenu v-if="tool.children && tool.children.length > 0" :key="tool.value" :index="tool.value">
                  <template slot="title"><span class="custom-submenu-title">{{ tool.label }}</span></template>
                  <template v-for="child in tool.children">
                    <el-submenu v-if="child.children && child.children.length > 0" :key="child.value" :index="child.value">
                      <template slot="title"><span class="custom-submenu-title">{{ child.label }}</span></template>
                      <el-menu-item v-if="asideTools[child.value]" :key="asideTools[child.value].value" :index="asideTools[child.value].value">{{asideTools[child.value].label}}</el-menu-item>
                      <el-menu-item v-for="subChild in child.children" :key="subChild.value" :index="subChild.value">{{ subChild.label }}</el-menu-item>
                    </el-submenu>
                    <el-menu-item v-else :key="child.value" :index="child.value">{{ child.label }}</el-menu-item>
                  </template>
                </el-submenu>
                <el-menu-item v-else :key="tool.value" :index="tool.value">{{ tool.label }}</el-menu-item>
              </template>
            </el-menu>
          </el-aside>
          <el-main style="background-color: rgba(249,248,235,0.55)">
            <div style="width: 100%; display: flex; justify-content: space-between;">
              <div class="upload">
                <el-button v-if="loginUser !== ''" type="primary" size="medium" @click.native="uploadInfo">新增商品</el-button>
              </div>
              <div class="pricefilter">
                <el-input v-model="fetchParam.minPrice" placeholder="最低价" type="number" min="0" style="width: 150px;"></el-input>
                <el-input v-model="fetchParam.maxPrice" placeholder="最高价" type="number" min="0" style="width: 150px;"></el-input>
                <el-button @click="filterInfos">筛选</el-button>
              </div>
              <div class="order">
                <el-button-group>
                  <el-button v-for="item in orderByOptions" :key="item.value" :type="fetchParam.order === item.value ? 'primary' : 'default'" size="mini" @click="fetchParam.order = fetchParam.order === item.value ? 0 : item.value">
                    {{ item.label }}
                    <i v-if="item.value === 1 || item.value === 3" class="el-icon-arrow-up"></i>
                    <i v-else class="el-icon-arrow-down"></i>
                  </el-button>
                </el-button-group>
              </div>
            </div>
            <div class="items">
              <ul>
                <li v-for="info in infos" :key="info.id">
                  <el-image :src="imgDomain + info.img_uri" :preview-src-list="[imgDomain + info.img_uri]" class="info_img" fit="contain"></el-image>
                  <h1><b>¥{{ info.price }}</b></h1>
                  <p class="items_p">
                    {{ info.name }}
                  </p>
                  <el-button v-if="loginUser !== ''" type="primary" size="mini" @click.native="editInfo(info)">编辑</el-button>
                  <el-button v-if="loginUser !== ''" type="primary" size="mini" @click.native="deleteInfo(info.id)">删除</el-button>
                  <el-button v-else type="primary" size="mini" @click.native="showInfo(info)">交易详情</el-button>
                </li>
              </ul>
            </div>
            <div>
              <span slot="footer">
                <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="fetchParam.page"
                  :page-sizes="[30, 50, 100]"
                  :page-size="fetchParam.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="total">
                </el-pagination>
              </span>
            </div>
            <el-dialog title="商品详情" :visible.sync="showDialog" :lock-scroll="false" :append-to-body="true" :max-height="'90vh'">
              <div class="dialog-content">
                <div class="detail-left">
                  <el-form :model="formData" ref="dataForm" label-position="left" label-width="90px">
                    <el-form-item label="商品名" prop="name">
                      <el-col>{{formData.name}}</el-col>
                    </el-form-item>
                    <el-form-item label="联系商人" prop="seller_id">
                      <el-col>{{formData.seller_id}}</el-col>
                    </el-form-item>
                    <el-form-item label="价格" prop="price">
                      <el-col>{{formData.price}}</el-col>
                    </el-form-item>
                    <el-form-item label="道具">
                      <el-col>{{formData.tool_id}}</el-col>
                    </el-form-item>
                    <el-form-item label="服务器">
                      <el-col>{{serversMap[formData.server_id]}}</el-col>
                    </el-form-item>
                    <el-form-item label="发布时间">
                      <el-col>{{formData.create_at}}</el-col>
                    </el-form-item>
                  </el-form>
                </div>
                <div class="detail-right">
                  <el-image :src="imgDomain + formData.img_uri" :preview-src-list="[imgDomain + formData.img_uri]" style="width: 100%; height: auto; border: 1px solid #ccc;"></el-image>
                </div>
              </div>
              <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="showDialog = false">取消</el-button>
              </span>
            </el-dialog>
            <el-dialog title="编辑商品" :visible.sync="editDialogVisible" :lock-scroll="false" :append-to-body="true">
              <el-form :model="formData" ref="dataForm" label-position="left" label-width="90px" style="width: 400px; margin-left: 50px;">
                <el-form-item label="商品名" prop="name">
                  <el-input v-model="formData.name" />
                </el-form-item>
                <el-form-item label="联系商人" prop="seller_id">
                  <el-input v-model="formData.seller_id" />
                </el-form-item>
                <el-form-item label="价格" prop="price">
                  <el-input v-model="formData.price" />
                </el-form-item>
                <el-form-item label="道具">
                  <el-cascader v-model="formData.tool_id" :options="tools" :props="{ expandTrigger: 'hover' }" clearable filterable></el-cascader>
                </el-form-item>
                <el-form-item label="服务器">
                  <el-radio-group v-model="formData.server_id">
                    <el-radio-button v-for="server in servers" :key="server.id" :label="server.id">{{ server.name }}</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="发布时间">
                  <el-input v-model="formData.create_at" disabled />
                </el-form-item>
                <el-form-item label="更新时间">
                  <el-input v-model="formData.update_at" disabled />
                </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button @click="handleClear">清空</el-button>
                <el-button type="primary" @click="updateData">确定</el-button>
              </span>
            </el-dialog>
            <el-dialog title="新增商品" :visible.sync="uploadDialogVisible" :lock-scroll="false" :append-to-body="true">
              <el-form :model="formData" ref="dataForm" label-position="left" label-width="90px" style="width: 400px; margin-left: 50px;">
                <el-form-item label="商品名" prop="name">
                  <el-input v-model="formData.name" />
                </el-form-item>
                <el-form-item label="联系商人" prop="seller_id">
                  <el-input v-model="formData.seller_id" />
                </el-form-item>
                <el-form-item label="价格" prop="price">
                  <el-input v-model="formData.price" />
                </el-form-item>
                <el-form-item label="道具">
                  <el-cascader
                    v-model="formData.tool_id"
                    :options="tools"
                    :props="{ expandTrigger: 'hover' }" clearable filterable>
                  </el-cascader>
                </el-form-item>
                <el-form-item label="服务器">
                  <el-radio-group v-model="formData.server_id">
                    <el-radio-button
                      v-for="server in servers"
                      :key="server.id"
                      :label="server.id">
                      {{server.name}}
                    </el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="商品图片">
                  <el-upload
                    action=""
                    :http-request="UnloadImg"
                    :before-upload="beforeUpload"
                    :on-remove="handleRemove"
                    :file-list="fileList"
                    accept="image/png,image/gif,image/jpg,image/jpeg,image/jfif"
                    list-type="picture">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">不超过1MB</div>
                  </el-upload>
                </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button @click="handleClear">清空</el-button>
                <el-button type="primary" @click="createData">确定</el-button>
              </span>
            </el-dialog>
          </el-main>
        </el-container>
      </el-main>
    </el-container>
</template>

<script>
import {getAllItems, deleteItem, updateItem, preloadImages, createItem, getInfosTotal} from '../api/index'
import { cdnURL } from '../api/http'
import { Servers, Tools, AsideTools, Orders } from '../../static/data'
import storage from '../store/index'

export default {
  name: 'Home',
  data () {
    return {
      formData: {},
      loginUser: '',
      fetchParam: {
        server: 'all',
        tool: '',
        minPrice: null,
        maxPrice: null,
        order: 2,
        page: 1,
        pageSize: 30
      },
      total: 1000,
      servers: Servers,
      tools: Tools,
      asideTools: AsideTools,
      infos: [],
      showDialog: false,
      editDialogVisible: false,
      uploadDialogVisible: false,
      toolsMap: [],
      serversMap: [],
      fileList: [],
      cdnURL: cdnURL,
      imgDomain: cdnURL + '/image/'
    }
  },
  created () {
    if (storage.getUsername()) {
      this.loginUser = storage.getUsername()
    }
    this.getInfosTotal()
    this.fetchInfos()
    this.fetchToolServersMap()
    // 提取图片URL并预加载
    let infos = [...this.infos]
    const imageUrls = infos.map(info => this.imgDomain + info.img_uri)
    preloadImages(imageUrls)
      .then(() => {
        console.log('Images preloaded successfully')
      })
      .catch(err => {
        console.error('Error preloading images', err)
      })
  },
  methods: {
    // 初始化
    getInfosTotal () {
      getInfosTotal(this.getFetchInfosParams())
        .then(res => {
          this.total = res.data
        }).catch(err => {
          console.log(err)
        })
    },
    fetchToolServersMap () {
      this.tools.forEach(tool => {
        if (tool.children) {
          tool.children.forEach(subTool => {
            if (subTool.children) {
              subTool.children.forEach(subSubTool => {
                this.toolsMap[subSubTool.value] = [tool, subTool, subSubTool]
              })
            } else {
              this.toolsMap[subTool.value] = [tool, subTool]
            }
          })
        } else {
          this.toolsMap[tool.value] = [tool]
        }
      })
      this.servers.forEach(server => {
        this.serversMap[server.id] = server.name
      })
    },
    fetchInfos () {
      getAllItems(this.getFetchInfosParams())
        .then(res => {
          this.infos = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    filterInfos () {
      this.getInfosTotal()
      this.fetchParam.page = 1
      this.fetchInfos()
    },
    getFetchInfosParams () {
      let params = {...Orders[this.fetchParam.order]}
      params.filters = {
        server_id: this.fetchParam.server,
        tool_id: this.fetchParam.tool,
        min_price: this.fetchParam.minPrice,
        max_price: this.fetchParam.maxPrice
      }
      params.page = this.fetchParam.page
      params.page_size = this.fetchParam.pageSize
      return params
    },
    // 点击筛选
    handleToolSelect (index) {
      this.fetchParam.tool = index
      this.filterInfos()
    },
    handleServerSelect (index) {
      this.fetchParam.server = index
      this.filterInfos()
    },
    // 登录 登出
    handleLogin () {
      this.$router.push({name: `Login`})
    },
    handleLogOut () {
      storage.logout()
      this.loginUser = ''
    },
    showInfo (info) {
      console.log('show info id: ', info.id)
      this.formData = { ...info }
      this.formData.tool_id = ''
      for (let i = 0; i < this.toolsMap[info.tool_id].length; i++) {
        this.formData.tool_id += this.toolsMap[info.tool_id][i].label + ' '
      }
      console.log('tool_id: ', this.formData.tool_id)
      this.formData.create_at = info.create_at.substr(0, 10)
      this.showDialog = true
    },
    editInfo (info) {
      console.log('edit info id: ', info.id)
      this.editDialogVisible = true
      this.formData = { ...info }
      this.formData.tool_id = []
      for (let i = 0; i < this.toolsMap[info.tool_id].length; i++) {
        this.formData.tool_id.push(this.toolsMap[info.tool_id][i].value)
      }
    },
    uploadInfo () {
      this.formData = {
        server_id: this.formData.server_id,
        seller_id: this.formData.seller_id
      }
      this.uploadDialogVisible = true
    },
    deleteInfo (id) {
      this.formData = { 'id': id }
      this.$confirm('确认删除该商品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteItem(this.formData)
          .then(res => {
            if (res.data === 'OK') {
              this.$message({
                type: 'info',
                message: '删除成功'
              })
              this.handleClear()
              this.fetchInfos()
            } else {
              this.$message({
                type: 'error',
                message: '删除失败'
              })
            }
          })
          .catch(err => {
            console.log(err)
            this.$message({
              type: 'error',
              message: '删除失败'
            })
          })
      }).catch(() => {
        this.formData = {}
      })
    },
    handleClear () {
      const { formData } = this
      const createAt = formData.create_at
      const updateAt = formData.update_at
      this.formData = { 'create_at': createAt, 'update_at': updateAt }
    },
    updateData () {
      const { formData } = this
      if (!formData.name || !formData.seller_id || !formData.price || !formData.tool_id || !formData.server_id || !formData.id) {
        this.$message.error('请填写完整信息')
        return
      }
      const fd = new FormData()
      fd.append('server_id', formData.server_id)
      fd.append('tool_id', formData.tool_id[formData.tool_id.length - 1])
      fd.append('seller_id', formData.seller_id)
      fd.append('price', formData.price)
      fd.append('name', formData.name)
      fd.append('id', formData.id)
      updateItem(fd)
        .then(res => {
          if (res.data === 'OK') {
            this.$message({
              type: 'info',
              message: '保存成功'
            })
            this.handleClear()
            this.editDialogVisible = false
            this.fetchInfos()
          } else {
            this.$message({
              type: 'error',
              message: '保存失败'
            })
          }
        })
        .catch(err => {
          console.error('update err:', err)
          this.$message({
            type: 'error',
            message: '保存失败'
          })
        })
    },
    // 上传图片
    createData () {
      const { formData } = this
      if (!formData.name ||
        !formData.seller_id ||
        !formData.price ||
        !formData.tool_id ||
        !formData.server_id ||
        !formData.file) {
        this.$message({
          type: 'error',
          message: '请填写完整信息'
        })
        return
      }
      const formDataCopy = {...formData}
      let fd = new FormData()
      fd.append('server_id', formData.server_id)
      fd.append('tool_id', formData.tool_id[formData.tool_id.length - 1])
      fd.append('seller_id', formData.seller_id)
      fd.append('price', formData.price)
      fd.append('name', formData.name)
      fd.append('file', formData.file)
      createItem(fd).then(res => {
        if (res.data === 'OK') {
          this.$message({
            type: 'info',
            message: '保存成功'
          })
          this.formData = {
            server_id: formDataCopy.server_id,
            seller_id: formDataCopy.seller_id
          }
          this.handleRemove()
          this.fetchInfos()
        } else {
          this.$message({
            type: 'error',
            message: '保存失败'
          })
          this.formData = {...formDataCopy}
        }
      }).catch(err => {
        this.$message({
          type: 'error',
          message: '保存失败: ' + err.message
        })
        this.formData = {...formDataCopy}
      })
    },
    beforeUpload (file) {
      const limit = file.size / 1024 / 1024 <= 1
      if (limit) {
        return true
      }
      this.$message.error('上传图片大小不能超过 1MB!')
      return false
    },
    handleRemove () {
      URL.revokeObjectURL(this.imageUrl)
      this.imageUrl = ''
      this.formData.file = ''
      this.fileList = []
    },
    UnloadImg (file) {
      this.imageUrl = URL.createObjectURL(file.file)
      this.formData.file = file.file
      this.fileList = [{
        name: file.file.name,
        url: this.imageUrl
      }]
    },
    // 分页
    handleSizeChange (val) {
      this.fetchParam.pageSize = val
      this.fetchParam.page = 1
      this.fetchInfos()
    },
    handleCurrentChange (val) {
      this.fetchParam.page = val
      this.fetchInfos()
    }
  },
  watch: {
    'fetchParam.order': 'fetchInfos'
  },
  computed: {
    orderByOptions () {
      return [
        { value: 1, label: '发布时间升序' },
        { value: 2, label: '发布时间逆序' },
        { value: 3, label: '价格升序' },
        { value: 4, label: '价格降序' }
      ]
    }
  }
}
</script>

<style scoped>
@import url('https://lhcos-d363c-1307527906.cos.ap-shanghai.myqcloud.com/gooddog/assets/css/font.css');
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.el-menu-item {
  font-size: 16px !important;
}

.el-submenu__title,
.custom-submenu-title {
  font-size: 16px !important;
}

.el-submenu .el-menu-item {
  font-size: 16px !important;
}

.logo {
  display: flex;
  margin-top: 40px;
  margin-left: 40px;
  justify-content: flex-start;
  width: 120px; /* Logo 宽度 */
  height: auto; /* 自适应高度 */
}

.title {
  text-align: center;
  margin-top: 40px;
  width: 280px; /* Logo 宽度 */
  height: auto; /* 自适应高度 */
}

.login {
  display: flex;
  margin-top: 40px;
  margin-right: 40px;
  justify-content: flex-end;
}

.upload {
  display: flex;
  justify-content: flex-start;
  margin-right: 20px;
  margin-top: 20px;
}

.order {
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;
  margin-top: 20px;
  width: 50%;
}

.order li {
  padding: 3px;
  list-style: none;
  margin-right: 15px;
  border: 1px solid #eee;
}

.servers {
  background-color: transparent !important;
}

.servers .el-menu-item,
.servers .el-submenu,
.servers .el-submenu__title {
  background-color: transparent !important;
}

.servers .el-menu-item.is-active,
.servers .el-submenu.is-active .el-submenu__title {
  background-color: transparent !important;
}

.serverfilter {
  display: flex;
  margin-left: 20px;
  margin-top: 20px;
}

.pricefilter {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  padding: 0px;
  background-color: transparent !important;
}

.items ul {
  display: flex;
  flex-wrap: wrap;
}

.items li {
  padding: 3px;
  list-style: none;
  width: 200px;
  margin-right: 10px;
  margin-top: 10px;
  border: 1px solid #eee;
  background-color: #ffffff;
}

.items_p {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 3em;
  line-height: 1.5em;
  margin-top: 1px;
  margin-bottom: 1px;
}

.info_img {
  width: 200px;
  height: 150px;
}

.dialog-content {
  display: flex;
  height: 100%;
}

.detail-left {
  width: 50%;
  overflow-y: auto;
  padding: 20px;
}

.detail-right {
  width: 50%;
  padding: 20px;
}
</style>
