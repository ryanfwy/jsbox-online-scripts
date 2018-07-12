$app.strings = {
  "en": {
    "copy": "Copy",
    "copied": " Copied"
  },
  "zh-Hans": {
    "copy": "复制",
    "copied": " 已复制"
  }
}

var TEMPLATE = [{
    type: "label",
    props: {
      id: "font",
      font: $font(13),
      textColor: $color("#AAAAAA"),
      align: $align.center
    },
    layout: function(make) {
      make.height.equalTo(15)
      make.left.right.inset(15)
      make.bottom.inset(5)
    }
  },
  {
    type: "label",
    props: {
      id: "input",
      align: $align.center
    },
    layout: function(make, view) {
      var pre = view.prev
      make.bottom.equalTo(pre.top)
      make.top.inset(5)
      make.left.right.inset(15)
    }
  }
]

function renderData(text) {
  var familyNames = $objc("UIFont").invoke("familyNames").rawValue().sort()
  var data = []
  for (var family of familyNames) {
    var fontNames = $objc("UIFont").invoke("fontNamesForFamilyName", family).rawValue()
    var rows = []
    for (var font of fontNames) {
      rows.push({
        font: {
          text: font
        },
        input: {
          text: text || "Hello World",
          font: $font(font, 20)
        }
      })
    }
    data.push({
      title: family,
      rows: rows
    })
  }
  $("list").data = data
}


$ui.render({
  props: {
    title: "Font Family"
  },
  views: [{
    type: "list",
    props: {
      template: TEMPLATE,
      rowHeight: 70,
      separatorHidden: true,
      actions: [{
        title: $l10n("copy"),
        handler: function(view, indexPath) {
          var font = view.object(indexPath).font.text
          $clipboard.text = font
          $ui.toast(font + $l10n("copied"))
        }
      }]
    },
    layout: $layout.fill,
    events: {
      didSelect: function(view, indexPath) {
        $input.text({
          text: view.object(indexPath).input.text,
          placeholder: "Hello World",
          handler: function(text) {
            renderData(text)
          }
        })
      }
    }
  }]
})

renderData()
