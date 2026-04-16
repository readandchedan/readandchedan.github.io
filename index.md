---
layout: default
title: Read And Chedan
permalink: /
pagination:
  enabled: false
---
<p class="quote"></p>
<ul style="list-style-type: circle;">
    <li class="category">
        <a href="/tabletennis/">体育.乒乓球</a>
    </li>
    <li class="category">
        <a href="/nonfiction/">闲谈.杂叙</a>
    </li>
    <li class="category">
        <a href="/fiction/">虚构.故事</a>
    </li>
</ul>
<script>
    var quotes = [
        "The ideal place for me is the one in which it is most natural to live as a foreigner. --- Italo Calvino",
        "Write a little every day, without hope and without despair. --- Isak Dinesen",
        "I don’t pretend to be an intellectual or a philosopher. I just look. –-- Josef Koudelka",
        "Think of nothing things, think of wind. --- Truman Capote",
        "Pain is inevitable. Suffering is optional. --- Haruki Murakami"
    ]
    var quote_idx = Math.floor(Math.random() * quotes.length)
	document.getElementsByClassName('quote')[0].innerHTML = quotes[quote_idx];
</script>
