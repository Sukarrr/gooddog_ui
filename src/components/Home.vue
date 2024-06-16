<template>
  <el-container>
    <h2 style="text-align: center;">三国交易网</h2>
    <el-header>
      <div v-if="loginUser !== ''" class="login"><p>管理员 {{loginUser}}</p></div>
      <div class="login">
        <el-button v-if="loginUser !== ''" size="mini" @click.native="handleLogOut">退出</el-button>
        <el-button v-else icon="el-icon-user-solid" size="mini" boarder="none" @click.native="handleLogin">管理员登录</el-button>
      </div>
    </el-header>
    <el-main>
      <el-container style="display: flex; border: 1px solid #eee">
        <el-header class="header">
          <el-form
            ref="dataForm"
            label-position="left"
            label-width="90px">
            <el-form-item label="服务器选择:" prop="server" class="filter">
              <el-radio-group v-model="selectedServer">
                <el-radio-button label="all">
                  所有服务器
                </el-radio-button>
                <el-radio-button
                  v-for="server in servers"
                  :key="server.id"
                  :label="server.id">
                  {{server.name}}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="道具选择:" prop="tool" class="filter">
              <el-cascader
                v-model="selectedTool"
                :options="tools"
                :props="{ expandTrigger: 'hover' }"
                @change="filterInfos" clearable filterable>
              </el-cascader>
            </el-form-item>
          </el-form>
        </el-header>
        <el-main>
          <div>
            <el-button v-if="loginUser !== ''" type="primary" size="mini" @click.native="toUpload" class="upload">新增商品</el-button>
            <ul class="order">
              <li>
                发布时间
                <el-button icon="el-icon-arrow-up" size="mini" boarder="none" @click.native="orderBy = 1"></el-button>
                <el-button icon="el-icon-arrow-down" size="mini" boarder="none" @click.native="orderBy = 2"></el-button>
              </li>
              <li>
                价格
                <el-button icon="el-icon-arrow-up" size="mini" boarder="none" @click.native="orderBy = 3"></el-button>
                <el-button icon="el-icon-arrow-down" size="mini" boarder="none" @click.native="orderBy = 4"></el-button>
              </li>
            </ul>
          </div>
          <div class="items" id="items">
            <ul>
              <li v-for="info in filteredInfos" :key="info.id">
                <el-image :src="imgDomain + info.img_uri" :preview-src-list="[imgDomain + info.img_uri]" class="info_img"></el-image>
                <h1><b>¥{{ info.price }}</b></h1>
                <p>{{ info.name }}</p>
                <el-button v-if="loginUser !== ''" type="primary" size="mini" @click.native="editInfo(info)">编辑</el-button>
                <el-button v-if="loginUser !== ''" type="primary" size="mini" @click.native="deleteInfo(info.id)">删除</el-button>
                <el-button v-if="loginUser === ''" type="primary" size="mini" @click.native="showInfo(info)">查看详情</el-button>
              </li>
            </ul>
          </div>
          <el-dialog title="商品详情" :visible.sync="showDialog" :lock-scroll="false" :append-to-body="true">
            <div style="width: 50%; height: 100%; float: left;">
              <el-form
                :model="formData"
                ref="dataForm"
                label-position="left"
                label-width="90px"
                style="margin-left:50px;"
              >
                <el-form-item label="商品名" prop="name">
                  <el-input v-model="formData.name" :disabled="true"/>
                </el-form-item>
                <el-form-item label="卖家 id" prop="seller_id">
                  <el-input v-model="formData.seller_id" :disabled="true"/>
                </el-form-item>
                <el-form-item label="价格" prop="price">
                  <el-input v-model="formData.price" :disabled="true"/>
                </el-form-item>
                <el-form-item label="道具">
                  <el-cascader
                    v-model="formData.tool_id"
                    :options="tools"
                    :props="{ expandTrigger: 'hover' }"
                    :disabled="true" clearable filterable>
                  </el-cascader>
                </el-form-item>
                <el-form-item label="服务器">
                  <el-input v-model="serversMap[formData.server_id]" :disabled="true"/>
                </el-form-item>
                <el-form-item label="发布时间">
                  <el-input v-model="formData.create_at" :disabled="true"/>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="showDialog = false">取消</el-button>
                </el-form-item>
              </el-form>
            </div>
            <div style="width: 50%; height: 100%; float: left;">
              <el-image :src="imgDomain + formData.img_uri" :preview-src-list="[imgDomain + formData.img_uri]" style="width: 100%; height: 100%"></el-image>
            </div>
          </el-dialog>
          <el-dialog title="编辑商品" :visible.sync="editDialogVisible" :lock-scroll="false" :append-to-body="true">
            <el-form
              :model="formData"
              ref="dataForm"
              label-position="left"
              label-width="90px"
              style="width: 400px; margin-left:50px;"
            >
              <el-form-item label="商品名" prop="name">
                <el-input v-model="formData.name"/>
              </el-form-item>
              <el-form-item label="卖家 id" prop="seller_id">
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
              <el-form-item label="发布时间">
                <el-input v-model="formData.create_at" :disabled="true"/>
              </el-form-item>
              <el-form-item>
                <el-button @click=" handleClear() ">清空</el-button>
                <el-button type="primary" @click=" updateData() ">确定</el-button>
              </el-form-item>
            </el-form>
          </el-dialog>
        </el-main>
      </el-container>
    </el-main>
  </el-container>
