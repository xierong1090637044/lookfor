// pages/mycompany/mycompany.js
var Bmob = require('../../utils/bmob.js');
Page({

  /*** 页面的初始数据*/
  data: {
    company: '',
    master: '',
    dataid: '',
    userid: '',
    codeurl: '',
    codeqd: '',
    codeqdgr: '',
    form: 'none',
    form1: '',
    modifydisplay: 'none',
    noqiandao: 'none',
    haveqiandao: 'none',
    qiandaomadis: 'none',
    codedis: 'none',
    longitude:'',
    latitude:'',
    people:'',
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    var that = this;
    var userid = wx.getStorageSync('user_id');

    var Diary = Bmob.Object.extend("member_act");
    var query = new Bmob.Query(Diary);
    query.include('parent_com');
    query.equalTo("parent", userid);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        var object = results[0];
        var companid = object.get('parent_com').objectId;
        var longitude = object.get('parent_com').longitude;
        var latitude = object.get('parent_com').latitude;
        var Diary = Bmob.Object.extend("activity");
        var query = new Bmob.Query(Diary);
        query.include('parent');
        query.get(companid, {
          success: function (result) {
            that.getqdmbyid(companid);
            that.getqiandao(companid);
            that.setData({
              company: object.get('parent_com'),
              master: result,
              dataid: '签到码',
              userid: userid,
              latitude: latitude,
              longitude: longitude,
            });
          },
        });
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
    var that = this;

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

  /**得到左边列表的data-id */
  getdataid: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    that.setData({ dataid: id });
  },

  hidden1: function () {
    var that = this;
    that.setData({
      modifydisplay: 'none'
    })
  },

  //退出功能
  goout: function () {
    var that = this;
    var id = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("activity");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", id);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log(results);
        var object = results[0];
        var companyid = object.id;
        console.log(companyid);
        wx.showModal({
          title: '你是活动创建者',
          content: '是否删除该活动',
          confirmText: '删除',
          confirmColor: '#2ca879',
          success: function (res) {
            if (res.confirm) {
              that.deleteallbyid(companyid);
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        });
      },
    });
  },

  //解散当前活动，单次请求50
  deleteallbyid: function (id) {
    wx.showLoading({
      title: '正在删除',
    });
    var userid = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("member_act");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent_com", id);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        var all = results.length;
        var length = parseInt(all / 50) + 1;
        // 循环处理查询到的数据
        for (var i = 0; i < length; i++) {
          var query = new Bmob.Query('member_act');
          query.equalTo("parent_com", id);
          query.find().then(function (todos) {
            return Bmob.Object.destroyAll(todos);
          }).then(function (todos) {
            var query = new Bmob.Query('activity');
            query.equalTo("parent", userid);
            query.find().then(function (todos) {
              return Bmob.Object.destroyAll(todos);
            }).then(function (todos) {
                var query = new Bmob.Query('qiandaoma');
                query.equalTo("parent_com", id);
                query.find().then(function (todos) {
                  return Bmob.Object.destroyAll(todos);
                }).then(function (todos) {
                  var query = new Bmob.Query('bycode');
                  query.equalTo("parent_com", id);
                  query.find().then(function (todos) {
                    return Bmob.Object.destroyAll(todos);
                  }).then(function (todos) {
                    wx.hideLoading();
                    wx.switchTab({
                      url: '../personcenter/personcenter',
                    });
                    setTimeout(function () {
                      wx.showToast({
                        title: '您已删除此次活动',
                        icon: 'none',
                        duration: 1000,
                      })
                    }, 1000)
                  });
                });
              });
          });
        }
      },
    });
  },

  //得到签到码  ”生成“点击
  getcodeimg: function () {
    var that = this;
    var date = new Date();
    var nowtime = date.getDate();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var userid = wx.getStorageSync('user_id');
    var companyid = that.data.company.objectId;
    var latitude = that.data.latitude;
    var longitude = that.data.longitude;

    var master = that.data.master.get('parent').objectId;

    if (master == userid) {
      wx.showModal({
        title: '提示',
        content: '是否生成签到二维码',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: 'https://route.showapi.com/887-1',
              data: {
                showapi_appid: '66939',
                showapi_sign: '8741e2d8bba64bed81f7a27dacd63189',
                content: companyid + '-' + nowtime + h + m + s+'-'+longitude+'-'+latitude,
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                var img = res.data.showapi_res_body.imgUrl;
                wx.setStorageSync('codeimg', img);

                var Diary = Bmob.Object.extend("qiandaoma");
                var User = Bmob.Object.extend("user_infor");
                var Company = Bmob.Object.extend("activity");
                var diary = new Diary();
                var user = new User();
                var company = new Company();
                user.id = userid;
                company.id = companyid;
                diary.set("codeurl", img);
                diary.set('codedata', companyid + '-' + nowtime + h + m + s);
                diary.set('parent', user);
                diary.set('parent_com', company);
                diary.save(null, {
                  success: function (result) {
                    wx.showToast({
                      title: '生成成功',
                      icon: 'none',
                      duration: 2000,
                    });
                    that.getqdmbyid(companyid);
                  },
                });
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showToast({
        title: '您没有权限',
        icon: 'none',
        duration: 2000,
      });
    }
  },

  //根据公司id 查询签到码
  getqdmbyid: function (id) {
    var that = this;
    var Diary = Bmob.Object.extend("qiandaoma");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent_com", id);
    // 查询所有数据
    query.find({
      success: function (results) {
        if (results.length == 0) {
          that.setData({
            qiandaomadis: 'block',
            codedis: 'none',
          })
        } else {
          var object = results[0];
          console.log('签到码:' + object.id + ' - ' + object.get('codeurl'));
          wx.setStorageSync('qdmid', object.id);
          that.setData({
            codeurl: object.get('codeurl'),
            codedis: 'block',
            qiandaomadis: 'none'
          })
        }
      },
    });
  },

  //重新生成点击
  getagain: function () {
    var that = this;
    var date = new Date();
    var userid = wx.getStorageSync('user_id');
    var master = that.data.master.get('parent').objectId;
    console.log(master);
    var nowtime = date.getDate();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var companyid = that.data.company.objectId;
    var qdmid = wx.getStorageSync('qdmid');
    var latitude = that.data.latitude;
    var longitude = that.data.longitude;

    if (master == userid) {
      wx.showModal({
        title: '注意',
        content: '重新生成，以前的二维码将过期，请注意！',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: 'https://route.showapi.com/887-1',
              data: {
                showapi_appid: '66939',
                showapi_sign: '8741e2d8bba64bed81f7a27dacd63189',
                content: companyid + '-' + nowtime+h+m+s+'-'+longitude+'-'+latitude,
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                var img = res.data.showapi_res_body.imgUrl;
                wx.setStorageSync('codeimg', img);

                var Diary = Bmob.Object.extend("qiandaoma");
                var query = new Bmob.Query(Diary);
                query.get(qdmid, {
                  success: function (result) {
                    result.set('codeurl', img);
                    result.set('codedata', companyid + '-' + nowtime + h + m + s);
                    result.save();
                    wx.showToast({
                      title: '重新生成成功',
                      icon: 'none',
                      duration: 2000,
                    });
                    that.getqdmbyid(companyid);
                  },
                });
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showToast({
        title: '您没有权限',
        icon: 'none',
        duration: 2000,
      });
    }
  },

  getagain1: function () {
    var that = this;
    var date = new Date();
    var userid = wx.getStorageSync('user_id');
    var master = that.data.master.get('parent').objectId;
    var companyid = that.data.company.objectId;
    var qdmid = wx.getStorageSync('qdmid');

    if (master == userid) {
      wx.showModal({
        title: '注意',
        content: '是否再次生成签到二维码！',
        success: function (res) {
          if (res.confirm) {
            var Diary = Bmob.Object.extend("qiandaoma");
            var query = new Bmob.Query(Diary);
            query.equalTo("parent_com", companyid);
            query.find({
              success: function (results) {
                var arr = [];
                var object = results[0];
                var time = object.get('codedata');
                arr = time.split('-');
                wx.request({
                  url: 'https://route.showapi.com/887-1',
                  data: {
                    showapi_appid: '66939',
                    showapi_sign: '8741e2d8bba64bed81f7a27dacd63189',
                    content: companyid + '-' + arr[1],
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success: function (res) {
                    var img = res.data.showapi_res_body.imgUrl;
                    wx.setStorageSync('codeimg', img);
                    var Diary = Bmob.Object.extend("qiandaoma");
                    var query = new Bmob.Query(Diary);
                    query.get(qdmid, {
                      success: function (result) {
                        result.set('codeurl', img);
                        result.save();
                        wx.showToast({
                          title: '再次生成成功',
                          icon: 'none',
                          duration: 2000,
                        });
                        that.getqdmbyid(companyid);
                      },
                    });
                  }
                })
              },
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showToast({
        title: '您没有权限',
        icon: 'none',
        duration: 2000,
      });
    }
  },

  //长按签到码
  savecode: function () {
    var codeimg = wx.getStorageSync('codeimg')
    wx.setClipboardData({
      data: codeimg,
      success: function (res) {
        wx.getClipboardData({

        })
      }
    })
  },


  /**得到我的出勤 */
  getqiandao: function (id) {
    var that = this;

    var Diary = Bmob.Object.extend("bycode");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent_com", id);
    query.include("parent");
    // 查询所有数据
    query.find({
      success: function (results) {
        if (results.length == 0) {
          that.setData({
            noqiandao: 'block',
            haveqiandao: 'none',
          })
        } else {
          console.log(results.length);
          that.setData({ 
            codeqd: results,
            people: results.length,
            });
        }
      },
    });
  },
})