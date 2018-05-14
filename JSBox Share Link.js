$app.strings = {
  "en": {
    "alert_button_copy": "Copy",
    "button_generate_link": "Generate Link",
    "button_paste": "Paste",
    "button_select": "Select",
    "toast_copied": "Copied",
    "error_not_url": "Invalid URL",
    "error_not_icon": "Invalid Icon",
    "error_no_url": "Require URL",
    "error_not_types": "Invalid Types",
    "title_name": "Name",
    "title_url": "URL",
    "title_icon": "Icon",
    "title_types": "Types",
    "title_version": "VERSION",
    "title_author": "Author",
    "title_website": "Website",
    "types_1": "Application",
    "types_2": "Today Widget",
    "types_3": "Action Extension",
    "types_4": "Keyboard"
  },
  "zh-Hans": {
    "alert_button_copy": "复制",
    "button_generate_link": "生成链接",
    "button_paste": "粘贴",
    "button_select": "选择",
    "toast_copied": "已复制",
    "error_not_url": "无效的 URL",
    "error_no_url": "必须输入 URL",
    "error_not_icon": "无效的图标",
    "error_not_types": "无效的类型",
    "title_name": "名称",
    "title_url": "URL",
    "title_icon": "图标",
    "title_types": "类型",
    "title_version": "版本",
    "title_author": "作者",
    "title_website": "网站",
    "types_1": "主应用",
    "types_2": "通知中心小部件",
    "types_3": "分享面板扩展",
    "types_4": "键盘"
  }
}

const TEMPLATE = [{
    type: "image",
    props: {
      id: "icon",
      bgcolor: $color("clear")
    },
    layout: function(make) {
      make.centerY.equalTo()
      make.left.inset(20)
    }
  },
  {
    type: "label",
    props: {
      id: "name",
      font: $font("bold", 18),
      textColor: $color("darkGray")
    },
    layout: function(make, view) {
      var pre = view.prev
      make.centerY.equalTo()
      make.left.equalTo(pre.right).offset(15)
    }
  },
  {
    type: "label",
    props: {
      id: "package",
      hidden: true,
      text: "Package",
      font: $font("Georgia-BoldItalic", 20),
      textColor: $color("gray"),
      alpha: 0.1
    },
    layout: function(make) {
      make.centerY.equalTo()
      make.height.equalTo(25)
      make.right.inset(10)
    }
  }
]

String.prototype.isURL = function() {
  return /^https*:\/\/[^\s]+$/.test(this)
}

String.prototype.isIcon = function() {
  var match = this.match(/^icon_(\d{3})\.png$/)
  if (match) {
    return parseInt(match[1]) <= 192 && parseInt(match[1]) > 0
  }
  return false
}

String.prototype.isTypes = function() {
  return parseInt(this) <= 15 && parseInt(this) > 0
}

String.prototype.isVersion = function() {
  return /^(\d+\.{0,1})+\d$/.test(this)
}

String.prototype.isPackage = function() {
  return this.indexOf(".js") == -1 ? true : false
}

String.prototype.prependZero = function(digit) {
  var zeros = new Array(digit - this.length + 1).join("0")
  return zeros + this
}

var iconData = null

$app.listen({
  ready: function() {
    $app.autoKeyboardEnabled = true
    listAddinFiles()
  },
  exit: function() {
    $app.autoKeyboardEnabled = false
  }
})

/* Function */
function listAddinFiles() {
  $ui.render({
    views: [{
      type: "list",
      props: {
        id: "list_addins",
        template: TEMPLATE,
        rowHeight: 50
      },
      layout: $layout.fill,
      events: {
        didSelect: function(sender, indexPath) {
          var addin = $addin.list[indexPath.row]
          pushEditorView(addin)
        }
      }
    }]
  })

  var data = []
  for (var d of $addin.list) {
    data.push({
      icon: {
        icon: $icon(d.icon.replace(/^([^.]+).*$/, "$1.png"), $color("gray"))
      },
      name: {
        text: d.displayName
      },
      package: {
        hidden: !d.name.isPackage()
      }
    })
  }
  $("list_addins").data = data
}

