Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: [{
            id: 0,
            value: "成就勋章",
            isActive: true
        }, {
            id: 1,
            value: "景点勋章",
            isActive: false
        }, ],
        currentTab: 0, //默认勋章
        showSwiper: true, //展示缩略图轮播
        //轮播图
        swiperCurrent: 0, //默认缩略图第一张
        slider: [{
                id: 0,
                picUrl: 'https://alifei01.cfp.cn/creative/vcg/800/new/VCG211363439424.jpg'
            },
            {
                id: 1,
                picUrl: 'https://tenfei04.cfp.cn/creative/vcg/800/new/VCG211359631262.jpg'
            },
            {
                id: 2,
                picUrl: 'https://alifei04.cfp.cn/creative/vcg/800/new/VCG211356080686.jpg'
            },
            {
                id: 3,
                picUrl: 'https://alifei05.cfp.cn/creative/vcg/800/new/VCG211356100950.jpg'
            },
            {
                id: 4,
                picUrl: 'https://tenfei05.cfp.cn/creative/vcg/800/new/VCG211358048991.jpg'
            },
            {
                id: 5,
                picUrl: 'https://tenfei04.cfp.cn/creative/vcg/800/new/VCG211356638039.jpg'
            },
        ],
        circular: true,
    },
    // 上面勋章切换
    handleBindItemTap(e) {
        // 1 获取被点击的标题索引
        const {
            index
        } = e.detail;
        // 2 修改源数组
        let {
            tabs
        } = this.data;
        tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
        // 3 赋值到data中
        this.setData({
            tabs
        })
    },
    // 下面tab切换
    clickTab(e) {
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current,
                showSwiper: true
            })
        }
    },
    handleShowSwiper(e) {
        this.setData({
            showSwiper: false,
            swiperCurrent: e.currentTarget.dataset.index
        })
    },
    //轮播图的切换事件 
    swiperChange(e) {
        // console.log(e.detail.current);
        //只要把切换后当前的index传给<swiper>组件的current属性即可 
        this.setData({
            swiperCurrent: e.detail.current
        })
    },
    dotsChange(e) {
        // console.log(e.detail.current);
        //只要把切换后当前的index传给<swiper>组件的current属性即可 
        this.setData({
            dotsCurrent: e.detail.current
        })
    },
    //点击指示点切换 
    chuangEvent(e) {
        this.setData({
            swiperCurrent: e.currentTarget.id
        })
    },
    chuangEvents(e) {
        this.setData({
            dotsCurrent: e.currentTarget.id
        })
    },
    handleDownload(e) {
        if (this.data.slider[0].picUrl) {
            this.data.slider = this.data.slider.map(x => {
                return x.picUrl
            })
        }
        wx.previewImage({
            current: this.data.slider[e.target.dataset.index],
            urls: this.data.slider
        })
    }
})