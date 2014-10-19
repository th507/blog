---
layout: post
title:  "Node.js/JavaScript 语言调研"
date:   2014-06-19 22:12:03
tags: node, javascript
---

这篇文章更多的是从宏观的、语言的层面分析 Node.js，原来写在公司内部的 wiki 上。

<!-- more -->

##Node.js 是什么？为什么会诞生这样的东西？
Node.js 是一个服务器端 JavaScript 解释器。发明者 Ryan Dahl 需要一个高性能的后端语言，在考察了几个语言之后，发现 JavaScript 没有 IO 处理接口，这就意味着他可以从头设计一套高性能单线程非阻塞接口，还不用处理其他语言接口的历史包袱，于是 Node.js 就诞生了。

这种单线程异步的方式比原来的多线程或多进程具备更高的性能，但仅仅是性能还不足以让这门语言得到大规模的应用，Node.js 采用 JavaScript 作为基础语言，这使得 Node 编程的入门门槛很低。Node 代码精简，功能 focus，文档详尽，包管理系统非常便于使用。各种优秀的特性，以及不陌生的开发语言使得 Node.js 成为前端敏捷开发的首选后端语言。

##为什么 Node.js 会流行
1. JavaScript 代码规模的扩大，传统前端职责后延，使用 Node.js 上手快，门槛低。
2. Node.js 有很好的包管理系统，第三方库丰富。
3. 适合用于开发有大量短生命期请求，使用 RESTful API 的应用。。可以很简单的实现并发获取数据，对 JSON 对象也有原生支持。
4. 在高并发下响应性能的更好一些。
5. Node.js 可以创建实时性很高的服务 ，比如 web 聊天应用。

##性能对比
理论上，单线程异步的 Node.js 比多线程的 Apache + PHP 有更好的性能。在 PHP 中，每个连接都会生成一个新线程，（并为其分配一些配套内存），而 Node.js 解决这个问题的方法是：更改连接到服务器的方式。每个连接触发一个在 Node.js 引擎的进程中运行的事件。通过使用事件驱动模型，Node.js 不使用锁，也不需要为每个连接新开一个线程。是的上下文切换的代价大大减小，而且它不会直接阻塞 I/O 调用

我们**简单**测试一下这两者的性能。

###测试语言/脚本

Node.js

```
var sys = require('sys'),
http = require('http');
  
http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
 
    res.write('<p>Hello World</p>');
    res.end();
}).listen(8080);
```

PHP

```
<?php 
    header("Content-Type: text/html");
    echo '<p>Hello World</p>';
?>
```

Go

```
package main
  
import (
    "fmt"
    "net/http"
)
  
func main() {
    hello := "<p>Hello World</p>"
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, hello)
    })
    http.ListenAndServe(":8080", nil)
}
```

测试脚本

```
ulimit -n 4096
ab -r -n 10000 -c 100 <URL>
```

###测试结果
Node.js，并发数 100

```
Concurrency Level:      100
Time taken for tests:   1.914 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      1180000 bytes
HTML transferred:       180000 bytes
Requests per second:    5225.01 [#/sec] (mean)
Time per request:       19.139 [ms] (mean)
Time per request:       0.191 [ms] (mean, across all concurrent requests)
Transfer rate:          602.10 [Kbytes/sec] received
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.3      0       3
Processing:     3   19  15.2     15     171
Waiting:        3   19  15.2     15     171
Total:          6   19  15.2     16     171
Percentage of the requests served within a certain time (ms)
  50%     16
  66%     18
  75%     20
  80%     21
  90%     23
  95%     26
  98%     44
  99%     55
 100%    171 (longest request)
```

Node.js，并发数 2000

```
Concurrency Level:      2000
Time taken for tests:   34.893 seconds
Complete requests:      10000
Failed requests:        3284
   (Connect: 0, Receive: 1767, Length: 1517, Exceptions: 0)
Write errors:           0
Total transferred:      974680 bytes
HTML transferred:       148680 bytes
Requests per second:    286.59 [#/sec] (mean)
Time per request:       6978.553 [ms] (mean)
Time per request:       3.489 [ms] (mean, across all concurrent requests)
Transfer rate:          27.28 [Kbytes/sec] received
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0   24  55.3      0     579
Processing:     1 2203 6471.0     35   34501
Waiting:        0   36  32.0     32     170
Total:         22 2228 6493.2     36   34679
Percentage of the requests served within a certain time (ms)
  50%     36
  66%     45
  75%    149
  80%    175
  90%   7914
  95%  21265
  98%  27955
  99%  27965
 100%  34679 (longest request)
```

PHP，并发数 100

```
Concurrency Level: 100
Time taken for tests:   1.784 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      2870000 bytes
HTML transferred:       180000 bytes
Requests per second:    5606.47 [#/sec] (mean)
Time per request:       17.837 [ms] (mean)
Time per request:       0.178 [ms] (mean, across all concurrent requests)
Transfer rate:          1571.34 [Kbytes/sec] received
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       3
Processing:     6   17  25.4     12     407
Waiting:        6   17  25.4     11     407
Total:          6   18  25.5     12     407
Percentage of the requests served within a certain time (ms)
  50%     12
  66%     12
  75%     20
  80%     21
  90%     22
  95%     23
  98%    109
  99%    204
 100%    407 (longest request)
```

