//app.js
const Bmob = require('utils/bmob.js');
Bmob.initialize("43edf782e0c9f04b3118c17b2c3f9ebe", "7f0b49f19a58d885bb248c3c64ac9fa6");

App({
  onLaunch: function () {
    var that = this;
    //调用API从本地缓存中获取数据
    try {
      var value = wx.getStorageSync('user_openid')
      if (value) {
      } else {
        console.log('执行login1')
        wx.login({
          success: function (res) {
            if (res.code) {
              console.log('执行login2', res);
            }
          }
        });
        wx.login({
          success: function (res) {
            if (res.code) {
              Bmob.User.requestOpenId(res.code, {
                success: function (userData) {
                  wx.getUserInfo({
                    success: function (result) {
                      var userInfo = result.userInfo
                      var nickName = userInfo.nickName
                      var avatarUrl = userInfo.avatarUrl
                      var sex = userInfo.gender
                      Bmob.User.logIn(nickName, userData.openid, {
                        success: function (user) {
                          try {
                            wx.setStorageSync('user_openid', user.get('userData').openid)
                            wx.setStorageSync('user_id', user.id)
                            wx.setStorageSync('my_nick', user.get("nickname"))
                            wx.setStorageSync('my_username', user.get("username"))
                            wx.setStorageSync('my_sex', user.get("sex"))
                            wx.setStorageSync('my_avatar', user.get("userPic"))
                          } catch (e) {
                          }
                          console.log("登录成功");
                        },
                        error: function (user, error) {
                          if (error.code == '101') {
                            var user = new Bmob.User();//开始注册用户
                            user.set('username', nickName);
                            user.set('password', userData.openid);
                            user.set("nickname", nickName);
                            user.set("userPic", avatarUrl);
                            user.set("userData", userData);
                            user.set('sex', sex);
                            user.set('feednum', 0);
                            user.signUp(null, {
                              success: function (result) {
                                console.log('注册成功');
                                try {//将返回的3rd_session存储到缓存中
                                  wx.setStorageSync('user_openid', user.get('userData').openid)
                                  wx.setStorageSync('user_id', user.id)
                                  wx.setStorageSync('my_nick', user.get("nickname"))
                                  wx.setStorageSync('my_username', user.get("username"))
                                  wx.setStorageSync('my_sex', user.get("sex"))
                                  wx.setStorageSync('my_avatar', user.get("userPic"))
                                } catch (e) {
                                }
                              },
                              error: function (userData, error) {
                                console.log("openid=" + userData);
                                console.log(error)
                              }
                            });
                          }
                        }
                      });
                    }
                  })
                },
                error: function (error) {
                  console.log("Error: " + error.code + " " + error.message);
                }
              });
            } else {
              console.log('获取用户登录态失败1！' + res.errMsg)
            }
          },
          complete: function (e) {
            console.log('获取用户登录态失败2！' + e)
          }
        });
      }
    } catch (e) {
      console.log("登陆失败")
    }
    wx.checkSession({
      success: function () {
      },
      fail: function () {
        //登录态过期，重新登录
        wx.login()
      }
    })
  },
  onShow: function () {

  },
  formate_data: function (date) {
    let month_add = date.getMonth() + 1;
    var formate_result = date.getFullYear() + '年'
      + month_add + '月'
      + date.getDate() + '日'
      + ' '
      + date.getHours() + '点'
      + date.getMinutes() + '分';
    return formate_result;
  },

  getUserInfo: function (cb) {
    var that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      });
    }
  },
  globalData: {
    userInfo: null,
  },
  onPullDownRefresh: function () {
    //wx.stopPullDownRefresh()
  },
  onError: function (msg) {
  }
})