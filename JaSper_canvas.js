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

JaSper.funcs.extend(JaSper.prototype, {
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
				if(!JaSper.funcs.canvasValid(this))
					return false;

				//'animable' bandera que indica si se esta animando este canvas
				//'draggable' bandera que indica si este elemento tiene elementos arrastrables
				if(this.JaSperItems === undefined)
					this.JaSperItems = [];
				this.JaSperItems.flags = this.JaSperItems.flags || {};
				this.JaSperItems.flags.animable = this.JaSperItems.flags.animable || false; //bandera que indica si se esta animando este canvas
				this.JaSperItems.flags.draggable = this.JaSperItems.flags.draggable || false; //bandera que indica si este elemento tiene elementos arrastrables

				//cada elemento de este array debe guardar todo lo necesario para volver a pintarlo si fuera necesario
				this.JaSperItems[props.id] = props; //cada elemento tiene como nombre su id, y sus propiedades como un objeto

				var JaSperFunc = JaSper.funcs[props.func];
				if(typeof JaSperFunc === 'function'){
					if(props.drag != undefined && props.drag && !this.JaSperItems.flags.draggable){ //este elemento es arrastrable con el raton
						this.JaSperItems.flags.draggable = true;
						_JaSper(this).eventAdd('mousedown', JaSper.funcs.canvasMouseDown);
					}
					return JaSperFunc.call(null, this, props);
				}

				return false;
			}, props);
		};

		//metodos disponibles
		var validFuncs = {'background': 'canvasBackground', 'circle': 'canvasCircle', 'image': 'canvasImage', 'path': 'canvasPath', 'polygon': 'canvasPolygon', 'text': 'canvasText'};

		for(var arg in arguments){
			var id = false;
			try{
				id = Object.keys(arguments[arg])[0];
			}
			catch(ex){}

			if(id !== false && arguments[arg][id].func !== undefined){
				if(validFuncs[arguments[arg][id].func] !== undefined){
					arguments[arg][id].func = validFuncs[arguments[arg][id].func]; //se pone el nombre correcto de la funcion si se ha llamado a la abreviada
				}
				arguments[arg][id].id = id; //comodidad para siguientes usos
				callFuncs(this, arguments[arg][id]);
			}
			else{
				JaSper.funcs.log('-JaSper::canvas- id de objeto invalida', 2);
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
				JaSper.funcs.log('-JaSper::animate- el objeto no es canvas', 1);
				return false; //no hace nada para elementos que no sean canvas //TODO mejorar la comprobacion de soporte de canvas
			}

			this.JaSperItems.flags.animable = true; //bandera que indica que se esta animando este canvas
			return JaSper.funcs.canvasAnimate(this, args);
		}, args);

		return this;
	}

});

