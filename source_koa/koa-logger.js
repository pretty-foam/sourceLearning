async  function logger(ctx,next){
    let res = ctx.res 
    res.on('finish',()=>{
        console.log('当前路由：'+ctx.req.url)
    })
    await next()
}

module.exports = logger 