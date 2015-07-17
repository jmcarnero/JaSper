/*! JaSper v3.3 | (c) 2015 José M. Carnero (sargazos.net) | JaSper_move v2.0 */
"use strict";JaSper.extend(JaSper.prototype,{move:function(e){if("object"!=typeof e)var e={};e.container=e.container||!1,e.reset=void 0==e.reset?!0:e.reset,e.place=e.place||!1,e.shadow=e.shadow||!1,e.restrict=e.restrict||!1,e.onMove=e.onMove||!1,e.onMoveEnd=e.onMoveEnd||!1,e.onMoveStart=e.onMoveStart||!1;var t,o=function(e){return t=JaSper.nodo.crear(e.tagName,{innerHTML:"&nbsp","class":e.className+" JaSper_shadow"}),t.style.position=e.posStyle,t.style.top=e.offsetTop,t.style.left=e.offsetLeft,t.style.height=e.clientHeight,t.style.width=e.clientWidth,t.style.border="1px dashed black",t.style.backgroundColor="#CACACA",e.parentNode.insertBefore(t,e.nextSibling),t},n=function(o,n,r){if(JaSper.event.preventDefault(o),JaSper.event.stop(o),e.reset&&(n.style.left=n.posMoveStart.x-n.posMoveStart.mx+"px",n.style.top=n.posMoveStart.y-n.posMoveStart.my+"px",n.style.position=n.posStyle),e.shadow&&t.parentNode.removeChild(t),n.style.zIndex-=10,JaSper.event.remove(document,"mousemove",r[0]),JaSper.event.remove(document,"mouseup",r[1]),"function"==typeof e.onMoveEnd){var a=JaSper.move.elementFromPoint(o);e.onMoveEnd.call(n,o,a)}},r=function(t,o){if(JaSper.event.preventDefault(t),JaSper.event.stop(t),"function"==typeof e.onMove){var n=JaSper.move.elementFromPoint(t);e.onMove.call(o,t,n)}var r=JaSper.move.posMouse(t),a=o.posMoveStart.y+("x"==e.restrict?0:r.y-o.posMouseInicial.y-o.posMoveStart.my),s=o.posMoveStart.x+("y"==e.restrict?0:r.x-o.posMouseInicial.x-o.posMoveStart.mx);if(e.container){var p=o.posMoveStart.y2,i=o.posMoveStart.x2;a<o.posMoveStartParent.y&&(a=o.posMoveStartParent.y),s<o.posMoveStartParent.x&&(s=o.posMoveStartParent.x),p>o.posMoveStartParent.y2&&(a=o.posMoveStartParent.y2-o.posMoveStart.h),i>o.posMoveStartParent.x2&&(s=o.posMoveStartParent.x2-o.posMoveStart.w)}o.style.top=a+"px",o.style.left=s+"px",$("origen").html=JaSper.event.source(t),$("evento").html=JaSper.event.name(t)},a=function(t,a){JaSper.event.preventDefault(t),JaSper.event.stop(t);var s;if(t.which?s=t.which:t.button&&(s=t.button),1!=s)return!1;if("function"==typeof e.onMoveStart){var p=JaSper.move.elementFromPoint(t);e.onMoveStart.call(a,t,p)}e.shadow&&o(a),a.posMoveStart=JaSper.move.posObject(a),a.posMouseInicial=JaSper.move.posMouse(t),e.container&&(a.posMoveStartParent=JaSper.move.posObject(e.container===!0?a.parentNode:e.container),a.parentNode.style.top=a.posMoveStartParent.y+"px",a.parentNode.style.left=a.posMoveStartParent.x+"px",a.parentNode.style.width=a.posMoveStartParent.w+"px",a.parentNode.style.height=a.posMoveStartParent.h+"px"),a.posStyle=a.style.position,a.style.position="absolute",a.style.top=a.posMoveStart.y-a.posMoveStart.my+"px",a.style.left=a.posMoveStart.x-a.posMoveStart.mx+"px",a.style.width=a.posMoveStart.w+"px",a.style.height=a.posMoveStart.h+"px",a.style.zIndex+=10;var i=function(e){r(e,a)},l=function v(e){n(e,a,[i,v])};JaSper.event.add(document,"mousemove",i),JaSper.event.add(document,"mouseup",l)};this.eventAdd("mousedown",function(e){a(e,this)})}}),JaSper.move={},JaSper.extend(JaSper.move,{elementFromPoint:function(e){if(document.elementFromPoint){var t=e.clientX,o=e.clientY,n=!0,r=0;return(r=JaSper.css.getStyle(document,"scrollTop"))>0?n=null==document.elementFromPoint(0,r+JaSper.css.getStyle(window,"height")):(r=JaSper.css.getStyle(document,"scrollLeft"))>0&&(n=null==document.elementFromPoint(r+JaSper.css.getStyle(window,"width"),0)),n||(t+=JaSper.css.getStyle(document,"scrollLeft"),o+=JaSper.css.getStyle(document,"scrollTop")),document.elementFromPoint(t,o)}return function(e){var t=e.explicitOriginalTarget;return t?(t.nodeType==Node.TEXT_NODE&&(t=t.parentNode),"HTML"==t.nodeName.toUpperCase()&&(t=document.getElementsByTagName("BODY").item(0)),t):null}(e)},posObject:function(e){for(var t=e,o=e.offsetLeft,n=e.offsetTop;t=t.offsetParent;)o+=t.offsetLeft,n+=t.offsetTop;var r=new Array;return r.w=parseInt(JaSper.css.getStyle(e,"width")),r.h=parseInt(JaSper.css.getStyle(e,"height")),r.x=o,r.y=n,r.x2=r.x+r.w,r.y2=r.y+r.h,r.mx=parseInt(JaSper.css.getStyle(e,"marginLeft")),r.my=parseInt(JaSper.css.getStyle(e,"marginTop")),r},posMouse:function(e){var t=new Array;return navigator.userAgent.toLowerCase().indexOf("msie")>=0?(t.x=window.event.clientX+document.body.clientLeft+document.body.scrollLeft,t.y=window.event.clientY+document.body.clientTop+document.body.scrollTop):(t.x=e.clientX+window.pageXOffset,t.y=e.clientY+window.pageYOffset),t}});