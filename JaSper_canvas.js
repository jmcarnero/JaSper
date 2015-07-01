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
 * Funciones para Canvas
 * 
 */

JaSper.extend(JaSper.prototype, {
	/**
	 * HTML5 Canvas
	 *
	 * @since 2014-12-28
	 * @param object
	 * @returns object
	 */
	canvas: function (){

		var callFuncs = function (jasperObj, props){
			jasperObj.each(function (){
				if(!JaSper.canvas.valid(this))
					return false;

				this.JaSperItemSelected = undefined; //elemento actualmente seleccionado

				//'animable' bandera que indica si se esta animando este canvas
				//'draggable' bandera que indica si este elemento tiene elementos arrastrables
				if(this.JaSperItems === undefined)
					this.JaSperItems = [];
				this.JaSperItems.flags = this.JaSperItems.flags || {};
				this.JaSperItems.flags.animable = this.JaSperItems.flags.animable || false; //bandera que indica si se esta animando este canvas
				this.JaSperItems.flags.draggable = this.JaSperItems.flags.draggable || false; //bandera que indica si este elemento tiene elementos arrastrables

				//cada elemento de este array debe guardar todo lo necesario para volver a pintarlo si fuera necesario
				//this.JaSperItems[props.id] = props; //cada elemento tiene como nombre su id, y sus propiedades como un objeto
				if(!JaSper.canvas.add(this, props)) return false;

				return false;
			}, props);
		};

		for(var arg in arguments){
			var id = false;
			try{
				id = Object.keys(arguments[arg])[0];
			}
			catch(ex){}

			if(id !== false){
				callFuncs(this, arguments[arg][id]);
			}
			else{
				JaSper.log('-JaSper::canvas- id de objeto invalida', 2);
				return false;
			}
		}

		return this;
	},

	/**
	 * Animaciones
	 *
	 * @since 2014-11-28
	 * @param object props Propiedades del circulo {"id": "id_circulo", "centroX": nn, "centroY": nn, "radio": nn, "fondo": "color_fondo"}
	 * @returns boolean
	 */
	animate: function (){
		//devolver la posicion del raton cuando se hace click en el canvas
		/*this.addEventListener('click',function(evt){
			alert(evt.clientX + ',' + evt.clientY);
			},false);*/

		var args = arguments;

		this.each(function (){
			if(this.nodeName.toLowerCase() != 'canvas'){
				JaSper.log('-JaSper::animate- el objeto no es canvas', 1);
				return false; //no hace nada para elementos que no sean canvas //TODO mejorar la comprobacion de soporte de canvas
			}

			this.JaSperItems.flags.animable = true; //bandera que indica que se esta animando este canvas
			return JaSper.canvas.animate(this, args);
		}, args);

		return this;
	}

});

JaSper.canvas = {};

