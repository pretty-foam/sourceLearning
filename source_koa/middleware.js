class Middleware {
    constructor(){
        this.cache  = []
    }
    get(path,childMiddleware){
        this.cache.push({childMiddleware,path})
    }
    middlewares(){
        let cache = this.cache 
        return async (ctx,next)=>{
            let path = ctx.req.url 
            let child = cache.filter(val=>path === val.path)
            child[0] ? await child[0].childMiddleware(ctx,next) : null
            await next() 
        }
    }
}
module.exports = Middleware