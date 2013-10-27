---
layout: post
title:  "Check if two strings are anagrams in one line"
date:   2012-10-03 12:00:00
---
I come up with a way to check for anagram. It does not takes care of extra spaces, and it runs pretty slow. 

But heck, it is only 3 lines of code. :)

````javascript
function isAnagram(a, b) {
	return a.match(new RegExp(b.split("").join("|"),"ig").join("") === a
}
````