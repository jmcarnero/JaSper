/*Copyright (C) 2009 José M. Carnero <jm_carnero@sargazos.net>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
http://www.gnu.org/copyleft/gpl.html*/

/**
 * Selector de elementos DOM, mediante id, clase, tag, etc. (ver detalles en constructor)
 *
 * Basada inicialmente en Getme.js Version 1.0.4 (Rob Reid)
 * y en otros (se menciona donde corresponda si se conoce su origen)
 *
 * Se añade a cada objeto DOM (cuando sea necesario) la propiedad JaSper, que contendra (por ejemplo) los eventos que se le hayan asignado, para poder quitarlos en bloque
 * al estar estas propiedades personalizadas agregadas al objeto al que pertenecen no se pierden si se mueve, y desaparecen si desaparece el objeto
 *
 * @author José M. Carnero
 * @since 2010-06-21
 * @version 3.6
 * @see Al final del archivo estan las extensiones necesarias de prototipos de objetos del sistema (polyfills)
 */
(function (window, undefined){ //window como parametro acelera las referencias a window; undefined como parametro evita confilctos y se puede usar para probar contra otras indefinidas
	'use strict';

	if(window.JaSper){ //evita problemas si se carga la libreria varias veces
		return;
	}

	//JaSper es la llamada estatica: JaSper.[funcion]
	//$ -> alias, para simplificar las llamadas al selector: $('selector').funcion()
	JaSper = window.JaSper = window.$ = function (sSel, oContext){
		return new JaSper.funcs.Init(sSel, oContext);
	};

	//version actual de la libreria
	JaSper.version = '3.6';

	//metodos para tratamiento de cookies del navegador
	JaSper.cookie = {

		/**
		 * Borra una cookie
		 * Pone su fecha de caducidad en el pasado
		 *
		 * @param {string} sNombre Nombre de la cookie
		 * @return {Boolean}
		 */
		del: function (sNombre){
			'use strict';

			if(!JaSper.cookie.has){
				JaSper.log('[JaSper::cookie.set] Cookies no disponibles.', 1);
				return false;
			}

			return JaSper.cookie.set(sNombre, '', -1);
		},

		/**
		 * Recupera informacion de una cookie
		 *
		 * @param {string} sNombre Nombre de la cookie
		 * @return {string}
		 */
		get: function (sNombre){
			'use strict';

			if(!JaSper.cookie.has){
				JaSper.log('[JaSper::cookie.set] Cookies no disponibles.', 1);
				return null;
			}

			var sRet = '';
			var sNombreEQ = encodeURIComponent(sNombre) + '=';
			var aCookies = document.cookie.split(';');

			for(var iCont = 0; iCont < aCookies.length; iCont++){
				var sCookie = aCookies[iCont];
				while(sCookie.charAt(0) === ' '){
					sCookie = sCookie.substring(1, sCookie.length);
				}
				if(sCookie.indexOf(sNombreEQ) === 0){
					sRet = sCookie.substring(sNombreEQ.length, sCookie.length);
				}
			}

			return sRet;
		},

		/**
		 * Devuelve si el navegador tiene o no disponibles cookies
		 * El usuario puede haberlas deshabilitado
		 *
		 * @return {Boolean}
		 */
		has: (function (){
			'use strict';

			var bCookieEnabled = navigator.cookieEnabled;

			//if not IE4+ nor NS6+
			if(typeof navigator.cookieEnabled === 'undefined' && !bCookieEnabled){
				document.cookie = 'testCookie=1';
				bCookieEnabled = document.cookie.indexOf('testCookie') !== -1;

				if(bCookieEnabled){
					JaSper.cookie.set('testCookie', '', -1);
				}
			}

			return bCookieEnabled;
		})(),

		/**
		 * Crea o cambia una cookie
		 *
		 * document.cookie = 'key=value;path=path;domain=domain;max-age=max-age-in-seconds;expires=date-in-GMTString-format;secure';
		 *
		 * @param {string} sNombre Nombre de la cookie
		 * @param {string} sValor Valor de la cookie
		 * @param {integer} iDuracion Duracion (en dias) de la cookie; por defecto 1 dia
		 * @return {Boolean}
		 */
		set: function (sNombre, sValor, iDuracion){
			'use strict';

			if(!JaSper.cookie.has){
				JaSper.log('[JaSper::cookie.set] Cookies no disponibles.', 1);
				return false;
			}

			if(!sNombre){
				return false;
			}
			sNombre = encodeURIComponent(sNombre) || '';
			sValor = encodeURIComponent(sValor) || '';
			iDuracion = iDuracion || 1; //por defecto 1 dia

			var sExpira = '';
			var sPath = ';path=/'; //TODO de momento se asume el raiz del sitio (path=/) como ambito de la cookie
			var sSoloSsl = ''; //';secure'; //solo se podra recuperar en conexiones SSL si esta esto

			if(iDuracion){
				var oFecha = new Date();
				oFecha.setTime(oFecha.getTime() + (iDuracion * 24 * 60 * 60 * 1000));
				sExpira = ';expires=' + oFecha.toGMTString();
			}

			document.cookie = sNombre + '=' + sValor + sExpira + sPath + sSoloSsl;

			return true;
		}

	};

	//funciones estaticas de estilos/CSS (espacio de nombres)
	JaSper.css = {

		/**
		 * Añade una clase CSS
		 *
		 * @since 2011-09-07
		 * @param {object} oElem Objeto al que añadir la clase
		 * @param {string} sName Nombre de la clase
		 */
		addClass: function (oElem, sName){
			if(typeof sName === 'string'){
				if(oElem.className.indexOf(sName) === -1){
					oElem.className += ' ' + sName;
				}
			}
		},

		/**
		 * Recupera una regla css de document o del elemento pasado
		 * 
		 * @todo comprobar el orden/jerarquia de aplicacion (inline pisa a todos)
		 * @param {object} oElem Elemento en el que buscar
		 * @param {string} sRegla Regla CSS de la que devolver su valor
		 * @return {string}
		 */
		getStyle: function (oElem, sRegla){
			oElem = oElem || document.defaultView;
			var sRet = '';

			if(oElem.nodeType === 1){
				if(document.defaultView && document.defaultView.getComputedStyle){ //Firefox
					sRet = document.defaultView.getComputedStyle(oElem, '')[sRegla];
				}
				else if(oElem.currentStyle){ //IE
					sRet = oElem.currentStyle[sRegla];
				}
				else{ //intenta devolver estilo inline
					sRet = oElem.style[sRegla];
				}
			}

			return sRet;
		},

		/**
		 * Busca y guarda el valor original de una propiedad CSS de un elemento y lo guarda como propiedad del propio elemento
		 * ej.: si se busca oDOMElem.style.display, se guardaria como oDOMElem.JaSper.original.display
		 *
		 * @param {object} oDOMElem Objeto DOM
		 * @param {string} sProp Propiedad CSS
		 * @return {string}
		 */
		original: function (oDOMElem, sProp){
			if(!sProp){
				return null;
			}

			var oExtend = JaSper.nodo.extend(oDOMElem);
			oExtend.css = oExtend.css || {};
			oExtend.css.original = oExtend.css.original || {};

			if(!oExtend.css.original[sProp]){
				var sActValue = JaSper.css.getStyle(oDOMElem, sProp) || oDOMElem.style.display;

				switch(sProp){
					case 'display':
						if(sActValue === 'none' || !sActValue){
							var oElem = document.createElement(oDOMElem.nodeName);
							JaSper(document.body).append(oElem);

							sActValue = JaSper.css.getStyle(oElem, sProp);

							JaSper(document.body).remove(oElem);
						}
						break;
					default:
				}

				oExtend.css.original[sProp] = sActValue;
			}

			JaSper.nodo.extend(oDOMElem, oExtend);

			return oExtend.css.original[sProp];
		},

		/**
		 * Elimina una clase CSS
		 *
		 * @since 2011-09-07
		 * @param {object} oElem Objeto al que añadir la clase
		 * @param {string} sName Nombre de la clase
		 */
		removeClass: function (oElem, sName){
			if(typeof sName === 'string'){
				if(oElem.className.indexOf(sName) > -1){
					oElem.className = oElem.className.substr(0, oElem.className.indexOf(sName) - 1) + oElem.className.substr(oElem.className.indexOf(sName) + sName.length);
				}
			}
		},

		/**
		 * Devuelve la posicion de scroll, tanto vertical como horizontal
		 *
		 * @return {object}
		 */
		scrollPos: function (){
			var oTipo = null;

			return {
				x: (((oTipo = document.documentElement) || (oTipo = document.body.parentNode)) && typeof oTipo.scrollLeft === 'number' ? oTipo : document.body).scrollLeft,
				y: (((oTipo = document.documentElement) || (oTipo = document.body.parentNode)) && typeof oTipo.scrollTop === 'number' ? oTipo : document.body).scrollTop

			};
		},

		/**
		 * Pone una regla CSS de document o del elemento pasado al valor pasado
		 *
		 * @param {Object} oElem Objeto al que cambiar la regla CSS
		 * @param {string} sCssRule Nombre de la regla CSS
		 * @param {string} sValue Nuevo valor de la regla CSS
		 * @return {Boolean}
		 */
		setStyle: function (oElem, sCssRule, sValue){
			oElem = (!oElem) ? document.defaultView : oElem;

			if(oElem.nodeType === 1){
				oElem.style[sCssRule] = sValue;
				return true;
			}

			return false;
		},

		/**
		 * Devuelve la posición y dimensiones de la parte visible de la página
		 *
		 * @return {object}
		 */
		viewport: function (){
			var iTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
			var iLeft = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
			//document.body.offsetWidth
			var iWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; //w3c, ie6, ie4
			var iHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

			return {
				top: iTop,
				bottom: iTop + iHeight,
				left: iLeft,
				right: iLeft + iWidth,
				width: iWidth,
				height: iHeight,
				resolution: {
					width: window.screen.width,
					height: window.screen.height
				}
			};
		}

	};

	/**
	 * Funciones estaticas de eventos (espacio de nombres)
	 * Emulacion de eventos mouseenter y mouseleave en los navegadores que no lo soportan (todos menos ie)
	 * mousewheel para navegadores gecko
	 *
	 * Para controlar el movimiento de la rueda:
	 * <code>
	$('<p>').eventAdd('mousewheel', function (ev){
		var rolled = 0;
		if('wheelDelta' in ev) {
			rolled = ev.wheelDelta; //devuelve 3 (se ha movido la rueda hacia arriba) o -3 (rueda hacia abajo)
		}else{
			rolled = -40 * ev.detail; //iguala los valores de esta propiedad con los que devuelve ev.wheelDelta
		}
		alert(rolled);
	});
	 * </code>
	 */
	JaSper.event = {

		/**
		 * Adjunta eventos
		 *
		 * @param {object} oElem Objeto al que poner el evento
		 * @param {string} sEvento Nombre del evento, ej: "click" (como "onclick" sin "on"); pueden pasarse varios, separados por comas ('click,mouseup,submit'), evidentemente a todos se asignara el mismo callback
		 * @param {Function} oFuncion Funcion que se lanzara con el evento; cadena de nombre de funcion o nombre de la funcion sin mas, tambien se permiten funciones anonimas: "function (){ alert('hello!'); }"
		 * @param {Boolean} bCapt Captura el evento cuando entra (fase de captura, true) o cuando sale (burbujeo, false, por defecto)
		 * @return {boolean}
		 */
		add: function (oElem, sEvento, oFuncion, bCapt){
			if(!oElem || oElem.nodeType === 3 || oElem.nodeType === 8){ //sin eventos en nodos texto y comentarios
				JaSper.log('[JaSper::event.add] No se asignan eventos a nodos de texto o comentarios.', 0);
				return false;
			}

			if(typeof oFuncion === 'string'){
				oFuncion = window[oFuncion];
			}

			bCapt = bCapt || false;

			var aEvento = sEvento.split(','); //soporte para mas de un evento, separados por comas; si solo se pasa uno aparece como aEvento[0]
			for(var iCont = 0; iCont < aEvento.length; iCont++){
				sEvento = aEvento[iCont];

				var aEventsCustom = ['mouseenter', 'mouseleave', 'mousewheel']; //eventos remapeados (ver mas abajo)

				//verifica si se puede usar el evento //TODO mejorar la verificacion de la existencia de eventos antes de aplicarlos
				if(aEventsCustom.indexOf(sEvento) === -1 && oElem['on' + sEvento] === undefined){
					//JaSper.log('[JaSper::event.add] No se puede aplicar el evento [' + sEvento + ']', 1);
					//continue;
					JaSper.log('[JaSper::event.add] Evento [' + sEvento + '] no estandar DOM', 1);
				}

				//esta propiedad contiene valores creados por el framework, en este caso la lista de eventos añadidos al objeto, bajo oElem.JaSper.event.-evento- (permite luego quitarlos en bloque o quitar cuando se ha asignado un callback anonimo)
				var oObjExtend = JaSper.nodo.extend(oElem);
				oObjExtend.event = oObjExtend.event || {};
				oObjExtend.event[sEvento] = oObjExtend.event[sEvento] || [];
				oObjExtend.event[sEvento].push(oFuncion);
				JaSper.nodo.extend(oElem, oObjExtend);

				if(document.addEventListener){ //w3c
					//eventos mouseenter, mouseleave y mousewheel sobre una idea original encontrada en http://blog.stchur.com
					switch(sEvento){
						case 'mouseenter':
							sEvento = 'mouseover';
							oFuncion = JaSper.event.mouseEnter(oFuncion);
							break;
						case 'mouseleave':
							sEvento = 'mouseout';
							oFuncion = JaSper.event.mouseEnter(oFuncion);
							break;
						case 'mousewheel':
							//recoger el movimiento de la rueda con "ev.wheelDelta = ev.wheelDelta || -(ev.detail);" (3 rueda arriba, -3 rueda abajo) //el valor varia segun navegador
							sEvento = 'onwheel' in document.createElement('div')
								? 'wheel' //Modern browsers support "wheel"
								: document.onmousewheel !== undefined
									? 'mousewheel' //Webkit and IE support at least "mousewheel"
									: 'DOMMouseScroll'; //let's assume that remaining browsers are older Firefox
							oFuncion = JaSper.event.mouseWheel(oFuncion);
							break;
						default: //resto de eventos
					}
					oElem.addEventListener(sEvento, oFuncion, bCapt);

					if(window.eventTrigger){
						oElem.addEventListener(sEvento, function (){
							window.eventTrigger.call(oElem, sEvento);
						}, bCapt);
					}
				}
				else if(document.attachEvent){ //ie
					var sClave = oElem + sEvento + oFuncion;

					oElem['e' + sClave] = oFuncion;
					oElem[sClave] = function (){
						oElem['e' + sClave](window.event);
					};
					oElem.attachEvent('on' + sEvento, oElem[sClave]);

					if(window.eventTrigger){
						sClave = oElem + sEvento + window.eventTrigger;

						oElem['e' + sClave] = function (){
							window.eventTrigger.call(oElem, sEvento);
						};
						oElem[sClave] = function (){
							oElem['e' + sClave](window.event);
						};
						oElem.attachEvent('on' + sEvento, oElem[sClave]);
					}
				}
				else{ //DOM level 0 //idea original de Simon Willison
					var oEvtOld = oElem['on' + sEvento];
					if(typeof oElem['on' + sEvento] !== 'function'){
						oElem['on' + sEvento] = oFuncion;
					}
					else{
						oElem['on' + sEvento] = function (){
							if(oEvtOld){
								oEvtOld();
							}
							oFuncion();
						};
					}

					if(window.eventTrigger){
						oEvtOld = oElem['on' + sEvento];
						this['on' + sEvento] = function (){
							if(oEvtOld){
								oEvtOld();
							}
							window.eventTrigger.call(oElem, sEvento);
						};
					}
				}
			}

			return true;
		},

		/**
		 * Crea eventos personalizados
		 *
		 * Ejemplo de nuevo evento: <code>
this.customEvents[sEvento] = new CustomEvent(sEvento, {
	detail: { //se puede poner cualquier clave valor, sera accesible cuando se dispare el evento en el objeto que dispare el evento como event.detail.message (event.detail.time)
		message: 'un mensaje',
		time: new Date(),
	},oDetalles
	bubbles: true,
	cancelable: true
});
		 * </code>
		 *
		 * @todo parametrizar bubbles y cancelable
		 * @since 2016-09-15
		 * @param {string} sEvento Nombre del evento personalizado
		 * @param {Object} oDetalles Objeto "detail" que recibira el evento personalizado
		 * @return {event} Evento personalizado
		 */
		custom: function (sEvento, oDetalles){
			if(!sEvento){
				JaSper.log('[JaSper::event.custom] Sin identificador no se crea evento personalizado.', 1);
				return null;
			}

			this.customEvents = this.customEvents || [];
			oDetalles = oDetalles || {};

			if(typeof this.customEvents[sEvento] === 'undefined'){
				this.customEvents[sEvento] = new CustomEvent(sEvento, {
					bubbles: true,
					cancelable: true,
					detail: oDetalles
				});
			}

			return this.customEvents[sEvento];
		},

		//http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
		/*eventSupported: function (eventName){
			var TAGNAMES = {
				'select':'input','change':'input',
				'submit':'form','reset':'form',
				'error':'img','load':'img','abort':'img'
			}

			var el = document.createElement(TAGNAMES[eventName] || 'div');
			eventName = 'on' + eventName;
			var isSupported = (eventName in el);
			if (!isSupported) {
				el.setAttribute(eventName, 'return;');
				isSupported = typeof el[eventName] == 'function';
			}
			el = null;

			return isSupported;
		},*/

		/**
		 * Dispara eventos personalizados
		 *
		 * @todo comprobar funcionamiento, si this corresponde a la referencia del objeto DOM
		 * @since 2016-09-16
		 * @param {object} oElem Objeto al que poner el evento
		 * @param {string} sEvento Nombre del evento (personalizado o no), ej: "click" (como "onclick" sin "on"); pueden pasarse varios, separados por comas ('click,mouseup,submit')
		 * @param {Object} oDetalles Objeto "detail" que recibira el evento personalizado
		 * @return {event} Evento personalizado
		 */
		fire: function (oElem, sEvento, oDetalles){
			if(!sEvento){
				JaSper.log('[JaSper::event.fire] Sin identificador no se dispara evento personalizado.', 1);
				return null;
			}

			var oEvento = JaSper.event.custom(sEvento, oDetalles);
			var bCancelled = null; //se devolvera null si no hay ningun metodo para disparar eventos
			if(oElem.dispatchEvent){
				bCancelled = oElem.dispatchEvent(oEvento);
			}
			else if(oElem.fireEvent){
				bCancelled = oElem.fireEvent('on' + sEvento, oEvento); //IE6 - IE10
			}

			return bCancelled;
		},

		/**
		 * Correccion de codigo de tecla pulsada.
		 * Para keypress corresponde con codigos ascii,
		 * para keyup o keydown no necesariamente (ej: "." devuelve 190 y no 46 -ASCII-); este metodo corrige la correspondencia devolviendo el ascii correcto
		 * Devuelve -1 si se llama con un evento que no sea keyXXX
		 *
		 * @todo completar mapa de correspondencia de teclas
		 * @since 2011-09-08
		 * @param {object} oEv Evento de tecla
		 * @return {number} Codigo de la tecla (o combinacion) pulsada
		 */
		keyCode: function (oEv){
			oEv = oEv || window.event;
			var iCode = oEv.keyCode || oEv.which;
			var sEtype = oEv.type.toLowerCase().replace('on', ''); //, char = String.fromCharCode(iCode);

			if(sEtype === 'keypress'){
				return iCode;
			}
			else if(sEtype === 'keydown' || sEtype === 'keyup'){
				var oKeycodes = { //keycode:[ascii_normal, ascii_shiftKey, ascii_controlkey, ascii_altKey]
					8: [8], //Backspace
					9: [9], //Tab
					13: [13], //Enter
					/*16: [], //Shift
					17: [], //Ctrl
					18: [], //Alt
					19: [], //Pause
					20: [], //Caps Lock
					27: [], //Escape
					33: [], //Page Up
					34: [], //Page Down
					35: [], //End
					36: [], //Home
					37: [], //Arrow Left
					38: [], //Arrow Up
					39: [], //Arrow Right
					40: [], //Arrow Down
					45: [], //Insert*/
					46: [127], //Delete
					48: [48], //0
					49: [49], //1
					50: [50], //2
					51: [51], //3
					52: [52], //4
					53: [53], //5
					54: [54], //6
					55: [55], //7
					56: [56], //8
					57: [57], //9
					65: [97, 65], //A
					66: [98, 66], //B
					67: [99, 67], //C
					68: [100, 68], //D
					69: [101, 69], //E
					70: [102, 70], //F
					71: [103, 71], //G
					72: [104, 72], //H
					73: [105, 73], //I
					74: [106, 74], //J
					75: [107, 75], //K
					76: [108, 76], //L
					77: [109, 77], //M
					78: [110, 78], //N
					79: [111, 79], //O
					80: [112, 80], //P
					81: [113, 81], //Q
					82: [114, 82], //R
					83: [115, 83], //S
					84: [116, 84], //T
					85: [117, 85], //U
					86: [118, 86], //V
					87: [119, 87], //W
					88: [120, 88], //X
					89: [121, 89], //Y
					90: [122, 90], //Z
					/*91: [], //Left Windows
					92: [], //Right Windows
					93: [], //Context Menu*/
					96: [48], //NumPad 0
					97: [49], //NumPad 1
					98: [50], //NumPad 2
					99: [51], //NumPad 3
					100: [52], //NumPad 4
					101: [53], //NumPad 5
					102: [54], //NumPad 6
					103: [55], //NumPad 7
					104: [56], //NumPad 8
					105: [57], //NumPad 9
					106: [42], //NumPad *
					107: [43], //NumPad +
					109: [45], //NumPad -
					110: [46], //NumPad .
					111: [47], //NumPad /
					/*112: [], //F1
					113: [], //F2
					114: [], //F3
					115: [], //F4
					116: [], //F5
					117: [], //F6
					118: [], //F7
					119: [], //F8
					120: [], //F9
					121: [], //F10
					122: [], //F11
					123: [], //F12
					144: [], //Num Lock
					145: [], //Scroll Lock*/
					186: [59], //;
					187: [61], //=
					188: [44], //,
					189: [45], //-
					190: [46], //.
					191: [47], ///
					192: [96], //`
					219: [91], //[
					220: [92], //\
					221: [93], //]
					222: [39] //'
				};

				var iShiftControlAlt = 0;
				if(navigator.appName === 'Netscape' && parseInt(navigator.appVersion, 10) === 4){ //netscape 4
					var sMString = (oEv.modifiers + 32).toString(2).substring(3, 6);
					iShiftControlAlt += sMString.charAt(0) === '1' ? 1 : 0;
					iShiftControlAlt += sMString.charAt(1) === '1' ? 1 : 0;
					iShiftControlAlt += sMString.charAt(2) === '1' ? 1 : 0;
				}
				else{ //resto
					iShiftControlAlt += oEv.shiftKey ? 1 : 0;
					iShiftControlAlt += oEv.altKey ? 1 : 0;
					iShiftControlAlt += oEv.ctrlKey ? 1 : 0;
				}

				if(typeof oKeycodes[iCode] !== 'undefined'){
					if(typeof oKeycodes[iCode][iShiftControlAlt] !== 'undefined'){
						return oKeycodes[iCode][iShiftControlAlt]; //devuelve exacto
					}
					else if(typeof oKeycodes[iCode][0] !== 'undefined'){
						return oKeycodes[iCode][0]; //devuelve correspondencia sin modificadores
					}
				}

				return iCode; //no hay correspondencia, devuelve keycode
			}

			return -1; //evento incoherente
		},

		mouseEnter: function (oFunc){
			var isAChildOf = function (oParent, oChild){ //TODO se puede sustituir por nodo.ancestros()?
				if(oParent === oChild){
					return false;
				}
				while(oChild && oChild !== oParent){
					oChild = oChild.parentNode;
				}
				return oChild === oParent;
			};

			return function (oEv){
				var oRel = oEv.relatedTarget;
				if(this === oRel || isAChildOf(this, oRel)){
					return;
				}
				oFunc.call(this, oEv);
			};
		},

		mouseWheel: function (oFunc){
			if(typeof oFunc === 'undefined'){
				oFunc = function (oEv){
					oEv.wheelDelta = -(oEv.detail);
					oFunc.call(this, oEv);
					oEv.wheelDelta = null;
				};
			}
			return oFunc;
		},

		/**
		 * Guarda el ultimo evento que se ha disparado, sirve como controlador para que otros eventos puedan lanzarse (o no) en funcion del previo
		 * asignar en cada funcion afectada (las que se lancen en los eventos), donde interese
		 *
		 * @todo revisar
		 * @param {event} oEv Evento
		 * @return {event} Evento
		 */
		name: function (oEv){
			/*this.nombreEvento = window.nombreEvento = evento.toLowerCase(); //se guarda el nombre del ultimo evento disparado para cada objeto JaSper; y el ultimo de todos en window.nombreEvento
			evento = this.nombreEvento;*/

			oEv = oEv || window.event;
			return oEv;
		},

		/**
		 * Anula la accion por defecto de un elemento, como click en <a>
		 *
		 * @param {event} oEvt Objeto evento
		 * @return {Boolean}
		 */
		preventDefault: function (oEvt){
			oEvt = oEvt || window.event;

			if(oEvt.preventDefault){ //modelo DOM
				//oEvt.stopPropagation();
				oEvt.preventDefault();
			}
			else if(window.event){ //modelo MSIE
				//oEvt.keyCode = 0;  //<<< esto ayuda a que funcione bien en iExplorer
				//oEvt.cancelBubble = true;
				oEvt.returnValue = false;
				oEvt.retainFocus = true;
			}

			return false;
		},

		/**
		 * Elimina eventos
		 *
		 * @todo eliminar todos los eventos del elemento si no se pasan parametros
		 * @param {object} oElem Objeto al que poner el evento
		 * @param {string} sEvento Nombre del evento, ej: "click" (como "onclick" sin "on"); si no se pasa nada se borran todos los eventos asociados a oElem
		 * @param {Function} oFuncion Funcion que se lanzara con el evento; cadena de nombre de funcion o nombre de la funcion sin mas, tambien se permiten funciones anonimas: "function (){ alert('hello!'); }"; si no se pasa borra todos los asociados a oElem y sEvento (si esta declarado)
		 * @param {Boolean} bCapt Captura el evento cuando entra (fase de captura, true) o cuando sale (burbujeo, false, por defecto)
		 * @return {Object} JaSper
		 */
		remove: function (oElem, sEvento, oFuncion, bCapt){
			var removeBatch = function (oElemInt, sEventoInt, oFuncionInt){
				var oObjExtend = JaSper.nodo.extend(oElemInt);
				var aViejosEventos = oObjExtend.event;
				var bRemove;
				oObjExtend.event = null;

				for(var sViejoEvento in aViejosEventos){
					bRemove = false;
					if(!sEventoInt || sEventoInt === sViejoEvento){
						bRemove = true;
					}

					for(var iCont = 0; iCont < aViejosEventos[sViejoEvento].length; iCont++){
						if(bRemove || (!oFuncionInt || oFuncionInt === aViejosEventos[sViejoEvento][iCont])){
							bRemove = true;
						}

						if(bRemove){
							JaSper.event.remove(oElemInt, sViejoEvento, aViejosEventos[sViejoEvento][iCont]);
						}
						else{
							oObjExtend.event[sViejoEvento].push(aViejosEventos[sViejoEvento][iCont]);
						}
					}
				}

				JaSper.nodo.extend(oElemInt, oObjExtend);
			};

			if(!sEvento || !oFuncion){
				removeBatch(oElem, sEvento, oFuncion);
			}

			if(typeof oFuncion === 'string'){
				oFuncion = window[oFuncion]; //TODO try para distinguir nombre_de_funcion de nombre_de_funcion(params) (evaluar esta ultima)
			}

			bCapt = bCapt || false;

			if(document.addEventListener){ //w3c
				//eventos mouseenter, mouseleave y mousewheel sobre una idea original encontrada en http://blog.stchur.com
				switch(sEvento){
					case 'mouseenter':
						sEvento = 'mouseover';
						oFuncion = JaSper.event.mouseEnter(oFuncion);
						break;
					case 'mouseleave':
						sEvento = 'mouseout';
						oFuncion = JaSper.event.mouseEnter(oFuncion);
						break;
					case 'mousewheel':
						sEvento = 'onwheel' in document.createElement('div')
							? 'wheel' //Modern browsers support "wheel"
							: document.onmousewheel !== undefined
								? 'mousewheel' //Webkit and IE support at least "mousewheel"
								: 'DOMMouseScroll'; //let's assume that remaining browsers are older Firefox
						oFuncion = JaSper.event.mouseWheel(oFuncion);
						break;
					default: //resto de eventos
				}
				oElem.removeEventListener(sEvento, oFuncion, bCapt);

				if(window.eventTrigger){
					oElem.removeEventListener(sEvento, function (){
						window.eventTrigger.call(oElem, sEvento);
					}, bCapt);
				}

			}
			else if(document.attachEvent){ //ie
				oElem.detachEvent('on' + sEvento, oElem[sEvento + oFuncion]);
				oElem[sEvento + oFuncion] = null;
				oElem['e' + sEvento + oFuncion] = null;

				if(window.eventTrigger){
					oFuncion = function (){
						window.eventTrigger.call(oElem, sEvento);
					};
					oElem.detachEvent('on' + sEvento, oElem[sEvento + oFuncion]);
					oElem[sEvento + oFuncion] = null;
					oElem['e' + sEvento + oFuncion] = null;
				}
			}
			else{ //DOM level 0
				oElem['on' + sEvento] = null;
			}

			return null;
		},

		/**
		 * Devuelve el objeto que ha disparado un evento.
		 *
		 * @param {event} oEvt Evento
		 * @return {Object} Objeto target del evento
		 */
		source: function (oEvt){
			oEvt = oEvt || window.event;
			var oTarg = false;

			/*if(oEvt.type == 'mouseover') targ = oEvt.relatedTarget || oEvt.fromElement; //origen para mouseover
			else*/ oTarg = oEvt.target || oEvt.srcElement; //w3c o ie

			if(oTarg.nodeType === 3 || oTarg.nodeType === 4){ //defeat Safari bug
				oTarg = oTarg.parentNode;
			}

			return oTarg;
		},

		/**
		 * Evita la propagacion de eventos, como que se disparen el del contenedor de un elemento y el del elemento
		 * poniendo esto en uno de ellos evita los demas
		 *
		 * @param {event} oEvt Objeto evento
		 * @return {Boolean}
		 */
		stop: function (oEvt){
			oEvt = oEvt || window.event;

			if(oEvt.stopPropagation){ //modelo DOM
				oEvt.stopPropagation();
			}
			else{ //modelo MSIE
				oEvt.cancelBubble = true;
			}

			return false;
		},

		/**
		* Devuelve el objeto destino de un evento (como a donde va el raton en mouseout).
		*
		* @param {event} oEvt Evento
		* @return {Object} Objeto destino del evento
		*/
		target: function (oEvt){
			oEvt = oEvt || window.event;
			var oDest = false;

			if(oEvt.type === 'mouseout'){ //destino en mouseout
				oDest = oEvt.relatedTarget || oEvt.toElement;
			}
			else{ //w3c o ie
				oDest = oEvt.target || oEvt.srcElement;
			}

			return oDest;
		}

	};

	/**
	 * Extiende un objeto con otro
	 *
	 * @param {Object} oOriginal Objeto original a extender
	 * @param {Object} oExtender Objeto con metodos que se agregaran a oObj
	 */
	JaSper.extend = function (oOriginal, oExtender){
		if(oOriginal === JaSper.langs){ //extiende traducciones
			JaSper.funcs.extendTrads(oExtender);
			return;
		}

		//if(!oOriginal) oOriginal = {}; //crea el objeto si no existe

		for(var oAdd in oExtender){
			oOriginal[oAdd] = oExtender[oAdd];
		}
	};

	//funciones estaticas genericas, referenciables por si mismas,  ej. JaSper.funcs.foreach()
	JaSper.funcs = {

		/**
		 * Amplia las traducciones
		 *
		 * @since 2011-06-15
		 * @param {Object} oObj Objeto con nuevas traducciones, ej. {'en':{'key':'key traduction'}, 'es':{'clave':'clave traduccion'}},
		 * @return {void}
		 */
		extendTrads: function (oObj){
			for(var aLang in oObj){
				if(!JaSper.langs[aLang]){
					JaSper.langs[aLang] = {};
				}

				for(var sClave in oObj[aLang]){
					JaSper.langs[aLang][sClave] = oObj[aLang][sClave];
				}
			}

			return null;
		},

		/**
		 * Recorre una lista de nodos o array, ejecutando la funcion pasada en cada resultado
		 *
		 * @param {array} aList Lista de nodos
		 * @param {function} oCallback Funcion a ejecutar
		 * @param {array} aArgs Argumentos para la funcion
		 * @return {array} Lista de nodos u objetos
		 */
		foreach: function (aList, oCallback, aArgs){
			aArgs = aArgs || [];
			if(this.isFunction(aList)){ //si se ha pasado una funcion se ejecuta para generar la lista de nodos
				aList = aList.call();
			}

			//two loops one for array like objects the other for hash objects
			//la condicion evita que se usen objetos inexistentes (revisar cuando se añade evento para una id que no existe, y luego se dispara el mismo evento para una id existente, esta dispara ambos ya que el primero se asigna a window)
			var iCont = 0;
			var iLen = aList.length;

			if(this.isArrayLike(aList)){
				for(iCont = 0, iLen = aList.length; iCont < iLen; iCont++){
					if(aList[iCont]){
						oCallback.apply(aList[iCont], aArgs);
					}
				}
			}
			else{
				for(iCont in aList){
					if(aList[iCont]){
						oCallback.apply(aList[iCont], aArgs);
					}
				}
			}

			return aList;
		},

		/**
		 * Crea un identificador unico
		 * Solo debe ser unico mientras exista la pagina y para la propia pagina
		 *
		 * @todo revisar funcionamiento, random no garantiza unico
		 * @since 2011-06-09
		 * @param {integer} iLen Longitud minima del identificador
		 * @return {string}
		 */
		genId: function (iLen){
			var sGidFijo = 'JaSper_';
			var sGid = '';
			iLen = !iLen ? 5 : parseInt(iLen, 10);

			var sChars = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
			var oRnum;

			while(sGid.length < iLen || document.getElementById(sGid)){
				/*fRnum = Math.abs(Math.sin(JaSper.funcs.getTimer())) * (sChars.length - 1); //sin es ciclica, no garantiza unicos
				sGid += chars.substr(rnum, 1 );*/
				oRnum = Math.floor(Math.random() * (sChars.length - 1));
				sGid += sChars.substr(oRnum, 1);
			}

			return sGidFijo + sGid;
		},

		/**
		 * Devuelve elementos filtrados por className, nodo y tag
		 *
		 * @param {string} sClsName Class name
		 * @param {Object} oNode Contexto en el que buscar class name
		 * @param {string} sTag En que tags HTML buscar
		 * @return {array}
		 */
		getElementsByClassName: function (sClsName, oNode, sTag){
			oNode = oNode || this.context || document;
			sTag = sTag || '*';
			var aRet = [];
			var iCont = 0;
			var iLen = 0;

			//usa funcion nativa si existe, FF3 Safari Opera
			if(document.getElementsByClassName){
				if(sTag === '*'){
					aRet = oNode.getElementsByClassName(sClsName);
				}
				else{
					sTag = sTag.toUpperCase();
					var aCls = oNode.getElementsByClassName(sClsName);

					for(iCont = 0, iLen = aCls.length; iCont < iLen; iCont++){
						if(aCls[iCont].nodeName === sTag){
							aRet.push(aCls[iCont]);
						}
					}
				}
			}
			else{ //para navegadores viejos e IE 8, a mano //usa document.all si es posible
				var oReg = new RegExp('(^|\\s)' + sClsName.replace(/-/, '\\-') + '(\\s|$)');
				var aEls = sTag === '*' && oNode.all ? oNode.all : oNode.getElementsByTagName(sTag);

				for(iCont = 0, iLen = aEls.length; iCont < iLen; iCont++){
					if(oReg.test(aEls[iCont].className)){
						aRet.push(aEls[iCont]);
					}
				}
			}

			return aRet;
		},

		/**
		 * Convierte los caracteres especiales HTML (&<>) de una cadena en entidades
		 *
		 * @param {string} sHtml Texto HTML
		 * @return {tring}
		 */
		htmlEntities: function (sHtml){
			return String(sHtml).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		},

		/**
		 * Constructor JaSper; permite varios tipos de selector
		 *
		 * [ID|#ID] selecciona el elemento con la id ID; sin # puede confundirse e intentar seleccionar todo aquello que coincida (clase = ID, tag = ID, etc)
		 * [CLASS|.clase] selecciona elementos por clase; sin . similar a anterior
		 * [NAME|@nombre] selecciona elementos por nombre (name="nombre"); sin @ similar a anterior
		 * [TAG|<tag>] selecciona todos los elementos con tipo de nodo tag (tambien lista de tags separados por coma); sin <> similar a anterior
		 * [div p span] selecciona todos los elementos que esten contenidos en un tag span que esten contenidos en un tag p que esten contenidos en div (descendientes de div que sean descendientes de p que sean span)
		 * [<div><span>texto</span></div>] selecciona los elementos que contenga la cadena HTML especificada
		 *
		 * @constructor
		 * @param {string} sSelector Selector
		 * @param {Object} oContext Contexto donde usar el selector
		 * @return {Object}
		 */
		Init: function (sSelector, oContext){
			//si no se pasa ningun selector se usa document
			sSelector = sSelector || document;

			this.version = JaSper.version;
			this.nodes = this.nodes || [];
			//this.funcs = {}; //funciones estaticas generales
			//this.event = {}; //funciones estaticas de eventos
			this.context = oContext || window.document; //contexto por defecto es document

			JaSper.debug = JaSper.debug || false; //TODO revisar si debe ser una variable global; al ser global el valor se conserva hasta que se cambia explicitamente

			//lenguaje para las traducciones, puede asignarse desde PHP para ser consistente con lo recibido desde el servidor
			//si no se proporciona detecta el lenguaje del navegador (no los configurados por el usuario); si no se detecta fuerza castellano (es)
			this.lang = JaSper.lang = JaSper.lang || (navigator.language ? navigator.language.substr(0, 2) : (navigator.userLanguage ? navigator.userLanguage.substr(0, 2) : 'es'));

			//si se ha pasado una cadena (sin distincion inicial), puede ser un ID, clase CSS, tag HTML o una cadena HTML
			if(typeof sSelector === 'string'){
				var aXpathIni = ['//', './']; //inicios de cadena validos para aceptar un selector como XPath, todos de dos caracteres

				if(aXpathIni.indexOf(sSelector.substring(0, 2)) !== -1){ //selector XPath
					if(typeof this.context.evaluate !== 'undefined'){
						try{
							var oIterator = this.context.evaluate(sSelector, this.context, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

							try{
								var oThisNode;
								while(oThisNode = oIterator.iterateNext()){
									this.nodes.push(oThisNode);
								}
							}
							catch(oEx){
								JaSper.log('[OrchardWeb::constructor] [XPath] Arbol del documento modificado durante la iteracion.', 1);
							}
						}
						catch(oEx){
							JaSper.log('[OrchardWeb::constructor] Expresión [XPath] inválida.', 2);
						}
					}
					else{
						JaSper.log('[OrchardWeb::constructor] Tu navegador no tiene soporte [XPath].', 2);
					}
				}
				else{ //selector con reglas CSS
					var oRegSel = /^<([^> ]+)[^>]*>(?:.|\n)+?<\/\1>$|^(#([-\w]+)|\.(\w[-\w]+)|@(\w[-\w]+))$/i; //comprueba si es cadena HTML, ID o class

					//busca un solo tag HTML, ej. <P> o <SPAN> o una lista de ellos separada por comas, ej. <h1>,<div>,<strong>
					var oRegTag = /<([a-z1-9]+?)>,?/ig;
					var aMatch = oRegTag.exec(sSelector);
					if(aMatch && aMatch[1]){
						aMatch = sSelector.match(oRegTag);
						for(var iCont = 0; iCont < aMatch.length; iCont++){
							//devuelve todos los nodos coincidentes con el tag
							if(typeof this.context.getElementsByTagName === 'function'){
								var aTemp = this.context.getElementsByTagName(aMatch[iCont].replace(/[<>,]/g, ''));
								try{ //slice necesita javascript 1.2
									this.nodes = this.nodes.concat(Array.prototype.slice.call(aTemp)); //convierte en array el objeto temp y lo añade a this.nodes
								}
								catch(oErr){
									for(var iCont2 = 0; iCont2 < aTemp.length; iCont2++){
										this.nodes[this.nodes.length] = aTemp[iCont2];
									}
								}
							}
							else{ //no se ha pasado un contexto valido
								JaSper.log('[JaSper::constructor] "' + this.context.toString() + '" no es un contexto v\u00E1lido.', 1);
							}
						}
					}
					else{
						//busca ID, class o cadena HTML
						//- aMatch[1] = cadena HTML - tag inicial y final
						//- aMatch[3] = ID
						//- aMatch[4] = class
						//- aMatch[5] = attribute
						aMatch = oRegSel.exec(sSelector) || [];

						if(aMatch[3]){ //id, con o sin # ej. #myid o myid
							this.nodes[0] = document.getElementById(aMatch[3]);
						}
						else if(aMatch[4]){ //nombre de clase ej. .myClass
							this.nodes = JaSper.funcs.getElementsByClassName(aMatch[4], this.context, '*');
						}
						else if(aMatch[5]){ //atributo name ej. @myName
							this.nodes = document.getElementsByName(aMatch[5]);
						}
						else if(aMatch[1]){ //cadena HTML valida, ej. <P><STRONG>hello</STRONG></P>
							//permite crear nodos desde el html que se le pase
							var oDiv = JaSper.nodo.crear('div', {innerHTML: sSelector});
							this.nodes = oDiv.childNodes;
							document.removeChild(oDiv);
						}
						else if(document.querySelectorAll){
							//FF 3.2+, Safari 3.2+, Opera 10, Chrome 3, IE 8 (standards mode)
							this.nodes = JaSper.funcs.selector(sSelector, this.context);
						}
						else{
							this.nodes = JaSper.find
								? JaSper.find(sSelector, this.context) //pasarselo a Sizzle (mas eficiente con navegadores antiguos)
								: []; //ninguna forma de localizar los nodos pedidos
						}
					}

				}
			}
			else if(sSelector.nodeType){
				//already got a node add
				this.context = this.nodes[0] = sSelector;
			}
			else if(JaSper.funcs.isArray(sSelector)){
				this.nodes = sSelector;
			}
			else{
				this.nodes = JaSper.funcs.makeArray(sSelector);
			}

			this.length = this.nodes.length;
			return this; //nodos;
		},

		/**
		 * Devuelve si es un nodo o elemento DOM
		 *
		 * @todo cambiar el retorno para distinguir nodo de elemento
		 * @param {Object} oObj Nodo a comprobar
		 * @return {Boolean}
		 */
		isDOMObject: function (oObj){
			var bWindow = oObj === window; //el objeto window no se ajusta a ninguno de los siguientes, pero puede recibir eventos (por ejemplo) como cualquier otro elemento HTML

			var bNode = typeof Node === 'object'
				? oObj instanceof Node
				: oObj && typeof oObj === 'object' && typeof oObj.nodeType === 'number' && typeof oObj.nodeName === 'string';

			var bElement = typeof HTMLElement === 'object'
				? oObj instanceof HTMLElement //DOM2
				: oObj && typeof oObj === 'object' && oObj !== null && oObj.nodeType === 1 && typeof oObj.nodeName === 'string';

			return bWindow || bNode || bElement;
		},

		/**
		 * Devuelve si un objeto es array
		 *
		 * @param {array} aElems Elemento a comprobar si es array
		 * @return {Boolean}
		 */
		isArray: function (aElems){
			return Object.prototype.toString.call(aElems) === '[object Array]';
		},

		/**
		 * Objetos con propiedades tipo array (array/nodelist)
		 *
		 * @param {Object} oObj Objeto a comprobar
		 * @return {Boolean}
		 */
		isArrayLike: function (oObj){
			//window, strings (y functions) tambien tienen 'length'
			return oObj && oObj.length && !this.isFunction(oObj) && !this.isString(oObj) && oObj !== window;
		},

		/**
		 * Comprueba si el argumento es una funcion
		 *
		 * @param {Object} oObj Argumento a comprobar
		 * @return {Boolean}
		 */
		isFunction: function (oObj){
			return oObj instanceof Function;
		},

		/**
		 * Devuelve si es un numero; flotante, entero, decimal, ...
		 *
		 * @param {integer} iNum Numero a comprobar
		 * @return {Boolean}
		 */
		isNumber: function (iNum){
			return !isNaN(parseFloat(iNum)) && isFinite(iNum);
		},

		/**
		 * Devuelve si es cadena el argumento pasado
		 *
		 * @param {integer} oObj Argumento a comprobar
		 * @return {Boolean}
		 */
		isString: function (oObj){
			return typeof oObj === 'string';
		},

		/**
		 * Construye un array
		 *
		 * @param {integer} aIni Valor inicial del array, si no se pasa nada se construye vacio
		 * @return {array}
		 */
		makeArray: function (aIni){
			var aRet = [];
			if(aIni !== null){
				//window, strings (y functions) tambien tienen 'length'
				if(!this.isArrayLike(aIni)){
					aRet[0] = aIni;
				}
				else{
					var iCont = aIni.length;
					while(iCont){
						aRet[--iCont] = aIni[iCont];
					}
				}
			}
			return aRet;
		},

		/**
		 * Pila de funciones a ejecutar en ready
		 */
		readyFuncs: [],

		/**
		 * Devuelve elementos por selector ej. DIV P SPAN
		 * soportado en IE 8 (standards mode), FF 3.1+, Safari 3.1+
		 *
		 * EXPONER Sizzle a JaSper.js
		 * En navegadores mas antiguos debera usarse sizzle.js mapeando los metodos publicos a metodos JaSper,
		 * en el final del fichero de sizzle reemplazar los metodos con lo siguiente:
window.Sizzle = Sizzle;

JaSper.find = Sizzle;
JaSper.filter = Sizzle.filter;
JaSper.expr = Sizzle.selectors;
JaSper.expr[":"] = JaSper.expr.filters;
		 *
		 * @param {string} sQuery Cadena con selector o selectores a buscar
		 * @param {Object} oContext Contexto en el que seleccionar
		 * @return {array} Nodos
		 */
		selector: function (sQuery, oContext){
			oContext = oContext || document;
			var aRet = [];

			try{
				var aSel = oContext.querySelectorAll(sQuery);
				if(aSel.length){ //evita que makeArray devuelva una lista de nodos vacia pero longitud 1
					aRet = this.makeArray(oContext.querySelectorAll(sQuery));
				}/*else{
					return [];
				}*/
			}
			catch(oEx){ //fuerza devolucion de array...
				//return [];
			}

			return aRet;
		},

		/**
		 * Emulacion de la funcion "sprintf".
		 * El primer parametro debe ser una cadena, los siguientes los valores a sustituir (en el mismo orden que aparezcan en la cadena)
		 *
		 * @todo Reconoce '%s' (string), '%u' (unsigned)  y '%%' (%)
		 * @since 2011-06-20
		 * @return {string} Cadena procesada
		 */
		sprintf: function (){
			if(!arguments || !arguments.length){
				return undefined;
			}
			if(arguments.length === 1){
				return arguments[0]; //devuelve la cadena (primer argumento) si no se pasa nada mas
			}
			var sCadena = arguments[0];


			var oRegExp = /(%[s%])/; //busca todos los %s o %%
			var aSust = [];
			var iCont = 0;

			while(aSust = oRegExp.exec(sCadena)){
				switch(aSust[1]){
					case '%%': //%
						sCadena = sCadena.substr(0, aSust.index) + '%' + sCadena.substr(aSust.index + 2);
						break;
					case '%s': //string
						sCadena = sCadena.substr(0, aSust.index) + arguments[++iCont].toString() + sCadena.substr(aSust.index + 2);
						break;
					case '%u': //unsigned
						sCadena = sCadena.substr(0, aSust.index) + parseInt(arguments[++iCont], 10) + sCadena.substr(aSust.index + 2);
						break;
					default:
						sCadena = sCadena.substr(0, aSust.index) + '-tipo desconocido-' + sCadena.substr(aSust.index + 2);
						iCont++;
				}
			}

			return sCadena;
		},

		/**
		 * Posicion de la ventana de visualizacion respecto al total de la pagina cargada
		 *
		 * ej. para comprobar si se ha llegado al final de la pagina y se esta intentando intentando bajar mas:
		 * <code>
$('<body>').addEvent('mousewheel', function (ev){
	if(JaSper.funcs.pagePosition().indexOf('bottom') > -1 && ev.wheelDelta == -3) alert('fin de pagina');
});

//probar con (window.scrollY >= window.scrollMaxY) || (window.scrollY >= window.pageYOffset)
//pero comprobar que navegadores lo soportan
		 * </code>
		 * @todo probar en mas navegadores
		 * @fixme no calcula bien la posicion de oNodo, debería ser la posicion de oNodo con respecto al documento o ventana?
		 * @param {Object} oNodo Objeto del que devolver su posicion, por defecto "document"
		 * @return {string} Que bordes del documento estan visibles respecto a la ventana visible (center si no esta en alguno de los bordes)
		 */
		windowPosition: function (oNodo){
			var oNodoDocument = oNodo || document.documentElement;
			oNodo = oNodo || document.body;

			var aRet = [];

			var iScrollTop = (oNodoDocument && oNodoDocument.scrollTop) || oNodo.scrollTop;
			var iScrollLeft = (oNodoDocument && oNodoDocument.scrollLeft) || oNodo.scrollLeft;
			var iScrollHeight = (oNodoDocument && oNodoDocument.scrollHeight) || oNodo.scrollHeight;
			var iScrollWidth = (oNodoDocument && oNodoDocument.scrollWidth) || oNodo.scrollWidth;

			(iScrollTop === 0) && (aRet[aRet.length] = 'top');
			(iScrollLeft === 0) && (aRet[aRet.length] = 'left');
			((iScrollLeft + window.innerWidth) >= iScrollWidth) && (aRet[aRet.length] = 'right');
			((iScrollTop + window.innerHeight) >= iScrollHeight) && (aRet[aRet.length] = 'bottom');

			if(!aRet.length){
				aRet[aRet.length] = 'center';
			}
			else if(aRet.indexOf('left') === -1 && aRet.indexOf('right') === -1){
				aRet[aRet.length] = 'centerX';
			}
			else if(aRet.indexOf('top') === -1 && aRet.indexOf('bottom') === -1){
				aRet[aRet.length] = 'centerY';
			}

			return aRet;
		}

	};

	/**
	 * Carga dinamica de scripts
	 */
	JaSper.load = {

		/**
		 * Carga scripts javascript que no se hayan cargado durante la carga de la pagina
		 *
		 * @todo asegurarse de no estar cargando un script ya cargado (principalmente los cargados durante la carga de la pagina u otro que se se pueda identificar con el id automatico aqui asignado)
		 * @todo comprobar la posibilidad de que no se ejecuten elementos de la cola por estar ya cargado el script
		 * @since 2011-05-10
		 * @param {string} sRuta Ruta absoluta ("http://ruta/script.js") o relativa a donde se encuentre "JaSper.js" (como "ruta/script.js")
		 * @param {boolean} bMinificar Si true intenta cargar la version minificada si corresponde
		 * @return {boolean}
		 */
		script: function (sRuta, bMinificar){
			bMinificar = (bMinificar && typeof bMinificar !== 'boolean') ? false : bMinificar;

			var sScriptId = 'JaSper_script_' + sRuta.replace(/[^a-zA-Z\d_]+/, '');
			if(document.getElementById(sScriptId)){
				JaSper.log('-JaSper::load.script- Script (id->' + sScriptId + ') ya cargado.', 0);
				return false; //ya cargado
			}

			var sMinificado = bMinificar ? JaSper.trait.minificado : ''; //sufijo cuando se trabaja con la version minificada

			//si se ha pasado una ruta no absoluta se le suma la misma ruta en que se encuentre "JaSper.js"
			if(sRuta.indexOf('http://') === -1){
				var oTempJs = new RegExp('(^|(.*?\\/))(JaSper' + sMinificado + '\\.js)(\\?|$)');
				var oScripts = document.getElementsByTagName('script');
				for(var iCont = 0, iLon = oScripts.length; iCont < iLon; iCont++){
					var sSrc = oScripts[iCont].getAttribute('src');
					if(sSrc){
						var aSrcMatch = sSrc.match(oTempJs);
						if(aSrcMatch){
							sRuta = aSrcMatch[1] + sRuta; //pone la misma ruta que "JaSper.js"
							break;
						}
					}
				}
			}

			/**
			 * Ejecuta las funciones que esten en cola
			 */
			var loadQueue = function (){ //podria recibir como parametro el propio script cargado (oScript){
				if(!JaSper.load.queue){ //nada que hacer si no hay funciones
					return false;
				}

				var oScriptQueue = JaSper.load.queue;
				JaSper.load.queue = [];

				for(var oMt in oScriptQueue){
					try{
						(function (oCb, oCtx){
							return oCb.call(oCtx);
						})(oScriptQueue[oMt].fn, oScriptQueue[oMt].ctx);
					}
					catch(oEx){
						JaSper.log('-JaSper::load.script- No se ha podido ejecutar el método: [' + oEx + ']', 1);
						JaSper.load.queue.push(oMt);
						return false;
					}
				}
			};

			var oScriptProps = {id: sScriptId/*, charset: 'windows-1250'*/, type: 'text/javascript', src: sRuta}; //scrPath -> relativo o absoluto, ej: 'http://path.to.javascript/file.js'

			try{ //for xhtml+xml served content, fall back to DOM methods
				var oHead = document.getElementsByTagName('head')[0] || document.documentElement;
				var oScript = JaSper.nodo.crear('script', oScriptProps);

				oScript.onload = oScript.onreadystatechange = function (){
					if(!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete'){
						oScript.onload = oScript.onreadystatechange = null;
						loadQueue();

						if(oHead && oScript.parentNode){
							oHead.removeChild(oScript);
						}
					}
				};

				//oHead.appendChild(oScript);
				oHead.insertBefore(oScript, oHead.firstChild);
			}
			catch(oEx){ //insertar via DOM en Safari 2.0 falla, asi que aproximacion por fuerza bruta
				document.write('<script id="' + oScriptProps.id + '" type="' + oScriptProps.type + '" src="' + oScriptProps.src + '"></script>');
				loadQueue();
			}

			return true;
		},

		//cola de ejecucion de los metodos pedientes de la carga de algun script dinamico
		queue: []

	};

	//traducciones en todos los lenguajes que sean necesarios, definidos por codigo iso 639
	JaSper.langs = {'en': {}, 'es': {}};

	/**
	 * Muestra mensajes de debug, si "JaSper.debug" es true
	 * Muestra los mensajes en el elemento con id "JaSperDebug" o lo crea bajo el primer nodo de this
	 * Ej. de uso:
	 * <code>
$('#capa').setDebug(true).ajax('ej_respuesta.php');
	 * </code>
	 *
	 * @todo mostrar el mensaje con la linea correcta en que se ha producido (no la linea de este metodo)
	 * @since 2011-03-24
	 * @param {string} sMens Mensaje de debug a mostrar
	 * @param {number} iErrLev Nivel de error a mostrar; 0 -> info (por defecto), 1 -> warn, 2 -> error
	 * @return {void}
	 */
	JaSper.log = function (sMens, iErrLev){
		if(!JaSper.debug){
			return false;
		}

		//intenta recuperar donde se origino el mensaje de aviso, basta con buscar desde donde se llama a este metodo
		var sStack = '';
		var aStack = [];

		try{
			sStack = new Error().stack; //fuerza error para generar la traza
		}
		catch(oEx){
			//alert("name:" + oEx.name + "\nmessage:" + oEx.message);
			if(oEx.stack){
				sStack = oEx.stack;
			}
			else{
				sStack = oEx.message; //opera

				if(oEx.stacktrace){ //resto
					sStack = oEx.stacktrace; //TODO pendiente de verificacion
				}
			}
		}
		finally{
			if(sStack){
				var aLineas = sStack.split('\n');
				for(var iCont = 0, iLen = aLineas.length; iCont < iLen; iCont++){
					if(aLineas[iCont].match(/^\s*[A-Za-z0-9\-_$]+/)){
						aStack.push(aLineas[iCont]);

						//en opera las lineas impares tienen el mensaje de error, las impares donde se ha producido
						/*var entry = aLineas[iCont];
						if(aLineas[iCont + 1]) entry += ' at ' + aLineas[++iCont];
						aStack.push(entry);*/
					}
				}
				//aStack.shift(); //elimina la llamada a este metodo
			}
		}

		sMens = sMens || 'JaSper debug';
		sMens += '\n[' + (aStack[1] || aStack[0]) + ']'; //hacer esta informacion opcional o solo mostrar fichero y linea de la llamada?
		iErrLev = iErrLev || 0;

		if(typeof console !== 'object'){
			//contenedor de los mensajes de debug
			var oElem = document.getElementById('JaSperDebug'); //TODO en firefox adquiere los metodos de JaSper, en ie no
			if(!oElem){
				oElem = JaSper.nodo.crear('ul', {className: 'JaSperDebug ', id: 'JaSperDebug'}); //TODO id -> diferenciar id's, por si se crea mas de uno
				JaSper('<body>').insertAfter(oElem);
			}

			//cada uno de los mensajes de debug
			var oMens = JaSper.nodo.crear('li', {className: 'JaSperDebug' + (iErrLev === 2 ? 'error' : (iErrLev === 1 ? 'warn' : 'info'))});
			oMens.appendChild(document.createTextNode(sMens));
			JaSper('<body>').append(oMens, oElem);
		}
		else{
			var oConsole = console;

			if(typeof sMens !== 'string'){
				oConsole.dir(sMens); //show objects
			}

			switch(iErrLev){
				case 2: //error
					oConsole.error(sMens);
					break;
				case 1: //warn
					oConsole.warn(sMens);
					break;
				case 0: //info
				default:
					oConsole.info(sMens);
			}
		}

		return null;
	};

	//funciones estaticas de nodos
	JaSper.nodo = {

		/**
		 * Busca y devuelve los padres del elemento pasado
		 *
		 * Si se pasa el segundo argumento (otro nodo) devuelve los nodos entre ambos, en caso de que el segundo sea ancestro del primero (en el grado que sea)
		 * Si el primer argumento no es descendiente del segundo devuelve null
		 * Si no se pasa segundo argumento devuelve todos los ancestros entre el primero y document.body
		 * Devuelve un array en orden: [oOrigenPadre, oOrigenPadrePadre, ...]
		 *
		 * @todo si el primer argumento es document.body o ancestro los da como validos y sigue hasta salirse
		 * @param {object} oOrigen Nodo del que se devolveran sus ancestros
		 * @param {object} oHasta Nodo ascendiente hasta el que se devolveran ancestros, opcional
		 * @return {array}
		 */
		ancestros: function (oOrigen, oHasta){
			if(!oOrigen){
				JaSper.log('-JaSper::nodo.ancestros- No se ha pasado ningun nodo', 0);
				return false;
			}

			var bEncontrado = false; //bandera para marcar si se ha encontrado oHasta
			oHasta = oHasta || document.body;
			var aNodos = [];

			var oUltimoPadre = oOrigen.parentNode;
			while(oUltimoPadre){
				aNodos.push(oUltimoPadre);
				if(oUltimoPadre === oHasta){
					bEncontrado = true;
					break;
				}
				oUltimoPadre = oUltimoPadre.parentNode;
			}

			if(!bEncontrado){
				aNodos = [];
			}

			return aNodos;
		},

		/**
		 * Cambia o consulta atributos de elementos
		 * No confundir con consulta/asignacion de estilos CSS
		 *
		 * @todo si se intenta cambiar una propiedad (como value) deberia cambiarse directamente (elem.value = 'valor'); bien controlando los casos o enviando a metodos especificos
		 * @param {Object} oObj Objeto DOM sobre el que consultar/cambiar el atributo
		 * @param {string} sAtributo Atributo a cambiar/consultar
		 * @param {string} sValor Nuevo valor para el atributo, si no se pasa nada se devuelve el valor actual
		 * @return {string} Valor actual (en consulta) o valor antiguo (en asignacion)
		 */
		attrib: function (oObj, sAtributo, sValor){
			var sRet = null;
			sAtributo = (sAtributo || '').toLowerCase();

			if(oObj && sAtributo){
				var sData = sAtributo.indexOf('data-') === 0 ? sAtributo.substr(5).toLowerCase() : null; //atributos tipo custom data (HTML5), ej.: data-info="ejemplo de datos"; deben usarse con DOMobject.dataset.info

				if(sData){
					sRet = oObj.dataset[sData] || oObj.getAttribute(sAtributo); //IE no se entiende bien con dataset[]
				}
				sRet = sRet || oObj.getAttribute(sAtributo); //consulta, se devuelve el valor; el actual o antiguo (si a continuacion se pone nuevo)

				if(sValor !== undefined){
					if(sValor){
						if(sData){
							oObj.dataset[sData] = sValor;
						}
						else{
							oObj.setAttribute(sAtributo, sValor);
						}
					}
					else if(sData){ //si se quiere borrar un atributo no debe hacerse con setAttribute
						oObj.dataset[sData] = null;
					}
					else{
						oObj.removeAttribute(sAtributo);
					}
				}
			}

			return sRet;
		},

		/**
		 * Devuelve la posicion y tamaño de la caja imaginaria (bounding box) que rodea al elemento pasado
		 *
		 * @param {Object} oObj Objeto DOM del que calcular su caja
    	 * @param {boolean} bRelativo Si true devuelve posicion relativa a viewport (por defecto, comportamiento natural de "getBoundingClientRect", si false devuelve posicion respecto al documento
		 * @return {Object} left, top, width y height de la caja del elemento
		 */
		boundingBox: function (oObj, bRelativo){
			if(!oObj){
				return {};
			}
			bRelativo = typeof bRelativo === 'undefined' ? true : Boolean(bRelativo);

			var iXcoord = 0;
			var iYcoord = 0;
			var iWidth = 0;
			var iHeight = 0;
			var iXcoord2 = 0;
			var iYcoord2 = 0;
			var oRect = null;

			if(oObj.getBoundingClientRect){ //ie, Firefox 3+, Chrome, Opera 9.5+, Safari 4+
				oRect = oObj.getBoundingClientRect();

				iXcoord = oRect.left;
				iYcoord = oRect.top;
				iWidth = oRect.right - oRect.left;
				iHeight = oRect.bottom - oRect.top;

				if(JaSper.trait.msie){ //bounding rectangle incluye los bordes top y left del area de cliente
					iXcoord -= document.documentElement.clientLeft;
					iYcoord -= document.documentElement.clientTop;

					var zoomFactor = (function (){ //devuelve 1 excepto para ie < 8, a niveles de zoom != 1
						var iFactor = 1;
						if(document.body.getBoundingClientRect){
							oRect = document.body.getBoundingClientRect(); //en ie < 8 rect devuelve pixel fisicos (no logicos, independientes de zoom)
							var iPhysicalW = oRect.right - oRect.left;
							var iLogicalW = document.body.offsetWidth;

							iFactor = Math.round(iPhysicalW / iLogicalW * 100) / 100; //el nivel de zoom level es un porcentaje (entero)
						}
						return iFactor;
					})();

					if(zoomFactor !== 1){ //ie 7
						iXcoord = Math.round(iXcoord / zoomFactor);
						iYcoord = Math.round(iYcoord / zoomFactor);
						iWidth = Math.round(iWidth / zoomFactor);
						iHeight = Math.round(iHeight / zoomFactor);
					}
				}
			}
			else{ //Firefox, Opera and Safari; versiones viejas
				var oOffset = {x: 0, y: 0};
				var oScrolled = {x: 0, y: 0};

				while(oObj.offsetParent){
					oOffset.x += oObj.offsetParent.offsetLeft;
					oOffset.y += oObj.offsetParent.offsetTop;

					if(oObj.offsetParent.tagName.toLowerCase() !== 'html'){
						oScrolled.x += oObj.offsetParent.scrollLeft;
						oScrolled.y += oObj.offsetParent.scrollTop;
					}
				}

				iXcoord = oOffset.x - oScrolled.x;
				iYcoord = oOffset.y - oScrolled.y;
				iWidth = oObj.offsetWidth;
				iHeight = oObj.offsetHeight;
			}

			iXcoord2 = iXcoord + iWidth;
			iYcoord2 = iYcoord + iHeight;

			if(!bRelativo){
				var oScroll = JaSper.css.scrollPos();

				iXcoord += oScroll.x;
				iXcoord2 += oScroll.x;
				iYcoord += oScroll.y;
				iYcoord2 += oScroll.y;
			}

			return {top: iYcoord, bottom: iYcoord2, left: iXcoord, right: iXcoord2, width: iWidth, height: iHeight, boundingClientRect: oRect};
		},

		/**
		 * Crea un elemento HTML (sTag) con las caracteristicas recibidas (oProps)
		 * Se puede especificar su padre asi como sus hijos
		 *
		 * @todo comprobar si se crea un elemento HTML valido
		 * @param {string} sTag HTML
		 * @param {Object} oProps Propiedades del elemento a crear (las claves seran los nombres de las propiedades del elemento)
		 * @param {Object} oPadre Padre al que adjuntar el nuevo elemento, si no se recibe ninguno el elemento no se adjunta al arbol DOM
		 * @param {Array} aHijos Cadena HTML o Uno o mas hijos para este elemento; deben ser elementos DOM, ya existentes (se puede pasar como parametro este mismo metodo construyendo un objeto nuevo)
		 * @param {string} sNamespace Espacio de nombres bajo el que crear el elemento
		 * @return {Object} El objeto creado
		 */
		crear: function (sTag, oProps, oPadre, aHijos, sNamespace){
			if(!sTag){
				return null;
			}

			sTag = sTag.toLowerCase();

			var oElem = null;
			if(sNamespace){
				oElem = document.createElementNS('http://www.w3.org/2000/svg', sTag);
			}
			else{
				oElem = document.createElement(sTag);
			}

			var propTipo = function (sTipo){ //devuelve si es atributo (0) o propiedad (1) o nada (-1)
				sTipo = sTipo || null;
				var iRet = -1;
				var aTipos = {className: 1, innerHTML: 1, style: 2};

				if(aTipos[sTipo]){
					if(aTipos[sTipo] === 2){ //algunos atributos pueden comportarse como propiedades; "style" si es un objeto es propiedad y no atributo
						if(typeof sTipo === 'string'){
							iRet = 0;
						}
						else if(typeof sTipo === 'object'){
							iRet = 1;
						}
					}
					else{
						iRet = aTipos[sTipo];
					}
				}

				return iRet;
			};

			if(oProps){
				if(oProps.id && document.getElementById(oProps.id)){ //si la id no es unica si ignora //TODO crear una id unica?
					JaSper.log('ID ya en uso: [' + oProps.id + ']', 1);
					oProps.id = false;
				}

				//obj.style.cssText = 'position:absolute;top:300px;left:300px;width:200px;height:200px;-moz-border-radius:100px;border:1px  solid #ddd;-moz-box-shadow: 0px 0px 8px  #fff;display:none;';
				//yourElement.setAttribute("style", "background-color:red; font-size:2em;");

				for(var sProp in oProps){
					if(oProps[sProp]){ //no se comprueba si la propiedad y su valor son validos
						var iTipo = propTipo(sProp);

						if(iTipo === 1){
							oElem[sProp] = oProps[sProp];
						}
						else{ //cualquier cosa que no sea propiedad se trata como atributo
							oElem.setAttribute(sProp, oProps[sProp]);
						}
					}
				}
			}

			if(oPadre){ //si no se adjunta el elemento creado a algun elemento existente (document u otro) no es visible
				oPadre.appendChild(oElem);
			}

			if(aHijos){
				if(typeof aHijos === 'string'){ //si es una cadena se supone que sera HTML
					oElem.innerHTML = aHijos;
				}
				else{
					aHijos = JaSper.funcs.isArray(aHijos) ? aHijos : [aHijos];
					var iLen = aHijos.length || 0;
					for(var iCont = 0; iCont < iLen; iCont++){
						oElem.appendChild(aHijos[iCont]);
					}
				}
			}

			return oElem;
		},

		/**
		 * Devuelve si el elemento pasado es tocable (visible y no enmascarado); si se encuentra parcial o totalmente en viewport y se puede tocar
		 *
		 * Puede estar parcial o totalmente a la vista
		 * De momento busca el centro de la parte expuesta del elemento
		 *
		 * @param {Object} oObj Objeto DOM a comprobar visibilidad
		 * @return {boolean} true si es visible
		 */
		expuesto: function (oObj){
			var oThis = this;

			//calcula el cuadro ocupado por un elemento dentro del viewport
			var boxPositionInViewport = function (oElBB){
				var oCoords = oThis.boundingBox(oElBB, false);
				var oViewport = JaSper.css.viewport();

				if(oViewport.top > oCoords.bottom || oCoords.top > oViewport.bottom){ //no es visible, la caja se sale por arriba o por abajo
					oCoords.top = null;
					oCoords.bottom = null;
					oCoords.height = null;
				}
				else{
					if(oViewport.top > oCoords.top){ //top esta por encima de viewport
						oCoords.top = oViewport.top;
					}
					if(oCoords.bottom > oViewport.bottom){ //bottom esta por debajo de viewport
						oCoords.bottom = oViewport.bottom;
					}
					oCoords.height = oCoords.bottom - oCoords.top; //recalculo por si ha cambiado cualquiera de las dos
				}

				if(oViewport.left > oCoords.right || oCoords.left > oViewport.right){ //no es visible, la caja se sale por arriba o por abajo
					oCoords.left = null;
					oCoords.right = null;
					oCoords.width = null;
				}
				else{
					if(oViewport.left > oCoords.left){ //left esta a la izquierda de viewport
						oCoords.left = oViewport.left;
					}
					if(oCoords.right > oViewport.right){ //right esta a la derecha de viewport
						oCoords.right = oViewport.right;
					}
					oCoords.width = oCoords.right - oCoords.left; //recalculo por si ha cambiado cualquiera de las dos
				}

				return oCoords;
			};

			if(JaSper.css.getStyle(oObj, 'display') !== 'none' && JaSper.css.getStyle(oObj, 'visibility') !== 'hidden'){
				var oRealCoords = boxPositionInViewport(oObj);

				if(oRealCoords.width && oRealCoords.height){
					var oScroll = JaSper.css.scrollPos();
					var iCoordX = Math.round(oRealCoords.left + (oRealCoords.width / 2) - oScroll.x); //se hace la comprobacion sobre el punto medio de la parte visible de la caja
					var iCoordY = Math.round(oRealCoords.top + (oRealCoords.height / 2) - oScroll.y);

					var oVisibleElem = document.elementFromPoint(iCoordX, iCoordY);
					if(oVisibleElem){
						var bIsVisibleElem = oVisibleElem === oObj;
						return Boolean(bIsVisibleElem || this.ancestros(oVisibleElem, oObj).length);
					}
				}
			}

			return false;
		},

		/**
		 * Extiende un elemento DOM con propiedades JaSper
		 * Si no se pasa el segundo parametro devuelve el estado actual de las propiedades extendidas JaSper
		 *
		 * @param {Object} oDom Objeto DOM a extender
		 * @param {Object} oAddObj Objeto con metodos que se agregaran a oDom
		 * @return {Object}
		 */
		extend: function (oDom, oAddObj){
			if(!JaSper.funcs.isDOMObject(oDom)){
				JaSper.log('[JaSper::nodo.extend] Se está intentando extender un nodo no DOM', 1);
				return false;
			}

			var sExtendProp = 'JaSper'; //nombre de la propiedad que recogera las propiedades extendidas JaSper
			oDom[sExtendProp] = oDom[sExtendProp] || {};

			if(oAddObj){
				for(var sProp in oAddObj){
					oDom[sExtendProp][sProp] = oAddObj[sProp];
				}
			}

			//devuelve el extendido actual
			//si no se ha extendido este objeto DOM con propiedades JaSper devuelve un objeto vacio
			return oDom[sExtendProp];

			/*function subExtend(obj, props){ //TODO de momento extiende recursivamente objetos, si alguna propiedad contiene un array no sigue esa rama
				for(var a in props){
					if(typeof obj[a] == 'object'){
						obj[a] = subExtend(obj[a], props[a]);
					}
					obj[a] = props[a];
				}
				return obj;
			}

			oDom[sExtendProp] = subExtend(oDom[sExtendProp], addObj);/**/
		}

	};

	/**
	 * Traduccion de los textos de funciones.
	 * Con la variable "JaSper.lang" (generada por PHP por ejemplo: $_SESSION['l10n'])
	 * que contenga el codigo de lenguaje que actualmente solicita el navegador;
	 * ya que javascript no puede leer directamente las cabeceras que envia el navegador;
	 *
	 * Devuelve el mensaje traducido o falso
	 * NO permite encadenado de metodos
	 *
	 * @todo optimizar codigo
	 * @param {array} aTrad Clave de la traduccion a devolver y parametros que requiera, ej. 'clave a traducir'; otro ej. ['%s a %s', 'clave', 'traducir'], la clave que se busca para la traduccion es el parametro unico o el primer indice y el resto del array parametros para sprintf
	 * @param {string} sLang Lenguaje al que traducir, si no se pasa ninguno se toma el de JaSper.lang
	 * @returns {string} Cadena traducida, original si no se encuentra traduccion
	 */
	JaSper._t = function (aTrad, sLang){
		if(!aTrad){
			return '';
		}
		sLang = sLang || JaSper.lang;

		if(!JaSper.funcs.isArray(aTrad)){
			aTrad = [aTrad];
		}
		if(JaSper.langs[sLang] && JaSper.langs[sLang][aTrad[0]]){
			aTrad[0] = JaSper.langs[sLang][aTrad[0]];
		}

		return JaSper.funcs.sprintf.apply(this, aTrad);
	};

	/**
	 * Metodos para ejecucion periodica de funciones
	 */
	JaSper.time = {

		/**
		 * Ejecuta la funcion pasada de forma periodica, indefinidamente o no
		 *
		 * @since 2010-12-16
		 * @todo devolver los id para controlarlos fuera; this en la funcion pasada deben ser los nodos JaSper?
		 * @param {Object} oFuncion Funcion a ejecutar; nombre de la funcion (string), referencia o anonima
		 * @param {number} iIntervalo Cada cuanto se ejecuta la funcion, si 0 se ejecutara una sola vez cuando se cumpla lapso (si hay lapso)
		 * @param {number} iLapso Tiempo tras el cual deja de ejecutarse (ambos en milisegundos, 1000ms = 1s)
		 * @return {Object} JaSper
		 */
		call: function (oFuncion, iIntervalo, iLapso){
			if(oFuncion){ //si no hay nada que ejecutar se sale

				var oIdt = null;

				if(!iIntervalo){ //ejecucion pasado un periodo
					if(iLapso){
						oIdt = setTimeout(oFuncion, iLapso);
					}
				}
				else{ //ejecucion por intervalos
					var oIdi = setInterval(oFuncion, iIntervalo);
					if(iLapso){
						oIdt = setTimeout('clearInterval(' + oIdi + ')', iLapso); //final de ejecucion
					}
				}
			}

			return this;
		},

		/**
		 * Ejecucion periodica de funciones
		 * basado en una idea de Ilya Kantor
		 *
		 * Las opciones deben ser:
		 *  intervalo //cada cuantos ms se hace una ejecucion de accion()
		 *  duracion //duracion total de ejecucion, en ms
		 *  function delta //funcion de variacion del progreso
		 *  function accion //que se hace en cada paso (frame); es el unico parametro obligatorio
		 *
		 * ej:
	JaSper.time.interval({
		intervalo: 10,
		duracion: 1000, //1 s
		delta: function (dt){return Math.pow(dt, 2);}, //si se omite toma este mismo valor
		accion: function(delta){
			domObj.style.left = 10 * delta + "px";
		}
	});
		 *
		 * @param {object} oOps Objeto con opciones
		 * @return {boolean}
		 */
		interval: function (oOps){
			oOps = oOps || {};

			if(!oOps.accion){
				return false;
			}

			oOps.intervalo = oOps.intervalo || 40; //25 fps por defecto
			oOps.duracion = oOps.duracion || 300;
			oOps.delta = oOps.delta || '';
			if(typeof oOps.delta === 'string'){
				switch(oOps.delta){
					case 'cuadratica': //variacion cuadratica (cuanto mayor sea el exponente mayor la aceleracion)
						oOps.delta = function (iDift){return Math.pow(iDift, 2);};
						break;
					case 'arco': //variacion "arco", primero a la inversa y despues directa acelear; en funcion de la intensidad (iPot)
						oOps.delta = function (iDift, iPot){iPot = iPot || 1.5; return Math.pow(iDift, 2) * ((iPot + 1) * iDift - iPot);};
						break;
					case 'bote': //variacion dando botes
						oOps.delta = function (iDift){for(var iRangA = 0, iRangB = 1; ; iRangA += iRangB, iRangB /= 2){if(iDift >= (7 - 4 * iRangA) / 11){return -Math.pow((11 - 6 * iRangA - 11 * iDift) / 4, 2) + Math.pow(iRangB, 2);}}};
						//oOps.delta = oOps.delta || function (dt, x){return Math.pow(2, 10 * (dt - 1)) * Math.cos(20 * Math.PI * x / 3 * dt);}; //variacion elastica, similar a dando botes (x define el rango inicial)
						break;
					case 'elastica': //variacion elastica, similar a dando botes (iIni define el rango inicial)
						oOps.delta = function (iDift, iIni){iIni = iIni || 1.5; return Math.pow(2, 10 * (iDift - 1)) * Math.cos(20 * Math.PI * iIni / 3 * iDift);};
						break;
					case 'lineal':
					default: //por defecto variacion lineal
						oOps.delta = function (iDift){return iDift;};
				}
			}

			var oInicio = new Date();

			//TODO ver como sustituir setInterval por window.requestAnimationFrame
			var oInterval = setInterval(function (){
				var fProgreso = (new Date() - oInicio) / oOps.duracion;

				var fDelta = oOps.delta(fProgreso);
				oOps.accion(fDelta);

				if(fProgreso > 1){
					clearInterval(oInterval);
				}
			}, oOps.intervalo);

			return true; //animacion finalizada
		},

		/**
		 * Pausa durante el tiempo especificado
		 *
		 * @param {integer} iTiempo Tiempo a dormir en milisegundos
		 * @return {boolean}
		 */
		wait: function (iTiempo){
			var oNow = new Date().getTime();
			while(new Date().getTime() < oNow + iTiempo){
				null; //no hace nada durante el tiempo indicado //TODO pasar un callback?
			}

			return true;
		}

	};

	/**
	 * Caracteristicas disponibles
	 *
	 * Tanto del propio JaSper como del navegador en que este siendo ejecutado
	 */
	JaSper.trait = {

		//informacion del navegador
		navigator: (navigator.userAgent.toLowerCase().match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, '0'])[1], //version
		msie: (/msie/).test(navigator.userAgent.toLowerCase()) && !(/opera/).test(navigator.userAgent.toLowerCase()),
		mozilla: (/mozilla/).test(navigator.userAgent.toLowerCase()) && !(/(compatible|webkit)/).test(navigator.userAgent.toLowerCase()),
		opera: (/opera/).test(navigator.userAgent.toLowerCase()),
		webkit: (/webkit/).test(navigator.userAgent.toLowerCase()),
		gecko: (/gecko/).test(navigator.userAgent.toLowerCase()) && !(/khtml/).test(navigator.userAgent.toLowerCase()),

		//guarda si es la version minificada (true) o normal (false)
		minificado: (function (){ //comprueba si estamos con la version minificada o la normal
			var aScripts = document.getElementsByTagName('script'); //document.scripts?
			var sCadenaMin = '_min';

			for(var iCont = 0; iCont < aScripts.length; iCont++){
				if(aScripts[iCont].src.indexOf('JaSper_min.js') > 0){
					return sCadenaMin; //version minificada
				}
			}

			return '';
		})(),

		//guarda si hay soporte para la API Promise
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
		promise: (function (){
			var bPromise = typeof Promise !== 'undefined' && Promise.toString().indexOf('[native code]') !== -1;
			return bPromise;
		})(),

		//guarda si se esta en un dispositivo con capacidades tactiles
		//FIXME no es completamente fiable
		tactil: (function (){
			var bTactil = 'ontouchstart' in window
				|| ('onmsgesturechange' in window || navigator.maxTouchPoints) //ie10
				|| false;

			return bTactil;
		})()

	};

	//esto convierte el constructor en prototipo, permitira extender JaSper() extendiendo JaSper.prototype
	JaSper.funcs.Init.prototype = JaSper.prototype;

	//puede extenderse el prototipo con los metodos encontrados en JaSper.funcs con:
	//JaSper.extend(JaSper.prototype, JaSper.funcs);

})(window, undefined);

/**
 * Extendiendo el prototipo
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * Busca y devuelve los padres del primer elemento del selector
	 *
	 * Si se pasa el segundo argumento (otro nodo) devuelve los nodos entre ambos, en caso de que el segundo sea ancestro del primero (en el grado que sea)
	 * Si el primer argumento no es descendiente del segundo devuelve array vacio
	 * Si no se pasa segundo argumento devuelve todos los ancestros entre el primero y document.body
	 * Devuelve un array en orden: [oOrigenPadre, oOrigenPadrePadre, ...]
	 *
	 * NO permite encadenado de metodos
	 *
	 * @todo si el primer argumento es document.body o ancestro los da como validos y sigue hasta salirse
	 * @param {object} oHasta Nodo ascendiente hasta el que se devolveran ancestros, opcional
	 * @return {array}
	 */
	ancestros: function (oHasta){
		oHasta = oHasta ? JaSper(oHasta).nodes[0] : document.body;
		var oElem = this.nodes[0];

		return JaSper.nodo.ancestros(oElem, oHasta);
	},

	/**
	 * Debug
	 *
	 * @since 2011-03-24
	 * @param {boolean} bDebug Se muestran mensajes de debug (true) o no (false)
	 * @returns {object} JaSper
	 */
	debug: function (bDebug){
		bDebug = bDebug || true;
		JaSper.debug = bDebug;

		return this;
	},

	/**
	 * Referencia automatica a la funcion foreach pasandole la lista de nodos, ej. $('<SPAN>').each(function (){});
	 *
	 * @param {Object} oCallback Callback a ejecutar
	 * @param {boolean} aArgs Argumentos
	 * @return {Object} JaSper
	 */
	each: function (oCallback, aArgs){
		aArgs = aArgs || undefined;

		if(this.nodes && this.nodes.length){ //no se hace nada si no hay nodos
			JaSper.funcs.foreach(this.nodes, oCallback, aArgs);
		}

		return this;
	},

	/**
	 * Ejecuta la funcion pasada cuando se haya cargado todo el arbol DOM
	 *
	 * $().ready(function (){[...]});
	 *
	 * http://snipplr.com/view.php?codeview&id=6156
	 *
	 * @todo eliminar el evento cuando ya no sea necesario
	 * @param {function} oFunc Funcion a ejecutar
	 * @return {Event}
	 */
	ready: function (oFunc){
		var runReady = function (){
			for(var iCont = 0; iCont < JaSper.funcs.readyFuncs.length; iCont++){
				JaSper.funcs.readyFuncs[iCont]();
			}
		};

		//if(!JaSper.trait.msie && !JaSper.trait.webkit && document.addEventListener) return document.addEventListener('DOMContentLoaded', oFunc, false);
		if(document.addEventListener){
			return document.addEventListener('DOMContentLoaded', oFunc, false);
		}

		if(JaSper.funcs.readyFuncs.push(oFunc) > 1){
			return null;
		}

		var iInterval = 0;
		if(JaSper.trait.msie){
			(function (){
				iInterval = setInterval(function (){
					try{
						document.documentElement.doScroll('left');
						clearInterval(iInterval);
						runReady();
					}
					catch(oEx){/*console.log('ready', oEx); //aun no ready*/}
				}, 5);
				/*try{document.documentElement.doScroll('left'); JaSper.funcs.runReady();}
				catch(oEx){setTimeout(oFunc, 0);}
				//catch (oEx){setTimeout(arguments.callee, 0);}*/
			})();
		}
		else if(JaSper.trait.webkit){
			iInterval = setInterval(function (){
				if(/^(loaded|complete)$/.test(document.readyState)){
					clearInterval(iInterval);
					runReady();
				}
			}, 0);
		}
	}

});

