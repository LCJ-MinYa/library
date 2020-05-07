const app = getApp()

Page({
    data: {
        title: '',
        content: '',
        disabled: true
    },

    changeTitle(event) {
        this.data.title = event.detail;
        this.submitBtnStatus();
    },

    changeContent(event) {
        this.data.content = event.detail;
        this.submitBtnStatus();
    },

    submitBtnStatus() {
        if (this.data.title && this.data.content) {
            if (this.data.disabled) {
                this.setData({
                    disabled: false
                })
            }
        }
        if (!this.data.title || !this.data.content) {
            if (!this.data.disabled) {
                this.setData({
                    disabled: true
                })
            }
        }
    },

    submitBook() {
        if (!this.data.title || !this.data.content) {
            return;
        }
        if (this.data.content.length < 140) {
            app.toast('字数有点少，怎么能引起共鸣喃，快去多写点吧~');
            return;
        }
        wx.showLoading({
            title: '加载中...',
        });
        const db = wx.cloud.database();
        const userInfo = app.getUserInfo();
        db.collection('book').add({
            data: {
                title: this.data.title,
                content: this.data.content,
                createTime: db.serverDate(),
                avatarUrl: userInfo.avatarUrl,
                nickName: userInfo.nickName
            },
            success: res => {
                app.toast('添加书评成功~');
                setTimeout(() => {
                    let pages = getCurrentPages();
                    let indexPage = pages[pages.length - 2];
                    indexPage.reloadRequest();
                    wx.navigateBack();
                }, 1000);
            },
            fail: err => {
                app.toast('添加失败,错误信息为:' + err);
            }
        });
    },
})
