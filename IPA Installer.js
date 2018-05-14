/*
IPA 文件安装器
- 支持文件分享安装
- 支持主程序运行选择文件安装
- 安装完成后请返回运行界面选择后续操作

作者联系：https://t.me/axel_burks
*/

$app.strings = {
  "en": {
    "error_not_support": "Unsupport running method",
    "error_not_ipa": " not an ipa",
    "alert_title_install": "Installing...",
    "alert_message_install": "\n\nGo to desktop to see the progress.\n\nAfter installed, back to the script.\n\nTap「Done」button.",
    "alert_title_restart": "Startup Failed",
    "alert_message_restart": "Please restart this script",
    "alert_button_cancel": "Cancel",
    "alert_button_done": "Done",
    "alert_button_ok": "OK"
  },
  "zh-Hans": {
    "error_not_support": "不支持该运行方式",
    "error_not_ipa": " 非 ipa 文件",
    "alert_title_install": "正在安装...",
    "alert_message_install": "\n\n请返回桌面查看进度\n\n安装完成后请返回\n\n点击「安装完成」按钮",
    "alert_title_restart": "安装启动失败",
    "alert_message_restart": "请重新运行此脚本",
    "alert_button_cancel": "取消",
    "alert_button_done": "安装完成",
    "alert_button_ok": "好的"
  }
}

var port_number = 8080
var plist_url = "itms-services://?action=download-manifest&url=https://gitee.com/suisr/PlistServer/raw/master/universal_jsbox.plist"

// 从应用内启动
if ($app.env == $env.app) {
  $drive.open({
    handler: function(data) {
      fileCheck(data)
    }
  })
}
// 从 Action Entension 启动
else if ($app.env == $env.action) {
  fileCheck($context.data)
} else {
  $ui.error($l10n("error_not_support"))
  delayClose(2)
}

function startServer(port) {
  $http.startServer({
    port: port,
    path: "",
    handler: function(result) {
      var url = result.url
    }
  })
}

function fileCheck(data) {
  if (data && data.fileName) {
    var fileName = data.fileName;
    if (fileName.indexOf(".ipa") == -1) {
      $ui.error(fileName + $l10n("error_not_ipa"))
      delayClose(2)
    } else {
      install(fileName, data);
    }
  }
}

function install(fileName, file) {
  var result = $file.write({
    data: file,
    path: "app.ipa"
  })
  if (result) {
    startServer(port_number)
    var preResult = $app.openURL(plist_url);
    if (preResult) {
      $ui.alert({
        title: $l10n("alert_title_install"),
        message: "\n" + fileName + $l10n("alert_message_install"),
        actions: [{
            title: $l10n("alert_button_cancel"),
            style: "Cancel",
            handler: function() {
              $http.stopServer()
              $file.delete("app.ipa")
              delayClose(0.2)
            }
          },
          {
            title: $l10n("alert_button_done"),
            handler: function() {
              $http.stopServer()
              $file.delete("app.ipa")
              delayClose(0.2)
            }
          }
        ]
      })
    } else {
      warning()
    }
  } else {
    warning()
  }
}

function warning() {
  $ui.alert({
    title: $l10n("alert_title_restart"),
    message: $l10n("alert_message_restart"),
    actions: [{
      title: $l10n("alert_button_ok"),
      style: "Cancel",
      handler: function() {
        delayClose(0.2)
      }
    }]
  })
}

function delayClose(time) {
  $thread.main({
    delay: time,
    handler: function() {
      if ($app.env == $env.action || $app.env == $env.safari) {
        $context.close()
      }
      $app.close()
    }
  })
}