/****************
** Metodos css **
*****************/
JaSper.extend(JaSper.prototype, {

	/**
	 * Añade una clase CSS
	 *
	 * @since 2011-09-07
	 * @param {string} sName Nombre de la clase
	 * @return {Object} JaSper
	 */
	addClass: function (sName){
		this.each(function (){
			JaSper.css.addClass(this, sName);
		});

		return this;
	},

	/**
	 * Recupera una regla css de document o del elemento pasado
	 *
	 * @param {string} sCssRule Nombre de la regla
	 * @return {Object}
	 */
	getStyle: function (sCssRule){
		var oElem = this.nodes[0];
		return JaSper.css.getStyle(oElem, sCssRule);
	},

	/**
	 * Elimina una clase CSS
	 *
	 * @since 2011-09-07
	 * @param {string} sClassName Nombre de la clase
	 * @return {Object} JaSper
	 */
	removeClass: function (sClassName){
		this.each(function (){
			JaSper.css.removeClass(this, sClassName);
		});

		return this;
	},

	/**
	 * Pone una regla css de document o del elemento pasado al valor pasado
	 *
	 * @param {string} sCssRule Nombre de la regla
	 * @param {string} sValue Nuevo estilo
	 * @return {Object}
	 */
	setStyle: function (sCssRule, sValue){
		this.each(function (sRul, sVal){
			var oThis = this;
			return JaSper.css.setStyle(oThis, sRul, sVal);
		}, [sCssRule, sValue]);

		return this;
	}

});

