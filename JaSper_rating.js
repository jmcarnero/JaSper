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

/*traducciones*/
JaSper.extend(JaSper.langs, {
	'en': {
		'rating_1': 'Without Javascript.',
		'rating_2': 'Id updated: %s, value: %s<br />Your vote: %s'
	},
	'es': {
		'rating_1': 'Sin Javascript.',
		'rating_2': 'Actualizada id: %s, con valor: %s<br />Tu voto: %s'
	}
});

/**
 * Funciones Rating (valoracion) para JaSper
 *
 * Crea barras o estrellas en los elementos seleccionados
 * Requiere "rating_stars.png" y "rating_styles.css"
 *
 * si la página no tiene "DOCTYPE" dara error en IE al intentar "this.innerHTML = outHtml;"
 * usar (por ej.) <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
 *
 * @author José M. Carnero
 * @version 1.0
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * Crea estrellas en el elemento seleccionado y los eventos necesarios para su funcionamiento
	 * La id del elemento contenedor se pasa por AJAX para ser guardada en base de datos con la puntuacion (o el tratamiento que quiera darsele)
	 *
	 * @param {object} properties Propiedades que recibira
	 * @return {object}
	 */
	rating: function (properties){
		'use strict';

		if(typeof properties !== 'object'){
			var properties = {};
		}

		properties.classPrefix = properties.classPrefix || 'JaSper_rating'; //prefijo para los nombres de las clases css; tambien se asigna esto como nombre de clase a todos los elementos seleccionados
		properties.classInactive = properties.classPrefix + (properties.classInactive || '_inactive'); //clase css para estrellas inactivas
		properties.classOver = properties.classPrefix + (properties.classOver || '_over'); //clase css para estrellas con el puntero encima (pero no marcadas)
		properties.classActive = properties.classPrefix + (properties.classActive || '_active'); //clase css para estrellas marcadas

		properties.total = properties.total || 5; //numero total de estrellas; 5 por defecto
		properties.size = properties.size || 30; //ancho (y alto de cada trozo de sprite) de la imagen de la estrella //TODO coger ancho automaticamente, de la imagen en la clase
		properties.rating = properties.rating || 0; //numero inicial de estrellas activadas
		properties.onClick = properties.onClick || false; //callback a ejecutar cuando se pulsa alguna estrella; dentro del callback this es el objeto pulsado, y tiene la propiedad "rating" con su valor

		this.each(function (props){
			if(!this.id){
				this.id = JaSper.funcs.genId();
			}
			if(this.className.indexOf(props.classPrefix) == -1){
				this.className += ' ' + properties.classPrefix;
				this.style.width = props.total * props.size; //TODO deberia fijarse el ancho del fondo repetido, no el del contenedor
			}

			var starIds = ''; //cadena con las id's de las estrellas generadas, se usa en los eventos //var starIds = '#' + this.id + '_rs_1,#' + this.id + '_rs_2,#' + this.id + '_rs_3,#' + this.id + '_rs_4,#' + this.id + '_rs_5';

			//alert(JaSper.funcs.getCSSRule('.rating_star').style.backgroundImage);
			//this.style.width = (props.total * 30) + 'px';

			var outHtml = ''; //HTML con las estrellas
			for(var idNum = 1; idNum <= props.total; idNum++){
				outHtml += '<div id="' + this.id + '_' + props.classPrefix + '_' + idNum + '" class="' + props.classInactive + '" style="margin:0 0 0 ' + ((idNum - 1) * props.size) + 'px;"></div>'; //el margen fuerza a que se coloquen en orden horizontal, //TODO hacer opcional la orientacion
				starIds += ('#' + this.id + '_' + props.classPrefix + '_' + idNum + ',');
			}
			starIds = starIds.substr(0, starIds.length - 1); //sobra la ultima coma
			this.innerHTML = outHtml;

			//var objCont = this; //no perder referencia al objeto contenedor en llamadas a eventos y demas
			var objContId = this.id + '_' + props.classPrefix + '_'; //id sin numero; comun a todos las estrellas

			//carga inicial de valores
			for(var j = 1; j <= props.total; j++){
				document.getElementById(objContId + j).className = (j <= props.rating) ? props.classActive : props.classInactive;
			}

			//evento de encima de estrellas
			JaSper(starIds).eventAdd('mouseover', function (){
				var idNum = this.id.substr(objContId.length); //parte numerica

				for(var j = 1; j <= idNum; j++){
					document.getElementById(objContId + j).className = props.classOver;
				}
			});

			//evento de salida de estrellas
			JaSper(starIds).eventAdd('mouseout', function (){
				var idNum = this.id.substr(objContId.length); //parte numerica

				for(var j = 1; j <= idNum; j++){
					document.getElementById(objContId + j).className = (j <= props.rating) ? props.classActive : props.classInactive;
				}
			});

			//evento de click en estrellas
			JaSper(starIds).eventAdd('click', function (){
				this.rating = this.id.substr(objContId.length); //parte numerica
				if(this.rating == props.rating){
					this.rating = props.rating = 0; //si se vuelve a pulsar el numero que ya estaba seleccionado se pone a cero el valor
				}
				props.rating = this.rating; //deja marcado el valor que se haya pulsado

				for(var j = 1; j <= props.total; j++){
					document.getElementById(objContId + j).className = (j <= this.rating) ? props.classActive : props.classInactive;
				}

				//dentro del callback this es el objeto pulsado, y tiene la propiedad "rating" con su valor
				if(typeof props.onClick === 'function'){
					props.onClick.call(this);
				}
			});

		}, [properties]);

		return this;
	},

	/**
	 * Rellena un div (parent_id) con 101 subdivs
	 * 
	 */
	/*ratingBars: function (parent_id, id){
		'use strict';

		var output = '';
		for(var i=0;i<=100;i++){
			output += '<div class="w4g_rb_global w4g_rb_col' + i + '" id="w4g_rb_id' + id + i + '" style="margin-left:' + i * 2 + 'px;"';
			output += ' onmouseover="ratingBarsUpdate(' + i + ', \'' + id + '\')"';
			output += ' onclick="user_rating' + id + '=' + i + ';query2page(\'' + id + '\', query_url' + id + '+\'&vote=' + i + '\',\'w4g_rb_area' + id + '\')"></div>';
		}
		document.getElementById(parent_id+id).innerHTML = output;
	},*/

	/**
	 * Cambia el color de los 101 subdivs creados con ratingBars
	 *
	 * @param int rating Ultimo div coloreado
	 */
	/*ratingBarsUpdate: function (rating, id){
		'use strict';

		var rating = rating || 50;

		for(var i=0;i <= 100;i++){
			var red = 250 - 5 * Math.max(0, i - 50);
			var green = Math.min(250, i * 5);
			var blue = 0;
			if(i <= rating) document.getElementById('w4g_rb_id' + id + i).style.backgroundColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
			else document.getElementById('w4g_rb_id' + id + i).style.backgroundColor = '#555555';
		}
		//document.getElementById('rating_text' + id).innerHTML = '&nbsp;' + rating + '%';
	},*/

});
