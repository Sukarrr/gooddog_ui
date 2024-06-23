import {get, post} from './http'

// 根据指定排序查询所有商品列表
export const getAllItems = (orderBy, orderType) => get(`api/v1/items/info?order_by=${orderBy}&order_type=${orderType}`)

// 返回当前的评论列表【根据传参发送不同请求】
// export const getAllComment = (type, id) => {
//   if(type === 0){ //type: 0 歌曲
//     return get(`comment/commentOfSongId?songId=${id}`);
//   }else{ //歌单
//     return get(`comment/commentOfSongListId?songListId=${id}`);
//   }
// }

// 新增商品【post请求】
export const createItem = (params) => post(`api/v1/items/create`, params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

export const updateItem = (params) => post(`api/v1/items/update`, params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

export const deleteItem = (params) => post(`api/v1/items/delete`, params)

// login
export const login = (params) => post(`api/v1/users/login`, params)

export function preloadImages (imageUrls) {
  const promises = imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.onload = resolve
      img.onerror = reject
    })
  })

  return Promise.all(promises)
}

// 下载音乐【异步请求】
// export const download = (url) => Axios({
//   method: 'get',
//   url: url,
//   responseType: 'blob'
// })
