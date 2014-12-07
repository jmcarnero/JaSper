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

/**************************************
 * Funciones de movimiento de objetos *
 * (div, p, ...)                      *
 **************************************/
JaSper.funcs.extend(JaSper.prototype, {

	/**
	 * Movimiento de objetos
	 * 
	 * @since 2011-07-08
	 * @return object
	 */
	move: function (){

		/* finaliza movimiento */
		var finMovElemento = function(event, obj, funcs){
			obj.style.left = obj.posInicioElem['x'] + 'px';
			obj.style.top = obj.posInicioElem['y'] + 'px';

			obj.style.position = obj.posStyle;

			//devolver el elemento a su nivel
			obj.style.zIndex -= 10;

			_JaSper(document).evRemove('mousemove', funcs[0]);
			_JaSper(document).evRemove('mouseup', funcs[1]);
			//evita la propagacion del evento
			_JaSper(this).evStop(event);

			/*var pos = posMouse(event);
			window.ultimoElemento = detectaElemento(pos, elemento.id);

			return window.ultimoElemento;*/
		};

		/* inicia movimiento */
		var inicioMovElemento = function(event, obj){
			var normalclick;
			if(event.which) normalclick = event.which;
			else if(event.button) normalclick = event.button;
			if(normalclick != 1) return(false);

			var funMov = function (e){movElemento(e, obj);}, funFin = function (e){finMovElemento(e, obj, [funMov, arguments.callee]);}; //"arguments.calle es imprescindible para poder desregistrar el evento, problemas pasando la definicion de la funcion...

			_JaSper(document).evAdd('mousemove', funMov);
			_JaSper(document).evAdd('mouseup', funFin);

			obj.posInicioElem = posElemento(obj);
			obj.posMouseInicial = posMouse(event);

			//TODO de momento solo mueve con position:absolute
			obj.posStyle = obj.style.position;
			obj.style.position = 'absolute';

			//poner el elemento sobre los demas
			obj.style.zIndex += 10;

			//evita la propagacion del evento
			_JaSper(this).evStop(event);
		};

		/* mover */
		var movElemento = function(event, obj){
			var pos = posMouse(event);

			obj.style.left = obj.posInicioElem['x'] + pos['x'] - obj.posMouseInicial['x'] + 'px';
			obj.style.top = obj.posInicioElem['y'] + pos['y'] - obj.posMouseInicial['y'] + 'px';

			$('origen').html = _JaSper(this).evSource(event);//obj;
			//document.getElementById('destino').innerHTML = _JaSper(this).evTarget(event);
			$('evento').html = _JaSper(this).evName(event);

			//evita la propagacion del evento
			_JaSper(this).evStop(event);
		};

		/*var mueveObj = function(e){
			evt = e || window.event;
			var moz = document.getElementById && !document.all;
			var obj = $(this).evSource(e);

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

		/* devuelve la posicion del elemento con respecto a su contenedor (left y top), (array=>['x'] - ['y']) */
		var posElemento = function(obj){
			var pos = new Array();

			pos['w'] = parseInt(obj.offsetWidth); //ancho del elemento
			pos['h'] = parseInt(obj.offsetHeight); //alto del elemento

			//http://www.quirksmode.org/js/findpos.html
			var curleft = curtop = 0;
			do{
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			}while(obj = obj.offsetParent);
			pos['x'] = curleft;
			pos['y'] = curtop;

			//pos['x'] = parseInt(elemento.offsetLeft); //esquina superior izquierda
			//pos['y'] = parseInt(elemento.offsetTop);
			pos['x2'] = pos['x'] + pos['w']; //esquina inferior derecha
			pos['y2'] = pos['y'] + pos['h'];

			return pos;
		};

		/* devuelve la posicion del puntero, (array=>["x"] - ["y"]) */
		var posMouse = function(event){
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
		this.evAdd('mousedown', function (e){inicioMovElemento(e, this);});
	}

});
