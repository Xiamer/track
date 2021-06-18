
# 埋点 track
前端页面埋点，点击、曝光、停留时长，支持单页面和多页面。

## 安装

### YARN
```shell
$ yarn add x-track
```
### NPM

```shell
$ npm install x-track --save
```
### CDN

目前可以通过[unpkg.com/x-track](https://unpkg.com/x-track/)获取到最新版本的资源，在页面上使用 script 标签直接引入文件即可开始使用

```html
<script src="https://unpkg.com/x-track/dist/x-track.min.js"></script>
```

或者

```html
<script src="https://cdn.jsdelivr.net/npm/x-track/dist/x-track.min.js"></script>
```

> 建议使用 CDN 引入 x-track 的用户在链接地址上锁定版本，以免将来 x-track 升级时受到非兼容性更新的影响。锁定版本的方法请查看 [unpkg.com](https://unpkg.com/) or [jsdelivr.com](https://www.jsdelivr.com/)。

## 常规用法

```js
import { Click, TP, Exposure } from "x-track"

// 点击埋点
let click = new Click({
  trackCb: (val) => {
    console.log('click track', val)
  }
})
document.querySelectorAll('.item').forEach(v => {
  click.add(v)
})

// 停留时长
let tp = new TP({
  trackCb: (oTime) => {
    // localStorage.setItem('tb time', JSON.stringify(oTime))
    // httpAjaxGet('http://www.baidu.com', oTime)
  }
})

// 曝光埋点
let exposure = new Exposure({
  trackCb: (val) => {
    console.log('exposure track', val)
  }
})

```
## VUE用法

参考 `/example/vue.html`



## 优化参考文章（未完成）

* [字节-无埋点系统](https://mp.weixin.qq.com/s/TcaOUBMBBEGQoQPAjYXb_Q)
* [政采云-无埋点系统](https://mp.weixin.qq.com/s/I-ttIv13UDSeKMIKyXqGQA)
