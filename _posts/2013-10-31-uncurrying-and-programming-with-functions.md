---
layout: post
title:  "反科里化的简单推导"
---

反科里化 ([uncurrying](https://en.wikipedia.org/wiki/Currying)) 是非常有趣的一个概念。

让我们像推导数学公式一样推导一下 JavaScript 里的反科里化：

<!-- more -->

````javascript
  foo.bar(a, b, c)

= bar.call(foo, a, b, c)

= (Function.call).call(bar, foo, a, b, c)

= (Function.call).call(Function.call, bar, foo, a, b, c)

= (Function.call).apply(Function.call, [bar, foo, a, b, c])

````

用推导的结果可以写出一个有趣的函数：

````javascript
var call = Function.call;
var slice = Array.prototype.slice;

function factory() {
	var defaults = slice.call(arguments);

	return function() {
		return call.apply(call, defaults.concat(slice.call(arguments)));
	};
}
````

这样可以很方便的实现 uncurrying

````javascript
var arr = [1, 2];
fn = factory([].push);
fn(arr, 3, 4) // -> [1, 2, 3, 4]

````

再绑定作用域

````javascript
fn = factory([].push, arr);
fn(3, 4) // -> [1, 2, 3, 4]
````

再加上一些默认参数

````javascript
fn = factory([].push, arr, 3);
fn(4) // -> [1, 2, 3, 4]
````
