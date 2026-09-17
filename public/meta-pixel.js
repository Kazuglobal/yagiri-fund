// Meta Pixel ベースコード（PageView）。
// 本番の CSP は script-src 'self' でインラインスクリプトを実行しないため、
// Meta 公式のスニペットを <script> 直書きではなくこのファイルに置き、
// index.html / crowdfunding-a4.html の <head> から読み込む。
// 読み込み先（connect.facebook.net / www.facebook.com）は public/_headers の CSP で許可している。
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1768844530815552');
fbq('track', 'PageView');