/**
 * Esta funcion es llamada en cada evento; independiente de objetos JaSper.
 * 'this' es el objeto que lo haya llamado
 *
 * @param ev Nombre del evento
 */
/*if(typeof window.eventTrigger != 'function'){
	window.eventTrigger = function (ev){
		//return true;
	};
}*/

/***********************
** Gestion de eventos **
***********************/
JaSper.extend(JaSper.prototype, {

	/**
	 * Manejador/agregador de eventos.
	 *
	 * Permite eventos personalizados, que deberan ser disparados con $(obj).eventFire('nombre_evento'); o JaSper.event.fire(obj, 'nombre_evento');
	 *
	 * @param {string} sEvento Nombre del evento, ej: "click" (como "onclick" sin "on")
	 * @param {Function} oFuncion Funcion que se lanzara con el evento; cadena de nombre de funcion o nombre de la funcion sin mas, tambien se permiten funciones anonimas: "function (){ alert('hello!'); }"
	 * @param {boolean} bCapt Captura el evento cuando entra (fase de captura, true) o cuando sale (burbujeo, false, por defecto)
	 * @return {Object} JaSper
	 */
	eventAdd: function (sEvento, oFuncion, bCapt){
		this.each(function (sEvt, oFunc, bCt){
			JaSper.event.add(this, sEvt, oFunc, bCt);
		}, [sEvento, oFuncion, bCapt]);

		return this;
	},

	/**
	 * Disparador de eventos (personalizados o no).
	 *
	 * @since 2016-09-19
	 * @param {string} sEvento Nombre del evento, ej: "click" (como "onclick" sin "on")
	 * @param {Object} oDetalles Objeto "detail" que recibira el evento personalizado
	 * @return {Object} JaSper
	 */
	eventFire: function (sEvento, oDetalles){
		this.each(function (sEvt, oDets){
			JaSper.event.fire(this, sEvt, oDets);
		}, [sEvento, oDetalles]);

		return this;
	},

	/**
	 * Elimina eventos.
	 *
	 * @param {string} sEvento Nombre del evento, ej: "click" (como "onclick" sin "on")
	 * @param {Function} oFuncion Funcion que se lanzara con el evento; cadena de nombre de funcion o nombre de la funcion sin mas, tambien se permiten funciones anonimas: "function (){ alert('hello!'); }"
	 * @param {boolean} bCapt Captura el evento cuando entra (fase de captura, true) o cuando sale (burbujeo, false, por defecto)
	 * @return {Object} JaSper
	 */
	eventRemove: function (sEvento, oFuncion, bCapt){
		//TODO eliminar todos los eventos del elemento si no se pasan parametros
		if(typeof oFuncion === 'string'){
			oFuncion = window[oFuncion]; //TODO try para distinguir nombre_de_funcion de nombre_de_funcion(params) (evaluar esta ultima)
		}

		bCapt = bCapt || false;

		this.each(function (sEvt, oFunc, bCt){
			JaSper.event.remove(this, sEvt, oFunc, bCt);
		}, [sEvento, oFuncion, bCapt]);

		return this;
	}

});

