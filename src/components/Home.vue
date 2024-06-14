<template>
  <el-container>
    <h2 style="text-align: center;">三国交易网</h2>
    <el-header>
      <div class="login">
        <p v-if="loginUser !== ''">已登录管理员账户</p>
        <el-button v-else icon="el-icon-user-solid" size="mini" boarder="none" @click.native="handleLogin">管理员登录</el-button>
      </div>
    </el-header>
    <el-main>
      <el-container style="display: flex; border: 1px solid #eee">
        <el-header class="header">
          <div class="filter">
            服务器选择:
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
          </div>
          <div class="filter">
            道具选择:
            <el-cascader
              v-model="selectedTool"
              :options="tools"
              :props="{ expandTrigger: 'hover' }"
              @change="filterInfos" clearable filterable>
            </el-cascader>
          </div>
        </el-header>
        <el-main>
          <div>
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
                <el-image :src="imgDomain + info.img_uri" :preview-src-list="[imgDomain + info.img_uri]"></el-image>
                <h1><b>¥{{ info.price }}</b></h1>
                <p>{{ info.name }}</p>
                <p>{{ info.seller_id }}</p>
                <p>{{ info.create_at.substr(0, 10) }}</p>
              </li>
            </ul>
          </div>
        </el-main>
      </el-container>
    </el-main>
  </el-container>
</template>

<script>
import {getAllItems} from '../api/index'
import {Servers, Tools} from '../../static/data'
import storage from '../store/index'

export default {
  name: 'Home',
  data () {
    return {
      loginUser: '',
      selectedServer: 'all',
      servers: Servers,
      selectedTool: [],
      orderBy: 2,
      tools: Tools,
      infos: [],
      filteredInfos: [],
      imgDomain: 'http://localhost:8080/api/v1/image/'
    }
  },
  created () {
    console.log('created route: ', this.$route.params)
    if (storage.getUsername()) {
      this.loginUser = storage.getUsername()
    }
    this.fetchInfos()
  },
  methods: {
    fetchInfos () {
      console.log('fetchInfos loginUser: ', this.loginUser)
      getAllItems('create_at', 'desc')
        .then(res => {
          this.infos = res.data
          this.filteredInfos = this.infos
        })
        .catch(err => {
          console.log(err)
        })
    },
    filterInfos () {
      const server = this.selectedServer
      const tool = this.selectedTool
      const toolLen = this.selectedTool.length
      console.log('server, tool: ', server, tool)
      console.log('infos: ', this.infos)
      this.filteredInfos = this.infos
      this.filteredInfos = this.filteredInfos.filter(info => {
        if (server !== 'all') {
          return info.server_id + '' === server
        }
        if (toolLen > 0) {
          return info.tool_id + '' === tool[toolLen - 1]
        }
        return true
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
    }
  },
  watch: {
    orderBy: 'orderInfos',
    selectedServer: 'filterInfos',
    selectedTool: 'filterInfos',
    selectedSubTool: 'filterInfos'
  }
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;
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
  border: 1px solid #eee;
}

.el-image {
  width: 200px;
  height: 150px;
}
</style>
