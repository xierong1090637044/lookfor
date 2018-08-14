// pages/lookfor/lookfor.js
var Bmob = require('../../utils/bmob.js'); 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '请填写完整',
    content1: '您还没创建名片',
    animationData: {},
    animationData1: {},
    x:1,
    userinfor:'',
    maskandform:'none',
    maskandform1: 'none',
    name:'',
    zhiwei:'',
    companyloc:'',
    companyname:'',
    mpbiaoyu:'',
    phone:"",
    youxiang:'',
    allcard:'',
    allcardbg:'',
    allcarditem:'',
    orderby:0,
    ssitem:'none',
    gobackdisplay:'none',
    limit:1,
    result:'',
    nocontent:"none",
    nocontentimg: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    let app = getApp();
    new app.ToastPannel();
    var userinfor = wx.getStorageSync('user_info');
    that.setData({
      userinfor: userinfor.avatarUrl,
    });
    that.queryallcard(false,that.data.orderby,10);

    var Diary = Bmob.Object.extend("sucai");
    var query = new Bmob.Query(Diary);
    query.equalTo("title", "allcard");
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log(results[0].get('imgs'));
        that.setData({
          allcardbg:results[0].get('imgs'),
        })
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

  /**加好点击 */
  add:function(){
    var that = this;
   
    that.setData({
        maskandform1: 'block',
        allcarditem: null
    });
  },

  //上传名片图片自动识别
  uploadmpimg:function()
  {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        
      }
    })
  },

  /**我的名片 */
  mymp:function()
  {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("mycard");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", userid);
    query.find({
      success: function (results) {
        if(results.length ==0)
        {
          that.setData({
            maskandform: 'block'
          })
        }else{
          wx.navigateTo({
            url: '../mycard/mycard?userid='+userid,
          })
        }
      },
    });
  },

  /**点击设置 */
  setting: function(){
    var that = this;
    that.data.x += 1;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    });
    var animation1 = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    });
    that.animation = animation;
    that.animation1 = animation1;
    if ((that.data.x) % 2 == 0) {
      animation.right("5%").rotate(360).step();
      animation1.opacity(1).right("5%").scale(1).step();
    } else {
      animation.right("-2%").rotate(0).step();
      animation1.right("-2%").scale(0).opacity(0).step();
    }
    that.setData({
      animationData: animation.export(),
      animationData1: animation1.export()
    });
  },

  /**修改名片 */
  modify:function()
  {
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("mycard");
    var query = new Bmob.Query(Diary);
    query.equalTo("parent", userid);
    query.find({
      success: function (results) {
        if (results.length == 0) {
          that.show(that.data.content1);
        } else {
          var object = results[0];
          console.log(results[0].id)
          that.setData({
            name:object.get('name'),
            zhiwei:object.get('zhiwei'),
            companyloc: object.get('companyloc'),
            companyname: object.get('companyname'),
            mpbiaoyu: object.get('mpbiaoyu'),
            phone:object.get('phone'),
            youxiang:object.get('youxiang'),
            userinfor:object.get('tx'),
            maskandform:'block',
          });
        }
      },
    });
  },

  /**修改头像 */
  uploadimg:function()
  {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          userinfor: tempFilePaths,
        })
      }
    })
  },

  /**表格提交 */
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    var that = this;
    var userinfor = wx.getStorageSync('user_info');
    var avatar = e.detail.value.input0;
    var name = e.detail.value.input1;
    var zhiwei = e.detail.value.input2;
    var phone = e.detail.value.input3;
    var youxiang = e.detail.value.input4
    var companyname = e.detail.value.input5;
    var companyloc = e.detail.value.input6;
    var mpbiaoyu = e.detail.value.input7;

    if (avatar == "" || name == "" || zhiwei == "" || phone == "" || companyname == "" || companyloc == "" || youxiang == '')
    {
      that.toast(that.data.content);
    }else{
      var userid = wx.getStorageSync('user_id');
      var Diary = Bmob.Object.extend("mycard");
      var query = new Bmob.Query(Diary);
      query.equalTo("parent", userid);
      query.find({
        success: function (results) {
          if(results.length ==0)
          {
            if (userinfor.avatarUrl == avatar) {
              var url = userinfor.avatarUrl;
              that.uploadsuccess(url, name, zhiwei, phone, youxiang, companyname, companyloc, mpbiaoyu)
            } else {
              console.log(avatar)
              var tempFilePaths = that.data.userinfor;
              console.log(tempFilePaths);
              if (avatar.length > 0) {
                var name1 = userinfor.nickName + ".jpg";//上传的图片的别名，建议可以用日期命名
                var file = new Bmob.File(name1, tempFilePaths);
                file.save().then(function (res) {
                console.log(res.url());
                var url = res.url();
                that.uploadsuccess(url, name, zhiwei, phone, youxiang, companyname, companyloc, mpbiaoyu)
                })
              }
            }
          }
          else
          {
            console.log(avatar)
            var tempFilePaths = that.data.userinfor;
            console.log(Array.isArray(tempFilePaths));
            if (Array.isArray(tempFilePaths))
            {
              if (avatar.length > 0) {
                var name1 = userinfor.nickName + ".jpg";//上传的图片的别名，建议可以用日期命名
                var file = new Bmob.File(name1, tempFilePaths);
                file.save().then(function (res) {
                  console.log(res.url());
                  var url = res.url();
                  that.modifymp(results[0].id, url, name, zhiwei, phone, youxiang, companyname, companyloc, mpbiaoyu)
                })
              }
            }else{
              var url = avatar;
              that.modifymp(results[0].id, url, name, zhiwei, phone, youxiang, companyname, companyloc, mpbiaoyu)
            }
          }
        }
      })
    }
  },

  /**表格1提交 */
  formSubmit1: function (e,modify,id) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    var that = this;
    var userinfor = wx.getStorageSync('user_info');
    var name = e.detail.value.input1;
    var zhiwei = e.detail.value.input2;
    var phone = e.detail.value.input3;
    var youxiang = e.detail.value.input4
    var companyname = e.detail.value.input5;
    var companyloc = e.detail.value.input6;

    if (name == "" || zhiwei == "" || phone == "" || companyname == "" || companyloc == "" || youxiang == '') {
      that.toast(that.data.content);
    } else {
      var modifyid = wx.getStorageSync('modifyid');
      if (modifyid != ''){
        var Diary = Bmob.Object.extend("allcard");
        var query = new Bmob.Query(Diary);
        query.get(modifyid, {
          success: function (result) {
            result.set("name", name);
            result.set("zhiwei", zhiwei);
            result.set("phone", phone);
            result.set("youxiang", youxiang);
            result.set("companyname", companyname);
            result.set("companyloc", companyloc);
            result.save(null);
            wx.showToast({
              icon: 'success',
              title: '修改成功',
              duration: 1000,
              success: function () {
                setTimeout(function () {
                  that.setData({
                    maskandform1: 'none'
                  });
                  wx.setStorageSync('modifyid', '')
                }, 1000)
              }
            });
          },
        });
      }else{
        var Diary = Bmob.Object.extend("allcard");
        var User = Bmob.Object.extend("user_infor");
        var diary = new Diary();
        var user = new User();
        user.id = userinfor.objectId;
        diary.set("parent", user);
        diary.set("name", name);
        diary.set("zhiwei", zhiwei);
        diary.set("phone", phone);
        diary.set("youxiang", youxiang);
        diary.set("companyname", companyname);
        diary.set("companyloc", companyloc);
        diary.save(null, {
          success: function (result) {
            wx.showToast({
              icon: 'success',
              title: '添加成功',
              duration: 1000,
              success: function () {
                setTimeout(function () {
                  that.setData({
                    maskandform1: 'none',
                    orderby:1,
                  });
                  that.queryallcard(false,1);
                }, 1000)
              }
            });
          },
        });
      }
    }
  },

  /**表单消失 */
  hidden:function()
  {
    this.setData({
      maskandform:'none',
      maskandform1: 'none',
    })
  },

  toast: function (content) {
    this.show(content);
  },

  uploadsuccess: function (url, name, zhiwei, phone, youxiang,companyname, companyloc,mpbiaoyu){
    var that = this;
    var userinfor = wx.getStorageSync('user_info');
    var Diary = Bmob.Object.extend("mycard");
    var User = Bmob.Object.extend("user_infor");
    var diary = new Diary();
    var user = new User();
    user.id = userinfor.objectId;
    diary.set("parent", user);
    diary.set("tx", url);
    diary.set("name", name);
    diary.set("zhiwei", zhiwei);
    diary.set("phone", phone);
    diary.set("youxiang", youxiang);
    diary.set("companyname", companyname);
    diary.set("companyloc", companyloc);
    diary.set("mpbiaoyu", mpbiaoyu);
    diary.save(null, {
      success: function (result) {
        wx.showToast({
          icon:'success',
          title: '创建成功',
          duration:1000
        });
        that.setData({
          maskandform: 'none'
        });
        wx.navigateTo({
          url: '../mycard/mycard?userid=' + userinfor.objectId,
        })
      },
    });
  },

  /**修改名片功能 */
  modifymp: function (id,url, name, zhiwei, phone, youxiang, companyname, companyloc, mpbiaoyu) 
  {
    var that = this;
    var userinfor = wx.getStorageSync('user_info');
    var Diary = Bmob.Object.extend("mycard");
    var query = new Bmob.Query(Diary);
    query.get(id, {
      success: function (result) {
        result.set("tx", url);
        result.set("name", name);
        result.set("zhiwei", zhiwei);
        result.set("phone", phone);
        result.set("youxiang", youxiang);
        result.set("companyname", companyname);
        result.set("companyloc", companyloc);
        result.set("mpbiaoyu", mpbiaoyu);
        result.save();
          wx.showToast({
            icon: 'success',
            title: '修改成功',
            duration: 1000
          });
        that.setData({
          maskandform: 'none'
        });
        wx.navigateTo({
          url: '../mycard/mycard?userid=' + userinfor.objectId,
        })
      },
    });
  },

  /**查询allcard表 */
  queryallcard:function(isdelete,orderby,limit=10)
  {
    wx.showLoading({
      title: '加载中',
      success:function(){
        that.setData({
          allcard: null
        });
      }
    });
    var that = this;
    var userid = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("allcard");
    var query = new Bmob.Query(Diary);
    query.limit(limit);
    query.equalTo("parent", userid);
    if(orderby%2 == 1)
    {
      query.descending('createdAt')
    }else{
      query.ascending('createdAt')
    }
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("allcard " + results);
        if(results.length == 0)
        {
          var Diary = Bmob.Object.extend("sucai");
          var query = new Bmob.Query(Diary);
          query.equalTo("title", "nocontent");
          // 查询所有数据
          query.find({
            success: function (results) {
              wx.hideLoading();
              that.setData({
                nocontent:'block',
                nocontentimg:results[0].get('imgs').url,
              });
            },
          });
        }else{
          if (isdelete) {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1500
            });
            wx.hideLoading();
          };
          that.setData({
            nocontent: 'none',
            allcard: results,
          });
          wx.hideLoading();
        }
      },
    });
  },

  //复制电话号码
  cancopy: function (e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.id,
    })
  },

  //修改和删除名片
  modifyanddelete: function(e)
  {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showActionSheet({
      itemList: ['删除', '修改'],
      success: function (res) {
        console.log(res.tapIndex)
        if(res.tapIndex == 0)
        {
          var Diary = Bmob.Object.extend("allcard");
          var query = new Bmob.Query(Diary);
          query.get(id, {
            success: function (object) {
              object.destroy({
                success: function (deleteObject) {
                  that.queryallcard(true);
                },
              });
            },
          });
        }
        if (res.tapIndex == 1)
        {
          var id = e.currentTarget.dataset.id;
          var Diary = Bmob.Object.extend("allcard");
          var query = new Bmob.Query(Diary);
          wx.setStorageSync('modifyid', id);
          query.get(id, {
            success: function (result) {
              that.setData({
                allcarditem: result,
                maskandform1: 'block',
              });
            },
          });
        }
      },
      fail:function()
      {
        wx.setStorageSync('modifyid', '');
      }
    })
  },

  paixu:function()
  {
    var that = this;
    that.setData({ orderby: that.data.orderby +1 });
    that.queryallcard(false,that.data.orderby);
  },

  sousuo:function(e)
  {
    var inputname = e.detail.value;
    var that = this;
    var Diary = Bmob.Object.extend("allcard");
    var query = new Bmob.Query(Diary);
    query.equalTo("name", inputname);
    // 查询所有数据
    query.find({
      success: function (results) {
        if(results.length ==0)
        {
          wx.showModal({
            title: '没有找到',
            content: '请确保您已创建该名片',
            showCancel:false,
            confirmColor:'#2ca879',
            confirmText:'知道了',
          })
          that.setData({
            ssitem: 'none',
          });
        }else{
          that.setData({
            allcard: results,
            ssitem: 'none',
            gobackdisplay:'block',
          });
        }
      }
    })
  },

  sousuo1:function()
  {
    var that = this;
    that.setData({
      ssitem:'block'
    })
  },

  hidden1:function()
  {
    var that = this;
    that.setData({
      ssitem: 'none'
    });
  },

  goback:function(){
    var that = this;
    that.queryallcard();
    that.setData({
      gobackdisplay:'none'
    })
  },

  scroll:function(){
    var that = this;
    var limit = that.data.limit + 1;
    var amount = limit * 10;
    var userid = wx.getStorageSync('user_id');
    var Diary = Bmob.Object.extend("allcard");
    var query = new Bmob.Query(Diary);
    var orderby = that.data.orderby;
    query.limit(amount);
    if (orderby % 2 == 1) {
      query.descending('createdAt');
    } else {
      query.ascending('createdAt');
    }
    query.equalTo("parent", userid);
    query.find({
    success: function (results) {
        console.log(results.length);
        if(results.length >10)
        {
          if (results.length == that.data.result )
          {
            wx.showToast({
              title: '到底啦',
              icon: 'none',
            })
          }else{
            wx.showLoading({
              title: '加载中',
              success: function () {
                that.setData({
                  allcard: results,
                  result: results.length
                });
                setTimeout(function () {
                  wx.hideLoading();
                }, 1000)
              }
            })
          }
        }else{
          wx.showToast({
            title: '到底啦',
            icon:'none',
          })
        }
        },
        });
  },
})