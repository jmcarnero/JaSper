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
 * Funciones de movimiento de objetos
 * (div, p, ...)
 * Con callbacks de inicio, fin de movimiento y mientras se esta moviendo
 *
 * @author José M. Carnero
 * @version 2.3
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * Movimiento de objetos
	 * 
	 * @since 2011-07-08
	 * @param object props Propiedades con que se hara el movimiento
	 * @return object
	 */
	move: function (props){
		'use strict';

		props = props || {};
		props.container = props.container || false; //limita el movimiento del objeto al contendedor en que se encuentra (true es parentNode), pasar como parametro el objeto contenedor (objeto DOM)
		props.reset = props.reset == undefined ? true : props.reset; //posicion final del objeto: true (devuelve a la posicion de inicio), false (se queda donde se suelte, ocupa el lugar de la sombra si shadow esta puesto)
		props.shadow = props.shadow || false; //mientras el objeto se mueve pone un objeto sombra con su tamaño en la posicion actual (true), o se mueve sin mover el resto de objetos (false)
		props.restrict = props.restrict || false; //limita el movimiento del objeto al eje 'x', eje 'y' o sin limites false

		//CALLBACKS en los tres casos reciben como primer parametro el evento disparado (evento del raton), segundo parametro es el objeto sobre el que esta el puntero y el objeto que se esta moviendo como this //TODO pensar que hacer con lo que se devuelve (si se devuelve algo)
		props.onMove = props.onMove || false; //callback a ejecutar mientras se mueve; CUIDADO, se ejecutara CONTINUAMENTE mientras se mueva el objeto
		props.onMoveEnd = props.onMoveEnd || false; //callback a ejecutar cuando finaliza el movimiento
		props.onMoveStart = props.onMoveStart || false; //callback a ejecutar cuando se inicia el movimiento

		var oSombra;
		
		var oEventos = { //eventos usados en dispositivos tactiles o con puntero
			inicio: (JaSper.tactil ? 'touchstart' : 'mousedown'), //evento de inicio de movimiento
			mueve: (JaSper.tactil ? 'touchmove' : 'mousemove'), //evento de movimiento
			fin: (JaSper.tactil ? 'touchend' : 'mouseup') //evento de final de movimiento
		};

		var createShadow = function (obj){
			oSombra = JaSper.nodo.crear(obj.tagName, {
				//id: 'JaSper_shadow',
				innerHTML: '&nbsp',
				class: obj.className + ' JaSper_shadow'
			});
			//oSombra.style = obj.style;
			//oSombra.className = nodo[1]; //TODO asignar una clase "sombra"?
			oSombra.style.position = obj.posStyle;
			oSombra.style.top = obj.offsetTop;
			oSombra.style.left = obj.offsetLeft;
			oSombra.style.height = obj.clientHeight;
			oSombra.style.width = obj.clientWidth;
			oSombra.style.border = '1px dashed black';
			oSombra.style.backgroundColor = '#CACACA';

			obj.parentNode.insertBefore(oSombra, obj.nextSibling);

			return oSombra;
		};

		/* finaliza movimiento */
		var moveEnd = function (event, obj, funcs){
			JaSper.event.preventDefault(event);
			JaSper.event.stop(event);

			if(props.reset){
				var oObjProps = JaSper.nodo.extend(obj);

				obj.style.left = (oObjProps.posMoveStart['x'] - oObjProps.posMoveStart['mx']) + 'px';
				obj.style.top = (oObjProps.posMoveStart['y'] - oObjProps.posMoveStart['my']) + 'px';

				obj.style.position = obj.posStyle;
			}

			if(props.shadow){
				if(!props.reset){
					obj.style.position = obj.posStyle;
					obj = obj.parentNode.removeChild(obj);
				
					oSombra.parentNode.insertBefore(obj, oSombra);
				}

				oSombra.parentNode.removeChild(oSombra); //TODO desenganchar del arbol DOM en lugar de borrarlo para no estar continuamente creandolo?
			}

			//devolver el elemento a su nivel
			obj.style.zIndex -= 10;

			JaSper.event.remove(document, oEventos.mueve, funcs[0]);
			JaSper.event.remove(document, oEventos.fin, funcs[1]);

			if(typeof props.onMoveEnd === 'function'){
				var iAntZindex = obj.style.zIndex;
				obj.style.zIndex = -999; //evita que se detecte como target al elemento que se esta moviendo
				var oTarget = JaSper.move.elementFromPoint(event);
				obj.style.zIndex = iAntZindex;

				props.onMoveEnd.call(obj, event, oTarget);
			}
		};

		/* mover */
		var moveObject = function (event, obj){
			JaSper.event.preventDefault(event);
			JaSper.event.stop(event);

			var pos = JaSper.move.posPuntero(event); //posicion del raton

			var oTarget = null;
			var iAntZindex = null;

			if(props.shadow){
				oSombra = oSombra.parentNode.removeChild(oSombra);

				iAntZindex = iAntZindex || obj.style.zIndex;
				obj.style.zIndex = -999; //evita que se detecte como target al elemento que se esta moviendo
				oTarget = oTarget || JaSper.move.elementFromPoint(event);
				obj.style.zIndex = iAntZindex;

				var aTargetPos = JaSper.move.posObject(oTarget);
				var iTargetHei = Math.round(aTargetPos['h'] / 2);

				if(pos['y'] < (aTargetPos['y'] + iTargetHei)){ //la sombra esta en el extremo superior del objetivo
					oTarget.parentNode.insertBefore(oSombra, oTarget);
				}
				else if(pos['y'] > (aTargetPos['y2'] - iTargetHei) && oTarget.nextSibling){ //la sombra esta en el extremo inferior del objetivo
					oTarget.parentNode.insertBefore(oSombra, oTarget.nextSibling);
				}
				else{ //la sombra esta en el centro del objetivo
					oTarget.parentNode.appendChild(oSombra);
				}
			}

			if(typeof props.onMove === 'function'){
				iAntZindex = iAntZindex || obj.style.zIndex;
				obj.style.zIndex = -999; //evita que se detecte como target al elemento que se esta moviendo
				oTarget = oTarget || JaSper.move.elementFromPoint(event);
				obj.style.zIndex = iAntZindex;

				props.onMove.call(obj, event, oTarget);
			}

			var oObjProps = JaSper.nodo.extend(obj);

			var top = oObjProps.posMoveStart['y'] + (props.restrict == 'x' ? 0 : pos['y'] - oObjProps.posPunteroInicial['y'] - oObjProps.posMoveStart['my']);
			var left = oObjProps.posMoveStart['x'] + (props.restrict == 'y' ? 0 : pos['x'] - oObjProps.posPunteroInicial['x'] - oObjProps.posMoveStart['mx']);

			//limita el movimiento del objeto a la caja que lo contiene o a la indicada en "container"
			if(props.container){ //TODO controlar en que direccion se mueve el raton para simplificar hacia donde se limita el movimiento
				var bottom = oObjProps.posMoveStart['y2']; //top + oObjProps.posMoveStart['h'];
				var right = oObjProps.posMoveStart['x2']; //left + oObjProps.posMoveStart['w'];

				if(top < oObjProps.posMoveStartParent['y']) top = oObjProps.posMoveStartParent['y'];
				if(left < oObjProps.posMoveStartParent['x']) left = oObjProps.posMoveStartParent['x'];
				if(bottom > oObjProps.posMoveStartParent['y2']) top = oObjProps.posMoveStartParent['y2'] - oObjProps.posMoveStart['h'];
				if(right > oObjProps.posMoveStartParent['x2']) left = oObjProps.posMoveStartParent['x2'] - oObjProps.posMoveStart['w'];
			}

			obj.style.top = top + 'px';
			obj.style.left = left + 'px';

			$('origen').html = JaSper.event.source(event);//obj;
			//document.getElementById('destino').innerHTML = JaSper.event.target(event);
			$('evento').html = JaSper.event.name(event);
		};

		/* inicia movimiento */
		var moveStart = function (event, obj){
			JaSper.event.preventDefault(event);
			JaSper.event.stop(event);

			var normalclick = 1;
			if(event.which) normalclick = event.which;
			else if(event.button) normalclick = event.button;
			if(normalclick != 1){
				return false;
			}

			if(typeof props.onMoveStart === 'function'){
				var iAntZindex = obj.style.zIndex;
				obj.style.zIndex = -999; //evita que se detecte como target al elemento que se esta moviendo
				var oTarget = JaSper.move.elementFromPoint(event);
				obj.style.zIndex = iAntZindex;

				props.onMoveStart.call(obj, event, oTarget);
			}

			if(props.shadow){
				createShadow(obj);
			}

			JaSper.nodo.extend(obj, {posMoveStart: JaSper.move.posObject(obj)});
			var oObjProps = JaSper.nodo.extend(obj, {posPunteroInicial: JaSper.move.posPuntero(event)});

			if(props.container){
				//TODO controlar si container es una cadena de texto o un objeto DOM (de momento debe ser esto ultimo)
				oObjProps = JaSper.nodo.extend(obj, {posMoveStartParent: JaSper.move.posObject(props.container === true ? obj.parentNode : props.container)});

				obj.parentNode.style.top = oObjProps.posMoveStartParent['y'] + 'px'; //fuerza al contenedor a que conserve su tamaño; cuando los objetos en movimiento cambian a absolute desaparece el hueco y cambia el tamaño del parent
				obj.parentNode.style.left = oObjProps.posMoveStartParent['x'] + 'px';
				obj.parentNode.style.width = oObjProps.posMoveStartParent['w'] + 'px';
				obj.parentNode.style.height = oObjProps.posMoveStartParent['h'] + 'px';
			}

			//TODO de momento solo mueve con position:absolute
			obj.posStyle = obj.style.position;
			obj.style.position = 'absolute';

			obj.style.top = (oObjProps.posMoveStart['y'] - oObjProps.posMoveStart['my']) + 'px';
			obj.style.left = (oObjProps.posMoveStart['x'] - oObjProps.posMoveStart['mx']) + 'px';
			obj.style.width = oObjProps.posMoveStart['w'] + 'px';
			obj.style.height = oObjProps.posMoveStart['h'] + 'px';

			//poner el elemento sobre los demas
			obj.style.zIndex += 10;

			//var funMov = function (e){moveObject(e, obj);}, funFin = function (e){moveEnd(e, obj, [funMov, arguments.callee]);}; //"arguments.calle es imprescindible para poder desregistrar el evento, problemas pasando la definicion de la funcion...
			var funMov = function (e){moveObject(e, obj);};
			var funFin = function funFinCall(e){moveEnd(e, obj, [funMov, funFinCall]);};

			JaSper.event.add(document, oEventos.mueve, funMov);
			JaSper.event.add(document, oEventos.fin, funFin);
		};

		//pone los eventos que lanzaran el movimiento de cada elemento
		this.eventAdd(oEventos.inicio, function (e){moveStart(e, this);}); //TODO eliminar este evento al finalizar el movimiento?
	}

});

