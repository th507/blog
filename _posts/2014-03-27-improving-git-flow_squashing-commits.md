---
layout: post
title: "改进合作 git 工作流：自动提取、合并提交"
---
**这是我为[美团前端 blog](http://fe.meituan.com/) 写的一篇文章，原文在[这里](http://fe.meituan.com/improving-git-flow_squashing-commits.html) 。**

每天，美团的上百名工程师都在不断改进美团的用户体验，或是加入各种新鲜的功能。作为负责展现、交互的前端工程师，我们上线的次数可达一天数十次。

我们使用 [Stash](https://www.atlassian.com/software/stash) 托管项目代码。每个功能都新增一个新任务分支 (feature branch)，当开发测试完成后，推送任务分支到 Stash 上，并创建 pull request 进入代码审查，直到被通过，等待上线。

为了保证开发速度，我们不断改进完善这个发布流程，让这个过程更简单、高效。

<!-- more -->

## 前端工作现状

前端工作是连接后台实现和视觉表现交互的桥梁，前端工作有以下特点：

* 往往需要和后端工程师合作开发
* 在测试时也需要 checkout 后端代码，并在此基础上进行开发
* 双方频繁 merge/rebase 分支
* 每个人使用 git 的方式不太一样，我们的工作流需要较强的适应性
* 在开发测试完成之后，我们要求每一次上线的代码都必须经过 pull request 加代码审核


多人合作开发的一般工作流可以参见 [A successful Git branching model](http://nvie.com/posts/a-successful-git-branching-model/) 和 [Git Workflows](https://www.atlassian.com/git/workflows)，在一般开发阶段使用 merge 或 rebase 都能够胜任。

但在 pull request 之前我们需要把双方的提交分开，这个工作往往还不够自动化。一种常见的做法是 `git reset --soft HEAD~` 将所有改动移出暂存区 (staging area)，然后手工添加那些我们改了的文件。

事实上，我们可以用 rebase 来帮我们提高效率，实现自动提取、合并提交。

## rebase 是什么？
首先简单介绍一下 rebase（衍合），git-scm 上有很好的[介绍](http://git-scm.com/book/en/Git-Branching-Rebasing)（[中文翻译](http://git-scm.com/book/zh/Git-%E5%88%86%E6%94%AF-%E5%88%86%E6%94%AF%E7%9A%84%E8%A1%8D%E5%90%88)），简单的说，`git rebase A B` 会把在 A 分支里提交的改变移到 B 分支里重放一遍。

它的原理是回到两个分支最近的共同祖先，根据 B 的历次提交对象，生成一系列文件补丁，然后以 A 为基底分支最后一个提交对象为新的出发点，逐个应用之前准备好的补丁文件，最后会生成一个新的合并提交对象，从而改写 B 的提交历史，使它成为 A 分支的直接下游。

通过修改提交历史，我们可以更方便的准备 pull request。


## 用 git rebase 来提取、合并提交

比如说后端的 Alice 和前端的 Bob 合作开发一个功能，他们分别从 master 分支上 checkout，并开始工作。

他们互相 merge 对方的分支的进行开发、测试。最终，这个功能开发测试完成，Bob 合并了 Alice 的分支（图中星号的位置），可以进入代码审核和上线的流程了。

<img src="/assets/improving-git-flow_squashing-commits/git-branches.svg" onerror="if (!this.failed) {this.failed=1;this.src=this.src.replace(/\.svg$/, '.png');}">

这时候 Alice 和 Bob 需要提取、合并各自的提交，并分别发送 pull request 进入代码审核。我们站在 Bob 的角度来解释一下如何使用 rebase 来方便的做到这一点。

Bob 现在处在 bob/fb 上（图中星号的位置），这时候 bob/fb 实际上包含了 alice/fb 的所有提交。首先我们从 bob/fb 上新建一个分支

````bash
// 准备一个新的分支
$ git checkout -b bob/review
````

<img src="/assets/improving-git-flow_squashing-commits/git-bob-before-rebase.svg" onerror="if (!this.failed) {this.failed=1;this.src=this.src.replace(/\.svg$/, '.png');}">

然后我们通过 rebase 把自己的提交排到一起

````bash
// 把 Alice 的提交和自己的提交分别排在一起
$ git rebase alice/fb
````

<img src="/assets/improving-git-flow_squashing-commits/git-bob-after-rebase.svg" onerror="if (!this.failed) {this.failed=1;this.src=this.src.replace(/\.svg$/, '.png');}">

接下来我们把 bob/review 上的提交合并

    // 用 interactive rebase 合并提交
    $ git rebase -i HEAD~`git rev-list --first-parent master...bob/fb --no-merges --count`

执行上面这行命令会打开终端默认的编辑器（可通过 EDITOR 环境变量设置）。

<img src="/assets/improving-git-flow_squashing-commits/vim-rebase.png">

这些信息表示从在 bob/review 上找到了两个在 bob/fb 上的提交。每个提交都另起一行来表示，行格式如下：

    (action) (partial SHA-1) (short commit message)

按照下面的提示，我们可以把除了第一行外的 pick 替换成 fixup (f) 或是 squash (s) 来实现合并提交。另外，上下移动一行可以对提交进行重排序。一旦你完成对提交信息的编辑，并退出编辑器，git 会按照你指定的顺序去应用提交，并且做出相应的操作（action），形成的新提交和提交信息会被保存起来。(**注**：在 git 1.7 之后，我们还可以使用 `rebase --autosquash` 自动合并提交，进一步提高生产效率。)

合并完之后我们的分支是这样的

<img src="/assets/improving-git-flow_squashing-commits/git-bob-squash.svg" onerror="if (!this.failed) {this.failed=1;this.src=this.src.replace(/\.svg$/, '.png');}">


然后，我们可以使用 `rebase --onto` 取出 bob/review 上有而 alice/fb 上没有的提交，并指定新的基底分支（也就是主干分支 master）

````bash
// 取出 Bob 的提交，并排除 alice/fb 上的提交
    git rebase --onto master alice/fb bob/review
````

<img src="/assets/improving-git-flow_squashing-commits/git-rebase-onto.svg" onerror="if (!this.failed) {this.failed=1;this.src=this.src.replace(/\.svg$/, '.png');}">


这样在 bob/review 分支上就只有 Bob 自己的提交了。

这时候就可以用 `git merge master` 或者 `git rebase master` 来更新分支，然后发送 pull request 进入代码审核环节了。

## 小结
以上是我们处理代码审查之前提取、合并提交的一点思考和实践。例子中命令虽然长，但可以很方便的写成一个脚本自动进行，除非遇到冲突，否则需要人工干预的情况并不多在。在美团，我们一直致力于用好现有工具，降低重复操作，让工具自动化融入工作流程之中，成为我们不断提升工作效率的重要帮手，希望我们的实践能也能对你有帮助。
