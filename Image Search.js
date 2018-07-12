$app.strings = {
  "en": {
    "item_clipboard_link": "Search by Clipboard Link",
    "item_clipboard_image": "Search by Clipboard Image",
    "item_pick": "Pick from Photos",
    "engine_google": "Google",
    "engine_baidu": "Baidu",
    "engine_sougou": "Sougou"
  },
  "zh-Hans": {
    "item_clipboard_link": "搜索剪贴板链接",
    "item_clipboard_image": "搜索剪贴板图片",
    "item_pick": "从相册选择图片",
    "engine_google": "谷歌搜索",
    "engine_baidu": "百度搜索",
    "engine_sougou": "搜狗搜索"
  }
}

var engines = [
  {
    name: $l10n("engine_google"),
    pattern: "https://images.google.com/searchbyimage?image_url="
  },
  {
    name: $l10n("engine_baidu"),
    pattern: "http://image.baidu.com/n/pc_search?queryImageUrl="
  },
  {
    name: $l10n("engine_sougou"),
    pattern: "http://pic.sogou.com/ris?flag=1&nr=true&query="
  }
]

function pickImage() {
  $photo.pick({
    handler: function(resp) {
      var image = resp.image
      if (image) {
        searchImage(image.jpg(1.0))
      } else {
        $ui.loading(false)
      }
    }
  })
}

function searchImage(data) {
  $ui.loading(true)
  $http.upload({
    showsProgress: false,
    url: "https://sm.ms/api/upload",
    files: [{"data": data, "name": "smfile"}],
    handler: function(resp) {
      $ui.loading(false)
      var url = resp.data.data.url
      if (url) {
        $clipboard.text = url      
        showEngines(url)
      }
    }
  })
}

function showEngines(url) {
  $ui.menu({
    items: engines.map(function(item) { return item.name }),
    handler: function(title, idx) {
      var pattern = engines[idx].pattern
      $app.openURL(pattern + encodeURIComponent(url))
      //$app.close()
    }
  })
}

var inputData = $context.data
var inputImage = $context.image
var inputLink = $context.link
var clipData = $clipboard.image
var clipLink = $clipboard.link

if (inputData) {
  searchImage(inputData)
} else if (inputImage) {
  searchImage(inputImage.jpg(1.0))
} else if (inputLink) {
  showEngines(inputLink)
} else if (clipData) {
  $ui.menu({
    items: [$l10n("item_clipboard_image"), $l10n("item_pick")],
    handler: function(title, idx) {
      idx == 0 ? searchImage(clipData) : pickImage()
    }
  })
} else if (clipLink) {
  $ui.menu({
    items:[$l10n("item_clipboard_link"), $l10n("item_pick")],
    handler:function(title, idx){
      idx == 0 ? showEngines(clipLink) : pickImage()
    }
  })
} else {
  pickImage()
}
