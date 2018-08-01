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
    display:'none',
    display1:'none',
    userInfo:'',
    userid:'',
    person1: '',
    person2: '',
    qiandao:'',
  },
  onLoad: function () {
    var that = this;
    that.getimg('person1');
    that.getimg('person2');
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

    that.modifyqiandao();
    that.modifybycode();

    //根据月数动态改变签到数据以及当日签到
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
          if(nowmonth > arr1[1]){
            var Diary = Bmob.Object.extend("qiandao");
            var query = new Bmob.Query(Diary);
            query.get(results[0].id, {
              success: function (result) {
                that.modifyqiandao(true);
                that.modifybycode(true);
                result.set('later', 0);
                result.set('common', 0);
                result.save();
              },
            });
          }
        }
      },
    });

    //查询获得用户的objectid
    var id = wx.getStorageSync('openid');
    var user = wx.getStorageSync('user_info');
    console.log(user.nickName);
    if (id == '' || id == null) {
      query.equalTo("nickName", user.nickName);
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
            })
          } else {
            that.setData({ userInfo: user, display: 'none', display1: 'block', user_id: object.id })
            wx.setStorageSync('user_id', object.id)
          }
        }
      });
    } else {
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
            })
          } else {
            that.setData({ userInfo: user, display: 'none', display1: 'block', user_id: object.id })
            wx.setStorageSync('user_id', object.id)
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

  //根据天数改变签到情况
  modifyqiandao:function(nextmonth)
  {
    var date = new Date();
    var nowtime = date.getDate();
    var nowmonth = '0' + (date.getMonth() + 1);
    console.log(nowmonth);
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
    console.log(nowmonth);
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
      var userid = wx.getStorageSync('user_id');
      var Diary = Bmob.Object.extend("member");
      var query = new Bmob.Query(Diary);
      query.equalTo("parent", userid);
      // 查询所有数据
      query.find({
        success: function (results) {
          if (results.length == 0) {
            wx.showToast({
              title: '请先加入公司',
              icon: 'none',
              duration: 2000
            })
          } else {
            wx.navigateTo({
              url: '../mycompany/mycompany'
            })
          }
        },
      })
    }
  },

  //签到功能
  qiandaofunction:function(id)
  {
    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.include('parent_com');
    query.equalTo("parent", id);
    // 查询所有数据
    query.find({
      success: function (results) {
        if(results.length == 0)
        {
          wx.showToast({
            title: '加入公司，才能签到',
            icon: 'none',
            duration:1000,
          })
        }else
        {
          if(results[0].get('today'))
          {
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
                  wx.showToast({
                    title: '距离超出，无法签到',
                    icon: 'none',
                    duration: 1000,
                  })
                }else{
                  var distance = res.result.elements[0].distance;
                  if (distance >= 1000) {
                    wx.showToast({
                      title: '距离超出，无法签到',
                      icon: 'none',
                      duration: 1000,
                    })
                  } else {
                    if (nowtime > getworktime) {
                      wx.showModal({
                        title: '提示',
                        content: '您已迟到，是否继续签到',
                        success: function (res) {
                          if (res.confirm) {
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
                                      //添加数据，第一个入口参数是null
                                      diary.save(null, {
                                        success: function (result) {
                                          console.log("日记创建成功, objectId:" + result.id);
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
                                //添加数据，第一个入口参数是null
                                diary.save(null, {
                                  success: function (result) {
                                    console.log("日记创建成功, objectId:" + result.id);
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

  //获得用户的信息并保存在数据库
  onGotUserInfo: function (e) {
    var that = this;
    var userinfor = e.detail.userInfo;
    var id = wx.getStorageSync('openid');
    that.setData({
      userInfo: userinfor,
      display: 'none',
      display1: 'inline-block',
    })
    var Diary = Bmob.Object.extend("user_infor");
    var query = new Bmob.Query(Diary);
    query.equalTo("openid", id);
    query.find({
      success: function (results) {
        if (results.length ==0)
        {
          var User = Bmob.Object.extend("user_infor");
          var user = new User();
          user.set("openid", wx.getStorageSync('openid'));
          user.set("nickName", userinfor.nickName);
          user.set("avatarUrl", userinfor.avatarUrl);
          user.set("sex", userinfor.gender);
          user.save(null,{
            success: function (result) {
              console.log("登录成功, objectId:" + result.id);
              wx.setStorageSync('user_id', result.id)
              wx.setStorageSync('user_info', result)
            },
          });
        }else if(results.length ==1)
        {
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
        else{
          return
        }
      },
    });
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
        console.log(results[0].get("imgs").url);
        if(id == 'person1')
        {
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
      var userid = wx.getStorageSync('user_id');
      var Diary = Bmob.Object.extend("member");
      var query = new Bmob.Query(Diary);
      query.equalTo("parent", userid);
      // 查询所有数据
      query.find({
        success: function (results) {
          if (results.length == 0) {
            wx.showToast({
              title: '请先加入公司',
              icon: 'none',
              duration: 2000
            });
          } else {
            var companyid = results[0].get("parent_com").id;

            var Diary = Bmob.Object.extend("bycode");
            var query = new Bmob.Query(Diary);
            query.equalTo("parent", userid);
            // 查询所有数据
            query.find({
              success: function (results) {
                console.log("共查询到 " + results.length + " 条记录");
                if(results.length == 0)
                {
                  var Diary = Bmob.Object.extend("qiandaoma");
                  var query = new Bmob.Query(Diary);
                  query.equalTo("parent_com", companyid);
                  // 查询所有数据
                  query.find({
                    success: function (results) {
                      var object = results[0];
                      var usetime = object.get('codedata');
                      console.log(usetime);
                      wx.scanCode({
                        success: (res) => {
                          console.log(res.result)
                          if (usetime == res.result) {
                            var Diary = Bmob.Object.extend("bycode");
                            var User = Bmob.Object.extend("user_infor");
                            var Company = Bmob.Object.extend("company");
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
                                that.showtoast('二维码签到成功');
                              },
                            });
                          } else {
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
                }else{
                  var object = results[0];
                  var id = object.id;
                  var today = object.get('today');
                  var qiandao = object.get('qiandao');
                  that.setData({qiandao:qiandao});
                  if(today)
                  {
                    that.showtoast('今日已扫码签到');
                  }else{
                    var Diary = Bmob.Object.extend("qiandaoma");
                    var query = new Bmob.Query(Diary);
                    query.equalTo("parent_com", companyid);
                    // 查询所有数据
                    query.find({
                      success: function (results) {
                        var object = results[0];
                        var usetime = object.get('codedata');
                        console.log(usetime);
                        wx.scanCode({
                          success: (res) => {
                            console.log(res.result)
                            if (usetime == res.result) {
                              var Diary = Bmob.Object.extend("bycode");
                              var query = new Bmob.Query(Diary);
                              query.get(id, {
                                success: function (result) {
                                  result.set('qiandao', that.data.qiandao+1);
                                  result.set('today',true);
                                  result.save();
                                  that.showtoast('二维码签到成功');
                                },
                              });
                            } else {
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
      })
    }
   
  },

  showtoast:function(text)
  {
    wx.showToast({
      title: text,
      icon:'none',
      duration:2000
    })
  },

})
