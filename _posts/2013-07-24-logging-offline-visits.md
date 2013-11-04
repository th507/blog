---
layout: post
title:  "记录离线流量"
---

在 web app 里，我们希望可以更准确的记录用户的访问记录。但移动设备并不总是有可用的网络连接，比如在地铁上，手机信号总是时有时无。如果按照 PC 上简单的记录方法，会漏计不少访问信息。

我们的 web app 设计之初就考虑并实现了离线浏览，记录离线流量能帮助我们更好的了解用户的浏览习惯，改进我们的产品，这是有确实而迫切的需求的。

<!-- more -->

我们可以考虑实现这样一种机制，每次用户访问一个新页面的时候，首先尝试直接发送[一张图片](http://en.wikipedia.org/wiki/Web_bug)，如果失败的话，就把用户这次浏览记录到 localStorage 里。每次发送前，我们检查一下 localStorage，如果有之前离线访问的记录，就依次发出。

我用 CoffeeScript 写了一个很简单的类，叫做 ftcTracker，专门用来记录离线流量，ftcTracker 同时支持 Google Analytics 的语法和我们内部 beacon image 的格式。

用法是这样的

````javascript
var ftcTracker = new FTCTracker("http://path/to/beacon.gif?url=");
ftcTracker.push(location.href)
````

这个类还有一个很好的副作用：因为我们每次都真正从服务器接收了一个图片，我们可以比 `navigator.onLine` 更可靠的判断网络通断状况。可以使用

````javascript
ftcTracker.isAccessible()
````

来获得最近的网络通断情况。

源代码做了简单的修改，去掉了专有的语法，但各家 tracker URL 约定往往不太一样，如果你真的想用的话，还免不了要看看代码修改一下。

因为不够通用，也就不放在 repository 里了，需要的可以查看 [CoffeeScript (带注释)](https://gist.github.com/th507/7302586) 或者下载编译好的 [JavaScript （不带注释）](/assets/logging-offline-visits/ftcTracker.js)。