/*********************
** Gestion de nodos **
*********************/
JaSper.extend(JaSper.prototype, {

	/**
	 * Añade un nodo hijo al seleccionado, despues de los existentes
	 *
	 * @todo debe funcionar con each (para toda la lista de nodos que se le pase)
	 * @todo si "nodo" es un objeto JaSper debe moverlo en lugar de añadir
	 * @since 2010-12-14
	 * @param {Object} oNodo Cadena HTML o elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @param {Object} oAncla Elemento al que se añadira nodo; si va vacio se usa this (los nodos de JaSper)
	 * @return {Object} JaSper
	 */
	append: function (oNodo, oAncla){
		oNodo = oNodo || this; //se usa el objeto JaSper actual si no se pasa ninguno (o si se pasa null); util para clonar, por ej.

		var aNodos = [oNodo];
		if(JaSper.funcs.isArray(oNodo)){
			aNodos = JaSper.nodo.crear(oNodo[0], {innerHTML: oNodo[1], className: oNodo[1], id: oNodo[1]}); //TODO id -> no repetir
		}
		else if(typeof oNodo === 'string'){ //si es una cadena HTML puede ser un elemento o varios
			//TODO deben clonarse los nodos resultantes de esta operacion?, de no ser asi los recibira solo el primer nodo en this.each y no podran adjuntase a mas this.each
			//TODO tal vez deberian insertarse en la primera pasada y en las siguiente clonarse los de la primera
			var oTempElem = JaSper.nodo.crear('div', null, null, oNodo);
			aNodos = oTempElem.childNodes;
		}

		if(!oAncla){
			this.each(function (aElems){
				if(this.nodeType === 1){
					var aElemsLength = aElems.length;
					var iCont = 0;
					var oNodoNuevo = null;
					while(iCont < aElems.length){
						oNodoNuevo = this.appendChild(aElems[iCont]);
						if(aElemsLength === aElems.length){ //en casos como nodeList los nodos se traslandan del array a su posicion con appendChild, con lo cual cambia la longitud del array
							iCont++;
						}
						//var dupNode = node.cloneNode(deep);
					}
				}
			}, [aNodos]);
		}
		else{
			if(typeof oAncla === 'string'){ //se ha pasado el id y no el objeto
				oAncla = document.getElementById(oAncla);
			}
			if(oAncla.nodeType === 1){
				var aElemsLength = aNodos.length;
				var iCont = 0;
				while(iCont < aNodos.length){
					oAncla.appendChild(aNodos[iCont]);
					if(aElemsLength === aNodos.length){ //en casos como nodeList los nodos se traslandan del array a su posicion con appendChild, con lo cual cambia la longitud del array
						iCont++;
					}
				}
			}
		}

		return this;
	},

	/**
	 * Cambia o consulta atributos de elementos
	 * No confundir con consulta/asignacion de estilos CSS
	 *
	 * NO permite encadenado de metodos
	 *
	 * @todo si se intenta cambiar una propiedad (como value) deberia cambiarse directamente (elem.value = 'valor'); bien controlando los casos o enviando a metodos especificos
	 * @since 2015-06-11
	 * @param {string} sAtributo Atributo a cambiar/consultar
	 * @param {string} sValor Nuevo valor para el atributo, si no se pasa nada se devuelve el valor actual
	 * @return {string} Valor del atributo del primer elemento
	 */
	attrib: function (sAtributo, sValor){
		var sRet = sValor;

		this.each(function (sAtr, sVal){
			if(typeof sVal === 'undefined'){ //no se ha pasado valor, solo consulta, se devuelve el valor del primer nodo
				sRet = JaSper.nodo.attrib(this, sAtr);
				return;
			}

			JaSper.nodo.attrib(this, sAtr, sVal);
		}, [sAtributo, sValor]);

		return sRet;
	},

	/**
	 * Devuelve el HTML de los nodos si no se le pasa nada
	 * Sustituye el HTML de los nodos con el que se pase por parametro devolviendo el HTML que hubiese previamente
	 *
	 * NO permite encadenado de metodos
	 *
	 * @todo solo funciona para nodos que tengan la propiedad innerHTML, extender para todos los nodos construyendo los objetos que se pasen por parametro y luego append al nodo?
	 * @param {string} sHtml HTML que sustituira el de los nodos
	 * @param {string} sSeparador Separador con el que se devuelven los nodos encontrados
	 * @return {string} HTML encontrado
	 */
	html: function (sHtml, sSeparador){
		var aRet = [];
		sHtml = sHtml || '';
		sSeparador = sSeparador || '';

		this.each(function (sHt){
			if(typeof this.innerHTML !== 'undefined'){ //si el nodo no tiene la propiedad innerHTML no se hace nada
				//TODO separar las cadenas HTML encontradas para un posterior split?
				aRet.push(this.innerHTML); //guarda el HTML actual del nodo

				if(sHt){ //sustituye con el HTML pasado por parametro
					this.innerHTML = sHt;
				}
			}
		}, [sHtml]);

		return aRet.join(sSeparador);
	},

	/**
	 * Inserta un elemento despues del nodo seleccionado
	 *
	 * @todo debe funcionar con each (para toda la lista de nodos que se le pase)
	 * @since 2010-12-09
	 * @param {Object} oNodo Cadena HTML, elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return {Object} JaSper
	 */
	insertAfter: function (oNodo){
		var aNodos = [oNodo];

		if(JaSper.funcs.isArray(oNodo)){
			aNodos = JaSper.nodo.crear(oNodo[0], {innerHTML: oNodo[1], className: oNodo[1], id: oNodo[1]}); //TODO id -> no repetir
		}
		else if(typeof oNodo === 'string'){ //si es una cadena HTML puede ser un elemento o varios
			var oTempElem = JaSper.nodo.crear('div', null, null, oNodo);
			aNodos = oTempElem.childNodes;
		}

		this.each(function (aElems){
			/*if (tn.lastChild) tn.insertBefore(e, tn.lastChild);
			else tn.appendChild(e);*/

			if(this.nodeType === 1){
				var aElemsLength = aElems.length;
				var iCont = 0;
				while(iCont < aElems.length){
					this.parentNode.insertBefore(aElems[iCont], this.nextSibling);
					if(aElemsLength === aElems.length){ //en casos como nodeList los nodos se traslandan del array a su posicion con appendChild, con lo cual cambia la longitud del array
						iCont++;
					}
				}
			}
		}, [aNodos]);

		return this;
	},

	/**
	 * Inserta un elemento antes del nodo seleccionado
	 *
	 * @todo debe funcionar con each (para toda la lista de nodos que se le pase)
	 * @since 2010-12-09
	 * @param {Object} oNodo Cadena HTML, elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return {Object} JaSper
	 */
	insertBefore: function (oNodo){
		var aNodos = [oNodo];

		if(JaSper.funcs.isArray(oNodo)){
			aNodos = JaSper.nodo.crear(oNodo[0], {innerHTML: oNodo[1], className: oNodo[2], id: oNodo[3]}); //TODO id -> no repetir
		}
		else if(typeof oNodo === 'string'){ //si es una cadena HTML puede ser un elemento o varios
			var oTempElem = JaSper.nodo.crear('div', null, null, oNodo);
			aNodos = oTempElem.childNodes;
		}

		this.each(function (aElems){
			if(this.nodeType === 1){
				var aElemsLength = aElems.length;
				var iCont = 0;
				while(iCont < aElems.length){
					this.parentNode.insertBefore(aElems[iCont], this);
					if(aElemsLength === aElems.length){ //en casos como nodeList los nodos se traslandan del array a su posicion con appendChild, con lo cual cambia la longitud del array
						iCont++;
					}
				}
			}

		}, [aNodos]);

		return this;
	},

	/**
	 * Añade un nodo hijo al seleccionado, antes de los existentes
	 *
	 * @todo debe funcionar con each (para toda la lista de nodos que se le pase)
	 * @todo si "nodo" es un objeto JaSper debe moverlo en lugar de añadir
	 * @since 2010-12-16
	 * @param {Object} oNodo Cadena HTML, elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @param {Object} oAncla Elemento al que se añadira nodo; si va vacio se usa this (los nodos de JaSper)
	 * @return {Object} JaSper
	 */
	prepend: function (oNodo, oAncla){
		oNodo = oNodo || this; //se usa el objeto JaSper actual si no se pasa ninguno; util para clonar, por ej.

		var aNodos = [oNodo];
		if(JaSper.funcs.isArray(oNodo)){
			aNodos = JaSper.nodo.crear(oNodo[0], {innerHTML: oNodo[1], className: oNodo[1], id: oNodo[1]}); //TODO id -> no repetir
		}
		else if(typeof oNodo === 'string'){ //si es una cadena HTML puede ser un elemento o varios
			var oTempElem = JaSper.nodo.crear('div', null, null, oNodo);
			aNodos = oTempElem.childNodes;
		}

		if(!oAncla){
			this.each(function (aElems){
				if(this.nodeType === 1){
					var aElemsLength = aElems.length;
					var iCont = 0;
					while(iCont < aElems.length){
						this.insertBefore(aElems[iCont], this.firstChild);
						if(aElemsLength === aElems.length){ //en casos como nodeList los nodos se traslandan del array a su posicion con appendChild, con lo cual cambia la longitud del array
							iCont++;
						}
					}
				}
			}, [aNodos]);
		}
		else{
			if(typeof oAncla === 'string'){ //se ha pasado el id y no el objeto
				oAncla = document.getElementById(oAncla);
			}
			if(oAncla.nodeType === 1){
				var aElemsLength = aNodos.length;
				var iCont = 0;
				while(iCont < aNodos.length){
					oAncla.insertBefore(aNodos[iCont], oAncla.firstChild);
					if(aElemsLength === aNodos.length){ //en casos como nodeList los nodos se traslandan del array a su posicion con appendChild, con lo cual cambia la longitud del array
						iCont++;
					}
				}
			}
		}

		return this;
	},

	/**
	 * Elimina un nodo
	 *
	 * @todo eliminar eventos asociados y cualquier otra informacion
	 * @param {Object} oNodo Elemento a eliminar
	 * @return {Object} JaSper
	 */
	remove: function (oNodo){
		//var el = this.get(oEl);
		this.each(function (oEl){
			oEl.parentNode.removeChild(oEl);
		}, [oNodo]);

		return this;
	},

	/**
	 * Devuelve el texto de los nodos si no se le pasa nada
	 * Sustituye el texto de los nodos con el que se pase por parametro, devolviendo el texto que hubiese previamente
	 *
	 * NO permite encadenado de metodos
	 *
	 * @param {string} sText Texto que sustituira el de los nodos
	 * @param {string} sSeparador Cadena para separar cuando se devuelven varios fragmentos de texto
	 * @return {string} Texto encontrado
	 */
	text: function (sText, sSeparador){
		var aRet = [];
		sText = sText || '';
		sSeparador = sSeparador || '';

		//TODO comprobar cross browser
		//TODO devolver value para elementos de formulario?
		this.each(function (sTxt){
			if(typeof this.textContent !== 'undefined'){ //si el nodo no tiene la propiedad text no se hace nada
				//TODO separar las cadenas encontradas para un posterior split?
				aRet[aRet.length] = this.textContent || this.nodeValue; //guarda el texto actual del nodo

				if(sTxt){ //sustituye con el texto pasado por parametro
					this.textContent = sTxt;
				}
			}
		}, [sText]);

		return aRet.join(sSeparador);
	}

});

