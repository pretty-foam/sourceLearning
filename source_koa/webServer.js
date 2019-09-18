const http =require('http')
const events = require('events')
const compose = require('./koa-compose')
const context ={
    _body:null ,
    _path:null,
    get body(){
        return this._body 
    },
    set body(val){
        this._body = JSON.stringify(val)
        this.res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        this.res.end(this._body)
    },
    throw(status,msg){
        this.res.writeHead(status, {'Content-Type': 'text/html; charset=utf-8'})
        this.res.end(msg)
    },
    get path(){
        return this.req.url
    }
}
class Webserver extends events{
    constructor(){
        super()
        this.context = Object.create(context)
        this.middleware = []   
    }
    /**
     * 服务端监听
     */
    listen(...args){
        const server = http.createServer(this.callBack())
        return server.listen(...args)
    }
    /**
     * 回调事件
     */
    callBack(){
        let that = this
        // if(that.listenners('error').length === 0 ){
        //     this.on('error',this.onerror)
        // }
        const handleRequest =async (req,res)=>{
            let context = this.createContext(req,res)
            let middleware = this.middleware 
            let fn =  await compose(middleware)
            await fn(context)
        }
        return handleRequest
    }
    /**
     * 注册使用中间件
     * @param {Function} fn
     */
    use(fn) {
        if (typeof fn === 'function') {
            this.middleware.push(fn);
        }
    }
    /**
     * 
     * @param {*} err 错误
     */
    onerror(err){
        console.log(err)
    }
    /**
     * 创建上下文
     */
    createContext(req,res){
        let context = Object.create(this.context)
        context.req = req 
        context.res = res 
        return context
    }
}
module.exports = Webserver