JaSper.move = {

	//devuelve el elemento sobre el que se encuentra el raton cuando se llama
	//utiliza un evento de raton que debe contener posicion X e Y del raton
	elementFromPoint: function (mouseEvent){
		'use strict';

		if(document.elementFromPoint){
			var x = mouseEvent.clientX, y = mouseEvent.clientY, isRelative = true, iDesp = 0;
			if((iDesp = JaSper.css.getStyle(document, 'scrollTop')) > 0){
				isRelative = (document.elementFromPoint(0, iDesp + JaSper.css.getStyle(window, 'height')) == null);
			}
			else if((iDesp = JaSper.css.getStyle(document, 'scrollLeft')) >0){
				isRelative = (document.elementFromPoint(iDesp + JaSper.css.getStyle(window, 'width'), 0) == null);
			}

			if(!isRelative){
				x += JaSper.css.getStyle(document, 'scrollLeft');
				y += JaSper.css.getStyle(document, 'scrollTop');
			}

			return document.elementFromPoint(x, y);
		}

		return (function (ev){
			var oTarget = ev.explicitOriginalTarget; //TODO ver que hacer en navegadores sin esta propiedad

			if(!oTarget){
				return null;
			}

			//imita el comportamiento de IE devuelve el padre para nodos de texto
			if(oTarget.nodeType == Node.TEXT_NODE){
				oTarget = oTarget.parentNode;
			}
		
			//imita el comportamiento de IE devuelve devuelve tag body cuando es tag html
			if(oTarget.nodeName.toUpperCase() == "HTML"){
				oTarget = document.getElementsByTagName("BODY").item(0);
			}

			return oTarget;
		})(mouseEvent);
	},

	/* devuelve la posicion del elemento con respecto al documento (top, left, etc.) y su tamaño */
	posObject: function (obj){
		'use strict';

		//TODO el tamaño de las cajas no se calcula igual en todos los navegadores

		//http://www.quirksmode.org/js/findpos.html
		var objLT = obj;
		var curleft = obj.offsetLeft;
		var curtop = obj.offsetTop;
		while(objLT = objLT.offsetParent){
			curleft += objLT.offsetLeft;
			curtop += objLT.offsetTop;
		}

		var pos = new Array();
		pos['w'] = parseInt(JaSper.css.getStyle(obj, 'width')); //pos['w'] = obj.offsetWidth; //ancho del elemento
		pos['h'] = parseInt(JaSper.css.getStyle(obj, 'height')); //pos['h'] = obj.offsetHeight; //alto del elemento
		pos['x'] = curleft;
		pos['y'] = curtop;
		pos['x2'] = pos['x'] + pos['w']; //esquina inferior derecha
		pos['y2'] = pos['y'] + pos['h'];

		pos['mx'] = parseInt(JaSper.css.getStyle(obj, 'marginLeft'));
		pos['my'] = parseInt(JaSper.css.getStyle(obj, 'marginTop'));

		return pos;
	},

	/* devuelve la posicion del puntero, (array=>["x"] - ["y"]) */
	//TODO devolver tanto tactil como no tactil, para permitir movimiento con raton y dedo en dispositivos tactiles
	posPuntero: function (event){
		'use strict';

		var pos = new Array();

		if(JaSper.tactil){ //posicion en dispositivos tactiles
			//"changedTouches" guarda la posicion de los puntos tocados (en caso de dispositivos multitactiles cada indice sera un dedo, por ejemplo)
			pos['x'] = event.changedTouches[0].pageX;
			pos['y'] = event.changedTouches[0].pageY;
		}
		else{ //posicion con raton o puntero
			if(navigator.userAgent.toLowerCase().indexOf("msie") >= 0){
				/* document.body.clientLeft/clientTop es el tamaño del borde (usualmente 2px) que encierra al documento ya que en IE este no empieza en (0,0) */
				pos['x'] = window.event.clientX + document.body.clientLeft + document.body.scrollLeft;
				pos['y'] = window.event.clientY + document.body.clientTop + document.body.scrollTop;
			}
			else{
				pos['x'] = event.clientX + window.pageXOffset;
				pos['y'] = event.clientY + window.pageYOffset;
			}
		}

		return pos;
	}

};
