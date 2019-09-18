const PENDING ='PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
const isFunction = variable => typeof variable === 'function'

class MyPromise{
    constructor(handle){
        this._static = PENDING 
        this._value = undefined
        this._fulfilledQueues = []
        this._rejectedQueues = []
        if(typeof handle !=='function')throw new Error('MyPromise must accept a function as a parameter')
        try{
            handle(this._resolve.bind(this),this._reject.bind(this))
        }catch(err){
            this._reject(err)
        }
    }
    _resolve(val){
        if(this._static !==PENDING)return 
        const run =()=>{
          this._static = FULFILLED 
          this._value = val
          let cb = null 
          while(cb = this._fulfilledQueues.shift()){
            cb(val)
          }
        }
        // run()
        setTimeout(run)
      }
    _reject(err){
        if(this._static !==PENDING)return
       const run =()=>{
        this._static =REJECTED 
        this._value = err 
        let cb = null 
        while(cb = this._rejectedQueues.shift()){
          cb(err)
        }
       }
       setTimeout(run)
    }
    // 添加then方法
    then (onFulfilled, onRejected) {
      const { _value, _static } = this
      return new MyPromise((onFulfilledNext,onRejectedNext)=>{
              const success=value=>{
                try{
                  if(!isFunction(onFulfilled)){
                    onFulfilledNext(value)
                  }else{
                    const res = onFulfilled(value)
                    if(res instanceof MyPromise){
                        res.then(onFulfilledNext,onRejectedNext)
                    }else{
                        onFulfilledNext(res)
                    }
                  }
                }catch(err){
                  onRejectedNext(err)
                }
              }
              const fail = value=>{
                try{
                  if(!isFunction(onRejected)){
                    onRejectedNext(value)
                  }else{
                    const res = onRejected(value)
                    if(res instanceof MyPromise){
                        res.then(onFulfilledNext,onRejectedNext)
                    }else{
                      onRejectedNext(res)
                    }
                  }
                }catch(err){
                  onRejectedNext(err)
                }
              }
              switch(_static){
                 // 当状态为pending时，将then方法回调函数加入执行队列等待执行
                case PENDING:
                  this._fulfilledQueues.push(success)
                  this._rejectedQueues.push(fail)
                  break
                // 当状态已经改变时，立即执行对应的回调函数
                case FULFILLED:
                  fulfilled(_value)
                  break
                case REJECTED:
                  rejected(_value)
                  break
              }
      })
    }
      //catch
    catch(rejected){
      return this.then(undefined,rejected)
    }
    //all 
    static all(list){
      return new MyPromise((res,rej)=>{
          let cache = []
          let count = 0
          list.forEach((el,index) => {
              el.then(data=>{
                cache[index]=data
                count++
                if(count===list.length)res(cache)
              }).catch(err=>{
                rej(err)
              })
          });
      })
    }
    //race
    static race(list){
      return new MyPromise((res,rej)=>{
          list.forEach(el=>{
            el.then(data=>res(data)).catch(err=>rej(err))
          })
      })
    }
    //finally
    finally(cb){
       this.then(data=>cb(data),err=>cb(err))
    }
}

const a= new MyPromise(res=>{
  setTimeout(()=>res('a'),1000)
})
const b= new MyPromise(res=>setTimeout(()=>res('b')))
const c= new MyPromise(res=>setTimeout(()=>res('c')))
const d= new MyPromise(res=>setTimeout(()=>res('d')))
const arr = [a,b,c,d]
MyPromise.all(arr).then(data=>{
  console.log(data)
})
