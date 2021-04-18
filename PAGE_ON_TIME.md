<!--
 * @Author: xiaoguang_10@qq.com
 * @LastEditors: xiaoguang_10@qq.com
 * @Date: 2021-04-08 11:44:12
 * @LastEditTime: 2021-04-08 20:16:37
-->
# title 如何精确统计页面停留时长 (多页面)

## 背景

页面停留时间（Time on Page）简称 Tp，是网站分析中很常见的一个指标，用于反映用户在某些页面上停留时间的长短，传统的Tp统计方法会存在一定的统计盲区，比如无法监控单页应用，没有考虑用户切换Tab、最小化窗口等操作场景。 基于上述背景，重新调研和实现了精确统计页面停留时长的方案，需要 兼容单页应用和多页应用，并且不耦合或入侵业务代码。

## 分析

我们可以把一个页面生命周期抽象为三个动作： 「进入」、「活跃状态切换」、「离开」

| 动作         |                                触发行为                                |
| :----------- | :--------------------------------------------------------------------: |
| 进入         |                首次加载、页面跳转、刷新、浏览器前进后退                |
| 活跃状态切换 | 页面失去焦点 / 获取焦点、切换窗口最小化、切换浏览器tab、电脑睡眠和唤起 |
| 离开         |                 关闭窗口、页面跳转、刷新、浏览器前后退                 |


## 如何监听页面的进入和离开

### 普通页面（多页面）
首次加载、页面关闭、刷新 等操作都可以通过 `window.onload` 和 `window.onbeforeunload` 事件来监听页面进入和离开，页面是否显示可以通过 pageshow 和 pagehide 处理。

```code 
beforeunload / load
pageshow / pagehide
```

#### 单页面
1. 监听路由变化 (browserHistory / hashHistory)
路由的变化本质都会调用 History.pushState() 或 History.replaceState() ，能监听到这两个事件就能知道。通过 popstate 事件能解决一半问题，因为 popstate 只会在浏览器前进后退的时候触发，当调用 history.pushState() or history.replaceState() 的时候并不会触发。
2. 判断变化的URL是否为不同页面 

browserHistory方法： 运行时重写 history.pushState 和 history.replaceState 方法

```js
let _wr =  function (type) {  
  let orig = window.history[type]
  return  function () {
    let rv = orig.apply(this, arguments)
    let e = new Event(type.toLowerCase())
    e.arguments = arguments
    window.dispatchEvent(e)
    return rv
  }
}
window.history.pushState = _wr('pushState')  
window.history.replaceState = _wr('replaceState')
window.addEventListener('pushstate',  function (event) {})  
window.addEventListener('replacestate',  function (event) {})
```

hashHistory方法： 是基于 hash 的变化，hash 的变化可以通过 hashchange 来监听。


### 对于页面进入和离开相关事件整理

|                      | 首次加载 | 关闭窗口 | 刷新  | 页面跳转 | 浏览器前进后退 |
| :------------------- | :------: | :------: | :---: | :------: | :------------: |  |
| 单页(browserHistory) | load | beforeunload | load/beforeunload| pushstate / replacestate | popstate|
| 单页(hashHistory)    | load | beforeunload | load/ beforeunload| hashchange | hashchange|
| 多页                 |load | beforeunload | lood/ beforeunload|load/beforeunload | load/beforeunload|

