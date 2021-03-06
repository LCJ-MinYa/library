//index.js
const app = getApp()
const moment = require('moment');

Page({
    data: {
        hasMore: true,
        loadMoreState: 0, //0.加载完成 1.加载中 2.没有更多了
        bookList: [],
        pageIndex: 1,
        pageSize: 10
    },

    onLoad() {
        this.getBookList();
        console.log(moment().format('YYYY-MM-DD'));
    },

    reloadRequest() {
        this.data.pageIndex = 1;
        this.getBookList();
    },

    goAddBook() {
        if (app.getUserInfo()) {
            wx.navigateTo({ url: '/pages/addBook/index' });
        } else {
            app.toast('请先登陆才能发表您的书评哦~');
        }
    },

    getBookList() {
        wx.showLoading({
            title: '加载中...',
        });

        const db = wx.cloud.database();
        db.collection('book').count().then(res => {
            let count = res.total;
            db.collection('book')
                .skip((this.data.pageIndex - 1) * this.data.pageSize)
                .limit(this.data.pageSize)
                .orderBy('createTime', 'desc')
                .get()
                .then(result => {
                    wx.hideLoading();

                    for (let i = 0; i < result.data.length; i++) {
                        result.data[i].createTime = moment(result.data[i].createTime).format('YYYY-MM-DD HH:mm:ss');
                    }

                    if (this.data.pageIndex == 1) {
                        this.setData({
                            bookList: result.data
                        })
                    } else {
                        this.setData({
                            bookList: this.data.bookList.concat(result.data)
                        })
                    }
                    this.dealLoadMore(count >= this.data.pageIndex * this.data.pageSize);
                    this.data.pageIndex++;
                });
        })
    },

    loadMore() {
        if (!this.data.hasMore || this.data.loadMoreState == 1 || this.data.loadMoreState == 2) {
            return;
        }
        console.log('loadMore');

        this.data.loadMoreState = 1;
        this.getBookList();
    },

    dealLoadMore(hasMore) {
        console.log('dealLoadMore', hasMore);
        if (hasMore) {
            this.setData({
                hasMore: true,
                loadMoreState: 0
            })
        } else {
            this.setData({
                hasMore: false,
                loadMoreState: 2
            })
        }
    }
})
