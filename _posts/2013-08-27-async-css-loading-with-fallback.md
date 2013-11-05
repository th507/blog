---
layout: post
title:  "更安全的异步加载 CSS"
date:   2013-08-27 19:42:31
tags: javascript, css, async
---
为了加快浏览器渲染，我们未来需要异步加载一些 CSS，这用 JavaScript 实现起来很简单。但对于有些核心页面，我们希望可以保证在没有 JavaScript 的情况下仍然可以正常显示。

为了同时满足这两种不同的需求，我们可以把 CSS 放在 `<noscript>` 里，这样正常情况下我们会异步加载 CSS，如果用户没有 JavaScript，则会退回传统的同步加载。

<!-- more -->

我写了一个简单的 demo。代码如下：

````html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title></title>
    <noscript><link href="http://twbs.github.io/bootstrap/dist/css/bootstrap.css" media="all" rel="stylesheet" type="text/css"/></noscript>
</head>
<body>
<h1>async CSS loader with proper fallback</h1>
<script>
(function() {
    var src, el, styleElement;
    window.addEventListener("DOMContentLoaded", function() {
        el = document.getElementsByTagName("noscript")[0];
        src = el.innerHTML.match(/href="([\w.\/:0-9\-_]*)"/);
        src = src[1];
        el.innerHTML = "";
        setTimeout(function() {
            styleElement = document.createElement("link");
            styleElement.type = "text/css";
            styleElement.rel = "stylesheet";
            styleElement.href = src + "?version=2";
            alert("font will change soon");
            (document.head || document.getElementsByTagName("head")[0]).appendChild(styleElement);
        }, 2000);
         
    });
}());
</script>
</body>
</html>
````

根据 w3c 规范，noscript 里如果放的是 link 元素，可以放到 head 中。

这样可以提前首次渲染，提高性能
![](/assets/async-loading-css-with-fallback/paint.png)

另外网络抓包也显示，这个 CSS 只请求了一次。检查 URL 可以看到这是由 JavaScript 发送的。
![](/assets/async-loading-css-with-fallback/network-sniffer.png)
