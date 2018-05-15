$app.strings = {
  "en": {
    "TIPS": "Please use it on Safari's share sheet"
  },
  "zh-Hans": {
    "TIPS": "请在 Safari 的分享面板中使用"
  }
}

main()

function main() {
  if ($app.env != $env.safari) {
    $ui.alert($l10n("TIPS"))
    return;
  }

  var items = [{
      "name": "Firebug Lite",
      "script": firebug
    },
    {
      "name": "vConsole",
      "script": vconsole
    },
    {
      "name": "Eruda",
      "script": eruda
    },
    {
      "name": "Clear Images",
      "script": clearImages
    }
  ]

  $ui.menu(items.map(function(item) {
    return item.name;
  })).then(function(selected) {
    $safari.inject(items[selected.index].script());
  });
}

function clearImages() {
  return `var images = document.getElementsByTagName('img');
  while (images.length > 0) {
    images[0].parentNode.removeChild(images[0]);
  }`
}

function eruda() {
  return `(function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://xteko.blob.core.windows.net/neo/eruda-loader.js';
    document.body.appendChild(script);
  })();`
}

function vconsole() {
  return `(function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://xteko.blob.core.windows.net/neo/vconsole-loader.js';
    document.body.appendChild(script);
  })();`
}

function firebug() {
  return `(function(node, maker, setter, getter, identifier, src, element) {
    if (node.getElementById(identifier)) return;
    element = node[maker + 'NS'] && node.documentElement.namespaceURI;
    element = element ? node[maker + 'NS'](element, 'script') : node[maker]('script');
    element[setter]('id', identifier);
    element[setter]('src', src);
    (node[getter]('head')[0] || node[getter]('body')[0]).appendChild(element);
  })(document, 'createElement', 'setAttribute', 'getElementsByTagName', 'FirebugLite', 'https://getfirebug.com/firebug-lite.js#startOpened')`
}
