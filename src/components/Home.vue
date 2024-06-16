<template>
  <div class="container">
    <!-- Logo -->
    <img src="../assets/logo.png" alt="Logo" class="logo">
    <el-container>
      <h2 style="text-align: center;">三国交易网</h2>
      <el-header>
        <div v-if="loginUser !== ''" class="login"><p>管理员 {{loginUser}}</p></div>
        <div class="login">
          <el-button v-if="loginUser !== ''" size="mini" @click.native="handleLogOut">退出</el-button>
          <el-button v-else icon="el-icon-user-solid" size="mini" border="none" @click.native="handleLogin">管理员登录</el-button>
        </div>
      </el-header>
      <el-main>
        <el-container style="border: 1px solid #eee">
          <el-header class="header">
            <el-form ref="dataForm" label-position="left" label-width="90px">
              <el-form-item label="" prop="server" class="filter">
                <el-menu mode="horizontal" default-active="all" @select="handleServerSelect">
                  <el-menu-item index="all">所有服务器</el-menu-item>
                  <el-menu-item v-for="server in servers" :key="server.id" :index="server.id">{{server.name}}</el-menu-item>
                </el-menu>
              </el-form-item>
            </el-form>
          </el-header>
          <el-main>
            <el-container style="border: 1px solid #eee">
              <!-- 左侧侧边栏 -->
              <el-aside width="200px">
                <el-menu default-active="all" @select="handleToolSelect">
                  <el-menu-item index="all">所有道具</el-menu-item>
                  <template v-for="tool in tools">
                    <el-submenu v-if="tool.children && tool.children.length > 0" :key="tool.value" :index="tool.value">
                      <template slot="title">{{ tool.label }}</template>
                      <template v-for="child in tool.children">
                        <el-submenu v-if="child.children && child.children.length > 0" :key="child.value" :index="child.value">
                          <template slot="title">{{ child.label }}</template>
                          <el-menu-item v-for="subChild in child.children" :key="subChild.value" :index="subChild.value">{{ subChild.label }}</el-menu-item>
                        </el-submenu>
                        <el-menu-item v-else :key="child.value" :index="child.value">{{ child.label }}</el-menu-item>
                      </template>
                    </el-submenu>
                    <el-menu-item v-else :key="tool.value" :index="tool.value">{{ tool.label }}</el-menu-item>
                  </template>
                </el-menu>
              </el-aside>
              <el-main>
                <div style="width: 100%; display: flex; justify-content: space-between;">
                  <div class="upload">
                    <el-button v-if="loginUser !== ''" type="primary" size="mini" @click.native="toUpload">新增商品</el-button>
                  </div>
                  <div class="order">
                    <el-button-group>
                      <el-button v-for="item in orderByOptions" :key="item.value" :type="orderBy === item.value ? 'primary' : 'default'" size="mini" @click="orderBy = orderBy === item.value ? 0 : item.value">
                        {{ item.label }}
                        <i v-if="item.value === 1 || item.value === 3" class="el-icon-arrow-up"></i>
                        <i v-else class="el-icon-arrow-down"></i>
                      </el-button>
                    </el-button-group>
                  </div>
                </div>
                <div class="items">
                  <ul>
                    <li v-for="info in filteredInfos" :key="info.id">
                      <el-image :src="imgDomain + info.img_uri" :preview-src-list="[imgDomain + info.img_uri]" class="info_img"></el-image>
                      <h1><b>¥{{ info.price }}</b></h1>
                      <p>{{ info.name }}</p>
                      <el-button v-if="loginUser !== ''" type="primary" size="mini" @click.native="editInfo(info)">编辑</el-button>
                      <el-button v-if="loginUser !== ''" type="primary" size="mini" @click.native="deleteInfo(info.id)">删除</el-button>
                      <el-button v-else type="primary" size="mini" @click.native="showInfo(info)">查看详情</el-button>
                    </li>
                  </ul>
                </div>
                <el-dialog title="商品详情" :visible.sync="showDialog" :lock-scroll="false" :append-to-body="true" :max-height="'90vh'">
                  <div class="dialog-content">
                    <div class="detail-left">
                      <el-form :model="formData" ref="dataForm" label-position="left" label-width="90px">
                        <el-form-item label="商品名" prop="name">
                          <el-input v-model="formData.name" disabled />
                        </el-form-item>
                        <el-form-item label="卖家 id" prop="seller_id">
                          <el-input v-model="formData.seller_id" disabled />
                        </el-form-item>
                        <el-form-item label="价格" prop="price">
                          <el-input v-model="formData.price" disabled />
                        </el-form-item>
                        <el-form-item label="道具">
                          <el-cascader v-model="formData.tool_id" :options="tools" :props="{ expandTrigger: 'hover' }" disabled clearable filterable></el-cascader>
                        </el-form-item>
                        <el-form-item label="服务器">
                          <el-input v-model="serversMap[formData.server_id]" disabled />
                        </el-form-item>
                        <el-form-item label="发布时间">
                          <el-input v-model="formData.create_at" disabled />
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
                    <el-form-item label="卖家 id" prop="seller_id">
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
                    <el-form-item>
                      <el-button @click="handleClear">清空</el-button>
                      <el-button type="primary" @click="updateData">确定</el-button>
                    </el-form-item>
                  </el-form>
                </el-dialog>
              </el-main>
            </el-container>
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { getAllItems, deleteItem, updateItem } from '../api/index'
import { Servers, Tools } from '../../static/data'
import storage from '../store/index'