PHP，并发数 2000

```
Concurrency Level:      2000
Time taken for tests:   42.637 seconds
Complete requests:      10000
Failed requests:        3962
   (Connect: 0, Receive: 1984, Length: 1978, Exceptions: 0)
Write errors:           0
Total transferred:      2303175 bytes
HTML transferred:       144450 bytes
Requests per second:    234.54 [#/sec] (mean)
Time per request:       8527.339 [ms] (mean)
Time per request:       4.264 [ms] (mean, across all concurrent requests)
Transfer rate:          52.75 [Kbytes/sec] received
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0   49 104.6      0    1212
Processing:     0 3313 8906.0     16   42387
Waiting:        0   14  10.9     15      70
Total:          0 3362 8982.3     16   42632
Percentage of the requests served within a certain time (ms)
  50%     16
  66%     18
  75%     27
  80%    113
  90%  15459
  95%  29288
  98%  36002
  99%  36005
 100%  42632 (longest request)
```

Go，并发数 100

```
Concurrency Level:      100
Time taken for tests:   0.717 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      1340000 bytes
HTML transferred:       180000 bytes
Requests per second:    13955.33 [#/sec] (mean)
Time per request:       7.166 [ms] (mean)
Time per request:       0.072 [ms] (mean, across all concurrent requests)
Transfer rate:          1826.19 [Kbytes/sec] received
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    3   1.2      3       9
Processing:     1    4   1.1      4      12
Waiting:        0    4   1.1      4      12
Total:          2    7   1.8      7      17
Percentage of the requests served within a certain time (ms)
  50%      7
  66%      7
  75%      8
  80%      9
  90%     10
  95%     10
  98%     11
  99%     13
 100%     17 (longest request)
```
 
Go，并发数 2000

```
Concurrency Level:      2000
Time taken for tests:   21.014 seconds
Complete requests:      10000
Failed requests:        2466
   (Connect: 0, Receive: 1360, Length: 1106, Exceptions: 0)
Write errors:           0
Total transferred:      1157760 bytes
HTML transferred:       155520 bytes
Requests per second:    475.87 [#/sec] (mean)
Time per request:       4202.812 [ms] (mean)
Time per request:       2.101 [ms] (mean, across all concurrent requests)
Transfer rate:          53.80 [Kbytes/sec] received
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0   44 187.7      4    1119
Processing:     0  918 3303.0      5   20949
Waiting:        0    6  26.4      4     359
Total:          6  961 3309.4     10   20984
Percentage of the requests served within a certain time (ms)
  50%     10
  66%     11
  75%     13
  80%     15
  90%   1907
  95%   7726
  98%  14346
  99%  20980
 100%  20984 (longest request)
```