/******************************
** Carga dinamica de metodos **
******************************/
JaSper.extend(JaSper.prototype, {
	/*
	 * Se cargan bajo demanda si estan aqui incluidos.
	 * todos los .js deben estar en el mismo directorio que este o subdirectorios de este
	 */

	/**
	 * Llama al metodo de carga de metodos en librerias no cargadas
	 *
	 * @since 2011-05-16
	 * @todo funcionan cadenas?
	 * @todo decidir si devolver algo
	 * @param {string} sMethod Nombre del metodo
	 * @param {array} aArgs Argumentos del metodo
	 * @param {string} sLibrary JS a cargar
	 * @return {Object} JaSper
	 */
	loadMethod: function (sMethod, aArgs, sLibrary){
		sLibrary = sLibrary || sMethod;

		switch(sLibrary){
			case 'ajax':
			case 'anim':
			case 'beautify':
			case 'canvas':
			case 'datetime':
			case 'lightbox':
			case 'move':
			case 'pages':
			case 'rating':
			case 'rest':
			case 'rtb':
				sLibrary = 'JaSper_' + sLibrary + JaSper.trait.minificado + '.js';
				break;
			case 'validar':
				sLibrary = 'JaSper_formazo' + JaSper.trait.minificado + '.js';
				break;
			default:
				sLibrary = false;
				JaSper.log('-JaSper::loadMethod- Intenta cargar dinamicamente una librería desconocida para el metodo: ' + sMethod, 1);
		}

		if(sLibrary){
			var oTempCall = (function (oObj, aAs){
				return function (){
					oObj[sMethod].apply(oObj, aAs);
				};
			})(this, aArgs);

			JaSper.load.queue.push({'fn': oTempCall, 'ctx': this});
			//JaSper.load.script('packer.php?scriptJs=' + library); //version con empaquetador/minificador "class.JavaScriptPacker.php"
			JaSper.load.script(sLibrary, true); //version sin empaquetador
		}

		return this;
	},

	/*Animaciones de elementos DOM mediante propiedades CSS*/
	fade: function (){return this.loadMethod('fade', arguments, 'anim');},
	hide: function (){return this.loadMethod('hide', arguments, 'anim');},
	show: function (){return this.loadMethod('show', arguments, 'anim');},
	toggle: function (){return this.loadMethod('toggle', arguments, 'anim');},

	/*AJAX*/
	ajax: function (){return this.loadMethod('ajax', arguments);},

	/*Beautifier*/
	beautify: function (){return this.loadMethod('beautify', arguments);},

	/*Canvas*/
	animate: function (){return this.loadMethod('animate', arguments, 'canvas');},
	canvas: function (){return this.loadMethod('canvas', arguments, 'canvas');},

	/*Carga dinamica de elementos de pagina*/
	carga: function (){return this.loadMethod('carga', arguments, 'pages');},

	/*Visor de imagenes en detalle*/
	lightbox: function (){return this.loadMethod('lightbox', arguments);},

	/*Fechas o relacionadas con fechas*/
	countdown: function (){return this.loadMethod('countdown', arguments, 'datetime');},
	datePicker: function (){return this.loadMethod('datePicker', arguments, 'datetime');},

	/*Movimiento de elementos*/
	move: function (){return this.loadMethod('move', arguments);},

	/*Sistema de valoracion, Rating*/
	rating: function (){return this.loadMethod('rating', arguments);},

	/*Rich Text Box*/
	rtb: function (){return this.loadMethod('rtb', arguments, 'rtb');},
	colorPicker: function (){return this.loadMethod('colorPicker', arguments, 'rtb');},

	/*Validacion de formularios*/
	validar: function (){return this.loadMethod('validar', arguments);},

	/*Peticiones a servidor REST*/
	rest: function (){return this.loadMethod('rest', arguments);}
});