function pushEditorView(file) {
  var isEnabled = file.name.indexOf(".js") == -1 ? false : true
  $ui.push({
    views: [{
        type: "view",
        layout: function(make) {
          make.height.equalTo(50)
          make.left.top.right.inset(0)
        },
        views: [{
            type: "button",
            props: {
              clipsToBounds: false,
              title: $l10n("button_generate_link")
            },
            layout: function(make, view) {
              shadowButton(view)
              make.top.bottom.inset(10)
              make.left.right.inset(20)
            },
            events: {
              tapped: function(sender) {
                if ($("input_2").text.length === 0) {
                  $ui.error($l10n("error_no_url"))
                  return
                }
                actionGenerateLink(!isEnabled)
              }
            }
          },
          {
            type: "canvas",
            layout: function(make, view) {
              var sup = view.super
              make.bottom.equalTo(sup)
              make.height.equalTo(1)
              make.left.right.inset(0)
            },
            events: {
              draw: function(view, ctx) {
                var width = view.frame.width
                var scale = $device.info.screen.scale
                ctx.strokeColor = $color("gray")
                ctx.setLineWidth(1 / scale)
                ctx.moveToPoint(0, 1)
                ctx.addLineToPoint(width, 1)
                ctx.strokePath()
              }
            }
          }
        ]
      },
      {
        type: "list",
        props: {
          id: "list_editor",
          rowHeight: 50,
          bgcolor: $color("#FDFDFD"),
          data: [{
              title: $l10n("title_name"),
              rows: [{
                type: "input",
                props: {
                  id: "input_1",
                  text: file.displayName,
                  bgcolor: $color("white"),
                  textColor: $color("darkGray"),
                  paddingLeft: 6
                },
                layout: $layout.fill,
                events: {
                  returned: function(sender) {
                    sender.blur()
                  }
                }
              }]
            },
            {
              title: $l10n("title_url"),
              rows: [{
                type: "view",
                layout: $layout.fill,
                views: [{
                    type: "button",
                    props: {
                      title: $l10n("button_paste"),
                      bgcolor: $color("#FDFDFD"),
                      titleColor: $color("tint"),
                      radius: 0
                    },
                    layout: function(make) {
                      make.width.equalTo(70)
                      make.top.right.bottom.inset(0)
                    },
                    events: {
                      tapped: function(sender) {
                        var field = sender.super.views[2]
                        actionPasteURL(field)
                      }
                    }
                  },
                  {
                    type: "canvas",
                    layout: function(make, view) {
                      var pre = view.prev
                      make.right.equalTo(pre.left)
                      make.width.equalTo(1)
                      make.top.bottom.inset(0)
                    },
                    events: {
                      draw: function(view, ctx) {
                        var height = view.frame.height
                        var scale = $device.info.screen.scale
                        ctx.strokeColor = $color("gray")
                        ctx.setLineWidth(1 / scale)
                        ctx.moveToPoint(1, 0)
                        ctx.addLineToPoint(1, height)
                        ctx.strokePath()
                      }
                    }
                  },
                  {
                    type: "input",
                    props: {
                      id: "input_2",
                      type: $kbType.url,
                      bgcolor: $color("white"),
                      textColor: $color("darkGray"),
                      paddingLeft: 6
                    },
                    layout: function(make, view) {
                      var pre = view.prev
                      make.right.equalTo(pre.left)
                      make.left.top.bottom.inset(0)
                    },
                    events: {
                      didBeginEditing: function(sender) {
                        sender.info = sender.text
                      },
                      didEndEditing: function(sender) {
                        if (sender.text.isURL()) {
                          sender.info = sender.text
                        } else {
                          sender.text = sender.info
                          $ui.error($l10n("error_not_url"))
                        }
                      },
                      returned: function(sender) {
                        sender.blur()
                      }
                    }
                  }
                ]
              }]
            },
            {
              title: $l10n("title_icon"),
              rows: [{
                type: "view",
                layout: $layout.fill,
                views: [{
                    type: "button",
                    props: {
                      enabled: isEnabled,
                      title: $l10n("button_select"),
                      bgcolor: $color("#FDFDFD"),
                      titleColor: $color("tint"),
                      radius: 0
                    },
                    layout: function(make) {
                      make.width.equalTo(70)
                      make.top.right.bottom.inset(0)
                    },
                    events: {
                      tapped: function(sender) {
                        actionSelectIcon()
                      }
                    }
                  },
                  {
                    type: "canvas",
                    layout: function(make, view) {
                      var pre = view.prev
                      make.right.equalTo(pre.left)
                      make.width.equalTo(1)
                      make.top.bottom.inset(0)
                    },
                    events: {
                      draw: function(view, ctx) {
                        var height = view.frame.height
                        var scale = $device.info.screen.scale
                        ctx.strokeColor = $color("gray")
                        ctx.setLineWidth(1 / scale)
                        ctx.moveToPoint(1, 0)
                        ctx.addLineToPoint(1, height)
                        ctx.strokePath()
                      }
                    }
                  },
                  {
                    type: "image",
                    props: {
                      icon: $icon(file.icon.replace(/^([^.]+).*$/, "$1.png"), $color("gray")),
                      bgcolor: $color("clear")
                    },
                    layout: function(make) {
                      make.size.equalTo($size(25, 25))
                      make.centerY.equalTo()
                      make.left.inset(15)
                    }
                  },
                  {
                    type: "input",
                    props: {
                      id: "input_3",
                      enabled: isEnabled,
                      text: file.icon.replace(/^([^.]+).*$/, "$1.png"),
                      type: $kbType.nap,
                      bgcolor: $color("white"),
                      textColor: $color("darkGray"),
                      paddingLeft: 6
                    },
                    layout: function(make, view) {
                      var pre = view.prev
                      var ppre = pre.prev
                      make.left.equalTo(pre.right)
                      make.right.equalTo(ppre.left)
                      make.top.bottom.inset(0)
                    },
                    events: {
                      didBeginEditing: function(sender) {
                        sender.info = sender.text
                        sender.runtimeValue().invoke("setSelectionRange", $range(5, 3))
                      },
                      didEndEditing: function(sender) {
                        if (sender.text.isIcon()) {
                          sender.info = sender.text
                          sender.prev.icon = $icon(sender.text, $color("gray"))
                        } else {
                          sender.text = sender.info
                          $ui.error($l10n("error_not_icon"))
                        }
                      },
                      returned: function(sender) {
                        sender.blur()
                      }
                    }
                  }
                ]
              }]
            },
            {
              title: $l10n("title_types"),
              rows: [{
                type: "view",
                layout: $layout.fill,
                views: [{
                    type: "button",
                    props: {
                      enabled: isEnabled,
                      title: $l10n("button_select"),
                      bgcolor: $color("#FDFDFD"),
                      titleColor: $color("tint"),
                      radius: 0
                    },
                    layout: function(make) {
                      make.width.equalTo(70)
                      make.top.right.bottom.inset(0)
                    },
                    events: {
                      tapped: function(sender) {
                        var field = sender.super.views[2]
                        actionSelectTypes(field, parseInt(field.text))
                      }
                    }
                  },
                  {
                    type: "canvas",
                    layout: function(make, view) {
                      var pre = view.prev
                      make.right.equalTo(pre.left)
                      make.width.equalTo(1)
                      make.top.bottom.inset(0)
                    },
                    events: {
                      draw: function(view, ctx) {
                        var height = view.frame.height
                        var scale = $device.info.screen.scale
                        ctx.strokeColor = $color("gray")
                        ctx.setLineWidth(1 / scale)
                        ctx.moveToPoint(1, 0)
                        ctx.addLineToPoint(1, height)
                        ctx.strokePath()
                      }
                    }
                  },
                  {
                    type: "input",
                    props: {
                      id: "input_4",
                      enabled: isEnabled,
                      text: file.types.toString(),
                      type: $kbType.nap,
                      bgcolor: $color("white"),
                      textColor: $color("darkGray"),
                      paddingLeft: 6
                    },
                    layout: function(make, view) {
                      var pre = view.prev
                      make.right.equalTo(pre.left)
                      make.left.top.bottom.inset(0)
                    },
                    events: {
                      didBeginEditing: function(sender) {
                        sender.info = sender.text
                      },
                      didEndEditing: function(sender) {
                        if (sender.text.isTypes()) {
                          sender.info = sender.text
                        } else {
                          sender.text = sender.info
                          $ui.error($l10n("error_not_types"))
                        }
                      },
                      returned: function(sender) {
                        sender.blur()
                      }
                    }
                  }
                ]
              }]
            },
            {
              title: $l10n("title_version"),
              rows: [{
                type: "input",
                props: {
                  id: "input_5",
                  enabled: isEnabled,
                  text: file.version,
                  type: $kbType.nap,
                  bgcolor: $color("white"),
                  textColor: $color("darkGray"),
                  paddingLeft: 6
                },
                layout: $layout.fill,
                events: {
                  didBeginEditing: function(sender) {
                    sender.info = sender.text
                  },
                  didEndEditing: function(sender) {
                    if (sender.text.isVersion()) {
                      sender.info = sender.text
                    } else {
                      sender.text = sender.info
                      $ui.error("Invalid Version")
                    }
                  },
                  returned: function(sender) {
                    sender.blur()
                  }
                }
              }]
            },
            {
              title: $l10n("title_author"),
              rows: [{
                type: "input",
                props: {
                  id: "input_6",
                  enabled: isEnabled,
                  text: file.author,
                  bgcolor: $color("white"),
                  textColor: $color("darkGray"),
                  paddingLeft: 6
                },
                layout: $layout.fill,
                events: {
                  returned: function(sender) {
                    sender.blur()
                  }
                }
              }]
            },
            {
              title: $l10n("title_website"),
              rows: [{
                type: "view",
                layout: $layout.fill,
                views: [{
                    type: "button",
                    props: {
                      enabled: isEnabled,
                      title: $l10n("button_paste"),
                      bgcolor: $color("#FDFDFD"),
                      titleColor: $color("tint"),
                      radius: 0
                    },
                    layout: function(make) {
                      make.width.equalTo(70)
                      make.top.right.bottom.inset(0)
                    },
                    events: {
                      tapped: function(sender) {
                        var field = sender.super.views[2]
                        actionPasteURL(field)
                      }
                    }
                  },
                  {
                    type: "canvas",
                    layout: function(make, view) {
                      var pre = view.prev
                      make.right.equalTo(pre.left)
                      make.width.equalTo(1)
                      make.top.bottom.inset(0)
                    },
                    events: {
                      draw: function(view, ctx) {
                        var height = view.frame.height
                        var scale = $device.info.screen.scale
                        ctx.strokeColor = $color("gray")
                        ctx.setLineWidth(1 / scale)
                        ctx.moveToPoint(1, 0)
                        ctx.addLineToPoint(1, height)
                        ctx.strokePath()
                      }
                    }
                  },
                  {
                    type: "input",
                    props: {
                      id: "input_7",
                      enabled: isEnabled,
                      text: file.website,
                      type: $kbType.url,
                      bgcolor: $color("white"),
                      textColor: $color("darkGray"),
                      paddingLeft: 6
                    },
                    layout: function(make, view) {
                      var pre = view.prev
                      make.right.equalTo(pre.left)
                      make.left.top.bottom.inset(0)
                    },
                    events: {
                      didBeginEditing: function(sender) {
                        sender.info = sender.text
                      },
                      didEndEditing: function(sender) {
                        if (sender.text.isURL() || !sender.text) {
                          sender.info = sender.text
                        } else {
                          sender.text = sender.info
                          $ui.error($l10n("error_not_url"))
                        }
                      },
                      returned: function(sender) {
                        sender.blur()
                      }
                    }
                  }
                ]
              }]
            }
          ]
        },
        layout: function(make, view) {
          var pre = view.prev
          make.top.equalTo(pre.bottom)
          make.left.bottom.right.inset(0)
        }
      }
    ]
  })
}

