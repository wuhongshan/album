/**
 * 根据不同的请求路径分发的不同的响应处理函数
 */

const fs = require('fs') // 文件操作模块
const url = require('url') // 解析处理 url 模块
const path = require('path') // 解析处理文件路径的模块
const config = require('./config') // 自定义配置文件
const handlers = require('./handlers') // 请求处理函数模块

module.exports = function(req, res) {
  // 使用 url 模块的 parse 方法将当前请求 url 转换成一个对象
  // 得到 请求路径、查询字符串等信息
  // 第二个参数的意思是解析的同时将 解析之后的对象中的 query 属性自动转为一个对象
  const urlObj = url.parse(req.url, true)

  const method = req.method.toUpperCase()

  // 得到请求路径，不包含查询字符串
  const pathname = decodeURI(urlObj.pathname)

  // 得到查询字符串对象（url.parse方法第二个为true的时候自动将查询字符串转为对象）
  const query = urlObj.query

  // 给 Request 请求对象挂载一个 查询字符串对象
  // 在后面的处理函数中就可以直接通过 req.query 来使用了
  req.query = query

  // 根据不同的请求路径做不同的处理响应
  // 请求静态资源，我们只把某些文件或目录开放给用户，别的文件或者目录用户是没有权限访问的
  // /node_modules/bootstrap/dist/css/bootstrap.css
  // /node_modules/jquery/dist/jquery.js
  // /node_modules/bootstrap/dist/js/bootstrap.js
  // es6 中 字符串的 startsWith 方法可以用来判定一个字符串是否是以指定的字符串开头的
  // 如果是 ，返回 true，否则返回 false
  if (pathname.startsWith('/node_modules/') || pathname.startsWith('/public/') || pathname.startsWith('/uploads/')) {
    fs.readFile(`.${pathname}`, (err, data) => {
      if (err) {
        throw err
      }
      res.end(data)
    })
  } else if (method === 'GET' && pathname === '/') {
    // 渲染首页
    handlers.showIndex(req, res)
  } else if (method === 'GET' && pathname === '/album') {
    // 渲染相册页面
    handlers.showAlbum(req, res)
  } else if (method === 'GET' && pathname === '/getAlbums') {
    // 响应相册列表内容
    handlers.getAlbums(req, res)
  } else if (method === 'GET' && pathname === '/add') {
    // 处理添加相册请求
    handlers.doAdd(req, res)
  } else if (method === 'GET' && pathname === '/login') {
    handlers.showLogin(req, res)
  } else if (method === 'POST' && pathname === '/login') {
    handlers.doLogin(req, res)
  } else if (method === 'POST' && pathname === '/album') {
    handlers.upload(req, res)
  } else {
    // 处理 404
    handlers.handle404(req, res)
  }
}
