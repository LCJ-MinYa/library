const app = getApp()

Page({
    data: {
        userInfo: null
    },

    onLoad() {
        this.updateUserInfo();
    },

    updateUserInfo() {
        try {
            let userInfo = JSON.parse(wx.getStorageSync('userInfo'));
            this.setData({
                userInfo: userInfo
            })
        } catch (err) { }
    },

    getUserInfoFun() {
        if (this.data.userInfo) {
            return;
        }
        wx.getUserInfo({
            success: (res => {
                this.agreeAuth(res.userInfo);
            }),
            fail: (err) => {
                this.refusedAuth();
            }
        });
    },

    //拒绝授权处理
    refusedAuth() {
        wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权,将无法正常显示个人信息,点击确定重新获取授权。',
            success: (res => {
                if (!res.confirm) {
                    return;
                }
                wx.openSetting({
                    success: (res) => {
                        //如果用户重新同意了授权登录
                        if (res.authSetting["scope.userInfo"] || res.authSetting["scope.userLocation"]) {
                            wx.getUserInfo({
                                success: (res => {
                                    this.agreeAuth(res.userInfo);
                                })
                            })
                        }
                    }
                })
            })
        })
    },

    agreeAuth(userInfo) {
        wx.showLoading({
            title: '加载中...',
        });
        this.getOpenid().then(res => {
            userInfo.openid = res.result.openid;
            this.onAddUser(userInfo);

            wx.setStorageSync('userInfo', JSON.stringify(userInfo));
            this.updateUserInfo();
            app.toast('登陆成功~');
        })
    },

    getOpenid() {
        return new Promise((resolve, reject) => {
            wx.cloud.callFunction({
                name: 'login',
                data: {},
                success: res => {
                    resolve(res);
                },
                fail: err => {
                    reject(err);
                }
            })
        })
    },

    onAddUser(userInfo) {
        const db = wx.cloud.database();
        db.collection('user').where({
            _openid: userInfo.openid
        }).get({
            success: res => {
                if (res.data.length) {
                    console.log('用户信息已经存储，不需要再存储数据库');
                } else {
                    db.collection('user').add({
                        data: {
                            userInfo
                        },
                        success: res => {
                            console.log(res);
                        },
                        fail: err => {
                            console.log(err);
                        }
                    })
                }
            }
        });
    },

    goAboutUs() {
        wx.navigateTo({ url: '/pages/mine/aboutUs/index' });
    },
})