export default {
  name: 'Home',
  data () {
    return {
      formData: {},
      loginUser: '',
      selectedServer: 'all',
      servers: Servers,
      selectedTool: '',
      orderBy: 2,
      tools: Tools,
      infos: [],
      filteredInfos: [],
      showDialog: false,
      editDialogVisible: false,
      toolsMap: [],
      serversMap: [],
      imgDomain: 'http://localhost:8080/api/v1/image/'
    }
  },
  created () {
    if (storage.getUsername()) {
      this.loginUser = storage.getUsername()
    }
    this.fetchInfos()
    this.fetchToolServersMap()
  },
  methods: {
    fetchToolServersMap () {
      this.tools.forEach(tool => {
        if (tool.children) {
          tool.children.forEach(subTool => {
            if (subTool.children) {
              subTool.children.forEach(subSubTool => {
                this.toolsMap[subSubTool.value] = [tool.value, subTool.value, subSubTool.value]
              })
            } else {
              this.toolsMap[subTool.value] = [tool.value, subTool.value]
            }
          })
        } else {
          this.toolsMap[tool.value] = [tool.value]
        }
      })
      this.servers.forEach(server => {
        this.serversMap[server.id] = server.name
      })
    },
    fetchInfos () {
      getAllItems('create_at', 'desc')
        .then(res => {
          this.infos = res.data
          this.filterInfos()
        })
        .catch(err => {
          console.log(err)
        })
    },
    handleToolSelect (index) {
      this.selectedTool = index
      this.filterInfos()
    },
    handleServerSelect (index) {
      this.selectedServer = index
      this.filterInfos()
    },
    filterInfos () {
      const server = this.selectedServer
      const tool = this.selectedTool
      this.filteredInfos = JSON.parse(JSON.stringify(this.infos))
      this.filteredInfos = this.filteredInfos.filter(info => {
        if (server !== 'all' && info.server_id + '' !== server) {
          return false
        }
        if (tool === '' || tool === 'all') {
          return true
        }
        return info.tool_id + '' === tool
      })
    },
    orderInfos () {
      const order = this.orderBy
      this.filteredInfos = this.filteredInfos.sort((a, b) => {
        switch (order) {
          case 1:
            return a.create_at < b.create_at ? -1 : 1
          case 2:
            return b.create_at < a.create_at ? -1 : 1
          case 3:
            return a.price - b.price
          case 4:
            return b.price - a.price
          default:
            return 0
        }
      })
    },
    handleLogin () {
      this.$router.push({name: `Login`})
    },
    handleLogOut () {
      storage.logout()
      this.loginUser = ''
    },
    showInfo (info) {
      console.log('show info id: ', info.id)
      this.showDialog = true
      this.formData = { ...info }
      this.formData.tool_id = this.toolsMap[info.tool_id]
      this.formData.create_at = info.create_at.substr(0, 10)
    },
    editInfo (info) {
      console.log('edit info id: ', info.id)
      this.editDialogVisible = true
      this.formData = { ...info }
      this.formData.tool_id = this.toolsMap[info.tool_id]
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
    checkForm () {
      const { formData } = this
      if (!formData.name || !formData.seller_id || !formData.price || !formData.tool_id || !formData.server_id || !formData.id) {
        this.$message.error('请填写完整信息')
        return false
      }
      return true
    },
    handleClear () {
      const { formData } = this
      const createAt = formData.create_at
      const updateAt = formData.update_at
      this.formData = { 'create_at': createAt, 'update_at': updateAt }
    },
    updateData () {
      if (!this.checkForm()) return
      const fd = new FormData()
      const { formData } = this
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
    toUpload () {
      this.$router.push({ name: `Upload` })
    }
  },
  watch: {
    orderBy: 'orderInfos',
    selectedServer: 'filterInfos',
    selectedTool: 'filterInfos'
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
.container {
  padding: 20px; /* 设置整体内边距 */
}

.logo {
  position: absolute; /* 绝对定位，使得 logo 在左上角 */
  top: 20px; /* 距离顶部距离 */
  left: 20px; /* 距离左侧距离 */
  width: 100px; /* Logo 宽度 */
  height: auto; /* 自适应高度 */
}

.login {
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;
}

.upload {
  display: flex;
  justify-content: flex-start;
  margin-right: 20px;
  margin-top: 20px;
  width: 50%;
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

.filter {
  display: flex;
  margin-left: 20px;
  margin-top: 20px;
}

.header {
  flex: 1;
  padding: 10px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
}

.items ul {
  display: flex;
  flex-wrap: wrap;
}

.items li {
  padding: 3px;
  list-style: none;
  margin-right: 15px;
  margin-top: 15px;
  border: 1px solid #eee;
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

.el-dialog__body {
  padding: 0;
}
</style>
