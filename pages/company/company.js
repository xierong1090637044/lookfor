var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var Bmob = require('../../utils/bmob.js'); 
var qqmapsdk;
Page({
  data: {
    header:'',
    content: '请填写公司/活动名称',
    content1:'未选择地点，将默认为当前位置',
    content2: '您已创建公司，请勿重复创建',
    content3: '电话号码格式有误',
    content4: '请选择上、下班时间',
    content5: '请选择签到时间',
    content6: '您已创建活动，请勿重复创建',
    mylocaltion:'',
    username:'',
    latitude:'',
    longitude:'',
    maskandform:'none',
    maskandform1: 'none',
    time:'',
    time1:'',
    display:'',
    display1: 'none', 
    display2: 'none',
    company:'',
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    let app = getApp();
    new app.ToastPannel();

    var that = this;
    var user_info = wx.getStorageSync('user_info');
    console.log(user_info.nickName);
    that.setData({ username: user_info.nickName});

    qqmapsdk = new QQMapWX({
      key: '3ACBZ-5PK34-HPZUT-XFODA-F4YS3-LNFXB'
    });

    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        var accuracy = res.accuracy;
        that.setData({
          latitude:latitude,
          longitude:longitude,
        });
        // 调用接口
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (res) {
            that.setData({
              mylocaltion: res.result.address
            })
          },
        });
      }
    });

    var Diary = Bmob.Object.extend("sucai");
    var query = new Bmob.Query(Diary);
    query.equalTo("title", "header");
    // 查询所有数据
    query.find({
      success: function (results) {
        that.setData({ header: results[0].get('imgs')._url})
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
    // 调用接口
  },

  /*** 生命周期函数--监听页面隐藏*/
  onHide: function () {
  
  },

  /*"创建公司"*/
  createcompany:function()
  {
    this.setData({
      maskandform: 'block'
    })
  },

  /*"创建活动"*/
  createact: function () {
    this.setData({
      maskandform1: 'block'
    })
  },

  /**加入公司 */
  joincompany:function()
  {
    var that = this;

    wx.navigateTo({
      url: '../joincompany/joincompany',
    })
  },

  gotocreate:function()
  {
    var that = this;
    that.setData({
      display: 'block',
      display1: 'none',
    })
  },

  /*"我的公司"*/
  mycompany: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
    });
    var userid = wx.getStorageSync('user_id');

    var Diary = Bmob.Object.extend("member");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", userid);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
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
    });
  },

    /*"创建公司隐藏层表单提交"*/
  formSubmit: function (e) {
    var that = this;
    console.log(e.detail.value);
    var id= wx.getStorageSync('user_id');
    var companyname = e.detail.value.input1;
    var localtion = e.detail.value.input2;
    var master = e.detail.value.input3;
    var phone = e.detail.value.input4;
    var worktime = e.detail.value.worktime;
    var leavetime = e.detail.value.leavetime;
    var latitude = that.data.latitude;
    var longitude = that.data.longitude;

    if(companyname =="")
    {
      this.toast(that.data.content);
    }
    else if (phone.length <11)
    {
      console.log(phone.length);
      this.toast(that.data.content3);
    }
    else if(worktime=='' || leavetime=='')
    {
      this.toast(that.data.content4);
    }
    else
    {
      var Diary = Bmob.Object.extend("company");
      var query = new Bmob.Query(Diary);
      query.equalTo("parent", id);
      // 查询所有数据
      query.find({
        success: function (results) {
          if (results.length==0)
          {
            var Diary = Bmob.Object.extend("company");
            var Post = Bmob.Object.extend("user_infor");
            var diary = new Diary();
            diary.set("company", companyname);
            diary.set("localtion", localtion);
            diary.set("latitude", latitude);
            diary.set("longitude", longitude);
            diary.set("worktime",worktime);
            diary.set("leavetime", leavetime);
            diary.set("companyicon",'');
            diary.set("tongzhi", '');
            var post = new Post();
            post.id = id;
            diary.set("parent", post);
            diary.save(null, {
              success: function (result) {
                console.log("日记创建成功, objectId:" + result.id);
                var companyid = result.id;
                var Diary = Bmob.Object.extend("member");
                var Post = Bmob.Object.extend("user_infor");
                var Company = Bmob.Object.extend("company");
                var diary = new Diary();
                diary.set("phone", phone);
                var post = new Post();
                post.id = id;
                diary.set("parent", post);
                var company = new Company();
                company.id = companyid;
                diary.set("parent_com", company);
                diary.save(null, {
                  success: function (result) {
                    console.log("日记创建成功, objectId:" + result.id);
                    wx.showToast({
                      title: '创建成功',
                      icon: 'none',
                      duration: 2000
                    })
                    that.setData({
                      maskandform: 'none'
                    })
                  },
                });
              },
            });
          }else
          {
            that.toast(that.data.content2);
          }
        },
      });
    }
  },

  /*"创建活动隐藏层表单提交"*/
  formSubmit1: function (e) {
    var that = this;
    console.log(e.detail.value);
    var id = wx.getStorageSync('user_id');
    var companyname = e.detail.value.input1;
    var localtion = e.detail.value.input2;
    var master = e.detail.value.input3;
    var phone = e.detail.value.input4;
    var worktime = e.detail.value.worktime;
    var latitude = that.data.latitude;
    var longitude = that.data.longitude;

    if (companyname == "") {
      this.toast(that.data.content);
    }
    else if (phone.length < 11) {
      console.log(phone.length);
      this.toast(that.data.content3);
    }
    else if (worktime == '') {
      this.toast(that.data.content5);
    }
    else {
      var Diary = Bmob.Object.extend("activity");
      var query = new Bmob.Query(Diary);
      query.equalTo("parent", id);
      // 查询所有数据
      query.find({
        success: function (results) {
          if (results.length == 0) {
            var Diary = Bmob.Object.extend("activity");
            var Post = Bmob.Object.extend("user_infor");
            var diary = new Diary();
            diary.set("company", companyname);
            diary.set("localtion", localtion);
            diary.set("latitude", latitude);
            diary.set("longitude", longitude);
            diary.set("worktime", worktime);
            diary.set("tongzhi", '');
            var post = new Post();
            post.id = id;
            diary.set("parent", post);
            diary.save(null, {
              success: function (result) {
                console.log("日记创建成功, objectId:" + result.id);
                var companyid = result.id;
                var Diary = Bmob.Object.extend("member_act");
                var Post = Bmob.Object.extend("user_infor");
                var Company = Bmob.Object.extend("activity");
                var diary = new Diary();
                var post = new Post();
                var company = new Company();
                post.id = id;
                company.id = companyid;
                diary.set("phone", phone);
                diary.set("parent", post);
                diary.set("parent_com", company);
                diary.save(null, {
                  success: function (result) {
                    console.log("日记创建成功, objectId:" + result.id);
                    wx.showToast({
                      title: '活动创建成功',
                      icon: 'none',
                      duration: 2000
                    })
                    that.setData({
                      maskandform1: 'none'
                    })
                  },
                });
              },
            });
          } else {
            that.toast(that.data.content2);
          }
        },
      });
    }
  },

  chooselocation:function()
  {
    var that = this;
        wx.chooseLocation({
          success:function(res){
            console.log(res)
            if(res.name==null ||res.name=="")
            {
              that.toast(that.data.content1);
            }else
            {
              that.setData({
                mylocaltion: res.name,
                latitude: res.latitude,
                longitude: res.longitude,
              })
            }
          },
          fail:function(){
            that.toast(that.data.content1);
          }
        })
  },

  toast: function (content) {
    this.show(content);
  },
  
  hidden:function()
  {
    this.setData({
      maskandform:'none',
      maskandform1: 'none'
    })
  },

  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },

  bindTimeChange1: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time1: e.detail.value
    })
  },
})