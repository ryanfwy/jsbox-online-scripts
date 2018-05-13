$app.strings = {
  "en": {
    "button_delete": "Delete",
    "alert_delete_title": "Warning",
    "alert_delete_message": "Sure to delete selected addins?\nThis action cannot be undone.",
    "alert_button_cancel": "Cancel",
    "toast_deleted": "Deleted"
  },
  "zh-Hans": {
    "button_delete": "删除",
    "alert_delete_title": "警告",
    "alert_delete_message": "确定要删除所选脚本?\n一旦删除将无法撤回。",
    "alert_button_cancel": "取消",
    "toast_deleted": "已删除"
  }
}

const TEMPLATE = {
  props: {
    multipleSelectionBackgroundView: $ui.create({type: "view"})
  },
  views: [{
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
  }]
}

Array.prototype.removeObjectsAtIndexes = function(rows) {
  rows.sort(function(a, b){ return b-a })
  for (var row of rows) {
    this.splice(row, 1)
  }
}

listAddinFiles()


/* Function */
function listAddinFiles() {
  $ui.render({
    props: {
      title: "Quick Delete"
    },
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
              title: $l10n("button_delete"),
              bgcolor: $color("#DF565D")
            },
            layout: function(make, view) {
              shadowButton(view)
              make.top.bottom.inset(10)
              make.left.right.inset(20)
            },
            events: {
              tapped: function(sender) {
                if (!$("list").runtimeValue().invoke("indexPathsForSelectedRows").rawValue().length) return
                deleteAlert()
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
          template: TEMPLATE,
          rowHeight: 50,
          allowsMultipleSelectionDuringEditing: true,
          editing: true
        },
        layout: function(make, view) {
          var pre = view.prev
          make.top.equalTo(pre.bottom)
          make.left.bottom.right.inset(0)
        }
      }
    ]
  })

  var data = []
  for (var d of $addin.list) {
    data.push({
      icon: {
        icon: $icon(d.icon.replace(/^([^.]+).*$/, "$1.png"), $color("gray"))
      },
      name: {
        text: d.displayName
      }
    })
  }
  $("list").data = data

  // Replace the delegate
  $define({
    type: "TableViewDelegate: NSObject <UITableViewDelegate>"
  })
  delegate = $objc("TableViewDelegate").invoke("alloc.init")
  $("list").runtimeValue().invoke("setDelegate", delegate)
}

function deleteAlert() {
  $ui.alert({
    title: $l10n("alert_delete_title"),
    message: $l10n("alert_delete_message"),
    actions: [{
        title: $l10n("alert_button_cancel"),
        style: "Cancel",
        handler: function() {}
      },
      {
        title: $l10n("button_delete"),
        style: "Destructive",
        handler: function() {
          deleteSelected()
        }
      }
    ]
  })
}

function deleteSelected() {
  var list = $("list")
  var selected = list.runtimeValue().invoke("indexPathsForSelectedRows").rawValue()
  for (var indexPath of selected) {
    var name = list.object(indexPath.rawValue()).name.text
    $console.info(name)
    $addin.delete(name)
  }
  var data = list.data
  var rows = selected.map(
    function(r) {
      return r.rawValue().row
    }
  )
  data.removeObjectsAtIndexes(rows)
  list.data = data

  $ui.toast($l10n("toast_deleted"))
}

function shadowButton(view) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setShadowOffset", $size(0, 3))
  layer.invoke("setShadowColor", $color("lightGray").runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.5)
  layer.invoke("setShadowRadius", 5)
}