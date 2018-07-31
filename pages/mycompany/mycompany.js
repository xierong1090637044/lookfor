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
    noqiandao:'none',
    haveqiandao:'none',
    userid:'',
    modifydisplay:'none',
    lxid:'',
    inputValue:'',
    memberallqd:'',
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
    var that = this;
    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent_com", id);
    query.include("parent");
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log('公司用户成员'+results);
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
          var all = later + commo;
          that.setData({
            qiandao: results,
            allqiandao: all,
            noqiandao: 'none',
            haveqiandao: 'block',
          });
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
          wx.showToast({
            title: '修改成功',
            icon:'none',
            duration:1000
          });
          setTimeout(function(){
            that.getmembers();
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
          },
        });
      },
    });
  },

  //解散当前公司，单次请求50
  deleteallbyid:function(id)
  {
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
        })
      },
    });
  }

})