function actionPasteURL(textField) {
  var clip = $clipboard.link || $clipboard.text
  if (clip.isURL()) {
    textField.text = clip
  } else {
    $ui.error($l10n("error_not_url"))
  }
}

function actionSelectIcon() {
  var iconHandler = $block("void, NSString *", function(icon) {
    $("input_3").text = icon.rawValue()
    $("input_3").prev.icon = $icon(icon.rawValue(), $color("gray"))
  })

  var icons = $objc("AddinIconPicker").invoke("alloc.init")
  icons.invoke("setCompletionHandler", iconHandler)
  icons.invoke("show")
}

function actionSelectTypes(textField, types) {
  const TYPE = [1, 2, 4, 8]

  $ui.push({
    props: {
      title: $l10n("title_types")
    },
    views: [{
      type: "list",
      props: {
        id: "list_types",
        rowHeight: 50,
        scrollEnabled: false,
        data: [{
            type: "label",
            props: {
              text: $l10n("types_1"),
              textColor: $color("darkGray")
            },
            layout: function(make) {
              make.left.inset(15)
              make.top.bottom.right.inset(0)
            }
          },
          {
            type: "label",
            props: {
              text: $l10n("types_2"),
              textColor: $color("darkGray")
            },
            layout: function(make) {
              make.left.inset(15)
              make.top.bottom.right.inset(0)
            }
          },
          {
            type: "label",
            props: {
              text: $l10n("types_3"),
              textColor: $color("darkGray")
            },
            layout: function(make) {
              make.left.inset(15)
              make.top.bottom.right.inset(0)
            }
          },
          {
            type: "label",
            props: {
              text: $l10n("types_4"),
              textColor: $color("darkGray")
            },
            layout: function(make) {
              make.left.inset(15)
              make.top.bottom.right.inset(0)
            }
          }
        ]
      },
      layout: $layout.fill,
      events: {
        didSelect: function(sender, indexPath) {
          var cell = sender.cell(indexPath).runtimeValue()
          var selected = cell.invoke("accessoryType")
          if (selected === 0) {
            cell.invoke("setAccessoryType", 3)
            types += TYPE[indexPath.row]
            textField.text = (types).toString()
          } else if (TYPE.indexOf(types) === -1) {
            cell.invoke("setAccessoryType", 0)
            types -= TYPE[indexPath.row]
            textField.text = (types).toString()
          }
        }
      }
    }]
  })

  $delay(0.1, function() {
    var list = $("list_types")
    for (var i in TYPE) {
      if (parseInt(types) & TYPE[i]) list.cell($indexPath(0, i)).runtimeValue().invoke("setAccessoryType", 3)
    }
  })
}

function actionGenerateLink(isPackage = false) {
  var parameter = []
  if (!isPackage) {
    const NAME = ["", "name", "url", "icon", "types", "version", "author", "website"]
    for (var i = 1; i <= 7; i++) {
      var text = $("input_" + i).text
      if (text) parameter.push(NAME[i] + "=" + encodeURIComponent(text))
    }
  } else {
    const NAME = ["", "name", "url"]
    for (var i = 1; i <= 2; i++) {
      var text = $("input_" + i).text
      parameter.push(NAME[i] + "=" + encodeURIComponent(text))
    }
  }

  var query = parameter.join("&")
  var url = "https://xteko.com/redir?" + query

  var linkHandler = $block("void", function() {
    $ui.toast($l10n("toast_copied"))
    $clipboard.text = url
  })

  var hint = $objc("BaseHintView").invoke("alloc.initWithText:buttonText:", url, $l10n("alert_button_copy"))
  hint.invoke("setButtonTappedHandler", linkHandler)
  hint.invoke("show")
}

function shadowButton(view) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setShadowOffset", $size(0, 3))
  layer.invoke("setShadowColor", $color("lightGray").runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.5)
  layer.invoke("setShadowRadius", 5)
}