// components/Tabs/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabs: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    handleItemTap(e) {
      // console.log(e);
      // 获取点击索引
      const {
        index
      } = e.currentTarget.dataset
      // 触发父组件的事件 自定义
      this.triggerEvent("tabItemChange", {
        index
      })
    }
  }
})