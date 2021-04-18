/*
 * @Author: xiaoguang_10@qq.com
 * @LastEditors: xiaoguang_10@qq.com
 * @Date: 2021-04-14 09:54:26
 * @LastEditTime: 2021-04-14 10:16:32
 */
export default class Click {
  constructor(option = {}) {
    this.trackCb = option && option.trackCb ? option.trackCb : function () { };
  }
  /**
   * 添加元素
   * @param {Element} el 
   */
  add(el) {
    let trackData = null;
    try {
      trackData = JSON.parse(el.getAttribute('click-data'));
    } catch (e) {
      trackData = null;
      console.error('click 埋点数据格式异常', e);
    }
    if (!trackData) return;
    el.addEventListener('click', () => {
      this.track(trackData)
    })
  }

  /**
   * 埋点上报
   */
  track(trackData) {
    this.trackCb(trackData)
  }
}