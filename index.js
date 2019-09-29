/*
 * @Author: shun
 * @Date: 2019-01-16 12:15:22
 * @Last Modified by: shun
 * 实例工具库
 */
// 浏览器兼容storage
let supportStorage = function () {
  let flag = false
  if (!window.storage) {
    throw new Error("浏览器不支持localStorage")
  } else {
    flag = true
  }
  return flag
}
// 工具类
class Util {
  /**
   * 替换字符串中所有得字符串
   * @param {*全局替换字符串} str
   * @param {*目标字符串} targetStr
   * @param {*要替换得新字符串} newStr
   */
  replaceStr (str, targetStr, newStr) {
    str = Util.isString(str) ? str : str.toString()
    let reRegExp = new RegExp(targetStr, "g")
    return str.replace(reRegExp, newStr)
  }
  /**
   *
   * @param {*storage名} name
   * @param {*storage值} value
   * @param {*类型 session/local} type
   */
  setStorage (name, value, type = "local") {
    let storage
    if (supportStorage) {
      let _value = JSON.stringify(value)
      if (type === 'local') {
        storage = window.localStorage
      } else {
        storage = window.sessionStorage
      }

      storage.setItem(name, _value)
    }
  }
  getStorage = (name, type = "local") => {
    let storage
    if (type === 'local') {
      storage = window.localStorage
    } else {
      storage = window.sessionStorage
    }
    return JSON.parse(storage.getItem(name))
  }
  removeStorage = (name, type = "local") => {
    let storage
    if (type === 'local') {
      storage = window.localStorage
    } else {
      storage = window.sessionStorage
    }
    return storage.removeItem(name)
  }
  clearStorage = (type = "local") => {
    let storage
    if (type === 'local') {
      storage = window.localStorage
    } else {
      storage = window.sessionStorage
    }
    return storage.clear()
  }
  /**
   * 获取IE历览器版本 火狐获取可能有点儿问题
   * 返回number类型当前大浏览器的大版本号
   */
  getIeVersion () {
    const browser = navigator.appName
    const bVersion = navigator.appVersion
    const version = bVersion.split(';')
    const trim_version = version[1] ? version[1].replace(/[ ]/g, '') : ''
    if (browser === 'Microsoft Internet Explorer') {
      return parseInt(trim_version.substr(4, 1))
    } else {
      return 0
    }
  }
  /**
   * 绑定事件
   * @param {*} element
   * @param {*} eType
   * @param {*} handle
   * @param {*} bol
   */
  addEvent (element, eType, handle, bol = true) {
    if (element.addEventListener) {
      element.addEventListener(eType, handle, bol)
    } else if (element.attachEvent) {
      element.attachEvent(eType, handle, bol)
    } else {
      element["on" + eType] = null
    }
  }
}

/**
 * 函数防抖动
 * @param {*执行函数} fn
 * @param {*时间间隔} wait
 */
Util._debance = function (fn, wait) {
  let timer = null
  return function () {
    let _this = this
    let args = arguments
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      fn.apply(_this, args)
    }, wait)
  }
}
/**
 * 节流函数
 * @param {*要执行的函数} fn
 * @param {*等待时间} wait
 */
Util._throttle = function (fn, wait) {
  let _lastTime = null
  return function () {
    let _nowTime = new Date()
    if (_nowTime - _lastTime > wait || !_lastTime) {
      fn()
      _lastTime = _nowTime
    }
  }
}
/**
 * @param {*要获取的url参数，无论是hash还是search值}
 */
Util.GetQueryString = function(name){
  var after = window.location.hash.split("?")[1]||window.location.search.split("?")[1];
  if(after){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = after.match(reg);
    if(r != null){
      return  decodeURIComponent(r[2]);
    }
    else{
      return null;
    }
  }
}
/**
 * 计算字符串长度
 * @param {*将要计算的字符串}
 * @param {*是否区分中英文}
 * 中文默认长度为2，英文默认为1
 */
Util.charLength = function (c,type=true) {
  c = c || '';
  var b = 0;
  for (var a = 0; a < c.length; a++) {
    if(type){
      if ((c.charCodeAt(a) >= 0) && (c.charCodeAt(a) <= 255)) {
          b++
      } else {
          b += 2
      }
    }else{
      b++
    }
  }
  return b
}
/**
 * @param {*格式化的金额}
 */
Util.moneyFormat = function (num) {
  num = num + "";
  var re = /(-?\d+)(\d{3})/;
  if(!re.test(num)) throw new Error ('The argument is not of type number')
  num = num.replace(re, "$1,$2");
  return num;
}




// 处理操作localStorage时的错误并给出提示
const localStorageErrHandler = (e) => {
    let errMsg = '';
    let errName = e.name.toLowerCase() || '';
    let errNumber = e.number.toString() || ''
    switch (errName) {
        case 'quotaexceedederror':
            // 本地存储满时，不提示直接清空localStorage，并执行回调对象中的回调函数
            errMsg = ''
            localStorage.clear()
            break
        case 'error':
            if (errNumber === '-2147024891') {
                // 高版本内核IE10禁止访问localStorage
                errMsg = '访问localStorage本地存储失败，IE浏览器请取消保护模式（设置路径：工具 -> Internal选项 -> 安全 -> 取消勾选启用保护模式）'
            } else {
                errMsg = '操作浏览器本地存储localStorage时发生意外错误'
            }
            break
        default:
            errMsg = '操作浏览器本地存储localStorage时发生意外错误'
            break
    }
    if (errMsg) {
        MessageBox.alert(errMsg, '确定', {
            confirmButtonText: '确定'
        }).then(() => {})
    }
}