JaSper.extend(JaSper.canvas, {

	/**
	 * Suma un objeto al array de objetos del canvas
	 * 
	 * @since 2015-02-17
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades del objeto
	 * @returns boolean
	 */
	add: function (canvas, props){
		if(!JaSper.canvas.valid(canvas))
			return false;

		props.id = props.id || JaSper.funcs.genId();

		//metodos disponibles
		var validFuncs = {'background': 'background', 'circle': 'circle', 'image': 'image', 'path': 'path', 'polygon': 'polygon', 'text': 'text'};

		if(!props.func || (!JaSper.canvas[props.func] && !validFuncs[props.func])){
			JaSper.log('-JaSper::canvas.add- metodo desconocido', 2);
			return false;
		}
		else{
			if(validFuncs[props.func] !== undefined)
				props.func = validFuncs[props.func]; //se pone el nombre correcto de la funcion si se ha llamado a la abreviada
		}
		canvas.JaSperItems[props.id] = props;

		var JaSperFunc = JaSper.canvas[props.func];
		if(typeof JaSperFunc === 'function'){
			if(props.drag != undefined && props.drag && !canvas.JaSperItems.flags.draggable){ //este elemento es arrastrable con el raton
				canvas.JaSperItems.flags.draggable = true;
				JaSper(canvas).eventAdd('mousedown', JaSper.canvas.mouseDown);
			}
			return JaSperFunc.call(null, canvas, props);
		}

		return false;
	},

	//anima un canvas, llamando a esta misma funcion a intervalos regulares (cada frame se redibuja)
	//TODO finalizar la animacion cuando no haya nada que animar (todos quietos o fuera y sin vuelta) //canvas.JaSperItems.flags.animable = false;
	animate: function (canvas, props){
		if(!JaSper.canvas.valid(canvas))
			return false;

		window.requestAnimationFrame(function(){
			JaSper.canvas.animate(canvas, props);
		});

		var callFuncs = function (canvasObj, callProps){
			var JaSperFunc = JaSper.canvas[callProps.func];
			if(typeof JaSperFunc === 'function')
				return JaSperFunc.call(null, canvasObj, callProps);

			return false;
		};

		//metodos disponibles
		var validFuncs = {'move': 'move', 'scale': false};

		for(var pr in props){
			var func = false;
			try{
				func = Object.keys(props[pr])[0];
			}
			catch(ex){;}

			//si hay limite de frames para este objeto y se ha alcanzado se salta
			if(props[pr][func].frames !== undefined && props[pr][func].frames-- < 1)
				continue;

			var callProps = props[pr][func];
			if(func !== false && validFuncs[func] !== undefined){
				if(validFuncs[func] !== false){ //no todos los tipos de animacion son llamadas directas a metodos
					callProps.func = validFuncs[func];
					callFuncs(canvas, callProps);
				}
				else{
					switch(func){
						case 'scale': //TODO callbacks?
							if(!callProps.id || !canvas.JaSperItems[callProps.id])
								return false;
							if(canvas.JaSperItems[callProps.id].scaleX === undefined) canvas.JaSperItems[callProps.id].scaleX = 0;
							if(canvas.JaSperItems[callProps.id].scaleY === undefined) canvas.JaSperItems[callProps.id].scaleY = 0;

							var scaleX = callProps.scaleX || 0;
							var scaleY = callProps.scaleY || 0;

							var speed = callProps.speed || 1; //velocidad, en pixels, del movimiento
							if(typeof callProps.speed === 'function')
								speed = callProps.speed.call(null); //callback

							canvas.JaSperItems[callProps.id].scaleX += (scaleX * speed);
							canvas.JaSperItems[callProps.id].scaleY += (scaleY * speed);

							break;
						default:
							JaSper.log('-JaSper::canvas.animate- submetodo desconocido: ' + func, 2);
							return false;
					}
				}
			}
			else{
				JaSper.log('-JaSper::canvas.animate- submetodo desconocido: ' + props[pr], 2);
				return false;
			}
		}

		JaSper.canvas.redraw(canvas);
	},

	/**
	 * Fondo; color, degradado, imagen, ...
	 * 
	 * @since 2015-01-07
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades del objeto
	 * @returns boolean
	 */
	background: function (canvas, props){
		if(!JaSper.canvas.valid(canvas))
			return false;
		var context = canvas.getContext('2d');

		props.fillStyle = props.fillStyle || '#fff'; //color de fondo //TODO degradados, imagenes de fondo
		props.width = props.width || canvas.style.width || false; //ancho del canvas
		props.height = props.height || canvas.style.height || false; //alto del canvas

		if(props.width) canvas.width = props.width;
		if(props.height) canvas.height = props.height;

		context.fillStyle = props.fillStyle; //limpia el canvas antes de redibujarlo; si no se limpia los objetos en movimiento dejan estela (no se borran las posiciones anteriores)
		context.fillRect(0, 0, canvas.width, canvas.height);

		return true;
	},

	/**
	 * Dibuja una caja alrededor del elemento seleccionado, como feedback para el usuario
	 *
	 * @todo personalizar la apariencia de la caja
	 * @since 2015-01-15
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades del objeto
	 * @returns boolean
	 */
	boundingBox: function (canvas, props){
		if(!JaSper.canvas.valid(canvas) || !props.boundingBox)
			return false;
		var context = canvas.getContext('2d');

		var iMargin = 2; //separacion entre la caja y el objeto

		if(props.selected){
			var iBBx = props.boundingBox[0] - iMargin;
			var iBBy = props.boundingBox[1] - iMargin;
			var iBBw = props.boundingBox[2] + (iMargin * 2);
			var iBBh = props.boundingBox[3] + (iMargin * 2);

			context.save();
			context.beginPath();
	
			context.rect(iBBx, iBBy, iBBw, iBBh); //pone la caja
			/*context.fillStyle = 'yellow';
			context.fill();*/
			context.lineWidth = 1;
			context.strokeStyle = 'green';
			context.stroke();

			context.beginPath(); //inicia el poligono

			context.lineWidth = 1; //color y borde para anclas
			context.strokeStyle = 'yellow';
			var iRad = 5; //radio de anclas //TODO configurable por el usuario y por objeto?

			var iAngIni = 3.3; //ancla para estiramiento, superior izquierda
			context.moveTo(iBBx + iRad * Math.sin(iAngIni), iBBy - iRad * Math.cos(iAngIni));
			var delta = (2 * Math.PI / 3); //angulo entre vertices
			context.lineTo(iBBx + iRad * Math.sin(iAngIni + delta), iBBy - iRad * Math.cos(iAngIni + delta));
			context.lineTo(iBBx + iRad * Math.sin(iAngIni + delta + delta), iBBy - iRad * Math.cos(iAngIni + delta + delta));
			context.stroke();

			iAngIni = 0.22; //ancla para estiramiento, inferior derecha
			context.moveTo(iBBx + iBBw + iRad * Math.sin(iAngIni), iBBy + iBBh - iRad * Math.cos(iAngIni));
			delta = (2 * Math.PI / 3); //angulo entre vertices
			context.lineTo(iBBx + iBBw + iRad * Math.sin(iAngIni + delta), iBBy + iBBh - iRad * Math.cos(iAngIni + delta));
			context.lineTo(iBBx + iBBw + iRad * Math.sin(iAngIni + delta + delta), iBBy + iBBh - iRad * Math.cos(iAngIni + delta + delta));
			context.stroke();

			context.beginPath(); //ancla para rotacion
			context.arc(iBBx + iBBw, iBBy, iRad, (Math.PI/180) * 0, (Math.PI/180) * 270);
			context.stroke();

			context.closePath();
			context.restore();
		}

		return true;
	},

	/**
	 * Dibuja un circulo
	 *
	 * @since 2014-11-27
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades del circulo
	 * @returns boolean
	 */
	circle: function (canvas, props){
		if(!JaSper.canvas.valid(canvas))
			return false;
		var context = canvas.getContext('2d');

		props.r = props.r || 50; //radio de la circunferencia
		props.x = props.x || 100; //centro, coordenada x
		props.y = props.y || 100; //centro, coordenada y
		props.angleStart = props.angleStart || 0; //angulo de inicio
		props.angleEnd = props.angleEnd || 360; //angulo de inicio
		props.cclock = props.cclock || false; //se dibuja en el sentido de las agujas del reloj o al contrario
		props.fill = props.fill || '#ccc';
		props.borderWidth = props.borderWidth || 1;
		props.border = props.border || '#3ab';
		var x = props.x, y = props.y;

		context.save();

		//transforms
		if(props.scaleX !== undefined || props.scaleY !== undefined || props.rotation !== undefined){
			context.translate(props.x, props.y);
			x = 0; //props.r;
			y = 0; //props.r;

			if(props.scaleX !== undefined || props.scaleY !== undefined)
				JaSper.canvas.scale(canvas, props);
			if(props.rotation !== undefined)
				JaSper.canvas.rotate(canvas, props);
		}

		//bounding box, guarda la caja que contiene el objeto (como feedback cuando sea seleccionado)
		props.boundingBox = [x - props.r, y - props.r, props.r * 2, props.r * 2, x + props.r, y + props.r]; //[left, top, width, height, right, bottom]
		if(props.selected != undefined && props.selected) JaSper.canvas.boundingBox(canvas, props); //elemento seleccionado, se dibuja su caja

		context.beginPath();
		//context.arc(x, y, r, (Math.PI/180) * grados_inicio_de_arco, (Math.PI/180) * grados_fin_de_arco, counterclockwise);
		context.arc(x, y, props.r, (Math.PI/180) * props.angleStart, (Math.PI/180) * props.angleEnd, props.cclock);
		context.closePath();

		context.fillStyle = props.fill; //relleno
		context.strokeStyle = props.border; //borde
		context.lineWidth = props.borderWidth;

		context.stroke();
		context.fill();

		context.restore();

		props.boundingBox[0] = props.x - props.r;
		props.boundingBox[1] = props.y - props.r;
		return true;
	},

	/**
	 * Dibuja una imagen
	 * 
	 * @since 2014-12-27
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades
	 * @returns boolean
	 */
	image: function (canvas, props){
		if(!JaSper.canvas.valid(canvas))
			return false;
		var context = canvas.getContext('2d');

		props.x = props.x || 100; //centro, coordenada x
		props.y = props.y || 100; //centro, coordenada y
		props.src = props.src || 'http://sargazos.net/imgs/logo.png'; //origen de la imagen

		var oImg = new Image();
		oImg.onload = function() {
			//syntax : drawImage(img, x, y);
			context.drawImage(oImg, props.x, props.y);
		};
		oImg.src = props.src;

		return true;
	},

	/**
	 * Detecta que objeto (dentro de canvas) se ha pulsado
	 *
	 * Sobre una idea original de Dan Gries
	 * http://rectangleworld.com/blog/archives/15
	 * 
	 * @todo mejorar con http://en.wikipedia.org/wiki/Point_in_polygon
	 * @todo convertir en detector de colisiones, ademas de deteccion de clicks
	 * @since 2015-01-11
	 * @param objeto oItem Objeto a comprobar
	 * @param integer iMouseX Coordenada X del raton
	 * @param integer fMouseY Coordenada Y del raton
	 * @returns boolean
	 */
	mouseHit: function (oItem, iMouseX, iMouseY){
		if(oItem.selected){ //comprobar si se pulsa sobre un ancla
			var iRad = 5; //radio de anclas //TODO configurable por el usuario y por objeto?
			var aRotacion = [Math.abs(oItem.boundingBox[4] - iMouseX), Math.abs(oItem.boundingBox[1] - iMouseY)];
			var aNW = [Math.abs(oItem.boundingBox[0] - iMouseX), Math.abs(oItem.boundingBox[1] - iMouseY)];
			var aSE = [Math.abs(oItem.boundingBox[4] - iMouseX), Math.abs(oItem.boundingBox[5] - iMouseY)];

			if(aRotacion[0] < iRad && aRotacion[1] < iRad) return 'r'; //rotacion
			else if(aNW[0] < iRad && aNW[1] < iRad) return 'nw'; //superior izquierda
			else if(aSE[0] < iRad && aSE[1] < iRad) return 'se'; //inferior derecha
		}

		if(oItem.r){
			var dx = iMouseX - oItem.x;
			var dy = iMouseY - oItem.y;
			return ((dx * dx + dy * dy) < (oItem.r * oItem.r)); //distancia menor que el radio del objeto
		}
		else if(oItem.boundingBox){ //[x, y, width, height]
			var dx = (oItem.boundingBox[0] < iMouseX) && (iMouseX < (oItem.boundingBox[4]));
			var dy = (oItem.boundingBox[1] < iMouseY) && (iMouseY < (oItem.boundingBox[5]));
			return dx && dy; //hay pulsacion si las coordenas del raton estan dentro de la caja que rodea al objeto
		}

		return false; //no se puede detectar la posicion del click con respecto a la figura
	},

	/**
	 * Se presiona el raton sobre un objeto dentro de canvas
	 * 
	 * Sobre una idea original de Dan Gries
	 * http://rectangleworld.com/blog/archives/15
	 * 
	 * @since 2015-01-11
	 * @param ev
	 * @returns boolean
	 */
	mouseDown: function (ev){
		var canvas = JaSper.event.source(ev);
		if(!JaSper.canvas.valid(canvas))
			return false;

		JaSper(canvas).eventRemove('mousedown', JaSper.canvas.mouseDown);

		var bRect = canvas.getBoundingClientRect();
		var aItems = canvas.JaSperItems;
		var oItemSelected = undefined;

		var iDxClick = 0, iDyClick = 0; //diferencia entre el x, y del objeto y posicion donde se ha hecho click, para compensar el punto desde el que es "cogido"

		/**
		 * Se mueve el raton dentro de canvas
		 *
		 * @todo guardar la posicion del objeto donde se hace click para "sujetarlo" por esa posicion (no por el centro) al arrastrarlo
		 * @param ev
		 * @returns boolean
		 */
		var mouseMove = function (ev){
			if(!oItemSelected) return false; //ningun elemento seleccionado

			var iMouseX = (ev.clientX - bRect.left) * (canvas.width / bRect.width);
			var iMouseY = (ev.clientY - bRect.top) * (canvas.height / bRect.height);

			if(oItemSelected.dragging !== undefined && oItemSelected.dragging){
				if(oItemSelected.dragging == 'r'){ //rotacion
					var dx = Math.abs(oItemSelected.boundingBox[4] - iMouseX);
					var dy = Math.abs(oItemSelected.boundingBox[1] - iMouseY);
					var iRotacion = Math.sqrt(dx * dx + dy * dy); //distancia del centro del ancla a la posicion del raton
					oItemSelected.rotation = iRotacion;
				}
				else{
					oItemSelected.x = iMouseX - iDxClick;
					oItemSelected.y = iMouseY - iDyClick;
				}

				if(!canvas.JaSperItems.flags.animable) JaSper.canvas.redraw(canvas); //TODO borrar bounding box cuando no hay fondo
			}
			else if(oItemSelected.selected !== undefined && oItemSelected.selected){ //TODO simplificar calculos de deteccion
				if(oItemSelected.boundingBox){ //[x, y, width, height]
					var iRad = 5; //radio de anclas //TODO configurable por el usuario y por objeto? //ver canvasBoundginBox

					var iMouseXr = iMouseX; //posicion relativa del raton si hay rotacion de la caja
					var iMouseYr = iMouseY;

					//posiciones relativas de las esquinas de la caja si hay rotacion
					var aCaja = [oItemSelected.boundingBox[0], oItemSelected.boundingBox[1], oItemSelected.boundingBox[4], oItemSelected.boundingBox[5]]; //left, top, right, bottom

					if(oItemSelected.rotation){ //caja girada
						//calcula la posicion de un punto 'p[x, y]' girado 'angle' radianes, respecto a un centro origen 'o[x, y]'
						var puntoGirado = function(p, o, angle){
							var sin = Math.sin(angle), cos = Math.cos(angle);
							p[0] -= o[0];
							p[1] -= o[1];
							var rx = p[0] * cos - p[1] * sin,
								ry = p[0] * sin + p[1] * cos;
							return [parseInt(rx + o[0]), parseInt(ry + o[1])];
						};

						var fAngle = (oItemSelected.rotation > 360 ? Math.floor(oItemSelected.rotation % 360) : oItemSelected.rotation) * Math.PI / 180;
						var iCenterX = oItemSelected.boundingBox[0] + (oItemSelected.boundingBox[2] / 2);
						var iCenterY = oItemSelected.boundingBox[1] + (oItemSelected.boundingBox[3] / 2);

						var aPoint = puntoGirado([iMouseXr, iMouseYr], [iCenterX, iCenterY], fAngle);
						iMouseXr = aPoint[0];
						iMouseYr = aPoint[1];

						var aPointCaja = puntoGirado([aCaja[0], aCaja[1]], [iCenterX, iCenterY], fAngle);
						aCaja[0] = aPointCaja[0];aCaja[1] = aPointCaja[1];
						aPointCaja = puntoGirado([aCaja[2], aCaja[3]], [iCenterX, iCenterY], fAngle);
						aCaja[2] = aPointCaja[0];aCaja[3] = aPointCaja[1];
					}

					var aRotacion = [Math.abs(aCaja[2] - iMouseXr), Math.abs(aCaja[1] - iMouseYr)];
					var aNW = [Math.abs(aCaja[0] - iMouseXr), Math.abs(aCaja[1] - iMouseYr)];
					var aSE = [Math.abs(aCaja[2] - iMouseXr), Math.abs(aCaja[3] - iMouseYr)];

					//cursor: url(images/cursor.png) x y, auto;
					if(aRotacion[0] < iRad && aRotacion[1] < iRad) canvas.style.cursor = 'crosshair'; //rotacion
					else if(aNW[0] < iRad && aNW[1] < iRad) canvas.style.cursor = 'NW-resize'; //superior izquierda
					else if(aSE[0] < iRad && aSE[1] < iRad) canvas.style.cursor = 'SE-resize'; //inferior derecha
					else{
						var bHitx = (aCaja[0] < iMouseXr) && (iMouseXr < aCaja[2]);
						var bHity = (aCaja[1] < iMouseYr) && (iMouseYr < aCaja[3]);

						if(bHitx && bHity) canvas.style.cursor = 'pointer'; //bounding box
						else canvas.style.cursor = 'default';
					}
				}
			}

			return true;
		};

		/**
		 * Se suelta el raton
		 *
		 * @param ev
		 * @return boolean
		 */
		var mouseUp = function (ev){
			JaSper(window).eventRemove('mouseup', mouseUp);

			for(var item in aItems){
				if(aItems[item].dragging !== undefined && aItems[item].dragging){
					iDxClick = iDyClick = 0;
					aItems[item].dragging = false;
				}
			}

			if(!canvas.JaSperItems.flags.animable) JaSper.canvas.redraw(canvas);
			JaSper(canvas).eventAdd('mousedown', JaSper.canvas.mouseDown);
			canvas.style.cursor = 'default';
			return true;
		};

		//posicion correcta del raton, independiente de redimensionado del navegador
		var mouseX = (ev.clientX - bRect.left) * (canvas.width / bRect.width);
		var mouseY = (ev.clientY - bRect.top) * (canvas.height / bRect.height);

		var itemsKeys = Object.keys(aItems); //se comprueban en el orden de visualizacion, se hace click sobre el que este visible (mas arriba)
		hitTest: for(var cont = itemsKeys.length;cont >= 0;--cont){
			if(!aItems[itemsKeys[cont]] || !aItems[itemsKeys[cont]].drag) continue hitTest; //solo para elementos draggables

			var iHit = JaSper.canvas.mouseHit(aItems[itemsKeys[cont]], mouseX, mouseY); //devuelve si se ha pulsado en un objeto, su caja de seleccion o en sus arrastradores
			if(iHit){
				canvas.style.cursor = 'pointer';
				iDxClick = mouseX - aItems[itemsKeys[cont]].x;
				iDyClick = mouseY - aItems[itemsKeys[cont]].y;
				oItemSelected = aItems[itemsKeys[cont]];
				if(aItems[itemsKeys[cont]].selected){
					JaSper(window).eventRemove('mousemove', aItems[itemsKeys[cont]].mouseMove);
					delete(aItems[itemsKeys[cont]].mouseMove);
				}
				oItemSelected.mouseMove = mouseMove;
				JaSper(window).eventAdd('mousemove', oItemSelected.mouseMove); //conserva la llamada a la funcion como propiedad para poder eliminar posteriormente el evento; si la firma cambia no se puede eliminar el evento
				oItemSelected.selected = true;
				oItemSelected.dragging = iHit;
				//break;
			}
			else{ //deselecciona todos los elementos cuando se pulsa el raton; luego selecciona el correcto si corresponde
				if(aItems[itemsKeys[cont]].selected){
					JaSper(window).eventRemove('mousemove', aItems[itemsKeys[cont]].mouseMove);
					delete(aItems[itemsKeys[cont]].mouseMove);
				}
				aItems[itemsKeys[cont]].selected = false;
			}
		}

		canvas.JaSperItemSelected = oItemSelected;
		JaSper(window).eventAdd('mouseup', mouseUp);

		//JaSper.funcs.eventPreventDefault(ev);
		return false;
	},

	/**
	 * Mueve objetos en el canvas
	 * 
	 * @since 2015-01-06
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades
	 * @returns boolean
	 */
	move: function (canvas, props){
		if(!JaSper.canvas.valid(canvas))
			return false;

		if(!props.id || !canvas.JaSperItems[props.id])
			return false;

		var angle = props.angle || 0; //angulo del movimiento
		if(typeof props.angle === 'function')
			angle = props.angle.call(null); //callback

		var fRadianes = angle * Math.PI / 180;

		var speed = props.speed || 1; //velocidad, en pixels, del movimiento
		if(typeof props.speed === 'function')
			speed = props.speed.call(null); //callback

		canvas.JaSperItems[props.id].x += (Math.cos(fRadianes) * speed);
		canvas.JaSperItems[props.id].y += (Math.sin(fRadianes) * speed);

		return true;
	},

	/**
	 * Dibuja una forma a partir de una serie (array) de puntos
	 * 
	 * @since 2014-12-30
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades
	 * @returns boolean
	 */
	path: function (canvas, props){
		if(!JaSper.canvas.valid(canvas))
			return false;
		var context = canvas.getContext('2d');

		return true;
	},

	/**
	 * Dibuja un poligono cerrado de N lados
	 * centrado en x, y
	 * 
	 * @since 2014-12-19
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades
	 * @returns boolean
	 */
	polygon: function (canvas, props){
		if(!JaSper.canvas.valid(canvas))
			return false;
		var context = canvas.getContext('2d');

		props.sides = props.sides || 3; //numero de lados //TODO 0 -> circulo
		props.r = props.r || 50; //radio de la circunferencia para los vertices del poligono //TODO por defecto debe ser la media del alto y ancho del canvas o similar
		props.x = props.x || 0; //centro, coordenada x
		props.y = props.y || 0; //centro, coordenada y
		props.angle = props.angle || 0;
		props.cclock = props.cclock || false; //se dibuja en el sentido de las agujas del reloj o al contrario
		props.fill = props.fill || '#ccc';
		props.borderWidth = props.borderWidth || 1;
		props.border = props.border || '#3ab';
		var x = props.x, y = props.y;
		var fRadianes = props.angle * Math.PI / 180;

		context.save();

		//transforms
		if(props.scaleX !== undefined || props.scaleY !== undefined || props.rotation !== undefined){
			context.translate(props.x, props.y);
			x = 0;
			y = 0;

			if(props.scaleX !== undefined || props.scaleY !== undefined)
				JaSper.canvas.scale(canvas, props);
			if(props.rotation !== undefined)
				JaSper.canvas.rotate(canvas, props);
		}

		//bounding box, guarda la caja que contiene el objeto (como feedback cuando sea seleccionado)
		props.boundingBox = [x - props.r, y - props.r, props.r * 2, props.r * 2, x + props.r, y + props.r]; //[left, top, width, height, right, bottom]
		if(props.selected != undefined && props.selected) JaSper.canvas.boundingBox(canvas, props); //elemento seleccionado, se dibuja su caja

		context.beginPath(); //inicia el poligono

		//calcula las posiciones de los vertices y comienza el path
		context.moveTo(x + props.r * Math.sin(fRadianes), y - props.r * Math.cos(fRadianes));
		var delta = 2 * Math.PI / props.sides; //angulo entre vertices
		for(var i = 1;i < props.sides;i++){ //resto de vertices
			fRadianes += props.cclock ? -delta : delta; //angulo de este vertice
			context.lineTo(x + props.r * Math.sin(fRadianes), y - props.r * Math.cos(fRadianes)); //calcula la posicion del vertice y dibuja una linea hasta el
		}
		context.closePath(); //cierra el poligono

		context.fillStyle = props.fill; //relleno
		context.strokeStyle = props.border; //borde
		context.lineWidth = props.borderWidth;

		/*context.fillStyle = "green";
		context.fillRect(10, 10, 100, 100); //relleno
		context.strokeRect(50,50,50,50); //solo borde
		context.clearRect(45,45,60,60); //transparente*/

		context.fill(); //pinta el relleno
		context.stroke(); //pinta el borde

		context.restore();

		props.boundingBox[0] = props.x - props.r;
		props.boundingBox[1] = props.y - props.r;
		return true;
	},

	/**
	 * Redibujado de canvas (de todos los objetos definidos como tal)
	 * 
	 * @since 2015-01-05
	 * @param object canvas Objeto canvas a redibujar
	 * @returns boolean
	 */
	redraw: function (canvas){
		if(!JaSper.canvas.valid(canvas))
			return false;

		var items = canvas.JaSperItems, item = false;
		for(item in items){
			var JaSperFunc = JaSper.canvas[items[item].func];
			if(typeof JaSperFunc === 'function')
				JaSperFunc.call(null, canvas, items[item]); //TODO decidir que hacer con el retorno de la funcion
		}

		return true;
	},

	/**
	 * Gira objetos en el canvas
	 * 
	 * @since 2015-01-27
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades
	 * @returns boolean
	 */
	rotate: function (canvas, props){
		if(!JaSper.canvas.valid(canvas) || !props)
			return false;
		var context = canvas.getContext('2d');

		var angle = props.rotation || 0; //angulo del giro
		var fRadianes = angle * Math.PI / 180;

		//context.setTransform(1,0,0,1,0,0); //identity matrix
		context.rotate(fRadianes);

		return true;
	},

	/**
	 * Escala (cambia tamano) objetos
	 * 
	 * @since 2015-01-07
	 * @param object canvas Canvas object
	 * @param object props Propiedades
	 * @returns boolean
	 */
	scale: function (canvas, props){
		if(!JaSper.canvas.valid(canvas) || !props)
			return false;
		var context = canvas.getContext('2d');

		/*if(!props.id || !context.canvas.JaSperItems[props.id])
			return false;*/
		var scaleX = props.scaleX || 1; //TODO callbacks?
		var scaleY = props.scaleY || 1;

		//context.setTransform(1,0,0,1,0,0); //identity matrix
		context.scale(scaleX, scaleY); //x scale, y scale

		return true;
	},

	/**
	 * Dibuja texto
	 * 
	 * @since 2014-12-27
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades
	 * @returns boolean
	 */
	text: function (canvas, props){
		if(!JaSper.canvas.valid(canvas))
			return false;
		var context = canvas.getContext('2d');

		props.x = props.x || 100; //centro, coordenada x
		props.y = props.y || 100; //centro, coordenada y
		props.fillStyle = props.fillStyle || '#01f'; //color
		if(!props.font){
			props.fontItalic = props.fontItalic || 'italic';
			props.fontWeight = props.fontWeight || 'bold';
			props.fontSize = props.fontSize || '15pt';
			props.fontName = props.fontName || 'Tahoma';
			props.font = props.fontItalic + ' ' + props.fontWeight + ' ' + props.fontSize + ' ' + props.fontName;
		}
		props.fillText = props.fillText || 'Hello world!';
		var x = props.x, y = props.y;

		context.save();

		context.fillStyle = props.fillStyle;
		context.font = props.font;
		var iTextWidth = context.measureText(props.fillText).width;
		var iTextHeight = context.measureText('m').width; //FIXME solo funciona para una linea y no tiene en cuenta signos con mas altura

		//transforms
		if(props.scaleX !== undefined || props.scaleY !== undefined || props.rotation !== undefined){
			context.translate(props.x + (iTextWidth / 2), props.y - (iTextHeight / 2));
			x = -(iTextWidth / 2);
			y = (iTextHeight / 2);

			if(props.scaleX !== undefined || props.scaleY !== undefined)
				JaSper.canvas.scale(canvas, props);
			if(props.rotation !== undefined)
				JaSper.canvas.rotate(canvas, props);
		}

		context.fillText(props.fillText, x, y);

		//bounding box, guarda la caja que contiene el objeto (como feedback cuando sea seleccionado)
		//props.boundingBox = [x, y - iTextHeight, iTextWidth, iTextHeight]; //[x, y, width, height]
		props.boundingBox = [x, y - iTextHeight, iTextWidth, iTextHeight, x + iTextWidth, y]; //[left, top, width, height, right, bottom]
		if(props.selected != undefined && props.selected) JaSper.canvas.boundingBox(canvas, props); //elemento seleccionado, se dibuja su caja

		context.restore();

		props.boundingBox[0] = props.x;
		props.boundingBox[1] = props.y - iTextHeight;
		return true;
	},

	/**
	 * Comprueba si canvas es un objeto html5 canvas valido
	 *
	 * @todo mejorar deteccion
	 * @since 2015-01-11
	 * @returns boolean
	 */
	valid: function (canvas){
		if(typeof canvas !== 'object' || typeof canvas.getContext !== 'function'){
			JaSper.log('-JaSper::canvas.valid- el objeto no es canvas', 1);
			return false; //no hace nada para elementos que no sean canvas //TODO mejorar la comprobacion de soporte de canvas
		}

		return true;
	}

});

//devuelve un "animation loop" nativo de canvas, si existe, o un timeout a 60 fps; ambos usables para dibujar frames en una animacion
//ver JaSper.canvas.animate()
//debe ser un objeto global? [TypeError: 'requestAnimationFrame' called on an object that does not implement interface Window.]
/*window.JaSper_canvasRequestAnimationFrame = (function(){
	return window.requestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function (callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();*/

/*http://paulirish.com/2011/requestanimationframe-for-smart-animating/
http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

MIT license*/
(function(){
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x){
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
		|| window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if(!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element){
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	if(!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id){
			clearTimeout(id);
		};
}());