---
layout: post
title:  "关于 YUI 停止维护的一点想法"
date:   2014-09-12 16:02:47
tags: YUI, javascript
---

我在调研 Node 语言的时候写到：

>与其说 Node.js 替代了 Ruby，倒不如说是轻量级框架替代了重量级框架。现在前端敏捷开发的需求非常强烈，新技术和工具不断涌现。更合理的技术栈应该做到合理分层，各层独立。这样任何一层可以被类似的技术替代，而不至于“牵一发而动全身”。用大而全的框架愈来愈不适应快速更新的技术演进了。

没想到在 YUI 上应验了。

<!-- more -->

YUI 是一个大而全的框架，连 Yahoo 这样的大公司维护起来都喊头痛， 我们美团这样的”小”公司在技术上也要有清醒的认识，对前端技术发展有一个基本的判断。

##未来趋势
###依赖语言特性和 Polyfill
功能模块可能更多瞄准语言规范提供的 API 实现，而不是像现在的 YUI 一样，提供兼容层。比方说用图片的时候，不能因为老版本 IE 不支持透明 png 就弃用这种格式，而是在页面中按需加载对应的 polyfill，让这些老掉牙的家伙也用上新玩意。
 
这样的思路下写出来的代码更有前瞻性，同时 polyfill 只需要考虑更少的适配情况，开发难度更低。
现在的 [Modernizr](http://modernizr.com/) 和 [Polyfill Service](http://labs.ft.com/2014/09/polyfills-as-a-service/) 等思路值得关注。

###Betting on the winner
YUI 本身提供了极为丰富的功能，但很多功能却没什么人用。比如 YUI 中提供了三个异步函数调用管理工具： AsyncQueue, Promise, 和 Parallel。

也许有人会争辩说上面三种函数都有各自的使用场景，但大部分时候，是可以（稍加改造）统一到其中一种上的。就像 Python 的格言中说的: 

>There should be one– and preferably only one –obvious way to do it.
>
这样也许性能不是最佳，代码不是最简洁的，但维护成本是比较低的。对于比较核心、抽象的部分，更要严格筛选。

在上面的例子里，Promise 已经成为实际的标准，所以统一到 Promise 是更好的选择。对不支持的浏览器，可按上一节的思路，提供一个按需加载的 Polyfill 即可。

###加载和依赖管理
现在 [ES6 的模块规范草案](http://www.2ality.com/2014/09/es6-modules-final.html)已经出来了。基本上[沿用了 CommonJS 的语法](http://jsmodules.io/cjs.html)，从规范来看，模块引用主要考虑的是同步/顺序加载，便于使用。在浏览器端，我们可以用 [Browserify](https://www.npmjs.org/package/browserify) ，直接加载 Node 语法的 JS 文件，大方向上没错，国外的同行基本也是这么做的。

但 Browserify 也有一些问题需要解决：
1. 它不支持 IE6
2. 我们需要更灵活的依赖管理
3. 它没有针对浏览器的并行下载特性优化
4. 我们开发时需要引入 Automate build，每次代码提交自动触发编译

Automate build + Browserify + Script Loader 的组合值得关注。

###atomic component
[Web Component](http://www.w3.org/TR/components-intro/) 很可能大大改变前端开发的思维模式和生态环境；而 [Polymer](http://www.polymer-project.org/) 提供了一个很好的机会，让我们可以一瞥未来开发的景象。这些技术的核心思路是把相关的元素、资源、甚至数据处理逻辑打包封装。外层框架/页面调用的时候，component 可以完成自身的 bootstrapping。每个 component 独立性更强，减少对外的依赖关系。
我们现在的 Node 框架也是在这个思路下设计和编写的。突出功能模块，淡化页面的作用。
 
###更抽象、精简的框架
一个合理的技术规划应该能够更好的适应编程范式的变化，具体来说，就是”不要把鸡蛋放到一个篮子里”，而是合理分层，各层独立，任何一层可随时被淘汰或替换。
 
比方说我想用模版引擎填充 HTML，不应该在框架各处拼接元素的地方使用。而应该增加一个模版填充的层级，在数据产生完成之后统一填充。这样效率未必是最高的，但是长远来看，是健壮性更好、更适应变化的设计。
 
这样一来，框架里面是不是提供模版引擎就不再重要了，反过来，为了框架本身的维护性，框架应该不要做多余的事情，比如不要提供模版引擎。
 
框架应该只提供最基础的一些功能，交互等可以考虑放到可配置的 component 中去。

##一点想法
短期来看，YUI 停止维护对我们影响还不是很大，功能还都可以使用，短期业务开发不会出现 YUI 无法支持的情况。

中长期来看，我们需要开始调研 browserify 等替代品的可行性。利用 npm 包管理代码，一部分依赖使用线下 automate build 完成，浏览器使用 browserify + script loader 加载脚本的做法国内外已经有一些先例了。

站在更高的角度，任何技术都不会一直流行，我们需要思考一下 YUI 失败的原因。了解前端技术发展趋势编程范式的变化，让我们写的代码能更好的适应业界的变化，适应未来的业务。