JaSper.funcs.extend(JaSper.funcs, {

	//anima un canvas, llamando a esta misma funcion a intervalos regulares (cada frame se redibuja)
	//TODO finalizar la animacion cuando no haya nada que animar (todos quietos o fuera y sin vuelta) //canvas.JaSperItems.flags.animable = false;
	canvasAnimate: function (canvas, props){
		if(!JaSper.funcs.canvasValid(canvas))
			return false;

		window.requestAnimationFrame(function(){
			JaSper.funcs.canvasAnimate(canvas, props);
		});

		var callFuncs = function (canvasObj, callProps){
			var JaSperFunc = JaSper.funcs[callProps.func];
			if(typeof JaSperFunc === 'function')
				return JaSperFunc.call(null, canvasObj, callProps);

			return false;
		};

		//metodos disponibles
		var validFuncs = {'move': 'canvasMove', 'scale': false};

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
							JaSper.funcs.log('-JaSper::canvasAnimate- submetodo desconocido: ' + func, 2);
							return false;
					}
				}
			}
			else{
				JaSper.funcs.log('-JaSper::canvasAnimate- submetodo desconocido: ' + props[pr], 2);
				return false;
			}
		}

		JaSper.funcs.canvasRedraw(canvas);
	},

	/**
	 * Fondo; color, degradado, imagen, ...
	 * 
	 * @since 2015-01-07
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades del objeto
	 * @returns boolean
	 */
	canvasBackground: function (canvas, props){
		if(!JaSper.funcs.canvasValid(canvas))
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
	 * Dibuja un circulo
	 *
	 * @since 2014-11-27
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades del circulo
	 * @returns boolean
	 */
	canvasCircle: function (canvas, props){
		if(!JaSper.funcs.canvasValid(canvas))
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
		if(props.scaleX !== undefined || props.scaleY !== undefined){
			context.translate(props.x, props.y);
			x = props.r;
			y = props.r;
			JaSper.funcs.canvasScale(canvas, props);
		}

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
	 * @param shape
	 * @param mx
	 * @param my
	 * @returns boolean
	 */
	canvasHitTest: function (shape, mx, my){
		var dx = mx - shape.x;
		var dy = my - shape.y;

		//a "hit" will be registered if the distance away from the center is less than the radius of the circular object
		return ((dx * dx + dy * dy) < (shape.r * shape.r));
	},

	/**
	 * Dibuja una imagen
	 * 
	 * @since 2014-12-27
	 * @param object canvas Objeto canvas
	 * @param object props Propiedades
	 * @returns boolean
	 */
	canvasImage: function (canvas, props){
		if(!JaSper.funcs.canvasValid(canvas))
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
	 * Se presiona el raton sobre un objeto dentro de canvas
	 * 
	 * Sobre una idea original de Dan Gries
	 * http://rectangleworld.com/blog/archives/15
	 * 
	 * @since 2015-01-11
	 * @param ev
	 * @returns boolean
	 */
	canvasMouseDown: function(ev){
		var canvas = JaSper.funcs.eventSource(ev);
		if(!JaSper.funcs.canvasValid(canvas))
			return false;

		_JaSper(canvas).eventRemove('mousedown', JaSper.funcs.canvasMouseDown);

		//getting mouse position correctly, being mindful of resizing that may have occured in the browser:
		var bRect = canvas.getBoundingClientRect();
		var mouseX = (ev.clientX - bRect.left) * (canvas.width / bRect.width);
		var mouseY = (ev.clientY - bRect.top) * (canvas.height / bRect.height);

		var items = canvas.JaSperItems;
		var itemsKeys = Object.keys(items); //se comprueban en el orden de visualizacion, se hace click sobre el que este visible (mas arriba)
		for(var cont = itemsKeys.length;cont >= 0;--cont){
			if(!items[itemsKeys[cont]] || !items[itemsKeys[cont]].drag) continue; //solo para elementos draggables

			if(JaSper.funcs.canvasHitTest(items[itemsKeys[cont]], mouseX, mouseY)){
				items[itemsKeys[cont]].dragging = true;
				_JaSper(window).eventAdd('mousemove', JaSper.funcs.canvasMouseMove);
				break;
			}
		}

		_JaSper(window).eventAdd('mouseup', JaSper.funcs.canvasMouseUp);

		JaSper.funcs.eventPreventDefault(ev);
		return false;
	},

	/**
	 * Se mueve el raton dentro de canvas
	 *
	 * Sobre una idea original de Dan Gries
	 * http://rectangleworld.com/blog/archives/15
	 *
	 * @since 2015-01-11
	 * @param ev
	 * @returns boolean
	 */
	canvasMouseMove: function (ev){
		var canvas = JaSper.funcs.eventSource(ev);
		if(!JaSper.funcs.canvasValid(canvas))
			return false;

		var items = canvas.JaSperItems, item = false;
		for(var it in items){
			if(items[it].dragging !== undefined && items[it].dragging){
				item = it;
				break;
			}
		};

		var bRect = canvas.getBoundingClientRect();
		var mouseX = (ev.clientX - bRect.left) * (canvas.width / bRect.width);
		var mouseY = (ev.clientY - bRect.top) * (canvas.height / bRect.height);

		items[item].x = mouseX;
		items[item].y = mouseY;

		if(!canvas.JaSperItems.flags.animable) JaSper.funcs.canvasRedraw(canvas);
	},

	/**
	 * Se suelta el raton
	 *
	 * Sobre una idea original de Dan Gries
	 * http://rectangleworld.com/blog/archives/15
	 *
	 * @since 2015-01-11
	 * @param ev
	 */
	canvasMouseUp: function (ev){
		var canvas = JaSper.funcs.eventSource(ev);
		if(!JaSper.funcs.canvasValid(canvas))
			return false;

		_JaSper(window).eventRemove('mouseup', JaSper.funcs.canvasMouseUp);

		var items = canvas.JaSperItems;
		for(var item in items){
			if(items[item].dragging !== undefined && items[item].dragging){
				items[item].dragging = false;
				_JaSper(window).eventRemove('mousemove', JaSper.funcs.canvasMouseMove);
			}
		}

		_JaSper(canvas).eventAdd('mousedown', JaSper.funcs.canvasMouseDown);
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
	canvasMove: function (canvas, props){
		if(!JaSper.funcs.canvasValid(canvas))
			return false;

		if(!props.id || !canvas.JaSperItems[props.id])
			return false;

		var angle = props.angle || 0; //angulo del movimiento
		if(typeof props.angle === 'function')
			angle = props.angle.call(null); //callback

		var radianes = angle * Math.PI / 180;

		var speed = props.speed || 1; //velocidad, en pixels, del movimiento
		if(typeof props.speed === 'function')
			speed = props.speed.call(null); //callback

		canvas.JaSperItems[props.id].x += (Math.cos(radianes) * speed);
		canvas.JaSperItems[props.id].y += (Math.sin(radianes) * speed);

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
	canvasPath: function (canvas, props){
		if(!JaSper.funcs.canvasValid(canvas))
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
	canvasPolygon: function (canvas, props){
		if(!JaSper.funcs.canvasValid(canvas))
			return false;
		var context = canvas.getContext('2d');

		props.sides = props.sides || 3; //numero de lados //TODO 0 -> circulo
		props.r = props.r || 50; //radio de la circunferencia para los vertices del poligono //TODO por defecto debe ser la media del alto y ancho del canvas o similar
		props.x = props.x || 0; //centro, coordenada x
		props.y = props.y || 0; //centro, coordenada y
		props.angle = props.angle || 0; //
		props.cclock = props.cclock || false; //se dibuja en el sentido de las agujas del reloj o al contrario
		props.fill = props.fill || '#ccc';
		props.borderWidth = props.borderWidth || 1;
		props.border = props.border || '#3ab';
		var x = props.x, y = props.y;

		context.save();

		//transforms
		if(props.scaleX !== undefined || props.scaleY !== undefined){
			context.translate(props.x, props.y);
			x = props.r;
			y = props.r;
			JaSper.funcs.canvasScale(canvas, props);
		}

		context.beginPath(); //inicia el poligono

		//calcula las posiciones de los vertices y comienza el path
		context.moveTo(x + props.r * Math.sin(props.angle), y - props.r * Math.cos(props.angle));
		var delta = 2 * Math.PI / props.sides; //angulo entre vertices
		for(var i = 1;i < props.sides;i++){ //resto de vertices
			props.angle += props.cclock ? -delta : delta; //angulo de este vertice
			context.lineTo(x + props.r * Math.sin(props.angle), y - props.r * Math.cos(props.angle)); //calcula la posicion del vertice y dibuja una linea hasta el
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
		return true;
	},

	/**
	 * Redibujado de canvas (de todos los objetos definidos como tal)
	 * 
	 * @since 2015-01-05
	 * @param object canvas Objeto canvas a redibujar
	 * @returns boolean
	 */
	canvasRedraw: function (canvas){
		if(!JaSper.funcs.canvasValid(canvas))
			return false;

		var items = canvas.JaSperItems, item = false;
		for(item in items){
			var JaSperFunc = JaSper.funcs[items[item].func];
			if(typeof JaSperFunc === 'function')
				JaSperFunc.call(null, canvas, items[item]); //TODO decidir que hacer con el retorno de la funcion
		}

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
	canvasScale: function (canvas, props){
		if(!JaSper.funcs.canvasValid(canvas))
			return false;
		var context = canvas.getContext('2d');

		if(!props)
			var props = {};

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
	canvasText: function (canvas, props){
		if(!JaSper.funcs.canvasValid(canvas))
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

		//transforms
		if(props.scaleX !== undefined || props.scaleY !== undefined){
			context.translate(props.x, props.y);
			x = props.r;
			y = props.r;
			JaSper.funcs.canvasScale(canvas, props);
		}

		context.fillStyle = props.fillStyle;
		context.font = props.font;
		context.fillText(props.fillText, x, y);

		context.restore();
		return true;
	},

	/**
	 * Comprueba si canvas es un objeto html5 canvas valido
	 *
	 * @todo mejorar deteccion
	 * @since 2015-01-11
	 * @returns boolean
	 */
	canvasValid: function (canvas){
		if(typeof canvas !== 'object' || typeof canvas.getContext !== 'function'){
			JaSper.funcs.log('-JaSper::canvasValid- el objeto no es canvas', 1);
			return false; //no hace nada para elementos que no sean canvas //TODO mejorar la comprobacion de soporte de canvas
		}

		return true;
	}

});

//devuelve un "animation loop" nativo de canvas, si existe, o un timeout a 60 fps; ambos usables para dibujar frames en una animacion
//ver JaSper.funcs.canvasAnimate()
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