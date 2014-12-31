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
	 * Manipulacion de HTML5 Canvas
	 *
	 * @since 2014-12-28
	 * @param object
	 * @return object
	 */
	canvas: function (){

		var callFuncs = function (jasperObj, props){
			jasperObj.each(function (){
				if(this.nodeName.toLowerCase() != 'canvas'){
					JaSper.funcs.log('-JaSper::canvas.callFuncs- el objeto no es canvas', 1);
					return false; //no hace nada para elementos que no sean canvas //TODO mejorar la comprobacion de soporte de canvas
				}

				var context = this.getContext('2d');

				if(this.JaSperItems == undefined)
					this.JaSperItems = [];

				if(props.id == undefined || props.id === false){
					props.id =  this.JaSperItems.length;
				}
				//cada elemento de este array debe guardar todo lo necesario para volver a pintarlo si fuera necesario
				this.JaSperItems[props.id] = props;

				//props = context.canvas.JaSperItems[id];

				var JaSperFunc = JaSper.funcs[props.func];
				if(typeof JaSperFunc === 'function')
					return JaSperFunc.call(null, context, props);

				return false;
			}, props);
		};

		//metodos llamables
		var validFuncs = {'animate': 'canvasAnimate', 'circle': 'canvasCircle', 'image': 'canvasImage', 'path': 'canvasPath', 'polygon': 'canvasPolygon', 'text': 'canvasText'};

		for(var arg in arguments){
			var func = false;
			try{
				func = Object.keys(arguments[arg])[0];
			}
			catch(ex){}

			if(func !== false && validFuncs[func] !== undefined){
				arguments[arg][func].func = validFuncs[func]; //incluye el nombre de la funcion (que se guardara como parte de las propiedades del item) para posteriores usos
				callFuncs(this, arguments[arg][func]);
			}
			else{
				JaSper.funcs.log('-JaSper::canvas- submetodo desconocido: ' + arguments[arg], 2);
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
	 * @return boolean
	 */
	animateCanvas: function (){
	}

});

JaSper.funcs.extend(JaSper.funcs, {

	//anima un canvas (tendra que hacerlo el metodo de redibujado), llamando a esta misma funcion a intervalos regulares (cada frame se redibuja)
	canvasAnimate: function (){
		JaSper.funcs.canvasRequestAnimationFrame(JaSper.funcs.canvasAnimate());
		JaSper.funcs.canvasRedraw();


		//devolver la posicion del raton cuando se hace click en el canvas
		/*this.addEventListener('click',function(evt){
			alert(evt.clientX + ',' + evt.clientY);
			},false);*/
	},

	/**
	 * Dibuja un circulo
	 *
	 * @since 2014-11-27
	 * @param object context Canvas context
	 * @param object props Propiedades del circulo
	 * @return boolean
	 */
	canvasCircle: function (context, props){
		if(!context || !context.canvas) return false;

		props.r = props.r || 50; //radio de la circunferencia
		props.x = props.x || 100; //centro, coordenada x
		props.y = props.y || 100; //centro, coordenada y
		props.angleStart = props.angleStart || 0; //angulo de inicio
		props.angleEnd = props.angleEnd || 360; //angulo de inicio
		props.cclock = props.cclock || false; //se dibuja en el sentido de las agujas del reloj o al contrario
		props.fill = props.fill || '#ccc';
		props.borderWidth = props.borderWidth || 1;
		props.border = props.border || '#3ab';

		context.beginPath();
		//context.arc(x, y, r, (Math.PI/180) * grados_inicio_de_arco, (Math.PI/180) * grados_fin_de_arco, counterclockwise);
		context.arc(props.x, props.y, props.r, (Math.PI/180) * props.angleStart, (Math.PI/180) * props.angleEnd, props.cclock);
		context.closePath();

		context.fillStyle = props.fill; //relleno
		context.strokeStyle = props.border; //borde
		context.lineWidth = props.borderWidth;

		context.stroke();
		context.fill();

		return true;
	},

	/**
	 * Dibuja una imagen
	 * 
	 * @since 2014-12-27
	 * @param object context Canvas context
	 * @param object props Propiedades
	 * @return boolean
	 */
	canvasImage: function (context, props){
		if(!context || !context.canvas) return false;

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
	 * Dibuja una forma a partir de una serie (array) de puntos
	 * 
	 * @since 2014-12-30
	 * @param object context Canvas context
	 * @param object props Propiedades
	 * @return boolean
	 */
	canvasPath: function (context, props){
		if(!context || !context.canvas) return false;

		return true;
	},

	//devuelve un "animation loop" nativo de canvas, si existe, o un timeout ciclico; ambos usables para dibujar frames en una animacion
	//ver JaSper.funcs.canvasAnimate()
	//debe ser un objeto global? [TypeError: 'requestAnimationFrame' called on an object that does not implement interface Window.]
	canvasRequestAnimationFrame: (
		window.requestAnimationFrame 
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function (callback){
				window.setTimeout(callback, 15);
			}
	),

	/**
	 * Dibuja un poligono cerrado de N lados
	 * centrado en x, y
	 * 
	 * @since 2014-12-19
	 * @param object context Canvas context
	 * @param object props Propiedades
	 * @return boolean
	 */
	canvasPolygon: function (context, props){
		if(!context || !context.canvas) return false;

		props.sides = props.sides || 3; //numero de lados //TODO 0 -> circulo
		props.r = props.r || 50; //radio de la circunferencia para los vertices del poligono //TODO por defecto debe ser la media del alto y ancho del canvas o similar
		props.x = props.x || 100; //centro, coordenada x
		props.y = props.y || 100; //centro, coordenada y
		props.angle = props.angle || 0; //
		props.cclock = props.cclock || false; //se dibuja en el sentido de las agujas del reloj o al contrario
		props.fill = props.fill || '#ccc';
		props.borderWidth = props.borderWidth || 1;
		props.border = props.border || '#3ab';

		context.beginPath(); //inicia el poligono

		//calcula las posiciones de los vertices y comienza el path
		context.moveTo(props.x + props.r * Math.sin(props.angle), props.y - props.r * Math.cos(props.angle));
		var delta = 2 * Math.PI / props.sides; //angulo entre vertices
		for(var i = 1;i < props.sides;i++){ //resto de vertices
			props.angle += props.cclock ? -delta : delta; //angulo de este vertice
			context.lineTo(props.x + props.r * Math.sin(props.angle), props.y - props.r * Math.cos(props.angle)); //calcula la posicion del vertice y dibuja una linea hasta el
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
	
		return true;
	},

	/**
	 * Dibuja texto
	 * 
	 * @since 2014-12-27
	 * @param object context Canvas context
	 * @param object props Propiedades
	 * @return boolean
	 */
	canvasText: function (context, props){
		if(!context || !context.canvas) return false;

		props.x = props.x || 100; //centro, coordenada x
		props.y = props.y || 100; //centro, coordenada y
		props.fillStyle = props.fillStyle || '#ccc'; //color
		if(!props.font){
			props.fontItalic = props.fontItalic || 'italic';
			props.fontWeight = props.fontWeight || 'bold';
			props.fontSize = props.fontSize || '35pt';
			props.fontName = props.fontName || 'Tahoma';
			props.font = props.fontItalic + ' ' + props.fontWeight + ' ' + props.fontSize + ' ' + props.fontName;
		}
		props.fillText = props.fillText || 'Hello world!';

		context.fillStyle = "red";
		context.font = "italic   ";
		context.fillText(props.fillText, props.x, props.y);

		return true;
	}
});
