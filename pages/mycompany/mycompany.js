// pages/mycompany/mycompany.js
var Bmob = require('../../utils/bmob.js'); 
Page({

  /*** 页面的初始数据*/
  data: {
    company:'',
    master:'',
    members:'',
    request:'',
    dataid:'',
    qiandao:"",
    allqiandao:'',
    allqiantui:'',
    userid:'', 
    lxid:'',
    inputValue:'',
    memberallqd:'',
    codeurl: '',
    codeqd:'',
    codeqdgr: '',
    form:'none',
    form1: '',
    modifydisplay: 'none',
    noqiandao: 'none',
    haveqiandao: 'none',
    qiandaomadis:'none',
    codedis:'none',
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    var that = this;
    var userid =wx.getStorageSync('user_id');

    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.include('parent_com');
    query.equalTo("parent", userid);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
          var object = results[0];
          var companid = object.get('parent_com').objectId;
          var Diary = Bmob.Object.extend("company");
          var query = new Bmob.Query(Diary);
          query.include('parent');
          query.get(companid, {
            success: function (result) {
              console.log(companid);
              that.getmembers(companid);
              that.getrequest(companid);
              that.getallqiandao(companid);
              that.getqiandao();
              that.getqdmbyid(companid);
              that.setData({
                company: object.get('parent_com'),
                master: result,
                dataid: '公司成员',
                userid: userid,
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

  /***同意按钮点击 */
  agree:function(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    var companyid = that.data.company;
    var userid = wx.getStorageSync('user_id');
    var masterid = companyid.parent.objectId;
    console.log(companyid.parent.objectId, userid);
    if(masterid == userid)
    {
      that.agree_and_refuse(id, 'member', '添加成功');
    }else{
      wx.showToast({
        title: '你没有权限进行操作',
        icon:'none',
        duration:2000,
      })
    }
  },

/***拒绝按钮点击 */
  refuse: function(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    var companyid = that.data.company;
    var userid = wx.getStorageSync('user_id');
    var masterid = companyid.parent.objectId;
    console.log(companyid.parent.objectId, userid);
    if (masterid == userid) {
      that.agree_and_refuse(id, 'jujue', '您已拒绝');
    } else {
      wx.showToast({
        title: '你没有权限进行操作',
        icon: 'none',
        duration: 2000,
      })
    }
  },

  /**得到左边列表的data-id */
  getdataid:function(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    that.setData({dataid:id});
  },

  /**得到公司用户成员 */
  getmembers:function(id)
  {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent_com", id);
    query.include("parent");
    // 查询所有数据
    query.find({
      success: function (results) {
        wx.hideLoading();
        that.setData({
          members:results
        });
      },
    });
  },

  /**得到我的出勤 */
  getqiandao: function () {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("qiandao");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", userid);
    query.include("parent");
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log('我的出勤' + results);
        if(results.length==0){
          that.setData({
            noqiandao: 'block',
            haveqiandao: 'none',
          })
        }else{
          var later = results[0].get('later');
          var commo = results[0].get('common');
          var later_z = results[0].get('leave_z');
          var commo_c = results[0].get('leave_c');
          var all = later + commo;
          var allqt = later_z + commo_c;
          that.setData({
            qiandao: results,
            allqiandao: all,
            allqiantui: allqt,
            noqiandao: 'none',
            haveqiandao: 'block',
          });
          /*var Diary = Bmob.Object.extend("bycode");
          var query = new Bmob.Query(Diary);
          query.equalTo("parent", userid);
          // 查询所有数据
          query.find({
            success: function (results) {
              var qiandao = results[0].get('qiandao');
              that.setData({codeqdgr:qiandao});
            },
          });*/
        }
      },
    });
  },

  /**得到申请列表 */
  getrequest: function (id) {
    var that = this;
    var Diary = Bmob.Object.extend("shenqing");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent_com", id);
    query.include("parent");
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log('申请列表'+results)
        that.setData({
          request: results
        });
      },
    });
  },

  /**同意按钮和拒绝按钮 */
  agree_and_refuse:function(id,dataname,text)
  {
    var that = this;
    var Diary = Bmob.Object.extend("shenqing");
    var query = new Bmob.Query(Diary);
    query.get(id, {
      success: function (result) {
        var userid = result.get('parent').id;
        var companyid = result.get('parent_com').id;
        var Member = Bmob.Object.extend(dataname);
        var Post = Bmob.Object.extend("user_infor");
        var Company = Bmob.Object.extend("company");
        var diary = new Member();
        var user = new Post();
        var company = new Company();
        user.id = userid;
        company.id = companyid;
        diary.set("parent", user);
        diary.set("parent_com", company);
        diary.set("today", false);
        diary.set("todayqt", false);
        if(dataname =='member')
        {
          diary.set("phone", '未添加');
        }
        diary.save(null, {
          success: function (result) {
            var Diary = Bmob.Object.extend("shenqing");
            var query = new Bmob.Query(Diary);
            query.get(id, {
              success: function (object) {
                object.destroy({
                  success: function (deleteObject) {
                    that.getrequest(companyid);
                    that.getmembers(companyid);
                    wx.showToast({
                      title: text,
                      icon: 'none',
                      duration: 1000,
                    })
                  },
                });
              },
            });
          },
        });
      },
    });
  },
  
  //修改按钮点击
  modifylx:function(e)
  {
    console.log(e.currentTarget.dataset.id);
    var that = this;
    that.setData({
      modifydisplay: 'block',
      lxid: e.currentTarget.dataset.id
    })
  },

  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  //确认修改按钮
  qrmodify:function()
  {
    var that = this;
    var id = that.data.lxid;
    var value = that.data.inputValue;
    var companyid = that.data.company.objectId;
    wx.showLoading({
      title: '修改中',
    });
    if(value.length<11)
    {
      wx.showToast({
        title: '请输入正确的联系方式',
        icon:'none',
        duration:1000
      })
    }else{
      var Diary = Bmob.Object.extend("member");
      var query = new Bmob.Query(Diary);
      query.get(id, {
        success: function (result) {
          result.set('phone', value);
          result.save();
          wx.hideLoading();
          wx.showToast({
            title: '修改成功',
            icon:'none',
            duration:1000
          });
          setTimeout(function(){
            that.getmembers(companyid);
            that.setData({
              modifydisplay: 'none'
            })
          },1000)
        },
      });
    }
  },

  hidden1:function()
  {
    var that = this;
    that.setData({
      modifydisplay:'none'
    })
  },

  //退出功能
  goout:function()
  {
    var that = this;
    var id = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", id);
    query.include("parent_com"); 
    // 查询所有数据
    query.find({
      success: function (results) {
        var masterid = results[0].get('parent_com').parent.objectId;
        var userid = results[0].id;
        var companyid = results[0].get('parent_com').objectId;
        console.log(companyid)
        if(id == masterid)
        {
          wx.showModal({
            title: '你是公司创建者',
            content: '是否解散该公司',
            confirmText:'解散',
            confirmColor:'#2ca879',
            success: function (res) {
              if (res.confirm) {
                that.deleteallbyid(companyid);
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          });
        }else{
          wx.showModal({
            title: '提示',
            content: '是否退出',
            confirmText: '退出',
            confirmColor: '#2ca879',
            success: function (res) {
              if (res.confirm) {
                that.deletebyid(userid);
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          });
        }
      },
    });
  },

  deletebyid:function(id)
  {
    wx.showLoading({
      title: '正在退出',
    });
    var userid = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.get(id, {
      success: function (object) {
        object.destroy({
          success: function (deleteObject) {
            //单个请求每次最多删除50条。
            var query = new Bmob.Query('qiandao');
            query.equalTo("parent", userid);
            query.find().then(function (todos) {
              return Bmob.Object.destroyAll(todos);
            }).then(function (todos) {

              var query = new Bmob.Query('bycode');
              query.equalTo("parent", userid);
              query.find().then(function (todos) {
                return Bmob.Object.destroyAll(todos);
              }).then(function (todos) {
              wx.hideLoading();
              wx.switchTab({
                url: '../personcenter/personcenter',
              });
              setTimeout(function () {
                wx.showToast({
                  title: '您已退出该公司',
                  icon: 'none',
                  duration: 1000,
                })
              }, 1000);
              });
            });
          },
        });
      },
    });
  },

  //解散当前公司，单次请求50
  deleteallbyid:function(id)
  {
    wx.showLoading({
      title: '正在退出',
    });
    var userid = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent_com", id);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        var all = results.length;
        var length = parseInt(all/50)+1;
         // 循环处理查询到的数据
        for (var i = 0; i < length; i++) {
          var query = new Bmob.Query('member');
          query.equalTo("parent_com", id);
          query.find().then(function (todos) {
            return Bmob.Object.destroyAll(todos);
          }).then(function (todos) {
            var query = new Bmob.Query('company');
            query.equalTo("parent", userid);
            query.find().then(function (todos) {
              return Bmob.Object.destroyAll(todos);
            }).then(function (todos) {
              var query = new Bmob.Query('qiandao');
              query.equalTo("parent_com", id);
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
                        title: '您已解散该公司',
                        icon: 'none',
                        duration: 1000,
                      })
                    }, 1000)
                  });
                });
              });
            });
          });
        }
      },
    });
  },

  //得到全部出勤情况
  getallqiandao:function(id)
  {
    var that = this;
    var Diary = Bmob.Object.extend("qiandao");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent_com", id);
    query.include("parent");
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log(results);
        that.setData({
          memberallqd: results
        });

        var Diary = Bmob.Object.extend("bycode");
        var query = new Bmob.Query(Diary);
        query.equalTo("parent_com", id);
        query.include("parent");
        // 查询所有数据
        query.find({
          success: function (results) {
            console.log("扫码签到 " + results.length + " 条记录");
            that.setData({
              codeqd: results
            });
          },
        });
      },
    });
  },

  //得到签到码  ”生成“点击
  getcodeimg:function()
  {
    var that = this;
    var date = new Date();
    var nowtime = date.getDate();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var userid = wx.getStorageSync('user_id');
    var companyid = that.data.company.objectId;
    var master = that.data.master.get('parent').objectId;

    if(master == userid)
    {
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
                content: companyid + '-' + nowtime + h + m + s,
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                var img = res.data.showapi_res_body.imgUrl;
                wx.setStorageSync('codeimg', img);

                var Diary = Bmob.Object.extend("qiandaoma");
                var User = Bmob.Object.extend("user_infor");
                var Company = Bmob.Object.extend("company");
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
    }else{
      wx.showToast({
        title: '您没有权限',
        icon: 'none',
        duration: 2000,
      });
    } 
  },

  //根据公司id 查询签到码
  getqdmbyid:function(id)
  {
    var that = this;
    var Diary = Bmob.Object.extend("qiandaoma");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent_com", id);
    // 查询所有数据
    query.find({
      success: function (results) {
        if(results.length == 0)
        {
          that.setData({
            qiandaomadis:'block',
            codedis: 'none',
          })
        }else{
          var object = results[0];
          console.log('签到码:' + object.id + ' - ' + object.get('codeurl'));
          wx.setStorageSync('qdmid', object.id);
          that.setData({
            codeurl: object.get('codeurl'),
            codedis:'block',
            qiandaomadis: 'none'
          })
        }
      },
    });
  },

  //重新生成点击
  getagain:function()
  {
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

    if(master == userid)
    {
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
                content: companyid + '-' + nowtime + h + m + s,
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
    }else{
      wx.showToast({
        title: '您没有权限',
        icon:'none',
        duration:2000,
      });
    }
  },

  getagain1:function()
  {
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
                    content: companyid+'-'+arr[1],
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
  savecode:function()
  {
    var codeimg = wx.getStorageSync('codeimg')
    wx.setClipboardData({
      data: codeimg,
      success: function (res) {
        wx.getClipboardData({
          
        })
      }
    })
  },

  //上传公司头像
  uploadimg:function()
  {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var master = that.data.master.get('parent').objectId;
    var companyid = that.data.master.id;
    if(master == userid){
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed'], 
        sourceType: ['album', 'camera'],
        success: function (res) {
          var tempFilePaths = res.tempFilePaths;
          if (tempFilePaths.length > 0) {
            var name = that.data.master.get('company')+".jpg";
            var file = new Bmob.File(name, tempFilePaths);
            file.save().then(function (res) {
              console.log(res.url());
              var url = res.url();
              var Diary = Bmob.Object.extend("company");
              var query = new Bmob.Query(Diary);
              query.get(companyid, {
                success: function (result) {
                  result.set('companyicon', url);
                  result.save(null,{
                    success: function(result){
                      var userid = wx.getStorageSync('user_id');

                      var Diary = Bmob.Object.extend("member");
                      var query = new Bmob.Query(Diary);
                      query.include('parent_com');
                      query.equalTo("parent", userid);
                      // 查询所有数据
                      query.find({
                        success: function (results) {
                          var object = results[0];
                          var companid = object.get('parent_com').objectId;
                          var Diary = Bmob.Object.extend("company");
                          var query = new Bmob.Query(Diary);
                          query.include('parent');
                          query.get(companid, {
                            success: function (result) {
                              that.setData({
                                company: object.get('parent_com'),
                                master: result,
                                dataid: '公司成员',
                                userid: userid,
                              });
                            },
                          });
                        },
                      });
                    }
                  });
                },
              });
            })
          }
        }
      })
    }else{}
  },

  //发布通知
  bindFormSubmit: function(e) {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var master = that.data.master.get('parent').objectId;
    var companyid = that.data.master.id;
    var content = e.detail.value.textarea;
    if (master == userid) {
      if(content ==""||content.length<10)
      {
        wx.showToast({
          title: '内容不能少于10个字',
          icon:'none'
        });
      }else
      {
        var Diary = Bmob.Object.extend("company");
        var query = new Bmob.Query(Diary);
        query.get(companyid, {
          success: function (result) {
            result.set('tongzhi', content);
            result.save(null, {
              success: function (result) {
                var userid = wx.getStorageSync('user_id');

                var Diary = Bmob.Object.extend("member");
                var query = new Bmob.Query(Diary);
                query.include('parent_com');
                query.equalTo("parent", userid);
                // 查询所有数据
                query.find({
                  success: function (results) {
                    var object = results[0];
                    var companid = object.get('parent_com').objectId;
                    var Diary = Bmob.Object.extend("company");
                    var query = new Bmob.Query(Diary);
                    query.include('parent');
                    query.get(companid, {
                      success: function (result) {
                        wx.showToast({
                          title: '提交成功',
                          icon:'none',
                          duration:2000
                        });
                        that.setData({
                          company: object.get('parent_com'),
                          master: result,
                          userid: userid,
                          dataid:'通知',
                          form: "none", 
                          form1: 'block'
                        });
                      },
                    });
                  },
                });
              }
            });
          },
        })
      }
    } else {
      wx.showToast({
        title: '您没有权限',
        icon:'none',
        duration:2000
      })
    }
  },

  againsubmit:function(){
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var master = that.data.master.get('parent').objectId;
    if (master == userid) {
    that.setData({form:"block",form1:'none'});
    }else{
      wx.showToast({
        title: '您无法进行此操作',
        icon:'none',
        duration:2000
      })
    }
  },

})