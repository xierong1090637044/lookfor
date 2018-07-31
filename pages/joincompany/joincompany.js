// pages/joincompany/joincompany.js
var Bmob = require('../../utils/bmob.js'); 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    display1: 'none', 
    display2: 'none',
    img:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var Diary = Bmob.Object.extend("sucai");
    var query = new Bmob.Query(Diary);
    query.equalTo("title", "joincompany");
    // 查询所有数据
    query.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          that.setData({
            img: object.get('imgs')._url
          })
        }
      },
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**搜索公司 */
  sousuo: function (e) {
    var that = this;
    var inputname = e.detail.value;
    var Diary = Bmob.Object.extend("company");
    var query = new Bmob.Query(Diary);
    query.equalTo("company", inputname);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        if (results.length == 0) {
          that.setData({
            company: results,
            display2: 'block',
            display1: 'none',
          })
        } else {
          that.setData({
            company: results,
            display1: 'block',
            display2: 'none',
          })
        }
      },
    });
  },

  gotocreate: function () {
    wx.navigateTo({
      url: '../company/company'
    })
  },

  shenqingjr: function (e) {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var id = e.currentTarget.dataset.id;

    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", userid);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        if (results == 0) {
          var Diary = Bmob.Object.extend("shenqing");
          var query = new Bmob.Query(Diary);
          query.equalTo("parent", userid);
          // 查询所有数据
          query.find({
            success: function (results) {
              console.log("共查询到 " + results.length + " 条记录");
              if (results.length == 0) {
                var companyid = id;
                var Diary = Bmob.Object.extend("shenqing");
                var Post = Bmob.Object.extend("user_infor");
                var Company = Bmob.Object.extend("company");
                var diary = new Diary();
                var post = new Post();
                post.id = userid;
                diary.set("parent", post);
                var company = new Company();
                company.id = companyid;
                diary.set("parent_com", company);
                diary.save(null, {
                  success: function (result) {
                    wx.showToast({
                      title: '管理员审核通过后，即可加入',
                      icon: 'none',
                      duration: 2000
                    });
                  },
                });
              } else {
                wx.showToast({
                  title: '请勿重复申请',
                  icon: 'none',
                  duration: 1000
                });
              }
            },
          });
        } else {
          wx.showToast({
            title: '您已加入了公司，请先退出后加入',
            icon: 'none',
            duration: 1000
          });
        }
      },
    });

  },
})