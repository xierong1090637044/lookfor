var app = getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var Bmob = require('../../utils/bmob.js'); 
var wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
var Shape = require("../../utils/wxdraw.min.js").Shape;
var AnimationFrame = require("../../utils/wxdraw.min.js").AnimationFrame;
var util = require('../../utils/util.js')
var qqmapsdk;
Page({
  data: {
    userInfo:'',
    userid:'',
    person1: '',
    person2: '',
    qiandao:'',
    box:'none',
    mask:'none',
    display: 'none',
    display1: 'none',
    mask1:'none',
  },
  onLoad: function () {
    var that = this;
    that.getimg('person1');
    //that.getimg('person2');

    //that.modifyqiandao();
    that.modifybycode();
    that.modifyqiandaobymonth();
  },

// Do something when show.
  onShow: function (options) {
    var that = this;
    var context = wx.createCanvasContext('fire')
    that.wxCanvas = new wxDraw(context, 0, 0, 400, 500);
    var img = [];
    for (var i = 1; i < 16; i++) {
      var xxposition = Math.floor(Math.random() * 400);
      img[i] = new Shape('image', { x: xxposition, y: 10 + i * 10, w: 6, h: 6, file: "../../images/xx.png" }, 'fill', false)
      that.wxCanvas.add(img[i]);
      img[i].animate({ opacity: 0, }, {
        duration: 5000
      }).start(true)
    };

    //查询获得用户的objectid
    var id = wx.getStorageSync('openid');
    var user = wx.getStorageSync('user_info');
    if (user == '' || user == null || id ==null|| id=='') {
      var id = wx.getStorageSync('openid');
      wx.showLoading({
        title: '登陆中',
      });
      var Diary = Bmob.Object.extend("user_infor");
      var query = new Bmob.Query(Diary);
      query.equalTo("openid", id);
      query.find({
        success: function (results) {
          console.log("共查询到 " + results.length + " 条记录");
          var object = results[0];
          console.log(object)
          wx.setStorageSync('user_info', object)
          var user = wx.getStorageSync('user_info');
          if (object == null || object == '') {
            that.setData({
              display: 'block', display1: 'none'
            });
            wx.hideLoading();
          } else {
            that.setData({ userInfo: user, display: 'none', display1: 'block', user_id: object.id })
            wx.setStorageSync('user_id', object.id);
            wx.hideLoading();
            that.modifyqiandao();
          }
        }
      });
    } else {
      wx.showLoading({
        title: '登陆中',
      });
      var Diary = Bmob.Object.extend("user_infor");
      var query = new Bmob.Query(Diary);
      query.equalTo("openid", id);
      query.find({
        success: function (results) {
          var object = results[0];
          wx.setStorageSync('user_info', object)
          var user = wx.getStorageSync('user_info');
          if (object == null || object == '') {
            that.setData({
              display: 'block', display1: 'none'
            });
            wx.hideLoading();
          } else {
            wx.hideLoading();
            that.setData({ userInfo: user, display: 'none', display1: 'block', user_id: object.id })
            wx.setStorageSync('user_id', object.id);
            that.modifyqiandao();
          }
        }
      });
    }
  },

  onUnload: function () {
    this.wxCanvas.clear(); //推荐这个
  },

  onHide:function(){
    this.wxCanvas.clear();
  },

  modifyqiandaobymonth:function()
  {
    //根据月数动态改变签到数据以及当日签到
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var date = new Date();
    var nowtime = date.getDate();
    var nowmonth = '0' + (date.getMonth() + 1);
    var Diary1 = Bmob.Object.extend("qiandao");
    var query = new Bmob.Query(Diary1);
    query.equalTo("parent", userid);
    // 查询所有数据
    query.find({
      success: function (results) {
        if (results.length == 0) { } else {
          var update = results[0].updatedAt;
          var arr = [];
          var arr1 = [];
          arr = update.split(' ');
          arr1 = arr[0].split('-');
          if (nowmonth > arr1[1]) {
            var Diary = Bmob.Object.extend("qiandao");
            var query = new Bmob.Query(Diary);
            query.get(results[0].id, {
              success: function (result) {
                that.modifyqiandao(true);
                that.modifybycode(true);
                result.set('later', 0);
                result.set('common', 0);
                result.set('leave_z', 0);
                result.set('leave_c', 0);
                result.save();
              },
            });
          }
        }
      },
    });
  },

  //根据天数改变签到情况
  modifyqiandao:function(nextmonth)
  {
    var date = new Date();
    var nowtime = date.getDate();
    var nowmonth = '0' + (date.getMonth() + 1);
    var userid = wx.getStorageSync('user_id');

    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", userid);
    // 查询所有数据
    query.find({
      success: function (results) {
        if (results.length == 0) { } else {
          var update = results[0].updatedAt;
          var arr = [];
          var arr1 = [];
          arr = update.split(' ');
          arr1 = arr[0].split('-');
          if(nextmonth)
          {
            var Diary = Bmob.Object.extend("member");
            var query = new Bmob.Query(Diary);
            query.get(results[0].id, {
              success: function (result) {
                result.set('today', false);
                result.set('todayqt', false);
                result.save();
              },
            });
          }else{
            if (arr1[2] < nowtime) {
              var Diary = Bmob.Object.extend("member");
              var query = new Bmob.Query(Diary);
              query.get(results[0].id, {
                success: function (result) {
                  result.set('today', false);
                  result.set('todayqt', false);
                  result.save();
                },
              });
            }
          }
        }
      },
    });
  },

  //根据天数改变二维码签到情况
  modifybycode: function (nextmonth) {
    var date = new Date();
    var nowtime = date.getDate();
    var nowmonth = '0' + (date.getMonth() + 1);
    var userid = wx.getStorageSync('user_id');

    var Diary = Bmob.Object.extend("bycode");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", userid);
    // 查询所有数据
    query.find({
      success: function (results) {
        if (results.length == 0) { } else {
          var update = results[0].updatedAt;
          var arr = [];
          var arr1 = [];
          arr = update.split(' ');
          arr1 = arr[0].split('-');
          if (nextmonth) {
            var Diary = Bmob.Object.extend("bycode");
            var query = new Bmob.Query(Diary);
            query.get(results[0].id, {
              success: function (result) {
                result.set('today', false);
                result.set('签到', 0);
                result.save();
              },
            });
          } else {
            if (arr1[2] < nowtime) {
              var Diary = Bmob.Object.extend("bycode");
              var query = new Bmob.Query(Diary);
              query.get(results[0].id, {
                success: function (result) {
                  result.set('today', false);
                  result.save();
                },
              });
            }
          }
        }
      },
    });
  },

  //公司按钮点击
  gotocompany:function()
  {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    if (userid = null || userid == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
    } else {
      wx.navigateTo({
        url: '../company/company'
      })
    }
  },

  //签到点击
  qiandao:function()
  {
    var that = this; 
    var userid = wx.getStorageSync('user_id');
    if(userid =null ||userid=="")
    {
      wx.showToast({
        title: '请先登录',
        icon:'none',
        duration:1000
      })
    }else
    {
      var userid = wx.getStorageSync('user_id');
      that.qiandaofunction(userid);
    }
  },

  //签退点击
  qiantui: function () {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    if (userid = null || userid == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
    } else {
      var userid = wx.getStorageSync('user_id');
      that.qiantuifunction(userid);
    }
  },

  //我的名片点击
  mymp:function()
  {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("mycard");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", userid);
    query.find({
      success: function (results) {
        if (results.length == 0) {
          wx.showToast({
            title: '你还未拥有名片',
            icon:'none',
            duration:1000,
          })
        } else {
          wx.navigateTo({
            url: '../mycard/mycard?userid=' + userid,
          })
        }
      },
    });
  },

  //我的公司点击
  mycompany:function()
  {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    if (userid = null || userid == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
    } else {
      wx.showLoading({
        title: '加载中',
        success:function()
        {
          var userid = wx.getStorageSync('user_id');
          var Diary = Bmob.Object.extend("member");
          var query = new Bmob.Query(Diary);
          query.equalTo("parent", userid);
          // 查询所有数据
          query.find({
            success: function (results) {
              if (results.length == 0) {
                wx.hideLoading();
                wx.showToast({
                  title: '请先加入公司',
                  icon: 'none',
                  duration: 2000
                })
              } else {
                wx.hideLoading();
                wx.navigateTo({
                  url: '../mycompany/mycompany'
                })
              }
            },
          })
        }
      })
      
    }
  },

  //签到功能
  qiandaofunction:function(id)
  {
    var that = this;
    wx.showLoading({
      title: '加载中',
    });
    that.setData({ mask1: 'block' });
    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.include('parent_com');
    query.equalTo("parent", id);
    // 查询所有数据
    query.find({
      success: function (results) {
        if(results.length == 0)
        {
          wx.hideLoading();
          that.setData({ mask1: 'none' });
          wx.showToast({
            title: '加入公司，才能签到',
            icon: 'none',
            duration:1000,
          })
        }else
        {
          if(results[0].get('today'))
          {
            wx.hideLoading();
            that.setData({ mask1: 'none' });
            wx.showToast({
              title: '您当日已签到，请勿重复签到',
              icon:'none',
              duration:1000
            })
          }else{
            var arr = [];
            var arr1 = [];
            var getworktime = '';
            var userid = results[0].id;
            var worktime = results[0].get('parent_com').worktime;
            arr = worktime.split(":");
            getworktime = arr[0] * 60 + parseInt(arr[1]);
            var date = new Date();
            var nowtime = date.getHours() * 60 + date.getMinutes();
            var cc_latitude = results[0].get('parent_com').latitude;
            var cc_longitude = results[0].get('parent_com').longitude;

            var companyid = results[0].get('parent_com').objectId;
            console.log(companyid);

            qqmapsdk = new QQMapWX({
              key: '3ACBZ-5PK34-HPZUT-XFODA-F4YS3-LNFXB'
            });
            qqmapsdk.calculateDistance({
              to: [{
                latitude: cc_latitude,
                longitude: cc_longitude
              }],
              complete: function (res) {
                console.log(res);
                if (res.status ==373)
                {
                  wx.hideLoading();
                  that.setData({ mask1: 'none' });
                  wx.showToast({
                    title: '距离超出，无法签到',
                    icon: 'none',
                    duration: 1000,
                  })
                }else{
                  var distance = res.result.elements[0].distance;
                  if (distance >= 2000) {
                    wx.hideLoading();
                    that.setData({ mask1: 'none' });
                    wx.showToast({
                      title: '距离超出，无法签到',
                      icon: 'none',
                      duration: 1000,
                    })
                  } else {
                    if (nowtime > getworktime) {
                      wx.hideLoading();
                      wx.showModal({
                        title: '提示',
                        content: '您已迟到，是否继续签到',
                        success: function (res) {
                          if (res.confirm) {
                            wx.showLoading({
                              title: '加载中',
                            });
                            var Diary = Bmob.Object.extend("member");
                            var query = new Bmob.Query(Diary);
                            query.get(userid, {
                              success: function (result) {
                                result.set('today', true);
                                result.save();

                                var Diary = Bmob.Object.extend("qiandao");
                                var query = new Bmob.Query(Diary);
                                query.equalTo("parent", id);
                                query.find({
                                  success: function (results) {
                                    if (results.length == 0) {
                                      //创建类和实例
                                      var Diary = Bmob.Object.extend("qiandao");
                                      var Company = Bmob.Object.extend("company");
                                      var User = Bmob.Object.extend("user_infor");
                                      var diary = new Diary();
                                      var user = new User();
                                      var company = new Company();
                                      user.id = id;
                                      company.id = companyid;
                                      diary.set("parent", user);
                                      diary.set("parent_com", company);
                                      diary.set("later", 1);
                                      diary.set("common", 0);
                                      diary.set("leave_z", 0);
                                      diary.set("leave_c", 0);
                                      //添加数据，第一个入口参数是null
                                      diary.save(null, {
                                        success: function (result) {
                                          wx.hideLoading();
                                          that.setData({ mask1: 'none' });
                                          wx.showToast({
                                            title: '签到成功',
                                            icon: 'success',
                                            duration: 1000,
                                          })
                                        },
                                      });
                                    } else {
                                      var Diary = Bmob.Object.extend("qiandao");
                                      var query = new Bmob.Query(Diary);
                                      query.get(results[0].id, {
                                        success: function (result) {
                                          result.set('later', results[0].get('later') + 1);
                                          result.save();
                                          wx.hideLoading();
                                          that.setData({ mask1: 'none' });
                                          wx.showToast({
                                            title: '签到成功',
                                            icon: 'success',
                                            duration: 1000,
                                          })
                                        },
                                      });
                                    }
                                  },
                                });
                              },
                            });
                          } else if (res.cancel) {
                            that.setData({ mask1: 'none' });
                            console.log('用户点击取消')
                          }
                        }
                      })
                    } else {
                      var Diary = Bmob.Object.extend("member");
                      var query = new Bmob.Query(Diary);
                      query.get(userid, {
                        success: function (result) {
                          result.set('today', true);
                          result.save();

                          var Diary = Bmob.Object.extend("qiandao");
                          var query = new Bmob.Query(Diary);
                          query.equalTo("parent", id);
                          query.find({
                            success: function (results) {
                              if (results.length == 0) {
                                //创建类和实例
                                var Diary = Bmob.Object.extend("qiandao");
                                var Company = Bmob.Object.extend("company");
                                var User = Bmob.Object.extend("user_infor");
                                var diary = new Diary();
                                var user = new User();
                                var company = new Company();
                                user.id = id;
                                company.id = companyid;
                                diary.set("parent", user);
                                diary.set("parent_com", company);
                                diary.set("later", 0);
                                diary.set("common", 1);
                                diary.set("leave_z", 0);
                                diary.set("leave_c", 0);
                                //添加数据，第一个入口参数是null
                                diary.save(null, {
                                  success: function (result) {
                                    wx.hideLoading();
                                    that.setData({ mask1: 'none' });
                                    wx.showToast({
                                      title: '签到成功',
                                      icon: 'success',
                                      duration: 1000,
                                    })
                                  },
                                });
                              } else {
                                var Diary = Bmob.Object.extend("qiandao");
                                var query = new Bmob.Query(Diary);
                                query.get(results[0].id, {
                                  success: function (result) {
                                    result.set('common', results[0].get('common') + 1);
                                    result.save();
                                    wx.hideLoading();
                                    that.setData({ mask1: 'none' });
                                    wx.showToast({
                                      title: '签到成功',
                                      icon: 'success',
                                      duration: 1000,
                                    })
                                  },
                                });
                              }
                            },
                          });
                        },
                      });
                    }
                  }
                }                
              }
            });
          }
        }
      },
    });
  },

  //签退功能
  qiantuifunction: function (id) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    });
    that.setData({mask1:'block'});
    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.include('parent_com');
    query.equalTo("parent", id);
    // 查询所有数据
    query.find({
      success: function (results) {
        if (results.length == 0) {
          that.setData({ mask1: 'none' });
          wx.hideLoading();
          wx.showToast({
            title: '加入公司，才能签退',
            icon: 'none',
            duration: 1000,
          })
        } else {
          if (results[0].get('todayqt')) {
            that.setData({ mask1: 'none' });
            wx.hideLoading();
            wx.showToast({
              title: '您当日已签退，请勿重复签退',
              icon: 'none',
              duration: 1000
            })
          } else {
            var arr = [];
            var arr1 = [];
            var getworktime = '';
            var userid = results[0].id;
            var worktime = results[0].get('parent_com').leavetime;
            arr = worktime.split(":");
            getworktime = arr[0] * 60 + parseInt(arr[1]);
            var date = new Date();
            var nowtime = date.getHours() * 60 + date.getMinutes();
            var cc_latitude = results[0].get('parent_com').latitude;
            var cc_longitude = results[0].get('parent_com').longitude;

            var companyid = results[0].get('parent_com').objectId;
            console.log(companyid);

            qqmapsdk = new QQMapWX({
              key: '3ACBZ-5PK34-HPZUT-XFODA-F4YS3-LNFXB'
            });
            qqmapsdk.calculateDistance({
              to: [{
                latitude: cc_latitude,
                longitude: cc_longitude
              }],
              complete: function (res) {
                console.log(res);
                if (res.status == 373) {
                  that.setData({ mask1: 'none' });
                  wx.hideLoading();
                  wx.showToast({
                    title: '距离超出，无法签退了',
                    icon: 'none',
                    duration: 1000,
                  })
                } else {
                  var distance = res.result.elements[0].distance;
                  if (distance >= 2000) {
                    that.setData({ mask1: 'none' });
                    wx.hideLoading();
                    wx.showToast({
                      title: '距离超出，无法签退了',
                      icon: 'none',
                      duration: 1000,
                    })
                  } else {
                    if (nowtime < getworktime) {
                      that.setData({ mask1: 'none' });
                      wx.hideLoading();
                      wx.showModal({
                        title: '提示',
                        content: '当前还未下班，您是否要早退',
                        success: function (res) {
                          if (res.confirm) {
                            wx.showLoading({
                              title: '加载中',
                            });
                            var Diary = Bmob.Object.extend("member");
                            var query = new Bmob.Query(Diary);
                            query.get(userid, {
                              success: function (result) {
                                result.set('todayqt', true);
                                result.save();

                                var Diary = Bmob.Object.extend("qiandao");
                                var query = new Bmob.Query(Diary);
                                query.equalTo("parent", id);
                                query.find({
                                  success: function (results) {
                                    if (results.length == 0) {
                                      //创建类和实例
                                      var Diary = Bmob.Object.extend("qiandao");
                                      var Company = Bmob.Object.extend("company");
                                      var User = Bmob.Object.extend("user_infor");
                                      var diary = new Diary();
                                      var user = new User();
                                      var company = new Company();
                                      user.id = id;
                                      company.id = companyid;
                                      diary.set("parent", user);
                                      diary.set("parent_com", company);
                                      diary.set("later", 0);
                                      diary.set("common", 0);
                                      diary.set("leave_z", 1);
                                      diary.set("leave_c", 0);
                                      //添加数据，第一个入口参数是null
                                      diary.save(null, {
                                        success: function (result) {
                                          wx.hideLoading();
                                          that.setData({ mask1: 'none' });
                                          wx.showToast({
                                            title: '签退成功',
                                            icon: 'success',
                                            duration: 1000,
                                          })
                                        },
                                      });
                                    } else {
                                      var Diary = Bmob.Object.extend("qiandao");
                                      var query = new Bmob.Query(Diary);
                                      query.get(results[0].id, {
                                        success: function (result) {
                                          result.set('leave_z', results[0].get('leave_z') + 1);
                                          result.save();
                                          that.setData({ mask1: 'none' });
                                          wx.hideLoading();
                                          wx.showToast({
                                            title: '签退成功',
                                            icon: 'success',
                                            duration: 1000,
                                          })
                                        },
                                      });
                                    }
                                  },
                                });
                              },
                            });
                          } else if (res.cancel) {
                            console.log('用户点击取消')
                            that.setData({ mask1: 'none' });
                          }
                        }
                      })
                    } else {
                      var Diary = Bmob.Object.extend("member");
                      var query = new Bmob.Query(Diary);
                      query.get(userid, {
                        success: function (result) {
                          result.set('todayqt', true);
                          result.save();

                          var Diary = Bmob.Object.extend("qiandao");
                          var query = new Bmob.Query(Diary);
                          query.equalTo("parent", id);
                          query.find({
                            success: function (results) {
                              if (results.length == 0) {
                                //创建类和实例
                                var Diary = Bmob.Object.extend("qiandao");
                                var Company = Bmob.Object.extend("company");
                                var User = Bmob.Object.extend("user_infor");
                                var diary = new Diary();
                                var user = new User();
                                var company = new Company();
                                user.id = id;
                                company.id = companyid;
                                diary.set("parent", user);
                                diary.set("parent_com", company);
                                diary.set("later", 0);
                                diary.set("common", 0);
                                diary.set("leave_z", 0);
                                diary.set("leave_c", 1);
                                //添加数据，第一个入口参数是null
                                diary.save(null, {
                                  success: function (result) {
                                    that.setData({ mask1: 'none' });
                                    wx.hideLoading();
                                    wx.showToast({
                                      title: '签退成功',
                                      icon: 'success',
                                      duration: 1000,
                                    })
                                  },
                                });
                              } else {
                                var Diary = Bmob.Object.extend("qiandao");
                                var query = new Bmob.Query(Diary);
                                query.get(results[0].id, {
                                  success: function (result) {
                                    result.set('leave_c', results[0].get('leave_c') + 1);
                                    result.save();
                                    that.setData({ mask1: 'none' });
                                    wx.hideLoading();
                                    wx.showToast({
                                      title: '签退成功',
                                      icon: 'success',
                                      duration: 1000,
                                    })
                                  },
                                });
                              }
                            },
                          });
                        },
                      });
                    }
                  }
                }
              }
            });
          }
        }
      },
    });
  },

  //获得用户的信息并保存在数据库
  onGotUserInfo: function (e) {
    var that = this;
    var userinfor = e.detail.userInfo;
    var id = wx.getStorageSync('openid');
    that.setData({
      userInfo: userinfor,
      display: 'none',
      display1: 'inline-block',
    });
    if(id == ""||id ==null)
    {
      var Diary = Bmob.Object.extend("user_infor");
      var query = new Bmob.Query(Diary);
      query.equalTo("nickName", userinfor.nickName);
      query.find({
        success: function (results) {
          var object = results[0];
          wx.setStorageSync('user_info', results[0]);
          wx.setStorageSync('user_id', object.id);
          wx.setStorageSync('openid', object.get('openid'));
        },
      });
    }else{
      var Diary = Bmob.Object.extend("user_infor");
      var query = new Bmob.Query(Diary);
      query.equalTo("openid", id);
      query.find({
        success: function (results) {
          if (results.length == 0) {
            var User = Bmob.Object.extend("user_infor");
            var user = new User();
            user.set("openid", wx.getStorageSync('openid'));
            user.set("nickName", userinfor.nickName);
            user.set("avatarUrl", userinfor.avatarUrl);
            user.set("sex", userinfor.gender);
            user.save(null, {
              success: function (result) {
                console.log("登录成功, objectId:" + result.id);
                wx.setStorageSync('user_id', result.id)
                wx.setStorageSync('user_info', result)
              },
            });
          } else if (results.length == 1) {
            var Diary = Bmob.Object.extend("user_infor");
            var query = new Bmob.Query(Diary);
            var id = wx.getStorageSync('openid')
            query.equalTo("openid", id);
            query.find({
              success: function (results) {
                console.log("共查询到 " + results.length + " 条记录");
                var object = results[0];
                console.log(object)
                wx.setStorageSync('user_info', object)
                var user = wx.getStorageSync('user_info');
                if (object == null || object == '') {
                  return
                } else {
                  that.setData({
                    userid: object.id
                  });
                  wx.setStorageSync('user_id', object.id);
                }
              }
            });
            wx.setStorageSync('user_info', results[0])
          }
          else {
            return
          }
        },
      });
    }
  },

  getimg: function (id) {
    var that = this;
    var Diary = Bmob.Object.extend("sucai");
    var query = new Bmob.Query(Diary);
    query.equalTo("title", id);
    // 查询所有数据
    query.find({
      success: function (results) {
        var imgurl = results[0].get("imgs").url;
        if(id == 'person1')
        {
          setTimeout(function () {
            that.setData({ box: 'block' })
          }, 2000);

          setTimeout(function () {
            that.setData({ box: 'none' })
          }, 7500);
          that.setData({
            person1: imgurl
          });
        }else{
          that.setData({
            person2: imgurl
          });
        }
      },
    });
  },

  scancode:function()
  {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    if (userid = null || userid == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
    } else {
      wx.showLoading({
        title: '加载中',
      })

      var userid = wx.getStorageSync('user_id');
      var Diary = Bmob.Object.extend("bycode");
      var query = new Bmob.Query(Diary);
      query.equalTo("parent", userid);
      // 查询所有数据
      query.find({
        success: function (results) {
          console.log(results.length);
          if (results.length == 0) {
            wx.hideLoading();
            wx.scanCode({
                success: (res) => {
                  console.log(res);
                  var arr =[];
                  arr = res.result.split('-');
                  var Diary = Bmob.Object.extend("qiandaoma");
                  var query = new Bmob.Query(Diary);
                  query.equalTo("parent_com", arr[0]);
                  query.find({
                    success: function (results) {
                      var qdmid = results[0].id;
                      var Diary = Bmob.Object.extend("qiandaoma");
                      var query = new Bmob.Query(Diary);
                      query.get(qdmid, {
                        success: function (result) {
                          var content = result.get("codedata");
                          var companyid = result.get("parent_com").id;
                          var contentarr = [];
                          contentarr = content.split('-');
                          console.log(contentarr[1], arr[1]);
                          if (contentarr[1] == arr[1]) {
                            var userid = wx.getStorageSync('user_id');
                            var Diary = Bmob.Object.extend("bycode");
                            var User = Bmob.Object.extend("user_infor");
                            var Company = Bmob.Object.extend("activity");
                            var diary = new Diary();
                            var user = new User();
                            var company = new Company();
                            user.id = userid;
                            company.id = companyid;
                            diary.set("qiandao", 1);
                            diary.set("today", true);
                            diary.set('parent', user);
                            diary.set('parent_com', company);
                            diary.save(null, {
                              success: function (result) {
                                wx.showToast({
                                  title: '二维码签到成功',
                                  icon: 'success',
                                  duration: 2000
                                })
                              },
                            });
                          } else {
                            wx.showToast({
                              title: '二维码已过期',
                              icon: 'none',
                              duration: 2000
                            });
                          }
                        },
                      });
                    },
                  });
                }
            });
          } else {
            var object = results[0];
            console.log(object);
            var id = object.id;
            var today = object.get('today');
            var qiandao = object.get('qiandao');
            var companyid = object.get('parent_com').id;
            that.setData({ qiandao: qiandao });
            if (today) {
              wx.hideLoading();
              that.showtoast('今日已扫码签到');
            } else {
              var Diary = Bmob.Object.extend("qiandaoma");
              var query = new Bmob.Query(Diary);
              query.equalTo("parent_com", companyid);
              // 查询所有数据
              query.find({
                success: function (results) {
                  var object = results[0];
                  var content = object.get("codedata");
                  var contentarr = [];
                  contentarr = content.split('-');
                  wx.hideLoading();
                  wx.scanCode({
                    success: (res) => {
                      console.log(res.result);
                      var arr = [];
                      arr = res.result.split('-');
                      if (contentarr[1] == arr[1]) {
                        var Diary = Bmob.Object.extend("bycode");
                        var query = new Bmob.Query(Diary);
                        query.get(id, {
                          success: function (result) {
                            result.set('qiandao', that.data.qiandao + 1);
                            result.set('today', true);
                            result.save();
                            wx.showToast({
                              title: '二维码签到成功',
                              icon: 'success',
                              duration: 2000
                            })
                          },
                        });
                      } else {
                        wx.hideLoading();
                        wx.showToast({
                          title: '二维码已过期',
                          icon: 'none',
                          duration: 2000
                        });
                      }
                    }
                  });
                },
              });
            }
          }
        }
      });
    }
  },

  //我的活动点击
  myactivity:function()
  {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    if (userid = null || userid == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
    } else {
      var userid = wx.getStorageSync('user_id');
      var Diary = Bmob.Object.extend("activity");
      var query = new Bmob.Query(Diary);
      query.equalTo("parent", userid);
      // 查询所有数据
      query.find({
        success: function (results) {
          console.log("共查询到 " + results.length + " 条记录");
          if(results.length == 0)
          {
            wx.showToast({
              title: '请先创建活动场景',
              icon:'none',
            })
          }else{
            wx.navigateTo({
              url: '../myactivity/myactivity'
            })
          }
        },
      });
    }
  },

  aboutus:function()
  {
    wx.navigateTo({
      url: '../about_us/about_us'
    });
  },

  weather:function()
  {
    wx.navigateTo({
      url: '../weather/weather'
    });
  },

  showtoast:function(text)
  {
    wx.showToast({
      title: text,
      icon:'none',
      duration:2000
    })
  },

  weather:function()
  {
    wx.navigateTo({
      url: '../weather/weather',
    })
  },

  //意见反馈点击
  suggestion:function()
  {
    var that = this;
    that.setData({mask:'block'});
  },

  hidden1:function()
  {
    var that = this;
    that.setData({ mask: 'none' });
  },

  bindFormSubmit: function (e) {
    var that = this;
    var content = e.detail.value.textarea;
    var userid = wx.getStorageSync("user_id");
    wx.showLoading({
      title: '加载中',
    });

    if(userid=="" ||userid ==null)
    {
      wx.hideLoading();
      wx.showToast({
        title: '请先登录',
        icon:'none',
        duration:1500
      });
      
    }else{
      if (content == "" ||content.length<=10) {
        wx.hideLoading();
        wx.showToast({
          title: '内容不能少于10个字',
          icon: 'none',
          duration: 2000
        });
        
      } else {
        //创建类和实例
        var Diary = Bmob.Object.extend("suggestions");
        var User = Bmob.Object.extend("user_infor");
        var diary = new Diary();
        var user = new User();
        user.id = userid;
        diary.set("content", content);
        diary.set("parent", user);
        diary.save(null, {
          success: function (result) {
            wx.hideLoading();
            wx.showToast({
              title: '提交成功',
              icon:'success',
              duration:2000,
            });
            that.setData({ mask: 'none' });
          }
        });
      }
    }
  }

})
