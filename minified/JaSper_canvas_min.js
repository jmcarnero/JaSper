/*! JaSper v3.4 | (c) 2015 José M. Carnero (sargazos.net) | JaSper_canvas v1.0 */
"use strict";JaSper.extend(JaSper.prototype,{canvas:function(){var e=function(e,a){e.each(function(){return JaSper.canvas.valid(this)?(this.JaSperItemSelected=void 0,void 0===this.JaSperItems&&(this.JaSperItems=[]),this.JaSperItems.flags=this.JaSperItems.flags||{},this.JaSperItems.flags.animable=this.JaSperItems.flags.animable||!1,this.JaSperItems.flags.draggable=this.JaSperItems.flags.draggable||!1,JaSper.canvas.add(this,a)?!1:!1):!1},a)};for(var a in arguments){var t=!1;try{t=Object.keys(arguments[a])[0]}catch(n){}if(t===!1)return JaSper.log("-JaSper::canvas- id de objeto invalida",2),!1;e(this,arguments[a][t])}return this},animate:function(){var e=arguments;return this.each(function(){return"canvas"!=this.nodeName.toLowerCase()?(JaSper.log("-JaSper::animate- el objeto no es canvas",1),!1):(this.JaSperItems.flags.animable=!0,JaSper.canvas.animate(this,e))},e),this}}),JaSper.canvas={},JaSper.extend(JaSper.canvas,{add:function(e,a){if(!JaSper.canvas.valid(e))return!1;a.id=a.id||JaSper.funcs.genId();var t={background:"background",circle:"circle",image:"image",path:"path",polygon:"polygon",text:"text"};if(!a.func||!JaSper.canvas[a.func]&&!t[a.func])return JaSper.log("-JaSper::canvas.add- metodo desconocido",2),!1;void 0!==t[a.func]&&(a.func=t[a.func]),e.JaSperItems[a.id]=a;var n=JaSper.canvas[a.func];return"function"==typeof n?(void 0!=a.drag&&a.drag&&!e.JaSperItems.flags.draggable&&(e.JaSperItems.flags.draggable=!0,JaSper.event.add(e,"mousedown",JaSper.canvas.mouseDown)),n.call(null,e,a)):!1},animate:function(e,a){if(!JaSper.canvas.valid(e))return!1;window.requestAnimationFrame(function(){JaSper.canvas.animate(e,a)});var t=function(e,a){var t=JaSper.canvas[a.func];return"function"==typeof t?t.call(null,e,a):!1},n={move:"move",scale:!1};for(var r in a){var o=!1;try{o=Object.keys(a[r])[0]}catch(i){}if(!(void 0!==a[r][o].frames&&a[r][o].frames--<1)){var s=a[r][o];if(o===!1||void 0===n[o])return JaSper.log("-JaSper::canvas.animate- submetodo desconocido: "+a[r],2),!1;if(n[o]!==!1)s.func=n[o],t(e,s);else switch(o){case"scale":if(!s.id||!e.JaSperItems[s.id])return!1;void 0===e.JaSperItems[s.id].scaleX&&(e.JaSperItems[s.id].scaleX=0),void 0===e.JaSperItems[s.id].scaleY&&(e.JaSperItems[s.id].scaleY=0);var l=s.scaleX||0,d=s.scaleY||0,c=s.speed||1;"function"==typeof s.speed&&(c=s.speed.call(null)),e.JaSperItems[s.id].scaleX+=l*c,e.JaSperItems[s.id].scaleY+=d*c;break;default:return JaSper.log("-JaSper::canvas.animate- submetodo desconocido: "+o,2),!1}}}JaSper.canvas.redraw(e)},background:function(e,a){if(!JaSper.canvas.valid(e))return!1;var t=e.getContext("2d");return a.fillStyle=a.fillStyle||"#fff",a.width=a.width||e.style.width||!1,a.height=a.height||e.style.height||!1,a.width&&(e.width=a.width),a.height&&(e.height=a.height),t.fillStyle=a.fillStyle,t.fillRect(0,0,e.width,e.height),!0},boundingBox:function(e,a){if(!JaSper.canvas.valid(e)||!a.boundingBox)return!1;var t=e.getContext("2d"),n=2;if(a.selected){var r=a.boundingBox[0]-n,o=a.boundingBox[1]-n,i=a.boundingBox[2]+2*n,s=a.boundingBox[3]+2*n;t.save(),t.beginPath(),t.rect(r,o,i,s),t.lineWidth=1,t.strokeStyle="green",t.stroke(),t.beginPath(),t.lineWidth=1,t.strokeStyle="yellow";var l=5,d=3.3;t.moveTo(r+l*Math.sin(d),o-l*Math.cos(d));var c=2*Math.PI/3;t.lineTo(r+l*Math.sin(d+c),o-l*Math.cos(d+c)),t.lineTo(r+l*Math.sin(d+c+c),o-l*Math.cos(d+c+c)),t.stroke(),d=.22,t.moveTo(r+i+l*Math.sin(d),o+s-l*Math.cos(d)),c=2*Math.PI/3,t.lineTo(r+i+l*Math.sin(d+c),o+s-l*Math.cos(d+c)),t.lineTo(r+i+l*Math.sin(d+c+c),o+s-l*Math.cos(d+c+c)),t.stroke(),t.beginPath(),t.arc(r+i,o,l,Math.PI/180*0,Math.PI/180*270),t.stroke(),t.closePath(),t.restore()}return!0},circle:function(e,a){if(!JaSper.canvas.valid(e))return!1;var t=e.getContext("2d");a.r=a.r||50,a.x=a.x||100,a.y=a.y||100,a.angleStart=a.angleStart||0,a.angleEnd=a.angleEnd||360,a.cclock=a.cclock||!1,a.fill=a.fill||"#ccc",a.borderWidth=a.borderWidth||1,a.border=a.border||"#3ab";var n=a.x,r=a.y;return t.save(),(void 0!==a.scaleX||void 0!==a.scaleY||void 0!==a.rotation)&&(t.translate(a.x,a.y),n=0,r=0,(void 0!==a.scaleX||void 0!==a.scaleY)&&JaSper.canvas.scale(e,a),void 0!==a.rotation&&JaSper.canvas.rotate(e,a)),a.boundingBox=[n-a.r,r-a.r,2*a.r,2*a.r,n+a.r,r+a.r],void 0!=a.selected&&a.selected&&JaSper.canvas.boundingBox(e,a),t.beginPath(),t.arc(n,r,a.r,Math.PI/180*a.angleStart,Math.PI/180*a.angleEnd,a.cclock),t.closePath(),t.fillStyle=a.fill,t.strokeStyle=a.border,t.lineWidth=a.borderWidth,t.stroke(),t.fill(),t.restore(),a.boundingBox[0]=a.x-a.r,a.boundingBox[1]=a.y-a.r,!0},image:function(e,a){if(!JaSper.canvas.valid(e))return!1;var t=e.getContext("2d");a.x=a.x||100,a.y=a.y||100,a.src=a.src||"http://sargazos.net/imgs/logo.png";var n=new Image;return n.onload=function(){t.drawImage(n,a.x,a.y)},n.src=a.src,!0},mouseHit:function(e,a,t){if(e.selected){var n=5,r=[Math.abs(e.boundingBox[4]-a),Math.abs(e.boundingBox[1]-t)],o=[Math.abs(e.boundingBox[0]-a),Math.abs(e.boundingBox[1]-t)],i=[Math.abs(e.boundingBox[4]-a),Math.abs(e.boundingBox[5]-t)];if(r[0]<n&&r[1]<n)return"r";if(o[0]<n&&o[1]<n)return"nw";if(i[0]<n&&i[1]<n)return"se"}if(e.r){var s=a-e.x,l=t-e.y;return s*s+l*l<e.r*e.r}if(e.boundingBox){var s=e.boundingBox[0]<a&&a<e.boundingBox[4],l=e.boundingBox[1]<t&&t<e.boundingBox[5];return s&&l}return!1},mouseDown:function(e){var a=JaSper.event.source(e);if(!JaSper.canvas.valid(a))return!1;JaSper.event.remove(a,"mousedown",JaSper.canvas.mouseDown);for(var t=a.getBoundingClientRect(),n=a.JaSperItems,r=void 0,o=0,i=0,s=function(e){if(!r)return!1;var n=(e.clientX-t.left)*(a.width/t.width),s=(e.clientY-t.top)*(a.height/t.height);if(void 0!==r.dragging&&r.dragging){if("r"==r.dragging){var l=Math.abs(r.boundingBox[4]-n),d=Math.abs(r.boundingBox[1]-s),c=Math.sqrt(l*l+d*d);r.rotation=c}else r.x=n-o,r.y=s-i;a.JaSperItems.flags.animable||JaSper.canvas.redraw(a)}else if(void 0!==r.selected&&r.selected&&r.boundingBox){var u=5,v=n,f=s,g=[r.boundingBox[0],r.boundingBox[1],r.boundingBox[4],r.boundingBox[5]];if(r.rotation){var h=function(e,a,t){var n=Math.sin(t),r=Math.cos(t);e[0]-=a[0],e[1]-=a[1];var o=e[0]*r-e[1]*n,i=e[0]*n+e[1]*r;return[parseInt(o+a[0]),parseInt(i+a[1])]},p=(r.rotation>360?Math.floor(r.rotation%360):r.rotation)*Math.PI/180,m=r.boundingBox[0]+r.boundingBox[2]/2,S=r.boundingBox[1]+r.boundingBox[3]/2,b=h([v,f],[m,S],p);v=b[0],f=b[1];var J=h([g[0],g[1]],[m,S],p);g[0]=J[0],g[1]=J[1],J=h([g[2],g[3]],[m,S],p),g[2]=J[0],g[3]=J[1]}var x=[Math.abs(g[2]-v),Math.abs(g[1]-f)],w=[Math.abs(g[0]-v),Math.abs(g[1]-f)],y=[Math.abs(g[2]-v),Math.abs(g[3]-f)];if(x[0]<u&&x[1]<u)a.style.cursor="crosshair";else if(w[0]<u&&w[1]<u)a.style.cursor="NW-resize";else if(y[0]<u&&y[1]<u)a.style.cursor="SE-resize";else{var M=g[0]<v&&v<g[2],I=g[1]<f&&f<g[3];a.style.cursor=M&&I?"pointer":"default"}}return!0},l=function(){JaSper.event.remove(window,"mouseup",l);for(var e in n)void 0!==n[e].dragging&&n[e].dragging&&(o=i=0,n[e].dragging=!1);return a.JaSperItems.flags.animable||JaSper.canvas.redraw(a),JaSper.event.add(a,"mousedown",JaSper.canvas.mouseDown),a.style.cursor="default",!0},d=(e.clientX-t.left)*(a.width/t.width),c=(e.clientY-t.top)*(a.height/t.height),u=Object.keys(n),v=u.length;v>=0;--v)if(n[u[v]]&&n[u[v]].drag){var f=JaSper.canvas.mouseHit(n[u[v]],d,c);f?(a.style.cursor="pointer",o=d-n[u[v]].x,i=c-n[u[v]].y,r=n[u[v]],n[u[v]].selected&&(JaSper.event.remove(window,"mousemove",n[u[v]].mouseMove),delete n[u[v]].mouseMove),r.mouseMove=s,JaSper.event.add(window,"mousemove",r.mouseMove),r.selected=!0,r.dragging=f):(n[u[v]].selected&&(JaSper.event.remove(window,"mousemove",n[u[v]].mouseMove),delete n[u[v]].mouseMove),n[u[v]].selected=!1)}return a.JaSperItemSelected=r,JaSper.event.add(window,"mouseup",l),!1},move:function(e,a){if(!JaSper.canvas.valid(e))return!1;if(!a.id||!e.JaSperItems[a.id])return!1;var t=a.angle||0;"function"==typeof a.angle&&(t=a.angle.call(null));var n=t*Math.PI/180,r=a.speed||1;return"function"==typeof a.speed&&(r=a.speed.call(null)),e.JaSperItems[a.id].x+=Math.cos(n)*r,e.JaSperItems[a.id].y+=Math.sin(n)*r,!0},path:function(e){if(!JaSper.canvas.valid(e))return!1;e.getContext("2d");return!0},polygon:function(e,a){if(!JaSper.canvas.valid(e))return!1;var t=e.getContext("2d");a.sides=a.sides||3,a.r=a.r||50,a.x=a.x||0,a.y=a.y||0,a.angle=a.angle||0,a.cclock=a.cclock||!1,a.fill=a.fill||"#ccc",a.borderWidth=a.borderWidth||1,a.border=a.border||"#3ab";var n=a.x,r=a.y,o=a.angle*Math.PI/180;t.save(),(void 0!==a.scaleX||void 0!==a.scaleY||void 0!==a.rotation)&&(t.translate(a.x,a.y),n=0,r=0,(void 0!==a.scaleX||void 0!==a.scaleY)&&JaSper.canvas.scale(e,a),void 0!==a.rotation&&JaSper.canvas.rotate(e,a)),a.boundingBox=[n-a.r,r-a.r,2*a.r,2*a.r,n+a.r,r+a.r],void 0!=a.selected&&a.selected&&JaSper.canvas.boundingBox(e,a),t.beginPath(),t.moveTo(n+a.r*Math.sin(o),r-a.r*Math.cos(o));for(var i=2*Math.PI/a.sides,s=1;s<a.sides;s++)o+=a.cclock?-i:i,t.lineTo(n+a.r*Math.sin(o),r-a.r*Math.cos(o));return t.closePath(),t.fillStyle=a.fill,t.strokeStyle=a.border,t.lineWidth=a.borderWidth,t.fill(),t.stroke(),t.restore(),a.boundingBox[0]=a.x-a.r,a.boundingBox[1]=a.y-a.r,!0},redraw:function(e){if(!JaSper.canvas.valid(e))return!1;var a=e.JaSperItems,t=!1;for(t in a){var n=JaSper.canvas[a[t].func];"function"==typeof n&&n.call(null,e,a[t])}return!0},rotate:function(e,a){if(!JaSper.canvas.valid(e)||!a)return!1;var t=e.getContext("2d"),n=a.rotation||0,r=n*Math.PI/180;return t.rotate(r),!0},scale:function(e,a){if(!JaSper.canvas.valid(e)||!a)return!1;var t=e.getContext("2d"),n=a.scaleX||1,r=a.scaleY||1;return t.scale(n,r),!0},text:function(e,a){if(!JaSper.canvas.valid(e))return!1;var t=e.getContext("2d");a.x=a.x||100,a.y=a.y||100,a.fillStyle=a.fillStyle||"#01f",a.font||(a.fontItalic=a.fontItalic||"italic",a.fontWeight=a.fontWeight||"bold",a.fontSize=a.fontSize||"15pt",a.fontName=a.fontName||"Tahoma",a.font=a.fontItalic+" "+a.fontWeight+" "+a.fontSize+" "+a.fontName),a.fillText=a.fillText||"Hello world!";var n=a.x,r=a.y;t.save(),t.fillStyle=a.fillStyle,t.font=a.font;var o=t.measureText(a.fillText).width,i=t.measureText("m").width;return(void 0!==a.scaleX||void 0!==a.scaleY||void 0!==a.rotation)&&(t.translate(a.x+o/2,a.y-i/2),n=-(o/2),r=i/2,(void 0!==a.scaleX||void 0!==a.scaleY)&&JaSper.canvas.scale(e,a),void 0!==a.rotation&&JaSper.canvas.rotate(e,a)),t.fillText(a.fillText,n,r),a.boundingBox=[n,r-i,o,i,n+o,r],void 0!=a.selected&&a.selected&&JaSper.canvas.boundingBox(e,a),t.restore(),a.boundingBox[0]=a.x,a.boundingBox[1]=a.y-i,!0},valid:function(e){return"object"!=typeof e||"function"!=typeof e.getContext?(JaSper.log("-JaSper::canvas.valid- el objeto no es canvas",1),!1):!0}}),function(){for(var e=0,a=["ms","moz","webkit","o"],t=0;t<a.length&&!window.requestAnimationFrame;++t)window.requestAnimationFrame=window[a[t]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[a[t]+"CancelAnimationFrame"]||window[a[t]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(a){var t=(new Date).getTime(),n=Math.max(0,16-(t-e)),r=window.setTimeout(function(){a(t+n)},n);return e=t+n,r}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(e){clearTimeout(e)})}();