在较低并发下，看每秒相应请求数，Node.js 比 PHP 稍低，而 Go 则比 PHP 高了一倍有余。在高并发情况下，Node.js 比 PHP 高， Go 则更好一点，但三者都出现了比较多的请求失败。
[Node.js vs PHP](http://blog.loadimpact.com/2013/02/01/node-js-vs-php-using-load-impact-to-visualize-node-js-efficency/), [Benchmarking Node.js](http://zgadzaj.com/benchmarking-nodejs-basic-performance-tests-against-apache-php) 两篇文章详细比较了并发数对 Node.js 的影响，包括响应数、内存和 CPU 使用等更多指标。

##听起来像老调重弹：Node.js 和 Ruby on Rails?
full-stack 这不是第一次有这个概念了。十年前，最热门的莫过于 Ruby on Rails (RoR) ，RoR 的让后端只用写一种语言就可以了，Mac OS X 10.5 Lepoard 中默认安装了 RoR，很多科技界的作者惊呼 TextMate 和 RoR 就足以让你掏钱买一台 Mac 开始开发了。

但十年之后，转向 Node.js 最积极的公司，就是当年最积极采用 RoR 的公司，原因主要有以下几个：

- 升级永远是麻烦事

	RoR 社区当年以激进而闻名，升级意味着不兼容，而各个 Gem 也不一定能在最新的 ruby 下运行。BaseCamp 等公司的做法是快速升级，在 [Ruby 2.0](https://www.ruby-lang.org/en/news/2013/02/24/ruby-2-0-0-p0-is-released/) 发布 [12 天之后](https://twitter.com/dhh/status/309744999774420993)就升级到最新版本。在没有完善的测试之前，这么快的跟随升级风险不小。
	
- 新功能影响稳定性／发布周期不定

	RoR 社区激进的另一个体现就是新功能影响稳定性。RoR 3.0 在开发阶段合并了一个并行的框架 Merb，导致最终 3.0 开发时间大大超过预期。不稳定的发布周期也让一些开发者近而远之。
	
- 框架太大太重，慢慢不适应现在日新月异的技术格局

	与其说 Node.js 替代了 Ruby，倒不如说是轻量级框架替代了重量级框架。现在前端敏捷开发的需求非常强烈，新技术和工具不断涌现。更合理的技术栈应该做到合理分层，各层独立。这样任何一层可以被类似的技术替代，而不至于“牵一发而动全身”。用大而全的框架愈来愈不适应快速更新的技术演进了。 
 
虽然 Node.js 看起来很有潜力，但还是难免让人不注意到到今天 Node.js 和当时 RoR 的一些类似之处。

##Node.js 和 PHP 对比
- 可以促进后端服务化，做到物理上前后端的隔离
- 可以有效的绕过浏览器跨域的技术限制，不在客户端整合数据，而是在前端展现层整合数据，前端可以做的事情更多，比如并行同时取多个数据
- 单线程非阻塞模型，理论上可以提供更好的性能
- 缺乏底层 API，维护成本稍大

##Node.js 维护性上的问题
###动态类型语言，无法在编译时检查
不能 AOT，只能 JIT，一般来说效率方面低于静态类型语言

更容易发生 runtime 错误

###循环引用容易发生内存泄漏，以及不确定性垃圾回收机制

内存回收的过程完全是由 Google V8 引擎决定的，JavaScript 语言本身现在和可预见的未来都没有提供底层接口，开发者无法设置内存上限。不能简单的控制内存和 CPU 使用上限。

另外，目前主流浏览器和 JS 引擎都使用 Mark-and-Sweep 算法进行内存回收。这一算法必须暂停所有的工作线程。由于没有暴露控制接口，这意味着开发者无法控制内存回收时机和行为。这对于需要长期稳定运行的系统来说，会带来一些额外的挑战。

比如 Express 之类依赖中间件的框架，却没有很好的组件通讯机制，使用中不注意的话容易产生内存泄漏。

###数据结构少
没有 enum, struct, static, public/private/protected, constant 等，
所以 JavaScript 程序员总是免不了要重复发明轮子，才能实现一些相当基础的功能。

另外复杂数据结构的缺失代码可读性不高。

###late-binding 编译器很难优化，程序员很难理解，查错也很麻烦
JavaScript 中很容易写出天书一样的代码，比如说我写

```
var func = Function.prototype.bind.bind(Function.call);
```

有人能很快告诉我 func 函数会做什么吗？

###运维要求较高
理论上 Node.js 可以提供比 PHP 更好的性能，但 Node.js 缺乏底层接口，比如没有 PHP 中 `ini_set('memory_limit', '256M')` 这样简单有效的 API。遇到内存泄漏需要在线上机器上做 profiling，并不是每个工程师都可以很快掌握的。

##Node.js 会是未来的语言吗？
##纯技术层面：也许不是
JavaScript 并不是很有前瞻性的语言。如果你想通过学一门语言提高自己，我并不建议学习 JavaScript 和 Node.js。

在较大的项目中，如果**只考虑技术方面的话**，我更倾向于选择一门语言，这门语言可以满足：

- 静态类型、强类型
- 有丰富的数据结构，比如 enum, class, struct, class (protected/private/public property), map, set 等
- 有良好的异步操作模型

静态类型可以在编译阶段的做静态类型检查，避免一些常见的错误。另外还可以利用这些信息做优化，相比之下，动态类型只能在运行时候做 JIT 编译优化，性能上有一定的差距。

适合大规模项目的后端语言常见的有：Java, Erlang, Scala, 以及比较新的 Clojure 等。以 Erlang 为例，Erlang 是一个为并行处理而设计的语言。Erlang 大量使用轻量级进程，并利用消息传递实现进程间通讯，进程间上下文切换比一般语言的线程切换要高效得多。

Google 的 Go 语言也是未来语言的有力竞争者。Go 的并行模式比 Node.js 更优雅一些。性能方面，Go 的性能不比 Node.js 差，甚至更好。

Apple 发明的 Swift 也是一个很有趣的语言。Chris Lattner 早先的工作成果主要是在 LLVM 编译器方面，而在 Swift 语言里能明显的看到编译器开发者的对语言的一些优化思路：Swift 是一个强类型、静态类型的语言，但通过编译阶段的 type inference，简化了不必要的类型声明，给人一种弱类型语言的风格，提高了开发效率。Swift 语言比较特殊的地方 (比如 Customized Intializer) 估计也是站在在编译器优化的角度来设计的。

虽然 Swift 不是为 Web 后端设计的语言，但它的结合脚本式语言和静态类型语言的思路是很有趣的。未来可能会看到采用类似设计思路的框架或语言用在后端上。

###实际上…很可能是的
Node.js 很可能成为 de facto 的前端技术栈。并在相当长的一段时间里作为前端后延的首选语言，这主要是因为：

- 可以统一后端和前端的语言，节约学习成本
- JavaScript 类 C 的语法可以很快上手，招人方面相对比较容易
- 不存在组内的技术之争
- 适合敏捷开发
