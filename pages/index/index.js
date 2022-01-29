//Page Object
// 引入promise方法在小程序中路径要补全
import {
    request
} from '../../utils/request.js'


Page({
    data: {
        swiperList: [],
        showProgress: true,
        showTask: false,

        showModal: false,
        userInfo: {},
        hasUserInfo: false,
        canIUseGetUserProfile: false,

    },
    //options(Object)
    onLoad(options) {
        this.getSwiperList();
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            })
        }
    },
    onShow() {
        const userInfo = wx.getStorageSync("userInfo");
        if (userInfo) {
            this.setData({
                hasUserInfo: true,
                userInfo
            })
        }

    },
    async getSwiperList() {
        request({
            url: "/home/swiperdata",
        }).then(result => {
            this.setData({
                swiperList: result
            })

        })
    },
    //  进度条加载完成
    handleStart() {
        this.setData({
            showProgress: false
        })
    },
    //  打开任务弹窗
    handleOpenTask() {
        const userInfo = wx.getStorageSync("userInfo");
        if (userInfo !== '') {
            this.setData({
                showTask: true
            })
        } else {
            this.setData({
                showModal: true
            })
        }

    },
    //  关闭任务弹窗
    handleCloseTask() {
        this.setData({
            showTask: false
        })
    },
    // 跳转到ar页面
    handleToSence() {
        wx.navigateTo({
            url: '../ar/index'
        })
    },
    // 
    handleToMedal() {
        wx.navigateTo({
            url: '../medal/index'
        })
    },
    // 获取用户信息
    getUserProfile() {
        wx.getUserProfile({
            desc: '用于完成任务,兑换奖品',
            success: (res) => {
                wx.setStorageSync("userInfo", res.userInfo);
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        })
    },
    modalConfirm() {
        this.setData({
            showModal: false
        })
        this.getUserProfile()
    },
    modalCancel() {
        this.setData({
            showModal: false
        })
    },
    handleCode() {
        wx.scanCode({
            onlyFromCamera: true,
            success(res) {
                console.log(res)
                wx.navigateTo({
                    url: res.result
                })
            }
        })
    },
});