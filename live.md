---
layout: default
title: TMPnews-Inshorts
permalink: /live/
description: "دی اردو پوسٹ لائیو کوریج: اہم ترین عالمی واقعات، تازہ ترین پیش رفت، بریکنگ نیوز اور فوری اعلانات کی لمحہ بہ لمحہ غیر جانبدارانہ اور براہ راست اپ ڈیٹس。"
image: /assets/images/live/TMPnewsliveBanner.webp
extra_css:
  - /assets/style/live.css
extra_js:
  - /assets/js/live.js
---
<div id="fb-root"></div>
<div class="live-container inshot-page-container">
    <header class="inshot-header">
        <div class="inshot-badge-row">
            <span class="inshot-live-badge">
                <span class="live-pulse-dot"></span>
                <span class="live-pulse-ring"></span>
                TMPnews-Inshorts
            </span>
        </div>
    </header>
    <div id="live-feed-persistence-wrapper">
        <div id="pinned-post-container"></div>
        <div id="live-feed">
            <div id="feed-skeleton-wrapper" class="skeleton-feed-wrapper">
                <!-- Skeleton Dummy Card 1 -->
                <div class="skeleton-post">
                    <div class="live-post-content inshot-card-inner">
                        <div class="live-post-meta inshot-card-meta">
                            <div class="skeleton-shimmer skeleton-badge"></div>
                            <div class="skeleton-shimmer skeleton-byline"></div>
                        </div>
                        <div class="skeleton-shimmer skeleton-title-long"></div>
                        <div class="skeleton-shimmer skeleton-title-short"></div>
                        <div class="skeleton-shimmer skeleton-text-full"></div>
                        <div class="skeleton-shimmer skeleton-text-full"></div>
                        <div class="skeleton-shimmer skeleton-text-short"></div>
                        <div class="skeleton-footer">
                            <div class="skeleton-footer-left">
                                <div class="skeleton-shimmer skeleton-pill"></div>
                                <div class="skeleton-shimmer skeleton-pill"></div>
                            </div>
                            <div class="skeleton-shimmer skeleton-pill skeleton-share"></div>
                        </div>
                    </div>
                </div>
                <!-- Skeleton Dummy Card 2 (With Image Preview) -->
                <div class="skeleton-post">
                    <div class="live-post-content inshot-card-inner">
                        <div class="live-post-meta inshot-card-meta">
                            <div class="skeleton-shimmer skeleton-badge"></div>
                            <div class="skeleton-shimmer skeleton-byline"></div>
                        </div>
                        <div class="skeleton-shimmer skeleton-title-long"></div>
                        <div class="skeleton-shimmer skeleton-image"></div>
                        <div class="skeleton-shimmer skeleton-text-full"></div>
                        <div class="skeleton-shimmer skeleton-text-short"></div>
                        <div class="skeleton-footer">
                            <div class="skeleton-footer-left">
                                <div class="skeleton-shimmer skeleton-pill"></div>
                                <div class="skeleton-shimmer skeleton-pill"></div>
                            </div>
                            <div class="skeleton-shimmer skeleton-pill skeleton-share"></div>
                        </div>
                    </div>
                </div>
                <!-- Skeleton Dummy Card 3 -->
                <div class="skeleton-post">
                    <div class="live-post-content inshot-card-inner">
                        <div class="live-post-meta inshot-card-meta">
                            <div class="skeleton-shimmer skeleton-badge"></div>
                            <div class="skeleton-shimmer skeleton-byline"></div>
                        </div>
                        <div class="skeleton-shimmer skeleton-title-long"></div>
                        <div class="skeleton-shimmer skeleton-title-short"></div>
                        <div class="skeleton-shimmer skeleton-text-full"></div>
                        <div class="skeleton-shimmer skeleton-text-short"></div>
                        <div class="skeleton-footer">
                            <div class="skeleton-footer-left">
                                <div class="skeleton-shimmer skeleton-pill"></div>
                                <div class="skeleton-shimmer skeleton-pill"></div>
                            </div>
                            <div class="skeleton-shimmer skeleton-pill skeleton-share"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="feed-controls" class="text-center mt-10 px-4" style="display: none;">
        <button id="load-more-btn" class="inshot-load-btn" onclick="if(window.triggerLoadMoreLivePosts) window.triggerLoadMoreLivePosts(event)">
            <i class="fas fa-history mr-2"></i>پچھلی اپڈیٹس لوڈ کریں
        </button>
        <a href="https://archive-live.tmpnews.com/?lang=ur" id="archive-btn" class="inshot-load-btn archive-variant" style="display: none;">
            <i class="fas fa-archive mr-2"></i>پرانی اپڈیٹس کا آرکائیو دیکھیں
        </a>
        <p id="no-more-posts-msg" class="text-gray-500 font-bold py-6 uppercase text-sm tracking-wider" style="display: none;">لائیو کوریج مکمل ہوئی۔</p>
    </div>
</div>
<div id="bottom-nav-placeholder"></div>
