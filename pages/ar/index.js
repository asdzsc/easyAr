import { CrsClient } from "./crsClient";
import { CryptoJS } from "./CryptoJS";

const systemInfo = wx.getSystemInfoSync();

const SELECT_TYPE = {
    NONE: 0,
    IMAGE: 1,
};

Page({
    data: {
        showOverlay: true,
        showSelect: false,
        SELECT_TYPE: SELECT_TYPE,
        selectType: 0,

        //CRS配置
        config: {
            apiKey: 'f737ef46a5c50b1bdee2c0d0c0e567f9', // EasyAR开发中心 - API KEY - API Key
            apiSecret: '45816f4ad13a49dd96a35018396f913c9e22487d71f3aa9b2e045335e70d86b9', // EasyAR开发中心 - API KEY - API Secret
            crsAppId: 'a7ff35a0f71602b0f76c5b21a7e08b6a', // EasyAR开发中心 - 云服务 - 云识别管理 - 云识别库信息 - CRS AppId
            token: '',
            clientHost: 'https://cn1-crs.easyar.com:8443', //服务器一般不变
            jpegQuality: 0.7, //JPEG压缩质量，建议不低于70%
            minInterval: 1000, //最短的两次CRS请求间隔
            // https://29272e0057dbee983f257f5b4b8d7796.cn1.crs.easyar.com:8443
        },
        //识别到这个数组中的ID就触发内容
        targetIds: [
            // "TODO 云识别管理 - 某个图库 - 识别图 - 某个识别图的ID",
            // "f15d6000-6be0-4938-a750-df7060591a6b",
            'f15d6000-6be0-4938-a750-df7060591a6b'
        ],

        showLoading: false,
        showLoadingText: "",
    },

    /** @type {CameraFrameListener} 相机帧回调 */
    listener: undefined,
    /** @type {HTMLCanvasElement} canvas对象 */
    canvas: undefined,

    /** @type {boolean} 是否需要持续识别，在点击“识别体验”之后和识别成功之前为true */
    runningCrs: undefined,
    /** @type {boolean} 当前是否正在进行CRS请求 */
    busy: undefined,
    /** @type {CrsClient} 负责发起CRS请求的对象 */
    crsClient: undefined,
    /** @type {number} 最后一次CRS请求的事件，用于判断是否满足最短请求间隔 */
    last: undefined,

    onLoad: function() {},
    onReady: function() {
        if (systemInfo.platform === "devtools") { //开发工具不会触发initdone事件，于是在onReady手动触发
            this.onCameraInit();
        }

        // 获取token
        this.queryToken().then(msg => {
            this.data.config.token = msg.result.token;
        }).catch(err => {
            console.info(err);
        });
    },

    showLoading(text) {
        this.setData({
            showLoading: true,
            showLoadingText: text,
        });
    },
    hideLoading() {
        this.setData({
            showLoading: false,
        });
    },

    //图像识别部分：

    onShow: function() {
        if (this.listener) this.listener.start(); //页面隐藏时相机帧的监听会自动停止，但恢复展示时不会自动启动，这里手动启动
    },

    onCameraInit: function() {
        //找到canvas对象
        const query = wx.createSelectorQuery();
        query.select('#capture')
            .fields({ node: true })
            .exec((res) => {
                const canvas = res[0].node;
                //设置canvas内部尺寸为480*640，frame-size="medium"的设置下相机帧大多是480*640
                canvas.width = 480;
                canvas.height = 640;
                this.canvas = canvas;

                this.crsClient = new CrsClient(this.data.config, this.canvas);
                //开始监听相机帧
                let cameraContext = wx.createCameraContext();

                this.listener = cameraContext.onCameraFrame(frame => {
                    console.log(frame);
                    if (!this.canvas) return;
                    let canvas = this.canvas;
                    //如果尺寸不匹配，就修改canvas尺寸以适应相机帧
                    if (canvas.width !== frame.width || canvas.height !== frame.height) {
                        canvas.width = frame.width;
                        canvas.height = frame.height;
                    }
                    this.queryImage(frame);
                })

                this.listener.start();
            });
    },

    queryImage: function(frame) {
        if (!this.runningCrs || this.busy || !this.crsClient) return;

        //最短的两次CRS请求间隔
        let now = new Date().getTime();
        if (this.last && (now - this.last < this.data.config.minInterval)) return;
        this.last = now;

        this.busy = true; //如果正在进行CRS请求，就不允许再次请求

        this.crsClient.queryImage(frame).then(res => {
            if (!this.runningCrs) return; //避免在停止后仍然触发
            let result = res && res.result;
            if (!result) return;

            if (result.target) {
                console.log("识别成功", result.target.targetId);
                this.runningCrs = false;
                this.hideLoading();

                // todo: 解析meta中的信息，触发业务逻辑

                //如果待触发的id列表中存在识别到的这个id，就触发
                if (this.data.targetIds.find(targetId => targetId === result.target.targetId)) {
                    this.onResult(result.target);
                }
            } else {
                console.log("识别失败", result.message);
            }
            this.busy = false;
        }).catch(e => {
            this.busy = false;
            console.log(e);
        }); //小程序iOS端不支持finally，所以在then和catch里分别设置busy = false
    },

    onResult: function(target) {
        console.log("触发内容!");
        if (target.meta) {
            console.log("meta base64:", target.meta);
        }
        this.setData({
            showOverlay: false,
            showContent: true,
            selectType: SELECT_TYPE.IMAGE,
        });
    },

    //界面：

    back: function() {
        this.runningCrs = false;
        this.setData({
            showOverlay: true,
            showContent: false,
            selectType: SELECT_TYPE.NONE,
        });
        this.hideLoading();
    },

    // 直接体验
    experience: function() {
        this.setData({
            showOverlay: false,
            showContent: true,
            selectType: SELECT_TYPE.IMAGE,
        });
    },

    scan: function() {
        this.runningCrs = true;
        this.setData({
            showOverlay: false,
            showContent: false,
            selectType: SELECT_TYPE.NONE,
        });
        this.showLoading("识别中");
    },

    download: function() {
        wx.saveImageToPhotosAlbum({
            filePath: "/images/experience@2x.png",
            success: res => {
                wx.showToast({ title: "已保存到相册", icon: "none" });
            },
            fail: res => {
                wx.showToast({ title: "保存失败", icon: "none" });
            },
        });
    },

    selectContent: function(e) {
        this.setData({
            selectType: e.currentTarget.dataset.contenttype,
        });
    },

    /**
     * 生成token
     */
    queryToken: function() {
        const obj = {
            'apiKey': this.data.config.apiKey,
            'expires': 86400,
            'timestamp': Date.now(),
            'acl': `[{"service":"ecs:crs","effect":"Allow","resource":["${this.data.config.crsAppId}"],"permission":["READ","WRITE"]}]`
        };
        const str = Object.keys(obj).sort().map(k => k + obj[k]).join('');
        obj.signature = CryptoJS.SHA256(str + this.data.config.apiSecret, '').toString();

        return new Promise((resolve, reject) => {
            wx.request({
                url: 'https://uac.easyar.com/token/v2',
                method: 'post',
                data: obj,
                header: {
                    'content-type': 'application/json'
                },
                success: res => {
                    resolve(res.data)
                        // console.log(res);
                },
                fail: err => reject(err),
            });
        });
    },
});