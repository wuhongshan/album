const fs = require('fs')
const path = require('path')
const config = require('./config')
const _ = require('underscore')
const qstring = require('querystring')
const formidable = require('formidable')

/**
 * GET /
 */
exports.showIndex = (req, res) => {
    fs.readFile('./views/index.html', (err, data) => {
      if (err) {
        throw err
      }
      res.end(data)
    })
  }

/**
 * GET /album?albumName=xxx
 */
exports.showAlbum = (req, res) => {
  const albumName = req.query.albumName
  const albumPath = path.join(config.uploadDir, albumName)
  fs.readdir(albumPath, (err, files) => {
    if (err) {
      throw err
    }
    files = files.map(fileName => fileName = `${albumName}/${fileName}`)
    fs.readFile('./views/album.html', 'utf8', (err, data) => {
      if (err) {
        throw err
      }
      // 处理模板字符串
      const htmlStr = _.template(data)({
        imgPaths: files,
        albumName: albumName
      })
      res.end(htmlStr)
    })
  })
}

/**
 * GET /getAlbums
 */
exports.getAlbums = (req, res) => {
  // 将相册目录 uploads 目录下所有的目录名称读取出来响应给客户端
  // 这里将相册目录放到配置文件中的目的是为了防止以后要改变相册目录
  // 假如这里使用 ./uploads 目录的形式，在添加相册中，也使用 ./uploads 目录形式
  // 这样的话一旦要修改相册目录，就要改好几个地方
  // 所以将这个路径放到配置文件中，所有使用该路径的地方都通过这个配置文件来获取就可以了
  // 这样以后假设要修改相册的目录了，只需要将配置文件改一下就可以了。
  // 总而言之：就是把可能变化的以及多个地方都使用的一些内容给放到配置文件中，方便维护和修改
  fs.readdir(config.uploadDir, (err, files) => {
    if (err) {
      throw err
    }

    let albums = []

    files.forEach(item => {
      const currentPath = path.join(config.uploadDir, item)
      if (fs.statSync(currentPath).isDirectory()) {
        albums.push(item)
      }
    })

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8'
    })

    // 将数组转成 json 格式字符串，响应给客户端
    // JSON.stringify 可以将一个 json 对象转换为 json 格式字符串
    // es6 中，如果一个对象的属性名和值引用的变量名是一样的，可以直接省略写一个即可
    res.end(JSON.stringify({
      albums
    }))
  })
}

/**
 * GET /add?albumName=xxx
 */
exports.doAdd = (req, res) => {
  // 1. 接收用户通过表单提交GET请求提交过来的查询字符串参数 albumName
  // 1.1 校验用户上传的查询字符串是否为空
  // 2. 校验相册名称是否已存在
  //  2.1 如果已存在，告诉用户
  //  2.2 如果不存在，创建新的目录
  const albumName = req.query.albumName

  if (albumName.trim().length === 0) {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8'
    })
    return res.end('小眼儿，请输入完整的相册名称')
  }


  fs.readdir(config.uploadDir, (err, files) => {
    if (err) {
      throw err
    }
    let albums = []
    files.forEach(item => {
      const currentPath = path.join(config.uploadDir, item)
      if (fs.statSync(currentPath).isDirectory()) {
        albums.push(item)
      }
    })
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8'
    })

    // ES6 中，数组增加了一个新的API-find
    // 类似于 underscore 中的 find
    // 注意：在Node后台中可以大量使用 ES6，因为代码运行在服务器端
    //        但是在前端浏览器中就最好不要使用ES6了，有兼容性问题，因为不是任何用户都升级了新版本的浏览器
    if (albums.find(item => item === albumName)) {
      return res.end('albumname already exists.')
    }

    // 代码执行到这里，说明可以新建相册目录了
    fs.mkdir(path.join(config.uploadDir, albumName), err => {
      if (err) {
        throw err
      }
      // HTTP 协议中，302 状态码就表示重定向的意思
      // 当浏览器看到这个状态码的时候，会自动去响应报文中找 Location
      // 找到 Location，浏览器主动重新对该 Location 指定的地址发起新的请求
      res.writeHead('302', {
        'Location': '/'
      })
      res.end() // 即便只发送了一个响应头，也要记得结束响应，否则客户端会一直等待
    })
  })
}

/**
 * GET /xxx
 */
exports.handle404 = (req, res) => {
  res.end('404 Not Found.')
}

/**
 * GET /login
 */
exports.showLogin = (req, res) => {
  fs.readFile('./views/login.html', (err, data) => {
    if (err) {
      throw err
    }
    res.end(data)
  })
}

/**
 * POST /login
 * body { username: xxx, password: xxx }
 */
exports.doLogin = (req, res) => {
  // 使用Node接收解析表单 POST 提交的数据
  // 1. 监听 req 对象的 data 和 end 事件
  let body = ''
  req.on('data', data => {
    body += data
  })
  req.on('end', () => {
    console.log(qstring.parse(body))
  })
}

exports.upload = (req, res) => {
  // 如果有文件上传的表单，自己解析非常的麻烦
  // 所以我们需要借助于社区中的一个包：formidable
  // formidable: https://www.npmjs.com/package/formidable
  // let body = ''
  // req.on('data',data => {
  //   body += data
  // })
  // req.on('end', () => {
  //   console.log(body)
  // })

  const albumName = req.query.albumName

  console.log(albumName)

  const form = new formidable.IncomingForm()

  // 指定 formidable 接收文件的保存路径
  form.uploadDir = path.join(config.uploadDir, albumName)

  // 默认 formidable 对于上传的文件会改名并且不包含扩展名
  // 下面这个代码可以让它继续保持扩展名
  form.keepExtensions = true

  // 限制用户上传文件的大小，单位是 字节
  form.maxFieldsSize = 5 * 1024 * 1024

  // 限制上传字段
  form.maxFields = 10

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    // fields 就是 POST 表单中普通数据
    console.log(files)
      // 默认 formidable 将用户上传的文件接收保存到了 用户的临时目录中了
    res.writeHead(302, {
      'Location': `/album?albumName=${encodeURI(albumName)}`
    })
    res.end()
  })
}
