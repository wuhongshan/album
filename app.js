const http = require('http') // 构建 http 服务模块
const config = require('./config') // 配置文件模块
const router = require('./router') // 路由模块

http
  .createServer((req, res) => {
    // 进入路由匹配系统，在路由中根据不同的请求路径调用不同的请求处理函数
    router(req, res)
  })
  .listen(config.port, config.host, () => {
    console.log(`server is running at port ${config.port}`)
    console.log(`    Please visit http://${config.host}:${config.port}/`)
  })
