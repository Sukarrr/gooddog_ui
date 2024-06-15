// 封装通用请求
import axios from 'axios'
import router from '../router'
import storage from '../store/index'
axios.defaults.timeout = 5000 // 超时时间：5s
axios.defaults.withCredentials = true// 允许跨域
// Content-Type 响应头
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8'
// 访问基础url
axios.defaults.baseURL = 'http://localhost:8080'

// 请求拦截器
axios.interceptors.request.use(
  async config => {
    if (config.url === 'api/v1/token/refresh') {
      return config
    }
    if (storage.getRefreshToken() !== null &&
      storage.getTokenExpire() &&
      new Date().getTime() - Number(storage.getTokenExpire()) > 1000) {
      console.log('refresh token: ', config.url)
      await get('api/v1/token/refresh', {headers: {Authorization: 'Bearer ' + storage.getRefreshToken()}}).then(res => {
        storage.setToken(res.data)
        storage.setTokenExpire(String(new Date().getTime()))
        config.headers['Authorization'] = 'Bearer ' + storage.getToken()
      }).catch(err => {
        console.log('refresh token err: ', err)
        router.replace({
          path: '/login'
        })
      })
    }
    if (!config.headers.Authorization) {
      if (storage.getToken() !== null) {
        config.headers['Authorization'] = 'Bearer ' + storage.getToken()
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  response => {
    // 如果response里面的status是200，说明访问到接口了，否则失败
    if (response.status === 200) {
      // Promise：异步框架
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  },
  response => {
    if (response.response.status) {
      if (response.response.status === 401) {
        router.replace({
          path: '/login'
        })
      }
      return Promise.reject(response.response)
    }
  }
)

/**
 * 封装get请求
 */
export function get (url, config = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, config)
      .then(response => {
        resolve(response.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * 封装post请求
 */
export function post (url, data = {}, config = {}) {
  return new Promise((resolve, reject) => {
    axios.post(url, data, config)
      .then(response => {
        resolve(response.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}
