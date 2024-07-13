<template>
  <div class="loginbody">
    <div class="logindata">
      <div class="logintext">
        <h2>Welcome</h2>
      </div>
      <div class="formdata">
        <el-form ref="form" :model="form" :rules="rules">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              clearable
              placeholder="请输入账号"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              clearable
              placeholder="请输入密码"
              show-password
            ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click=" login() ">登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '../api/index'
import storage from '../store/index'

export default {
  name: 'Login',
  data () {
    return {
      form: {
        password: '',
        username: ''
      },
      checked: false,
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { max: 10, message: '不能大于10个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { max: 10, message: '不能大于10个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    storage.logout()
  },
  mounted () {
  },
  methods: {
    login () {
      login(this.form)
        .then(res => {
          storage.setToken(res.data.token)
          storage.setTokenExpire(String(new Date().getTime()))
          storage.setRefreshToken(res.data.refresh_token)
          storage.setUsername(this.form.username)
          this.$router.push({name: `Home`})
        })
        .catch(err => {
          console.log(err)
          this.$message({
            type: 'error',
            message: '用户名或密码错误',
            showClose: true
          })
        })
    }
  }
}
</script>

<style scoped>
.loginbody {
  width: 100%;
  height: 100%;
  min-width: 1000px;
  background-size: 100% 100%;
  background-position: center center;
  overflow: auto;
  background-repeat: no-repeat;
  position: fixed;
  line-height: 100%;
  padding-top: 150px;
}

.logintext {
  margin-bottom: 20px;
  line-height: 50px;
  text-align: center;
  font-size: 30px;
  font-weight: bolder;
  color: white;
  text-shadow: 2px 2px 4px #000000;
}

.logindata {
  width: 400px;
  height: 300px;
  transform: translate(-50%);
  margin-left: 50%;
}

.tool {
  display: flex;
  justify-content: space-between;
  color: #606266;
}

.butt {
  margin-top: 10px;
  text-align: center;
}

.shou {
  cursor: pointer;
  color: #606266;
}
</style>
