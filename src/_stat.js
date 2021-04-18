/*
  * @description 页面埋点统计（停留时间）
  *
  * 当浏览器进入页面时，触发onload
  * 当关闭浏览器时，执行顺序 onbeforeunload--> visibilitychange --> onunload
  * 每一次进入页面 entry_time  记当前时间戳，初始化时记一次当前时间戳
  * 每一次隐藏页面 hidden_time 记当前时间戳， onbeforeunload时再记一次当前时间戳
  * hidden_time[i] - entry_time[i] 位每次停留的时间，求和为总的停留时间。
  *
  *
  * 关闭窗口请求参考链接：https://usefulangle.com/post/62/javascript-send-data-to-server-on-page-exit-reload-redirect
  *
  * 1. 可用ajax 同步请求，但是对用户不友好
  * 2. 可用ajax 异步请求，后端可能需要配置 ignore_user_abort
  * 3. 可用 navigator.sendBeacon，不兼容ie。（推荐这个）
  *
  * trackCb 接收的数据
  * {
  *   split_time,  // 页面停留时间 [1400, 1200, 1000]
  *   stay_time,   // 页面总的停留时间 3600
  *
  * }
  *
  * @example
  * new PageView({trackCb: fn})
  */
function PageView(option) {
  // 计算页面显示时的时间戳
  this.entry_time = [],
    // 计算页面隐藏时的时间戳
    this.hidden_time = [],
    // 停留时间  总的停留时间 = 停留时间累加
    this.split_time = [],
    // 总的停留时间
    this.stay_time = 0,

    this.trackCb = option && option.trackCb ? option.trackCb : null,
  // 初始化
  this.init();
}


// 页面 进入
PageView.prototype.countEntryTime = function () {
  this.entry_time.push(new Date().getTime());
};

// 页面 隐藏
PageView.prototype.countHiddenTime = function () {
  this.hidden_time.push(new Date().getTime());
};

// 组装数据
PageView.prototype.getAnalysisData = function () {
  let aEntryTime = this.entry_time,
    aHiddenTime = this.hidden_time;

  // 计算停留时间
  for (let i = 0; i < aHiddenTime.length; i++) {
    let t = +((aHiddenTime[i] - aEntryTime[i])).toFixed()
    this.split_time.push(t);
  }

  // 计算停留总时长
  let nStayTime = 0;
  for (let i = 0; i < this.split_time.length; i++) {
    nStayTime += this.split_time[i];
  };
  nStayTime = +nStayTime.toFixed();
  this.stay_time = nStayTime;

  return {
    split_time: this.split_time,
    stay_time: this.stay_time,
    page: this.page
  }
};

// 关闭或刷新页面数据处理 回调页面逻辑
PageView.prototype.setAnalysis = function () {
  let data = this.getAnalysisData();
  if (data.stay_time) {
    this.trackCb && this.trackCb(data);
  } else {
    console.error('停留时间计算错误');
  }
};

// 关闭或刷新页面
PageView.prototype.initCloseWindow = function () {
  let self = this;
  // onbeforeunload onunload https://stackoverflow.com/questions/6895564/difference-between-onbeforeunload-and-onunload

  this.addEventListener(window, 'beforeunload', function (event) {
    // 关闭或刷新时 记一次hidden时间
    self.countHiddenTime();
    self.setAnalysis();
  }, false);
};

/**
 * @description 页面 显示隐藏
 * 参考: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
 */
PageView.prototype.initChangeVisible = function () {
  let self = this;
  function handleVisibilityChange() {
    // 页面隐藏计算时间
    if (document[hidden]) {
      self.countHiddenTime();
    } else {
      // 页面显示统计时间
      self.countEntryTime();
    }
  }

  // 设置隐藏属性和改变可见属性的事件的名称
  var hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  // 兼容 addEventListener
  this.addEventListener(document, visibilityChange, handleVisibilityChange, false);

};

// 监听事件 兼容性
PageView.prototype.addEventListener = function (ele, event, fn, bubble) {
  if (ele.addEventListener) {
    ele.addEventListener(event, fn, bubble);
  } else {
    ele.attachEvent('on' + event, fn);
  }
};

PageView.prototype.init = function () {
  // 第一次进入页面时 记entry时间
  this.countEntryTime();
  // 初始化 页面隐藏时间
  this.initChangeVisible();
  // 初始化 页面关闭或刷新事件
  this.initCloseWindow();
};

var pageView = new PageView({trackCb: null});


/**
 * @description 页面埋点
 *
 * example:
 * var st = stat(option1);
 * st(option2);
 *
 * option1传项目（和页面）公共参数
 * option2传当前触发参数
 *
 * option1 和 option2 结构相同、option2可覆盖option1
 *
 * {
 *   base: {},
 *   yc_log: {},
 *   lg_vl: {}
 * }
 */


function stat(option) {
  // 容错机制
  if (!option) option = {};

  // 私有参数
  var lg_vl = {
    url: window.location.href,
    ref: document.referrer
  };
  if (option.lg_vl) oBjectAssign(lg_vl, option.lg_vl);

  // 共有参数
  var yc_log = {
    agt: navigator.userAgent,    // 浏览器信息
    lg_vl: lg_vl
  };
  if (option.yc_log) oBjectAssign(yc_log, option.yc_log);


  // 基本参数
  var oData = {
    ltype: '',     // R 访问类型
    yc_log: yc_log
  };
  if (option.base) oBjectAssign(oData, option.base);

  return function (option2) {
    var data = JSON.parse(JSON.stringify(oData));
    if (option2.base) oBjectAssign(data, option2.base);
    if (option2.yc_log) oBjectAssign(data.yc_log, option2.yc_log);
    if (option2.lg_vl) oBjectAssign(data.yc_log.lg_vl, option2.lg_vl);

    data.yc_log.itime = new Date().getTime(); // 日志发生时间

    // console.log('data', JSON.parse(JSON.stringify(data)));

    // tpye 停留时长
    if (data.ltype === 'tlsc') {
      pageView.trackCb = function(oTime) {
        data.yc_log.itime = new Date().getTime();
        data.yc_log.lg_vl.tlsc_dur = oTime.stay_time;  // 停留时长时间字段
        httpAjaxGet('http://www.baidu.com', data);
      }
    } else {
      // tpye 浏览、点击
      httpAjaxGet('http://www.baidu.com', data);
    }
  }
}

/**
 * @description 合并对象到 arg[0]
 *
 * @param {Object}  obj1
 * @param {Object}  obj2
 *
 */
function oBjectAssign(obj1, obj2) {
  for (var key in obj2) {
    obj1[key] = obj2[key];
  }
};

/**
 * @description 封装ajax get, 兼容ie8
 *
 * @param {String}  url 请求url
 * @param {Object} data 请求参数
 * @param {Function} cb 成功回调
 *
 */
function httpAjaxGet(url, data, cb) {
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

/**
 * @description 设置url参数 data2str params
 *
 * @param {Object} data 参数
 * @returns {String} 返回 qarams string
 */
function parseParams(data) {
  var data2str = '';
  for (var key in data) {
    var value = data[key];
    if (Object.prototype.toString.call(data[key]) === '[object Object]') {
      value = encodeURIComponent(JSON.stringify(value));
    }
    data2str += key + '=' + value + '&';
  }
  data2str = data2str && data2str.slice(0, -1);
  return data2str;
};


export  {
  stat
}


