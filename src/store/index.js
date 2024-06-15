var storage = {
  setToken (value) {
    console.log('set token: ', value)
    localStorage.setItem('token', value)
  },
  getToken () {
    console.log('get token: ', localStorage.getItem('token'))
    return localStorage.getItem('token')
  },
  getTokenExpire () {
    return localStorage.getItem('token_expire')
  },
  setTokenExpire (value) {
    localStorage.setItem('token_expire', value)
  },
  clearToken () {
    localStorage.removeItem('token')
  },
  setUsername (value) {
    localStorage.setItem('username', value)
  },
  getUsername () {
    return localStorage.getItem('username')
  },
  getRefreshToken () {
    return localStorage.getItem('refresh_token')
  },
  setRefreshToken (value) {
    localStorage.setItem('refresh_token', value)
  },
  logout () {
    localStorage.clear()
  }
}

export default storage
