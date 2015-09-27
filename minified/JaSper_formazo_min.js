/*! JaSper v3.4 | (c) 2015 José M. Carnero (sargazos.net) | JaSper_formazo v2.0 */
"use strict";JaSper.extend(JaSper.langs,{en:{"valida/bic":"BIC/SWIFT bank number invalid","valida/clave":"Check that you entered the same password in both boxes","valida/email":"Invalid e-mail","valida/fechas":"Incorrect date.\nRecommended format for your dates: ","valida/fichero":"File type not allowed.","valida/iban":"IBAN bank number invalid","valida/nif1":"NIE wrong.","valida/nif2":"NIF wrong.","valida/numeros1":"Range between ","valida/numeros2":" and ","valida/obligatorio":" can not be empty.","valida/obligatorioRadio":" should have checked some option.","valida/url":'Invalid URL.\nRecommended format: "http://dominio.tld"'},es:{"valida/bic":"Código bancario BIC/SWIFT incorrecto","valida/clave":"Compruebe que ha escrito la misma clave en ambas casillas","valida/email":"e-mail no válido","valida/fechas":"Fecha incorrecta.\nFormato recomendado para las fechas: ","valida/fichero":"Tipo de fichero no permitido.","valida/iban":"Código bancario IBAN incorrecto","valida/nif1":"NIE incorrecto","valida/nif2":"NIF incorrecto","valida/numeros1":"Rango entre ","valida/numeros2":" y ","valida/obligatorio":" no puede estar vacío.","valida/obligatorioRadio":" debe tener marcada alguna opción.","valida/url":'URL no válida.\nFormato recomendado: "http://dominio.tld"'}}),JaSper.extend(JaSper.prototype,{validar:function(e){e=e||{},e.clases=e.clases||{},e={alert:void 0===e.alert?!0:e.alert,preview:void 0===e.preview?!1:e.preview,clases:{error:e.clases.error||"frmError",obligatorio:e.clases.obligatorio||"obligatorio",clave:e.clases.clave||"clave",email:e.clases.email||"email",entero:e.clases.entero||"entero",fichero:e.clases.fichero||"fichero",fecha:e.clases.fecha||"fecha",nif:e.clases.nif||"nif",numerico:e.clases.numerico||"numerico",telefono:e.clases.telefono||"telefono",url:e.clases.url||"url"}};var a={};a[e.clases.obligatorio]=function(e){return JaSper.valida.obligatorio(e)},a[e.clases.clave]=function(e){return JaSper.valida.clave(e,document.getElementById("objId2"))},a[e.clases.email]=function(e){return JaSper.valida.email(e)},a[e.clases.entero]=function(e){return JaSper.valida.numeros(e)},a[e.clases.fichero]=function(e){return JaSper.valida.fichero(e)},a[e.clases.fecha]=function(e){return JaSper.valida.fechas(e)},a[e.clases.nif]=function(e){return JaSper.valida.nif(e)},a[e.clases.numerico]=function(e){return JaSper.valida.numeros(e)},a[e.clases.telefono]=function(e){return JaSper.valida.numeros(e)},a[e.clases.url]=function(e){return JaSper.valida.url(e)};var r={};return r[e.clases.entero]=function(e,a){return JaSper.valida.teclasNumeros(a,e,!1)},r[e.clases.fecha]=function(e,a){return JaSper.valida.teclasFechas(a,e)},r[e.clases.numerico]=function(e,a){return JaSper.valida.teclasNumeros(a,e,!0)},this.each(function(){JaSper("<input>,<textarea>",this).each(function(){var e=this;if("undefined"!=e.className)for(var a=e.className.split(" "),t=0;t<a.length;t++)if(JaSper.funcs.isFunction(r[a[t]])){var i=a[t];JaSper.event.add(e,"keydown",function(a){return r[i](a,e)?(JaSper.event.preventDefault(a),JaSper.event.stop(a),!1):void 0})}}),JaSper('select[multiple="multiple"]',this).eventAdd("mousedown",function(e){if(!e.ctrlKey){for(var a=[],r=0;r<this.options.length;r++)a[r]=this.options[r].selected;JaSper(this).eventAdd("mouseup",function t(){for(var e=0;e<this.options.length;e++)this.options[e].selected=this.options[e].selected?!a[e]:a[e];JaSper(this).eventRemove("mouseup",t)})}}),e.preview&&JaSper('input[type="file"]',this).each(function(){var e=this.dataset.previewId||this.getAttribute("data-previewId")||null;return e?(e="#"+e,void JaSper(this).eventAdd("change",function(){if("function"!=typeof FileReader)return JaSper.log("Vista previa no disponible",0),!1;var a=function(e){return e.replace(/data:([^;]+).*/,"$1")},r=this,t=r.files;if(t.length>0){var i=new FileReader;i.onloadend=function(t){var i=t.target,n=a(i.result.substring(0,30));"image/jpeg"!==n&&"image/png"!==n&&"image/gif"!==n?(JaSper(e).attrib("src",""),r.value="",JaSper.log("No se puede mostrar preview del fichero seleccionado",1)):JaSper(e).attrib("src",i.result)},i.onerror=function(e){JaSper.log(e,2)},i.readAsDataURL(t[0])}else JaSper(e).attrib("src","")})):!1})}),this.eventAdd("submit",function(r){return window.errMens=[],"undefined"!=typeof a?(JaSper("<input>,<textarea>,<select>",this).each(function(){var r=this;if("undefined"!=r.className){for(var t=r.className.split(" "),i=[],n=0;n<t.length;n++)if(JaSper.funcs.isFunction(a[t[n]])){var o=a[t[n]](r);o!==!1&&(i[i.length]=a[t[n]](r))}i.length?(JaSper.css.addClass(r,e.clases.error),window.errMens[window.errMens.length]=i.join("\n")):JaSper.css.removeClass(r,e.clases.error)}}),JaSper("."+e.clases.error,this).length>0?(JaSper.event.preventDefault(r),JaSper.event.stop(r),e.alert&&alert("Se han producido los siguientes errores:\n\n"+window.errMens.join("\n")),!1):!0):void 0}),this}}),JaSper.valida={},JaSper.extend(JaSper.valida,{bic:function(e){var a=!0;return e.value=e.value.toString().trim()||"",e.value||(a=!1),/^[a-z]{6}[0-9a-z]{2}([0-9a-z]{3})?$/i.test(e.value)||(a=!1),a?!1:JaSper._t("valida/bic")},clave:function(e,a){if(!a)return!1;var r=!0;return e||""==a.value||e==a.value||(r=!1),r?!1:JaSper._t("valida/clave")},email:function(e){var a=!0,r=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;return e.value=e.value.toString().trim()||"",""!=e.value&&(a=r.test(e.value)?!0:!1),a?!1:JaSper._t("valida/email")},fechas:function(e,a){a||(a="aaaa-mm-dd hh:mm:ss");var r=!1;if(e.value=e.value.toString().trim()||"",""!=e.value){var t=Date.parse(e.value.replace(/-/g,"/"));if(!isNaN(t)){var i=new Date;i.setTime(t),"Invalid Date"!=i&&(r=!0)}}return r?!1:JaSper._t("valida/fechas")+a},fichero:function(e,a){var r=!0;if(e.value=e.value.toString().trim()||"",""!=e.value){var t=new Array;t=e.value.split("."),r=a.indexOf(t[t.length-1].toLowerCase())>=0?!0:!1}return r?!1:JaSper._t("valida/fichero")},iban:function(e){var a=!0;if(e.value=e.value.toString().trim()||"",""!=e.value){var r,t,i,n,o,l,d=e.value.replace(/[^a-zA-Z0-9]/gim,"").toUpperCase(),s="",u=!0,v="",c="",p=d.substring(0,2),f={AD:"\\d{8}[\\dA-Z]{12}",AE:"\\d{3}\\d{16}",AL:"\\d{8}[\\dA-Z]{16}",AT:"\\d{16}",AZ:"[\\dA-Z]{4}\\d{20}",BA:"\\d{16}",BE:"\\d{12}",BG:"[A-Z]{4}\\d{6}[\\dA-Z]{8}",BH:"[A-Z]{4}[\\dA-Z]{14}",BR:"\\d{23}[A-Z][\\dA-Z]",CH:"\\d{5}[\\dA-Z]{12}",CR:"\\d{17}",CY:"\\d{8}[\\dA-Z]{16}",CZ:"\\d{20}",DE:"\\d{18}",DK:"\\d{14}",DO:"[A-Z]{4}\\d{20}",EE:"\\d{16}",ES:"\\d{20}",FI:"\\d{14}",FO:"\\d{14}",FR:"\\d{10}[\\dA-Z]{11}\\d{2}",GB:"[A-Z]{4}\\d{14}",GE:"[\\dA-Z]{2}\\d{16}",GI:"[A-Z]{4}[\\dA-Z]{15}",GL:"\\d{14}",GR:"\\d{7}[\\dA-Z]{16}",GT:"[\\dA-Z]{4}[\\dA-Z]{20}",HR:"\\d{17}",HU:"\\d{24}",IE:"[\\dA-Z]{4}\\d{14}",IL:"\\d{19}",IS:"\\d{22}",IT:"[A-Z]\\d{10}[\\dA-Z]{12}",KW:"[A-Z]{4}[\\dA-Z]{22}",KZ:"\\d{3}[\\dA-Z]{13}",LB:"\\d{4}[\\dA-Z]{20}",LI:"\\d{5}[\\dA-Z]{12}",LT:"\\d{16}",LU:"\\d{3}[\\dA-Z]{13}",LV:"[A-Z]{4}[\\dA-Z]{13}",MC:"\\d{10}[\\dA-Z]{11}\\d{2}",MD:"[\\dA-Z]{2}\\d{18}",ME:"\\d{18}",MK:"\\d{3}[\\dA-Z]{10}\\d{2}",MR:"\\d{23}",MT:"[A-Z]{4}\\d{5}[\\dA-Z]{18}",MU:"[A-Z]{4}\\d{19}[A-Z]{3}",NL:"[A-Z]{4}\\d{10}",NO:"\\d{11}",PK:"[\\dA-Z]{4}\\d{16}",PL:"\\d{24}",PS:"[\\dA-Z]{4}\\d{21}",PT:"\\d{21}",RO:"[A-Z]{4}[\\dA-Z]{16}",RS:"\\d{18}",SA:"\\d{2}[\\dA-Z]{18}",SE:"\\d{20}",SI:"\\d{15}",SK:"\\d{20}",SM:"[A-Z]\\d{10}[\\dA-Z]{12}",TN:"\\d{20}",TR:"\\d{5}[\\dA-Z]{17}",VG:"[\\dA-Z]{4}\\d{16}"},h=f[p];for("undefined"==typeof h&&(a=!1),n=new RegExp("^[A-Z]{2}\\d{2}"+h+"$",""),n.test(d)||(a=!1),r=d.substring(4,d.length)+d.substring(0,4),o=0;o<r.length;o++)t=r.charAt(o),"0"!==t&&(u=!1),u||(s+="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(t));for(l=0;l<s.length;l++)i=s.charAt(l),c=""+v+i,v=c%97;a=1===v}return a?!1:JaSper._t("valida/iban")},nif:function(e){var a=!0,r="";if(e.value=(e.value.toString().trim()||"").toUpperCase(),""!=e.value)if(dni=e.value.substr(0,e.value.length-1),"X"==e.value.charAt(0)&&(dni=dni.substr(1)),letra=e.value.charAt(sNif.length-1),8==dni.length&&isNaN(letra)){var t="TRWAGMYFPDXBNJZSQVHLCKE";pos=dni%23,t=t.charAt(pos),t==letra&&(a=!0)}else r+=JaSper._t("X"==e.value.charAt(0)?"valida/nif1":"valida/nif2"),a=!1;return a?!1:r},numeros:function(e,a,r){var t=!0;if(e.value=e.value.toString().trim()||"",""!=e.value){"undefined"==typeof a&&(a=0),"undefined"==typeof r&&(r=Math.pow(10,e.maxLength));var i=parseInt(e.value);t=i>=a&&r>=i||""==e?!0:!1}return t?!1:JaSper._t("valida/numeros1")+a+JaSper._t("valida/numeros2")+r},obligatorio:function(e){var a=!0,r="";try{e.value=e.value.toString().trim()||""}catch(t){JaSper.log("No se puede alterar el valor de <"+e.tagName+' id="'+e.id+'" type="'+e.type+'" />',1)}return""!=e.value?a=!0:(r=JaSper("<label>",e.parentNode).text(),a=!1),a?!1:'"'+r+'"'+JaSper._t("valida/obligatorio")},obligatorioRadio:function(e){for(var a=!0,r=-1,t=e,i=t.length-1;i>-1;i--)t[i].checked&&(r=i,i=-1);return r>-1?a=!0:(text=JaSper("<label>",e.parentNode).text(),a=!1),a?!1:'"'+text+'"'+JaSper._t("valida/obligatorioRadio")},teclasFechas:function(e,a){var r=!1;a=a||window.event;var t=JaSper.event.keyCode(a);return t>31&&(48>t||t>58)&&32!=t&&47!=t&&45!=t?(r=!0,JaSper.event.preventDefault(a)):(r=!1,-1!=e.value.indexOf(" ")&&32==t&&(r=!0)),r},teclasNumeros:function(e,a,r){var t=!1;a=a||window.event,r="undefined"!=typeof r?r:!0;var i=JaSper.event.keyCode(a);return r?i>31&&(48>i||i>57)&&46!=i?(t=!0,JaSper.event.preventDefault(a)):(t=!1,-1!=e.value.indexOf(".")&&46==i&&(t=!0)):i>31&&(48>i||i>57)?(t=!1,JaSper.event.preventDefault(a)):t=!1,t},url:function(e){var a=!0,r=/(((ht|f)tp(s?):\/\/)|(www\.[^ [\]()\n\r\t]+)|(([012]?[0-9]{1,2}\.){3}[012]?[0-9]{1,2})\/)([^ [\](),;"'<>\n\r\t]+)([^. [\](),;"'<>\n\r\t])|(([012]?[0-9]{1,2}\.){3}[012]?[0-9]{1,2})/;return e.value=e.value.toString().trim()||"",""!=e.value&&(a=r.test(this.nodes[i].value)?!0:!1),a?!1:JaSper._t("valida/url")}});
