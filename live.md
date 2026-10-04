---
layout: default
title: لائیو اپڈیٹس
permalink: /live/
description: "Follow the latest live updates, breaking news, and real-time coverage from TMP News."
image: /assets/images/live/TMPnewsliveBanner.webp
extra_css:
  - /assets/style/live.css
extra_js:
  - /assets/js/live.js
---
<div id="fb-root"></div>
<div class="live-container">
    <header class="live-header">
        <h1><div class="live-indicator"><div class="dot"></div></div> لائیو اپڈیٹس</h1>
    </header>
    <div id="live-feed-persistence-wrapper">
        <div id="pinned-post-container"></div>
        <div id="live-feed">
             <div class="loader"></div>
        </div>
    </div>
    <div id="feed-controls" class="text-center mt-8 px-4">
        <button id="load-more-btn" class="professional-btn" onclick="if(window.triggerLoadMoreLivePosts) window.triggerLoadMoreLivePosts(event)">پچھلی اپڈیٹس لوڈ کریں</button>
        <a href="https://archive-live.tmpnews.com" id="archive-btn" class="professional-btn" style="display: none;">پرانی اپڈیٹس کا آرکائیو دیکھیں</a>
        <p id="no-more-posts-msg" class="text-gray-500 font-bold py-4 uppercase text-sm" style="display: none;">لائیو کوریج مکمل ہوئی۔</p>
    </div>
</div>
<div id="bottom-nav-placeholder"></div>