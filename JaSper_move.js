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

'use strict';

/**************************************
 * Funciones de movimiento de objetos *
 * (div, p, ...)                      *
 **************************************/
_JaSper.funcs.extend(_JaSper.prototype, {

	/**
	 * Movimiento de objetos
	 * 
	 * @since 2011-07-08
	 * @param object props Propiedades con que se hara el movimiento
	 * @return object
	 */
	move: function (props){

		if(typeof props !== 'object') var props = {};
		props.container = props.container || false; //limita el movimiento del objeto al contendedor en que se encuentra (si true) //TODO de momento solo limita a parentNode, pasar como parametro el objeto contenedor
		props.reset = props.reset == undefined ? true : props.reset; //posicion final del objeto: true (devuelve a la posicion de inicio), false (se queda donde se suelte)
		props.place = props.place || false; //true -> mueve la sombra indicando el lugar que ocupara el elemento cuando se suelte (desplazando su entorno), si reset == false; o false -> se situara sobre los demas (via z-index y position absolute, sin molestar) si reset == false (si no volvera a su lugar original)
		props.shadow = props.shadow || false; //mientras el objeto se mueve pone un objeto sombra con su tamaño en la posicion actual (true), o se mueve sin mover el resto de objetos (false)
		props.restrict = props.restrict || false; //limita el movimiento del objeto al eje 'x', eje 'y' o sin limites false

		//CALLBACKS en los tres casos reciben como primer parametro el objeto que se esta moviendo, referenciable como this //TODO pensar que hacer con lo que se devuelve (si se devuelve algo)
		props.onMove = props.onMove || false; //callback a ejecutar mientras se mueve; CUIDADO, se ejecutara CONTINUAMENTE mientras se mueva el objeto
		props.onMoveEnd = props.onMoveEnd || false; //callback a ejecutar cuando finaliza el movimiento
		props.onMoveStart = props.onMoveStart || false; //callback a ejecutar cuando se inicia el movimiento

		var JaSperShadow;

		var createShadow = function (obj){
			JaSperShadow = document.createElement(obj.tagName);
			JaSperShadow.id = 'JaSper_shadow';
			JaSperShadow.innerHTML = '&nbsp';
			JaSperShadow.style = obj.style;
			JaSperShadow.className = obj.className + ' JaSper_shadow';
			//JaSperShadow.className = nodo[1]; //TODO asignar una clase "sombra"?
			/*JaSperShadow.style.position = obj.posStyle;
			JaSperShadow.style.top = obj.offsetTop;
			JaSperShadow.style.left = obj.offsetLeft;
			JaSperShadow.style.height = obj.clientHeight;
			JaSperShadow.style.width = obj.clientWidth;*/
			JaSperShadow.style.border = '1px dashed black';
			JaSperShadow.style.backgroundColor = '#CACACA';
			obj.parentNode.insertBefore(JaSperShadow, obj.nextSibling);

			return JaSperShadow;
		};

		/* finaliza movimiento */
		var moveEnd = function (event, obj, funcs){
			_JaSper.funcs.eventPreventDefault(event);
			_JaSper.funcs.eventStop(event);

			if(props.reset){
				obj.style.left = obj.posMoveStart['x'] + 'px';
				obj.style.top = obj.posMoveStart['y'] + 'px';

				obj.style.position = obj.posStyle;
			}

			if(props.shadow){
				JaSperShadow.parentNode.removeChild(JaSperShadow); //TODO desenganchar del arbol DOM en lugar de borrarlo para no estar continuamente creandolo?
			}

			//devolver el elemento a su nivel
			obj.style.zIndex -= 10;

			JaSper(document).eventRemove('mousemove', funcs[0]).eventRemove('mouseup', funcs[1]);

			if(typeof props.onMoveEnd === 'function') props.onMoveEnd.call(obj);

			/*var pos = posMouse(event);
			window.ultimoElemento = detectaElemento(pos, elemento.id);

			return window.ultimoElemento;*/
		};

		/* mover */
		var moveObject = function (event, obj){
			_JaSper.funcs.eventPreventDefault(event);
			_JaSper.funcs.eventStop(event);

			if(typeof props.onMove === 'function') props.onMove.call(obj);

			var pos = posMouse(event);
			var top = obj.posMoveStart['y'] + (props.restrict == 'x' ? 0 : pos['y'] - obj.posMouseInicial['y']);
			var left = obj.posMoveStart['x'] + (props.restrict == 'y' ? 0 : pos['x'] - obj.posMouseInicial['x']);

			//limita el movimiento del objeto a la caja que lo contiene
			if(props.container){ //TODO controlar en que direccion se mueve el raton para simplificar hacia donde se limita el movimiento
				var bottom = top + obj.posMoveStart['h'];
				var right = left + obj.posMoveStart['w'];

				if(top < obj.posMoveStartParent['y']) top = obj.posMoveStartParent['y'];
				if(left < obj.posMoveStartParent['x']) left = obj.posMoveStartParent['x'];
				if(bottom > obj.posMoveStartParent['y2']) top = obj.posMoveStartParent['y2'] - obj.posMoveStart['h'];
				if(right > obj.posMoveStartParent['x2']) left = obj.posMoveStartParent['x2'] - obj.posMoveStart['w'];
			}

			obj.style.top = top + 'px';
			obj.style.left = left + 'px';

			$('origen').html = _JaSper.funcs.eventSource(event);//obj;
			//document.getElementById('destino').innerHTML = JaSper.funcs.eventTarget(event);
			$('evento').html = _JaSper.funcs.eventName(event);
		};

		/*var mueveObj = function (e){
			evt = e || window.event;
			var moz = document.getElementById && !document.all;
			var obj = _JaSper.funcs.eventSource(e);

			document.getElementById('origen').innerHTML = obj;
			document.getElementById('destino').innerHTML = $(this).destinoEvento(e);
			document.getElementById('evento').innerHTML = $(this).nombreEvento(e);

			newLeft = moz ? evt.clientX : event.clientX;
			newTop = moz ? evt.clientY : event.clientY;

			// Posicionamos el objeto en las nuevas coordenadas y aplicamos unas desviaciones
			// horizontal y vertical correspondientes a la mitad del ancho y alto del elemento
			// que movemos para colocar el puntero en el centro de la capa movible.
			obj.style.left = (newLeft - parseInt(obj.style.width)/2) + 'px';
			obj.style.top = (newTop - parseInt(obj.style.height)/2) + 'px';

			// Devolvemos false para no realizar ninguna acción posterior
			return false;
		};*/

		/* inicia movimiento */
		var moveStart = function (event, obj){
			_JaSper.funcs.eventPreventDefault(event);
			_JaSper.funcs.eventStop(event);

			var normalclick;
			if(event.which) normalclick = event.which;
			else if(event.button) normalclick = event.button;
			if(normalclick != 1) return(false);

			if(typeof props.onMoveStart === 'function') props.onMoveStart.call(obj);

			if(props.shadow){
				createShadow(obj);
			}

			obj.posMoveStart = posObject(obj);
			obj.posMouseInicial = posMouse(event);

			if(props.container){
				obj.posMoveStartParent = posObject(obj.parentNode);

				obj.parentNode.style.top = obj.posMoveStartParent['y'] + 'px'; //fuerza al contenedor a que conserve su tamaño; cuando los objetos en movimiento cambian a absolute desaparece el hueco y cambia el tamaño del parent
				obj.parentNode.style.left = obj.posMoveStartParent['x'] + 'px';
				obj.parentNode.style.width = obj.posMoveStartParent['w'] + 'px';
				obj.parentNode.style.height = obj.posMoveStartParent['h'] + 'px';
			}

			//TODO de momento solo mueve con position:absolute
			obj.posStyle = obj.style.position;
			obj.style.position = 'absolute';

			obj.style.top = obj.posMoveStart['y'] + 'px';
			obj.style.left = obj.posMoveStart['x'] + 'px';
			obj.style.width = obj.posMoveStart['w'] + 'px';
			obj.style.height = obj.posMoveStart['h'] + 'px';

			//poner el elemento sobre los demas
			obj.style.zIndex += 10;

			//var funMov = function (e){moveObject(e, obj);}, funFin = function (e){moveEnd(e, obj, [funMov, arguments.callee]);}; //"arguments.calle es imprescindible para poder desregistrar el evento, problemas pasando la definicion de la funcion...
			var funMov = function (e){moveObject(e, obj);}, funFin = function funFinCalle(e){moveEnd(e, obj, [funMov, funFinCalle]);};

			JaSper(document).eventAdd('mousemove', funMov);
			JaSper(document).eventAdd('mouseup', funFin);

		};

		/* devuelve la posicion del elemento con respecto a su contenedor (left y top), (array=>['x'] - ['y']) */
		var posObject = function (obj){
			//TODO el tamaño de las cajas no se calcula igual en todos los navegadores
			var boxLeft = parseInt(_JaSper.funcs.getStyle(obj, 'marginLeft'));
			var boxTop = parseInt(_JaSper.funcs.getStyle(obj, 'marginTop'));

			//http://www.quirksmode.org/js/findpos.html
			var objLT = obj;
			var curleft = obj.offsetLeft - boxLeft;
			var curtop = obj.offsetTop - boxTop;
			while(objLT = objLT.offsetParent){
				curleft += objLT.offsetLeft;
				curtop += objLT.offsetTop;
			}

			var pos = new Array();
			pos['w'] = parseInt(_JaSper.funcs.getStyle(obj, 'width')); //pos['w'] = obj.offsetWidth; //ancho del elemento
			pos['h'] = parseInt(_JaSper.funcs.getStyle(obj, 'height')); //pos['h'] = obj.offsetHeight; //alto del elemento
			pos['x'] = curleft;
			pos['y'] = curtop;
			pos['x2'] = pos['x'] + pos['w']; //esquina inferior derecha
			pos['y2'] = pos['y'] + pos['h'];

			return pos;
		};

		/* devuelve la posicion del puntero, (array=>["x"] - ["y"]) */
		var posMouse = function (event){
			var pos = new Array();
			if(navigator.userAgent.toLowerCase().indexOf("msie") >= 0){
				/* document.body.clientLeft/clientTop es el tamaño del borde (usualmente 2px) que encierra al documento ya que en IE este no empieza en (0,0) */
			 	pos['x'] = window.event.clientX + document.body.clientLeft + document.body.scrollLeft;
				pos['y'] = window.event.clientY + document.body.clientTop + document.body.scrollTop;
			}
			else{
				pos['x'] = event.clientX + window.pageXOffset;
				pos['y'] = event.clientY + window.pageYOffset;
			}
			return pos;
		};

		//pone los eventos que lanzaran el movimiento de cada elemento
		this.eventAdd('mousedown', function (e){moveStart(e, this);}); //TODO eliminar este evento al finalizar el movimiento?
	}

});
