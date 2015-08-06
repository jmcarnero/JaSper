/*! JaSper v3.4 | (c) 2015 José M. Carnero (sargazos.net) */
"use strict";!function(e,t){e.JaSper||(JaSper=e.JaSper=e.$=function(e,t){return new JaSper.funcs.init(e,t)},JaSper.css={addClass:function(e,t){"string"==typeof t&&-1==e.className.indexOf(t)&&(e.className+=" "+t)},getStyle:function(e,t){e=e?e:document.defaultView;var n="";return 1==e.nodeType&&(n=document.defaultView&&document.defaultView.getComputedStyle?document.defaultView.getComputedStyle(e,"")[t]:e.currentStyle?e.currentStyle[t]:e.style[t]),n},original:function(e,t){if(!t)return null;var n=JaSper.nodo.extend(e);if(n.css=n.css||{},n.css.original=n.css.original||{},!n.css.original[t]){var r=JaSper.css.getStyle(e,t);switch(t){case"display":if("none"==e.style.display||!e.style.display){var a=document.createElement(e.nodeName);JaSper(document.body).append(a),n.css.original[t]=JaSper.css.getStyle(a,t),JaSper(document.body).remove(a)}n.css.original[t]=n.css.original[t]||("none"!=r?r:"");break;default:n.css.original[t]=r}}return JaSper.nodo.extend(e,n),n.css.original[t]},removeClass:function(e,t){"string"==typeof t&&e.className.indexOf(t)>-1&&(e.className=e.className.substr(0,e.className.indexOf(t)-1)+e.className.substr(e.className.indexOf(t)+t.length))},setStyle:function(e,t,n){return e=e?e:document.defaultView,1==e.nodeType?(e.style[t]=n,!0):!1}},JaSper.event={add:function(n,r,a,o){if(!n||3==n.nodeType||8==n.nodeType)return JaSper.log("[JaSper::event.add] No se asignan eventos a nodos de texto o comentarios.",0),t;"string"==typeof a&&(a=e[a]),o=o||!1;for(var i=r.split(","),s=0;s<i.length;s++){r=i[s];var u=["mouseenter","mouseleave","mousewheel"];if(-1!=u.indexOf(r)||n["on"+r]!==t){var c=JaSper.nodo.extend(n);if(c.event=c.event||{},c.event[r]=c.event[r]||[],c.event[r].push(a),JaSper.nodo.extend(n,c),document.addEventListener){switch(r){case"mouseenter":n.addEventListener("mouseover",JaSper.event.mouseEnter(a),o);break;case"mouseleave":n.addEventListener("mouseout",JaSper.event.mouseEnter(a),o);break;case"mousewheel":JaSper.funcs.gecko&&(r="DOMMouseScroll",a=JaSper.event.mouseWheel(a));default:n.addEventListener(r,a,o)}e.eventTrigger&&n.addEventListener(r,function(){e.eventTrigger.call(n,r)},o)}else if(document.attachEvent){var l=n+r+a;if(n["e"+l]=a,n[l]=function(){n["e"+l](e.event)},n.attachEvent("on"+r,n[l]),e.eventTrigger){var l=n+r+e.eventTrigger;n["e"+l]=function(){e.eventTrigger.call(n,r)},n[l]=function(){n["e"+l](e.event)},n.attachEvent("on"+r,n[l])}}else{var d=n["on"+r];if(n["on"+r]="function"!=typeof n["on"+r]?a:function(){d&&d(),a()},e.eventTrigger){var d=n["on"+r];this["on"+r]=function(){d&&d(),e.eventTrigger.call(n,r)}}}}else JaSper.log("[JaSper::event.add] No se puede aplicar el evento ["+r+"]",1)}},keyCode:function(t){t=t||e.event;var n=t.keyCode||t.which,r=t.type.toLowerCase().replace("on","");if("keypress"==r)return n;if("keydown"==r||"keyup"==r){var a={8:[8],9:[9],13:[13],46:[127],48:[48],49:[49],50:[50],51:[51],52:[52],53:[53],54:[54],55:[55],56:[56],57:[57],65:[97,65],66:[98,66],67:[99,67],68:[100,68],69:[101,69],70:[102,70],71:[103,71],72:[104,72],73:[105,73],74:[106,74],75:[107,75],76:[108,76],77:[109,77],78:[110,78],79:[111,79],80:[112,80],81:[113,81],82:[114,82],83:[115,83],84:[116,84],85:[117,85],86:[118,86],87:[119,87],88:[120,88],89:[121,89],90:[122,90],96:[48],97:[49],98:[50],99:[51],100:[52],101:[53],102:[54],103:[55],104:[56],105:[57],106:[42],107:[43],109:[45],110:[46],111:[47],186:[59],187:[61],188:[44],189:[45],190:[46],191:[47],192:[96],219:[91],220:[92],221:[93],222:[39]},o=0;if("Netscape"==navigator.appName&&4==parseInt(navigator.appVersion,10)){var i=(t.modifiers+32).toString(2).substring(3,6);o+="1"==i.charAt(0)?1:0,o+="1"==i.charAt(1)?1:0,o+="1"==i.charAt(2)?1:0}else o+=t.shiftKey?1:0,o+=t.altKey?1:0,o+=t.ctrlKey?1:0;if("undefined"!=typeof a[n]){if("undefined"!=typeof a[n][o])return a[n][o];if("undefined"!=typeof a[n][0])return a[n][0]}return n}return-1},mouseEnter:function(e){var t=function(e,t){if(e===t)return!1;for(;t&&t!==e;)t=t.parentNode;return t===e};return function(n){var r=n.relatedTarget;this===r||t(this,r)||e.call(this,n)}},mouseWheel:function(e){return"undefined"==typeof e&&(e=function(t){t.wheelDelta=-t.detail,e.call(this,t),t.wheelDelta=null}),e},name:function(t){return t=t||e.event},preventDefault:function(t){return t=t||e.event,t.preventDefault?t.preventDefault():e.event&&(t.returnValue=!1,t.retainFocus=!0),!1},remove:function(t,n,r,a){function o(e,t,n){var r,a=JaSper.nodo.extend(e),o=a.event;a.event=null;for(var i in o){r=!1,t&&t!=i||(r=!0);for(var s=0;s<o[i].length;s++)(r||!n||n==o[i][s])&&(r=!0),r?JaSper.event.remove(e,i,o[i][s]):a.event[i].push(o[i][s])}JaSper.nodo.extend(e,a)}if(n&&r||o(t,n,r),"string"==typeof r&&(r=e[r]),a=a||!1,document.addEventListener){switch(n){case"mouseenter":t.removeEventListener("mouseover",JaSper.event.mouseEnter(r),a);break;case"mouseleave":t.removeEventListener("mouseout",JaSper.event.mouseEnter(r),a);break;case"mousewheel":JaSper.funcs.gecko&&(n="DOMMouseScroll",r=JaSper.event.mouseWheel(r));default:t.removeEventListener(n,r,a)}e.eventTrigger&&t.removeEventListener(n,function(){e.eventTrigger.call(t,n)},a)}else if(document.attachEvent){if(t.detachEvent("on"+n,t[n+r]),t[n+r]=null,t["e"+n+r]=null,e.eventTrigger){var r=function(){e.eventTrigger.call(t,n)};t.detachEvent("on"+n,t[n+r]),t[n+r]=null,t["e"+n+r]=null}}else t["on"+n]=null},source:function(t){t=t||e.event;var n=!1;return n=t.target||t.srcElement,(3==n.nodeType||4==n.nodeType)&&(n=n.parentNode),n},stop:function(t){return t=t||e.event,t.stopPropagation?t.stopPropagation():t.cancelBubble=!0,!1},target:function(t){t=t||e.event;var n=!1;return n="mouseout"==t.type?t.relatedTarget||t.toElement:t.target||t.srcElement}},JaSper.extend=function(e,t){if(e===JaSper.langs)return void JaSper.funcs.extendTrads(t);for(var n in t)e[n]=t[n]},JaSper.funcs={navigator:(navigator.userAgent.toLowerCase().match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[0,"0"])[1],msie:/msie/.test(navigator.userAgent.toLowerCase())&&!/opera/.test(navigator.userAgent.toLowerCase()),mozilla:/mozilla/.test(navigator.userAgent.toLowerCase())&&!/(compatible|webkit)/.test(navigator.userAgent.toLowerCase()),opera:/opera/.test(navigator.userAgent.toLowerCase()),webkit:/webkit/.test(navigator.userAgent.toLowerCase()),gecko:/gecko/.test(navigator.userAgent.toLowerCase())&&!/khtml/.test(navigator.userAgent.toLowerCase()),extendTrads:function(e){for(var t in e){JaSper.langs[t]||(JaSper.langs[t]={});for(var n in e[t])JaSper.langs[t][n]=e[t][n]}},foreach:function(e,t,n){if(this.isFunction(e)&&(e=e.call()),this.isArrayLike(e))if(n)for(var r=0,a=e.length;a>r;r++)e[r]&&t.apply(e[r],n);else for(var r=0,a=e.length;a>r;r++)e[r]&&t.call(e[r]);else if(n)for(var r in e)e[r]&&t.apply(e[r],n);else for(var r in e)e[r]&&t.call(e[r]);return e},genId:function(e){var t="JaSper_";(!e||e.length<t.length+5)&&(e=t.length+5);for(var n,r="0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";t.length<e||document.getElementById(t);)n=Math.floor(Math.random()*(r.length-1)),t+=r.substr(n,1);return t},getElementsByClassName:function(e,t,n){if(t=t||this.context||document,n=n||"*",document.getElementsByClassName){if("*"==n){var r=t.getElementsByClassName(e);return r}n=n.toUpperCase();for(var a=t.getElementsByClassName(e),r=[],o=0,i=a.length;i>o;o++)a[o].nodeName==n&&r.push(a[o]);return r}for(var s=[],r="*"==n&&t.all?t.all:t.getElementsByTagName(n),u=new RegExp("(^|\\s)"+e.replace(/\-/,"\\-")+"(\\s|$)"),c=0,l=r.length;l>c;c++)u.test(r[c].className)&&s.push(r[c]);return s},init:function(t,n){if(t=t||document,this.version=JaSper.version="JaSper v3.4",this.nodes=this.nodes||[],this.context=n||e.document,JaSper.debug=JaSper.debug||!1,this.lang=JaSper.lang=JaSper.lang||(navigator.language?navigator.language.substr(0,2):navigator.userLanguage?navigator.userLanguage.substr(0,2):"es"),"string"==typeof t)if("//"==t.substring(0,2)){var r=this.context.evaluate(t,this.context,null,XPathResult.ANY_TYPE,null);try{for(var a;a=r.iterateNext();)this.nodes.push(a)}catch(o){JaSper.log("[JaSper::constructor] [XPath] Arbol del documento modificado durante la iteracion.",1)}}else{var i,s=/^<([^> ]+)[^>]*>(?:.|\n)+?<\/\1>$|^(\#([-\w]+)|\.(\w[-\w]+)|@(\w[-\w]+))$/i,u=/<([a-z1-9]+?)>,?/gi;if(i=u.exec(t),i&&i[1]){i=t.match(u);for(var c=0;c<i.length;c++)if("function"==typeof this.context.getElementsByTagName){var l=this.context.getElementsByTagName(i[c].replace(/[<>,]/g,""));try{this.nodes=this.nodes.concat(Array.prototype.slice.call(l))}catch(d){for(var f=0;f<l.length;f++)this.nodes[this.nodes.length]=l[f]}}else JaSper.log('[JaSper::constructor] "'+n.toString()+'" no es un contexto válido.',1)}else{var i=s.exec(t)||[];if(i[3])this.nodes[0]=document.getElementById(i[3]);else if(i[4])this.nodes=JaSper.funcs.getElementsByClassName(i[4],this.context,"*");else if(i[5])this.nodes=document.getElementsByName(i[5]);else if(i[1]){var p=JaSper.nodo.crear("div",{innerHTML:t});this.nodes=p.childNodes,document.removeChild(p)}else this.nodes=document.querySelectorAll?JaSper.funcs.selector(t,this.context):JaSper.find?JaSper.find(t,this.context):[]}}else t.nodeType?this.context=this.nodes[0]=t:this.nodes=JaSper.funcs.isArray(t)?t:JaSper.funcs.makeArray(t);return this.length=this.nodes.length,this},isDOMObject:function(t){var n=t===e,r="object"==typeof Node?t instanceof Node:t&&"object"==typeof t&&"number"==typeof t.nodeType&&"string"==typeof t.nodeName,a="object"==typeof HTMLElement?t instanceof HTMLElement:t&&"object"==typeof t&&null!==t&&1===t.nodeType&&"string"==typeof t.nodeName;return n||r||a},isArray:function(e){return"[object Array]"==Object.prototype.toString.call(e)},isArrayLike:function(t){return t&&t.length&&!this.isFunction(t)&&!this.isString(t)&&t!==e},isFunction:function(e){return e instanceof Function},isNumber:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},isString:function(e){return"string"==typeof e},loadScript:function(e){var t="JaSper_script_"+e.replace(/[^a-zA-Z\d_]+/,"");if(document.getElementById(t))return void JaSper.log("-JaSper::loadScript- Script (id->"+t+") ya cargado.",0);var n=JaSper.minificado?"_min":"";if(-1===e.indexOf("http://"))for(var r=new RegExp("(^|(.*?\\/))(JaSper"+n+".js)(\\?|$)"),a=document.getElementsByTagName("script"),o=0,i=a.length;i>o;o++){var s=a[o].getAttribute("src");if(s){var u=s.match(r);if(u){e=u[1]+e;break}}}var c=function(e,n){if(n=n||!1,JaSper.funcs.loadScriptQueue){var r=JaSper.funcs.loadScriptQueue;JaSper.funcs.loadScriptQueue=[],"ie"==n?JaSper.log("-JaSper::loadScript- Script ["+e+"] listo! ... en IE",0):"st"==n?JaSper.log("-JaSper::loadScript- Script ["+e+"] cargado!",0):JaSper.log("-JaSper::loadScript- Script (id->"+t+') leido con "document.write".');for(var a in r)try{!function(e,t){return e.call(t)}(r[a].fn,r[a].ctx)}catch(o){return JaSper.log("-JaSper::loadScript- No se ha podido ejecutar el método: ["+o+"]",1),void JaSper.funcs.loadScriptQueue.push(a)}}},l=JaSper.nodo.crear("script",{id:t,type:"text/javascript",src:e});l.readyState?l.onreadystatechange=function(){("loaded"==l.readyState||"complete"==l.readyState)&&(l.onreadystatechange=null,c(l.src,"ie"))}:l.onload=function(){c(l.src,"st")};var d=document.getElementsByTagName("head").length?document.getElementsByTagName("head")[0]:document.body;return d.appendChild(l),!0},loadScriptQueue:[],makeArray:function(e){var t=[];if(null!=e)if(this.isArrayLike(e))for(var n=e.length;n;)t[--n]=e[n];else t[0]=e;return t},readyFuncs:[],runReady:function(){for(var e=0;e<JaSper.funcs.readyFuncs.length;e++)JaSper.funcs.readyFuncs[e]()},selector:function(e,t){t=t||document;try{var n=t.querySelectorAll(e);return n.length?this.makeArray(t.querySelectorAll(e)):[]}catch(r){return[]}},setInterval:function(e){if(e=e||{},e.intervalo=e.intervalo||40,e.duracion=e.duracion||300,e.delta=e.delta||"","string"==typeof e.delta)switch(e.delta){case"cuadratica":e.delta=function(e){return Math.pow(e,2)};break;case"arco":e.delta=function(e,t){return t=t||1.5,Math.pow(e,2)*((t+1)*e-t)};break;case"bote":e.delta=function(e){for(var t=0,n=1;;t+=n,n/=2)if(e>=(7-4*t)/11)return-Math.pow((11-6*t-11*e)/4,2)+Math.pow(n,2)};break;case"elastica":e.delta=function(e,t){return t=t||1.5,Math.pow(2,10*(e-1))*Math.cos(20*Math.PI*t/3*e)};break;case"lineal":default:e.delta=function(e){return e}}if(!e.accion)return!1;var t=new Date,n=setInterval(function(){var r=(new Date-t)/e.duracion,a=e.delta(r);e.accion(a),r>1&&clearInterval(n)},e.intervalo);return!0},sprintf:function(){if(arguments&&arguments.length){if(1==arguments.length)return arguments[0];for(var e=arguments[0],t=/(%[s%])/,n=[],r=0;n=t.exec(e);)switch(n[1]){case"%%":e=e.substr(0,n.index)+"%"+e.substr(n.index+2);break;case"%s":e=e.substr(0,n.index)+arguments[++r].toString()+e.substr(n.index+2);break;case"%u":e=e.substr(0,n.index)+parseInt(arguments[++r],10)+e.substr(n.index+2);break;default:e=e.substr(0,n.index)+"-tipo desconocido-"+e.substr(n.index+2),r++}return e}},windowPosition:function(){var t=function(t){return"x"==t?e.innerWidth+e.scrollX>=document.body.offsetWidth:"y"==t?e.innerHeight+e.scrollY>=document.documentElement.clientHeight:void 0},n=[];return 0==document.body.scrollTop&&(n[n.length]="top"),0==document.body.scrollLeft&&(n[n.length]="left"),t("x")&&(n[n.length]="right"),t("y")&&(n[n.length]="bottom"),n.length?-1==n.indexOf("left")&&-1==n.indexOf("right")?n[n.length]="centerY":-1==n.indexOf("top")&&-1==n.indexOf("bottom")&&(n[n.length]="centerX"):n[n.length]="center",n}},JaSper.langs={en:{},es:{}},JaSper.log=function(e,t){if(!JaSper.debug)return!1;var n="",r=[];try{n=(new Error).stack}catch(a){n=a.stack?a.stack:a.stacktrace?a.stacktrace:a.message}finally{if(n)for(var o=n.split("\n"),i=0,s=o.length;s>i;i++)o[i].match(/^\s*[A-Za-z0-9\-_$]+/)&&r.push(o[i])}if(e=e||"JaSper debug",e+="\n["+r[1]+"]",t=t||0,"object"!=typeof console){var u=document.getElementById("JaSperDebug");u||(u=JaSper.nodo.crear("ul",{className:"JaSperDebug ",id:"JaSperDebug"}),JaSper("<body>").insertAfter(u));var c=JaSper.nodo.crear("li",{className:"JaSperDebug"+(2==t?"error":1==t?"warn":"info")});c.appendChild(document.createTextNode(e)),JaSper("<body>").append(c,u)}else switch("string"!=typeof e&&console.dir(e),t){case 2:console.error(e);break;case 1:console.warn(e);break;case 0:default:console.info(e)}},JaSper.minificado=function(){for(var e=document.getElementsByTagName("script"),t=0;t<e.length;t++)if(e[t].src.indexOf("JaSper_min.js")>0)return!0;return!1}(),JaSper.nodo={attrib:function(e,n,r){var a=null;if(n=(n||"").toLowerCase(),e&&n){var o=0==n.indexOf("data-")?n.substr(5).toLowerCase():null;a=o?e.dataset[o]:e.getAttribute(n),r!==t&&(r?o?e.dataset[o]=r:e.setAttribute(n,r):o?e.dataset[o]=null:e.removeAttribute(n))}return a},boundingRect:function(e){if(e){var t=0,n=0,r=0,a=0,o=0,i=0,s=null;if(e.getBoundingClientRect){if(s=e.getBoundingClientRect(),t=s.left,n=s.top,r=s.right-s.left,a=s.bottom-s.top,"microsoft internet explorer"==navigator.appName.toLowerCase()){t-=document.documentElement.clientLeft,n-=document.documentElement.clientTop;var u=function(){var e=1;if(document.body.getBoundingClientRect){s=document.body.getBoundingClientRect();var t=s.right-s.left,n=document.body.offsetWidth;e=Math.round(t/n*100)/100}return e}();1!=u&&(t=Math.round(t/u),n=Math.round(n/u),r=Math.round(r/u),a=Math.round(a/u))}}else{for(var c={x:0,y:0},l={x:0,y:0};e.offsetParent;)c.x+=e.offsetParent.offsetLeft,c.y+=e.offsetParent.offsetTop,"html"!=e.offsetParent.tagName.toLowerCase()&&(l.x+=e.offsetParent.scrollLeft,l.y+=e.offsetParent.scrollTop);t=c.x-l.x,n=c.y-l.y,r=e.offsetWidth,a=e.offsetHeight}return o=t+r,i=n+a,{top:n,bottom:i,left:t,right:o,width:r,height:a,boundingClientRect:s}}},crear:function(e,t,n){function r(e){e=e||null;var t=-1,n={innerHTML:1,style:2};return n[e]&&(2==n[e]?"string"==typeof e?t=0:"object"==typeof e&&(t=1):t=n[e]),t}if(!e)return null;var a=document.createElement(e);if(t){t.id&&document.getElementById(t.id)&&(JaSper.log("ID ya en uso: ["+t.id+"]",1),t.id=!1);for(var o in t)if(t[o]){var i=r(o);1==i?a[o]=t[o]:a.setAttribute(o,t[o])}}return n&&n.appendChild(a),a},extend:function(e,t){if(!JaSper.funcs.isDOMObject(e))return JaSper.log("[JaSper::nodo.extend] Se está intentando extender un nodo no DOM",1),!1;var n="JaSper";if(e[n]=e[n]||{},!t)return e[n];for(var r in t)e[n][r]=t[r]}},JaSper._t=function(e,t){return e?(t=t||JaSper.lang,JaSper.funcs.isArray(e)||(e=[e]),JaSper.langs[t]&&JaSper.langs[t][e[0]]&&(e[0]=JaSper.langs[t][e[0]]),JaSper.funcs.sprintf.apply(this,e)):""},JaSper.tactil=function(){var t="ontouchstart"in e||"onmsgesturechange"in e||navigator.maxTouchPoints||!1;return t}(),JaSper.funcs.init.prototype=JaSper.prototype)}(window,void 0),JaSper.extend(JaSper.prototype,{debug:function(e){return e=e||!0,JaSper.debug=e,this},each:function(e,t){return this.nodes&&this.nodes.length&&(t?JaSper.funcs.foreach(this.nodes,e,t):JaSper.funcs.foreach(this.nodes,e,void 0)),this},ready:function(e){if(document.addEventListener)return document.addEventListener("DOMContentLoaded",e,!1);if(!(JaSper.funcs.readyFuncs.push(e)>1))if(JaSper.funcs.msie)!function(){var e=setInterval(function(){try{document.documentElement.doScroll("left"),JaSper.funcs.runReady(),clearInterval(e)}catch(t){}},5)}();else if(JaSper.funcs.webkit)var t=setInterval(function(){/^(loaded|complete)$/.test(document.readyState)&&(clearInterval(t),JaSper.funcs.runReady())},0)}}),JaSper.extend(JaSper.prototype,{addClass:function(e){return this.each(function(){JaSper.css.addClass(this,e)}),this},getStyle:function(e){var t=this.nodes[0];return JaSper.css.getStyle(t,e)},removeClass:function(e){return this.each(function(){JaSper.css.removeClass(this,e)}),this},setStyle:function(e,t){return this.each(function(e,t){var n=this;return JaSper.css.setStyle(n,e,t)},[e,t]),this}}),JaSper.extend(JaSper.prototype,{eventAdd:function(e,t){return this.each(function(e,t,n){JaSper.event.add(this,e,t,n)},[e,t]),this},eventRemove:function(e,t,n){return"string"==typeof t&&(t=window[t]),n=n||!1,this.each(function(e,t,n){JaSper.event.remove(this,e,t,n)},[e,t,n]),this}}),JaSper.extend(JaSper.prototype,{append:function(e,t){e=e||this;var n=null;return n=JaSper.funcs.isArray(e)?JaSper.nodo.crear(e[0],{innerHTML:e[1],className:e[1],id:e[1]}):e,t?("string"==typeof t&&(t=document.getElementById(t)),1==t.nodeType&&t.appendChild(n)):this.each(function(e){1==this.nodeType&&this.appendChild(e)},[n]),this},attrib:function(e,t){var n=this;return this.each(function(e,t){return void 0===t?void(n=JaSper.nodo.attrib(this,e)):void JaSper.nodo.attrib(this,e,t)},[e,t]),n},html:function(e,t){var n=[];return e=e||"",t=t||"",this.each(function(e){this.innerHTML&&(n[n.length]=this.innerHTML,e&&(this.innerHTML=e))},[e]),n.join(t)},insertAfter:function(e){return elem=JaSper.funcs.isArray(e)?JaSper.nodo.crear(e[0],{innerHTML:e[1],className:e[1],id:e[1]}):e,this.each(function(e){this.parentNode.insertBefore(e,this.nextSibling)},[elem]),this},insertBefore:function(e){return elem=JaSper.funcs.isArray(e)?JaSper.nodo.crear(e[0],{innerHTML:e[1],className:e[2],id:e[3]}):e,this.each(function(e){this.parentNode.insertBefore(e,this)},[elem]),this},prepend:function(e,t){return e=e||this,elem=JaSper.funcs.isArray(e)?JaSper.nodo.crear(e[0],{innerHTML:e[1],className:e[1],id:e[1]}):e,t?("string"==typeof t&&(t=document.getElementById(t)),1==t.nodeType&&t.insertBefore(el,t.firstChild)):this.each(function(e){1==this.nodeType&&this.insertBefore(e,this.firstChild)},[elem]),this},remove:function(e){return this.each(function(e){e.parentNode.removeChild(e)},[e]),this},text:function(e,t){var n=[];return e=e||"",t=t||"",this.each(function(e){this.textContent&&(n[n.length]=this.textContent||this.nodeValue,e&&(this.textContent=e))},[e]),n.join(t)}}),JaSper.extend(JaSper.prototype,{callPeriodic:function(e,t,n){return e&&this.each(function(e,t,n){if(t){var r=setInterval(e,t);n&&(idt=setTimeout("clearInterval("+r+")",n))}else n&&(idt=setTimeout(e,n))},[e,t,n]),this}}),JaSper.extend(JaSper.prototype,{loadMethod:function(method,args,library){library=library||method;var sMinified=JaSper.minificado?"_min":"";switch(library){case"ajax":library="JaSper_ajax"+sMinified+".js";break;case"anim":library="JaSper_anim"+sMinified+".js";break;case"canvas":library="JaSper_canvas"+sMinified+".js";break;case"datetime":library="JaSper_datetime"+sMinified+".js";break;case"lightbox":library="JaSper_lightbox"+sMinified+".js";break;case"move":library="JaSper_move"+sMinified+".js";break;case"rating":library="JaSper_rating"+sMinified+".js";break;case"rtb":library="JaSper_rtb"+sMinified+".js";break;case"validar":library="JaSper_formazo"+sMinified+".js";break;default:library=!1,JaSper.log("-JaSper::loadMethod- Intenta cargar dinamicamente una librería desconocida para el metodo: "+method,1)}var tempCall=function(obj,as){return function(){eval("obj."+method+".apply(obj, as);")}}(this,args);return library&&(JaSper.funcs.loadScriptQueue.push({fn:tempCall,ctx:this}),JaSper.funcs.loadScript(library)),this},fade:function(){return this.loadMethod("fade",arguments,"anim")},slide:function(){return this.loadMethod("slide",arguments,"anim")},slideToggle:function(){return this.loadMethod("slideToggle",arguments,"anim")},toggle:function(){return this.loadMethod("toggle",arguments,"anim")},ajax:function(){return this.loadMethod("ajax",arguments)},animate:function(){return this.loadMethod("animate",arguments,"canvas")},canvas:function(){return this.loadMethod("canvas",arguments,"canvas")},lightbox:function(){return this.loadMethod("lightbox",arguments)},countdown:function(){return this.loadMethod("countdown",arguments,"datetime")},datePicker:function(){return this.loadMethod("datePicker",arguments,"datetime")},move:function(){return this.loadMethod("move",arguments)},rating:function(){return this.loadMethod("rating",arguments)},rtb:function(){return this.loadMethod("rtb",arguments)},validar:function(){return this.loadMethod("validar",arguments)}}),Array.prototype.indexOf||(Array.prototype.indexOf=function(e){for(var t=0,n=this.length;n>t;t++)if(this[t]==e)return t;return-1}),String.prototype.trim||(String.prototype.trim=function(){var e=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;return this.replace(e,"")}),Object.keys||(Object.keys=function(){var e=Object.prototype.hasOwnProperty,t=!{toString:null}.propertyIsEnumerable("toString"),n=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],r=n.length;return function(a){if("object"!=typeof a&&("function"!=typeof a||null===a))throw new TypeError("Object.keys called on non-object");var o,i,s=[];for(o in a)e.call(a,o)&&s.push(o);if(t)for(i=0;r>i;i++)e.call(a,n[i])&&s.push(n[i]);return s}}());