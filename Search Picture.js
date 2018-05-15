$app.strings = {
  "en": {
    "item_clipboard": "Clipboard",
    "item_last": "Last Photo",
    "item_pick": "Pick Photo",
    "engine_google": "Google",
    "engine_baidu": "Baidu",
    "engine_sougou": "Sougou"
  },
  "zh-Hans": {
    "item_clipboard": "剪贴板",
    "item_last": "最后一张",
    "item_pick": "选择图片",
    "engine_google": "谷歌搜索",
    "engine_baidu": "百度搜索",
    "engine_sougou": "搜狗搜索"
  }
}

const engines = [
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

function lastImage(){
  $photo.fetch({
    count:1,
    handler:function(image){
      if(image){
        searchImage(image[0].jpg(1.0))
      } else {
        $ui.loading(false)
      }
    }
  })
}

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
      $app.close()
    }
  })
}

var inputData = $context.data
var inputLink = $context.link
var clipData = $clipboard.image
var clipLink = $clipboard.link

if (inputData) {
  searchImage(inputData)
} else if (inputLink) {
  showEngines(inputLink)
} else if (clipData || clipLink) {
  $ui.menu({
    items: [$l10n("item_clipboard"), $l10n("item_last"), $l10n("item_pick")],
    handler: function(title, idx) {
      switch(idx){
        case 0: 
          if(clipLink){
            showEngines(clipLink)
          } else{
            searchImage(clipData)
          }         
          break
        case 1:
          lastImage()
          break
        case 2:
          pickImage()
          break
      }
    }
  })
} else {
  $ui.menu({
    items:[$l10n("item_last"), $l10n("item_pick")],
    handler:function(title, idx){
      idx == 0 ? lastImage() : pickImage()
    }
  })
}