</template>

<script>
import {deleteItem, getAllItems, updateItem} from '../api/index'
import {Servers, Tools} from '../../static/data'
import storage from '../store/index'

export default {
  name: 'Home',
  data () {
    return {
      formData: {},
      loginUser: '',
      selectedServer: 'all',
      servers: Servers,
      selectedTool: [],
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
    filterInfos () {
      const server = this.selectedServer
      const tool = this.selectedTool
      const toolLen = this.selectedTool.length
      this.filteredInfos = JSON.parse(JSON.stringify(this.infos))
      this.filteredInfos = this.filteredInfos.filter(info => {
        if (server !== 'all' && info.server_id + '' !== server) {
          return false
        }
        return !(toolLen > 0 && info.tool_id + '' !== tool[toolLen - 1])
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
      this.formData = JSON.parse(JSON.stringify(info))
      this.formData.tool_id = this.toolsMap[info.tool_id]
      this.formData.create_at = info.create_at.substr(0, 10)
    },
    editInfo (info) {
      console.log('edit info id: ', info.id)
      this.editDialogVisible = true
      this.formData = JSON.parse(JSON.stringify(info))
      this.formData.tool_id = this.toolsMap[info.tool_id]
      this.formData.create_at = info.create_at.substr(0, 10)
    },
    deleteInfo (id) {
      console.log('delete id: ', id)
      this.formData = {'id': id}
      this.$alert('确认删除该商品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        callback: action => {
          if (action === 'confirm') {
            if (!this.formData.id) {
              this.$message({
                type: 'error',
                message: '缺少商品 id'
              })
            } else {
              deleteItem(this.formData).then(res => {
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
              }).catch(err => {
                console.log(err)
                this.$message({
                  type: 'error',
                  message: '删除失败'
                })
              })
            }
          } else {
            this.formData = {}
          }
        }
      })
    },
    checkForm () {
      if (!this.formData.name ||
        !this.formData.seller_id ||
        !this.formData.price ||
        !this.formData.tool_id ||
        !this.formData.server_id ||
        !this.formData.id) {
        this.$message({
          type: 'error',
          message: '请填写完整信息'
        })
        return false
      }
      return true
    },
    handleClear () {
      let createAt = this.formData.create_at
      this.formData = {'create_at': createAt}
    },
    updateData () {
      if (!this.checkForm()) {
        return
      }
      let that = this
      let fd = new FormData()
      fd.append('server_id', that.formData.server_id)
      fd.append('tool_id', that.formData.tool_id[that.formData.tool_id.length - 1])
      fd.append('seller_id', that.formData.seller_id)
      fd.append('price', that.formData.price)
      fd.append('name', that.formData.name)
      fd.append('id', that.formData.id)
      updateItem(fd).then(res => {
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
      }).catch(err => {
        console.log('update err:', err)
        this.$message({
          type: 'error',
          message: '保存失败'
        })
      })
    },
    toUpload () {
      this.$router.push({name: `Upload`})
    }
  },
  watch: {
    orderBy: 'orderInfos',
    selectedServer: 'filterInfos',
    selectedTool: 'filterInfos'
  }
}
</script>

<style scoped>
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
}

.order {
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;
  margin-top: 20px;
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
  flex: 1;
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
</style>
