let { TP, Exposure, Click } = window['x-track']

// 停留时长
let tp = new TP({
  trackCb: (oTime) => {
    localStorage.setItem('x', JSON.stringify(oTime))
    httpAjaxGet('http://www.baidu.com', oTime)
  }
})

// 曝光埋点
let exposure = new Exposure({
  trackCb: (val) => {
    console.log('exposure track', val)
  }
})

document.querySelectorAll('.item').forEach(v => {
  exposure.add(v)
})

// 点击埋点
let click = new Click({
  trackCb: (val) => {
    console.log('click track', val)
  }
})
document.querySelectorAll('.item').forEach(v => {
  click.add(v)
})


/**
 * @description 封装ajax get, 兼容ie8
 *
 * @param {String}  url 请求url
 * @param {Object} data 请求参数
 * @param {Function} cb 成功回调
 *
 */
function httpAjaxGet(url, data, cb) {
  if (navigator && navigator.sendBeacon) {
    // post
    navigator.sendBeacon(url, data);
    cb && cb()
    return
  }

  var xmlhttp = null;
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  };

  // get params string
  var data2str = parseParams(data);

  if (xmlhttp != null) {
    xmlhttp.open("GET", url + '?' + data2str, false); //第一个参数指明访问方式，第二次参数是目标url，第三个参数是“是否异步”，true表示异步，false表示同步
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var d = xmlhttp.responseText;
        // 处理返回结果
        cb && cb();
      }
    }
    xmlhttp.send();
  }
}

