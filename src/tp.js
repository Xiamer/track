/** 
  * 
  * @description 页面埋点统计（停留时间）
  * tp time on page
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
  * 3. 可用 navigator.sendBeacon(post)，不兼容ie。（推荐这个）
  *
  * trackCb track 回调
  * {
  *   split_time,  // 页面停留时间 [1400, 1200, 1000]
  *   stay_time,   // 页面总的停留时间 3600
  * }
  *
  * @example
  * new TP({trackCb: fn})
*/
export class TP {
  constructor(option) {
    // 计算页面显示时的时间戳
    this.entry_time = [];
    // 计算页面隐藏时的时间戳
    this.hidden_time = [];
    // 停留时间  总的停留时间 = 停留时间累加
    this.split_time = [];
    // 总的停留时间
    this.stay_time = 0;
    // 是否触发过TP 埋点 (连续点击a链接跳转，beforeunload 会触发多次)
    this.bTracked = false;
    // track 回调
    this.trackCb = option && option.trackCb ? option.trackCb : function() {};
    // 初始化
    this.init();
  }

  /**
   * 页面 进入
   */
  countEntryTime() {
    this.entry_time.push(new Date().getTime());
  };

  /**
   * 页面 隐藏
   */
  countHiddenTime() {
    this.hidden_time.push(new Date().getTime());
  };

  /**
   * 组装数据
   */
  getAnalysisData() {
    let aEntryTime = this.entry_time,
      aHiddenTime = this.hidden_time;

    // 计算停留时间 
    for (let i = 0; i < aEntryTime.length; i++) {
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
      stay_time: this.stay_time
    }
  };

  /**
   * 关闭或刷新页面数据处理 回调页面逻辑
   */
  sendAnalysis() {
    let data = this.getAnalysisData();
    if (data.stay_time) {
      this.trackCb(data);
    } else {
      console.error('停留时间计算错误');
    }
  }


  /**
   * 单页面 browserHistory、hashHistory 修改时
   */
  initPageChange() {
    window.addEventListener('pushstate', () => {
      this.setTP()
    })
    window.addEventListener('replacestate', () => {
      this.setTP()
    })
    window.addEventListener('popstate', () => {
      this.setTP()
    })
    window.addEventListener('hashchange', () => {
      this.setTP()
    })
  }

  /**
   * set page on time
   */
  setTP() {
    // 关闭、刷新、离开当前页面 记一次hidden时间
    this.countHiddenTime();
    // 发送数据
    this.sendAnalysis();
  }


  /**
   * 关闭或刷新页面
   */
  initCloseWindow() {
    let self = this;
    // onbeforeunload onunload https://stackoverflow.com/questions/6895564/difference-between-onbeforeunload-and-onunload

    this.addEventListener(window, 'beforeunload', function (event) {
      if (self.bTracked === false) {
        self.bTracked = true;
        self.setTP()
      }
    }, false);
  };

  /**
   * @description 页面 显示隐藏
   * 参考: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
   */
  initChangeVisible() {
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

  /**
   * 监听事件 兼容性
   */
  addEventListener(ele, event, fn, bubble) {
    if (ele.addEventListener) {
      ele.addEventListener(event, fn, bubble);
    } else {
      ele.attachEvent('on' + event, fn);
    }
  }

  /**
   * event: pushState replaceState 事件， window没有监听该事件
   */
  initStateEvent() {
    const _wr = function (type) {
      let orig = window.history[type]
      return function () {
        let rv = orig.apply(this, arguments)
        let e = new Event(type.toLowerCase())
        e.arguments = arguments
        window.dispatchEvent(e)
        return rv
      }
    }
    window.history.pushState = _wr('pushState')
    window.history.replaceState = _wr('replaceState')
  }

  /**
   * 初始化
   */
  init() {
    this.initStateEvent();
    // 第一次进入页面时 记entry时间
    this.countEntryTime();
    // 初始化 页面隐藏时间
    this.initChangeVisible();
    // 初始化 页面离开（单页面）
    this.initPageChange();
    // 初始化 页面关闭或刷新事件
    this.initCloseWindow();
  };

}
