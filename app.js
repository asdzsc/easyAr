// app.js
App({
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                wx.request({
                    url: "https://api-hmugo-web.itheima.net/api/public/v1/users/wxlogin",
                    data: res.code,
                    methods: "POST",
                    success(result) {
                        // console.log(result)
                    }
                })
            }
        })
    },
    // globalData: {
    //     userInfo: null
    // }
})