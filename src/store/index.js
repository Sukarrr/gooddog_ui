var storage = {
  setToken (value) {
    localStorage.setItem('token', value)
  },
  setUsername (value) {
    localStorage.setItem('username', value)
  },
  getToken () {
    return localStorage.getItem('token')
  },
  getUsername () {
    return localStorage.getItem('username')
  }
}

export default storage
