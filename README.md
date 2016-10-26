# 我的相册

## 项目结构

```
node_modules    存储第三方包（Node包和第三方包都在里面）
public          页面公共资源文件（css、js、img），注意这里的 js 是浏览器端使用的 js
  css           
    *.css
  js
    *.js
  img
    *.jpg
views           html视图模板文件，所有的视图都放在这个目录下，根据不同的请求路径渲染不同的视图
  *.html
app.js          主模块，启动网站服务器的主入口文件，例如：node app.js
router.js       路由模块，根据不同的请求路径做不同的响应处理
config.js       配置文件模块，将可能发生变化的项配置到配置文件中，方便维护和修改，例如端口号
handler.js      请求处理函数模块，业务简单可以直接把所有的请求处理业务封装成函数放到这个模块中，每个模块都需要 req 和 res 两个对象
package.json    包说明文件，用来保存一些项目的基本信息，例如项目名称，项目依赖等
README.md       项目的说明文档，一般写一些项目说明，以及如何运行等相关介绍
```

以上只需要把前端用到的一些静态资源开放出去即可，例如这里就把 `node_modules、public`
两个目录开放给了用户，用户就可以通过路径的形式来访问这些资源，其它一概不允许访问。

对于其它的视图文件，也就是 HTML 模板文件，则是由我们自己来规定路由的，
例如我们可以设定当用户请求 /a 的时候，把登录页响应给用户，可控制性比较灵活。

## 功能需求

- 首页相册列表展示
- 相册页面图片展示

## 路由划分

```
GET /                         views/index.html  渲染首页
GET /getAlbums                { album: [] }     响应相册名称数组列表
GET /add?albumName=xxx        处理用户添加相册请求
GET /album?albumName=xxx      根据不同的 albumName 渲染不同的内容
POST /album?albumName=xxx     处理相册图片上传
```

关于为什么要使用这样的路由，主要是为了 url 的简洁性，可配置性更好，
在 Node 中做 Web 开发，一般路由都是自己来设定。

可以参考豆瓣小组的路由地址：https://www.douban.com/group/explore，
基本上都是自定义的。

## 处理表单提交

### 处理表单 GET 提交

处理表单 GET 提交只需要解析 url 路径就可以拿到提交的数据了。

### 处理普通表单（没有文件） POST 提交

```js
let body = ''
req.on('data',data => {
  body += data
})
req.on('end', () => {
  console.log(body)
})
```

### 处理复杂表单（有文件） POST 提交

- 表单注意事项
  + 1. 有文件的表单提交 `method` 必须是 `post`
  + 2. 必须显式的将表单的 `envtype` 属性设置为 `multipart/form-data`
  + 3. 同样的，file 类型的 input 元素也必须有 `name` 属性

对于使用 Node 解析复杂表单请求，很麻烦，所以这里借助社区中的一个包：
[formidable](https://www.npmjs.com/package/formidable)

具体使用方式如下：

1. 安装

```bash
$ npm install --save formidable
```

2. 基本使用

```js
const form = new formidable.IncomingForm()

// 默认 formidable 将用户上传的文件接收保存到了 用户的临时目录中了
// 通过下面的方式可以配置 formidable 接收文件的保存路径
form.uploadDir = './uploads/'

// 默认 formidable 对于上传的文件会改名并且不包含扩展名
// 下面这个代码可以让它继续保持扩展名
form.keepExtensions = true

// 限制用户上传文件的大小，单位是 字节
form.maxFieldsSize = 5 * 1024 * 1024

form.parse(req, (err, fields, files) => {
  if (err) {
    throw err
  }
  // fields 就是 POST 表单中普通数据
  console.log(files)
  res.end('upload success')
})
```
