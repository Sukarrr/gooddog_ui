import {get} from './http'

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

// 新增收藏【post请求】
// export const setCollect = (params) => post(`collect/add`, params);

// 下载音乐【异步请求】
// export const download = (url) => Axios({
//   method: 'get',
//   url: url,
//   responseType: 'blob'
// })
