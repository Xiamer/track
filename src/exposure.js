/**
 * 曝光 track
 * 
 * 卡片必须完全的出现在浏览器可视化区域内。
 * 商品必须在可视化区域内停留 5s 以上。 (5s一屏出现的商品并不多，暂不考虑 pool 处理)
 * 进入页面到离开页面相同的商品只进行一次曝光。
 * 
 */

import 'intersection-observer'

// 节流时间调整，默认100ms
IntersectionObserver.prototype['THROTTLE_TIMEOUT'] = 300

export class Exposure {
  constructor(option = {}) {
    this._observer = null

    this.trackCb = option && option.trackCb ? option.trackCb : function() {};
    // IntersectionObserver option
    this.observerOpt =  Object.assign(
      {
        root: null,
        rootMargin: '0px',
        threshold: 1 // 元素出现面积，0 - 1，这里当元素出现一半以上则进行曝光
      },
      option.observerOpt || {}
    )
    this.init()
  }

  /**
   * 初始化
   */
  init() {
    const self = this
    let timer = {}; //增加定时器对象

    // 实例化监听
    this._observer = new IntersectionObserver(function(entries, observer) {
      entries.forEach((entry) => {
        // 获取参数
        let trackData = null;
        let trackId = entry.target.getAttribute('exposure-id')
        try {
          trackData = JSON.parse(entry.target.getAttribute('exposure-data'));
        } catch (e) {
          trackData = null;
          console.error('exposure 埋点数据格式异常', e);
        }
        //没有埋点数据取消上报
        if (!trackData) {
          observer.unobserve(entry.target);
          return;
        }

        if (entry.isIntersecting) {
          timer[trackId] = setTimeout(function() {
            //上报埋点信息
            self.track(trackData)
            // 取消监听
            observer.unobserve(entry.target);
            timer[trackId] = null;
          }, 5000);
      } else {
        if (timer[trackId]) {
          clearTimeout(timer[trackId]);
          timer[trackId] = null;
        }
      }
      })
    },
   self.observerOpt)
  }

  /**
   * 元素添加监听
   * @param {Element} ele 
   */
  add(ele) {
    this._observer && this._observer.observe(ele)
  }
  /**
   * 元素移除监听
   * @param {Element} ele 
   */
   remove(ele) {
    this._observer && this._observer.unobserve(ele)
  }

  /**
   * 埋点上报
   */
  track(trackData) {
    this.trackCb(trackData)
  }
}