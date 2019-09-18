const compose = async (middleware)=>{
    if(!Array.isArray(middleware)){
        throw new TypeError('Middleware stack must be an Array!')
    }
   return async (ctx,next)=>{
    let index = 0
    await dispatch(0)
    async function dispatch(i){
         if(index > i){
           throw new Error('next() called multiple times')
         }
         index  = i 
         let fn = middleware[i]
         if(i === middleware.length){
             fn = next 
         }
         if(fn){
              try{
                await fn(ctx,async ()=>dispatch(i+1))
              }catch(err){
                  console .error(err)
                  ctx.throw(500,'server error')
              }
         }
     }
   }
}

module.exports =compose