// 操作localStrage报错时如果有传回调对象则执行回调函数
const localStorageErrCallBack = (e, callBackObj) => {
    if (callBackObj && callBackObj.errName.toLowerCase().toString() === e.name.toLowerCase().toString() && callBackObj.fn) {
        callBackObj.fn()
    }
}

// 从localStorage取值
export function getLocalStorage(key, callBackObj) {
    let value = ''
    try {
        value = window.localStorage.getItem(key)
    } catch (e) {
        localStorageErrHandler(e)
        localStorageErrCallBack(e, callBackObj)
    }
    return value
}

// 给localStorage赋值
export function setLocalStorage(key, value, callBackObj) {
    try {
        window.localStorage.setItem(key, value)
    } catch (e) {
        localStorageErrHandler(e)
        localStorageErrCallBack(e, callBackObj)
    }
}

// 给localStorage去值
export function removeLocalStorage(key, callBackObj) {
    try {
        window.localStorage.removeItem(key)
    } catch (e) {
        localStorageErrHandler(e)
        localStorageErrCallBack(e, callBackObj)
    }
}

// 转义 - 防XSS攻击
export function escapeHtml(str = '') {
    return str.replace(/&/g, '&amp;').replace(/\//g, '&#x2F;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

// 反转义
export function unescapeHtml(str = '') {
    return str.replace(/&amp;/g, '&').replace(/&#x2F;/g, '/').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, '\'')
}

/**
 * 浏览器窗口resize事件回调，调整窗口缩放
 * @param docWidth: 浏览器窗口宽度
 * @param docHeight: 浏览器窗口高度
 */
export function windowResize(docWidth, docHeight) {
    const designWidth = 1920
        // const designHeight = 1080
    let docScale = docHeight / docWidth
    let els = document.querySelectorAll('body')
    let scale = docWidth / designWidth
        // let scaleX = docWidth / designWidth
        // let scaleY = docHeight / designHeight
    convertArray(els).forEach(function(el) {
        extend(el.style, {
            width: designWidth + 'px',
            height: (docScale * designWidth) + 'px',
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: '0 0',
            webkitTransformOrigin: '0 0',
            transform: 'scale(' + scale + ')',
            webkitTransform: 'scale(' + scale + ')',
            overflow: 'auto',
            webkitOverflowScrolling: 'touch'
        })
    })
}

function convertArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike, 0)
}

function extend() {
    var args = Array.prototype.slice.call(arguments, 0)
    return args.reduce(function(prev, now) {
        for (var key in now) {
            if (now.hasOwnProperty && now.hasOwnProperty(key)) {
                prev[key] = now[key]
            }
        }
        return prev
    })
}

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
const _delay = restArguments(function(func, wait, args) {
    return setTimeout(function() {
        return func.apply(null, args)
    }, wait)
})

// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex
    return function() {
        let length = Math.max(arguments.length - startIndex, 0)
        let rest = Array(length)
        let index = 0
        for (; index < length; index++) {
            rest[index] = arguments[index + startIndex]
        }
        switch (startIndex) {
            case 0:
                return func.call(this, rest)
            case 1:
                return func.call(this, arguments[0], rest)
            case 2:
                return func.call(this, arguments[0], arguments[1], rest)
        }
        var args = Array(startIndex + 1)
        for (index = 0; index < startIndex; index++) {
            args[index] = arguments[index]
        }
        args[startIndex] = rest
        return func.apply(this, args)
    }
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
    var timeout, result

    var later = function(context, args) {
        timeout = null
        if (args) result = func.apply(context, args)
    }

    var debounced = restArguments(function(args) {
        if (timeout) clearTimeout(timeout)
        if (immediate) {
            var callNow = !timeout
            timeout = setTimeout(later, wait)
            if (callNow) result = func.apply(this, args)
        } else {
            timeout = _delay(later, wait, this, args)
        }

        return result
    })

    debounced.cancel = function() {
        clearTimeout(timeout)
        timeout = null
    }

    return debounced
}

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
export function throttle(func, wait, options) {
    let timeout, context, args, result
    let previous = 0
    if (!options) options = {}

    var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime()
        timeout = null
        result = func.apply(context, args)
        if (!timeout) context = args = null
    }

    var throttled = function() {
        var now = new Date().getTime()
        if (!previous && options.leading === false) previous = now
        var remaining = wait - (now - previous)
        context = this
        args = arguments
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            previous = now
            result = func.apply(context, args)
            if (!timeout) context = args = null
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining)
        }
        return result
    }

    throttled.cancel = function() {
        clearTimeout(timeout)
        previous = 0
        timeout = context = args = null
    }

    return throttled
}

export default new Util()