/**************
** polyfills **
**************/

if(!Array.prototype.indexOf){
	//No existe en versiones viejas de IE; existe en Firefox, pero no en MOZ
	Array.prototype.indexOf = function (obj){
		for(var i = 0, len = this.length; i < len; i++){
			if(this[i] == obj){
				return i;
			}
		}
		return -1;
	};
}

if(!String.prototype.trim){
	String.prototype.trim = function (){
		// Make sure we trim BOM and NBSP
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		return this.replace(rtrim, '');
	};
}

//From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if(!Object.keys){
	Object.keys = (function (){
		'use strict';
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
			dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
			dontEnumsLength = dontEnums.length;

		return function (obj){
			if(typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)){
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [], prop, i;

			for(var prop in obj){
				if(hasOwnProperty.call(obj, prop)){
					result.push(prop);
				}
			}

			if(hasDontEnumBug){
				for(i = 0; i < dontEnumsLength; i++){
					if(hasOwnProperty.call(obj, dontEnums[i])){
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
};

/**
 * Rellena (de momento solo por la izquierda) la cadena sStr con el caracter sPadChar, si la cadena sStr tiene una longitud inferior a iPadLen
 * ej.: strPad('123', '0', '5'), devuelve '00123'
 *
 * @todo permitir rellanr con una cadena, no solo con un caracter (variara la longitud de relleno)
 * @param {string} sStr Cadena a rellenar
 * @param {string} sPadChar Caracter de relleno
 * @param {number} iPadLen Longitud maxima de relleno
 * @return {string}
 */
/*function strPad(sStr, sPadChar, iPadLen){
	var sRet = sStr;
	sRet = (sPadChar + sStr).slice(-iPadLen);
	return sRet;
}*/

//TODO
if(!window.requestAnimationFrame){
	window.requestAnimationFrame = (function (callback){
		return window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function (callback){window.setTimeout(callback, 1000 / 60); return new Date().getTime();}; //TODO callback has one single argument, a DOMHighResTimeStamp, which indicates the current time (the time returned from "performance.now()") for when requestAnimationFrame starts to fire callbacks
	})();
}

