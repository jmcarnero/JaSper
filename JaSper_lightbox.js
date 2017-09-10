/*Copyright (C) 2015 José M. Carnero <jm_carnero@sargazos.net>

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
 * Muestra detalle de imagenes en pantalla completa
 *
 * @author José M. Carnero
 * @since 2015-07-07
 * @version 1.2
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * Detalle de imagenes
	 * Opciones:
	 *  contenedor -> elemento contenedor de todas las imagenes que se vayan a mostrar; por omision se crea (si no existe) un <div id="JaSper_lightbox" class="JaSper_lightbox" />
	 *  descripcion -> Texto descriptivo de la imagen, por omision se toma su "title"
	 *  exif -> Callback donde recuperar datos EXIF de la imagen //TODO
	 *  origen -> donde encontrar la ruta a la imagen completa a mostrar, debe ser un "data-" del propio elemento, ej.: data-image="http://url.com/image.jpg", se recogeria con origen: 'data-image', o href de un a (por omision); se anula la accion por defecto
	 *  pie -> Pie de imagen, por omision se toma su "alt"
	 *
	 * "descripcion", "origen" y "pie" pueden ser callbacks que devuelvan la cadena de texto a usar
	 *
	 * @param {Object} oOps Opciones
	 * @return {Object} JaSper
	 */
	lightbox: function (oOps){
		'use strict';

		oOps = oOps || {};
		oOps.origen = oOps.origen || 'href'; //"href" de un <a> (por defecto)
		oOps.pie = oOps.pie || 'alt'; //atributo a tomar como pie de la imagen
		oOps.descripcion = oOps.descripcion || 'title'; //atributo para descripcion larga
		oOps.exif = oOps.exif || null; //callback que devuelve los datos EXIF

		if(!oOps.contenedor && !document.getElementById('JaSper_lightbox')){
			oOps.contenedor = JaSper.nodo.crear('div',
				{className: 'JaSper_lightbox',
					id: 'JaSper_lightbox',
					title: 'JaSper Lightbox',
					style: 'display:none;flex-direction:column;align-items:center;position:fixed;left:0px;top:0px;height:100%;width:100%;text-align:center;z-index:999999;background:rgba(221, 221, 221, 0.7) none repeat scroll 0px 0px;'} //display:flex;
				, document.getElementsByTagName('body')[0]);
		}

		var aImgsSrc = []; //src's de las imagenes, para poder hacer carrusel con ellas
		var aImgsSrcExt = []; //titulo y descripcion de las imagenes; debe tener los mismos indices que aImgsSrc

		//imagen dentro del contenedor, ira mostrando los distintos src
		var oImg = JaSper.nodo.crear('img', {
			className: 'JaSper_lightbox_img',
			alt: 'JaSper Lightbox image',
			src: '',
			style: 'max-height:90%;max-width:90%;margin:auto;cursor:pointer;' //estilos por defecto para las imagenes
		});
		oOps.contenedor.appendChild(oImg);

		//elemento donde mostrar pie de imagen y descripcion
		var oPie = JaSper.nodo.crear('p', {
			className: 'JaSper_lightbox_img_p',
			style: 'display:none;' //solo se mostrara si hay texto
		});

		oOps.contenedor.appendChild(oPie);

		var fPie = function (oObj){ //actualiza la informacion del pie de foto con los atributos indicados
			if(oObj.pie){
				oPie.innerHTML = '<strong>' + oObj.pie.toString() + '</strong>';
				if(oObj.desc){
					oPie.innerHTML += '<br /><span>' + oObj.desc.toString() + '</span>';
				}
				oPie.style.display = 'block';
			}
			else{
				oPie.style.display = 'none';
				oPie.innerHTML = '';
			}
		};

		//click sobre el contenedor a la vista lo cierra
		JaSper.event.add(oOps.contenedor, 'click', function (ev){
			this.style.display = 'none'; //TODO hacer con toggle?
		});

		//click sobre la imagen, de momento va cambiando (en rotacion) de derecha a izquierda las que haya
		JaSper.event.add(oImg, 'click', function (ev){
			JaSper.event.stop(ev);
			var sSrcAct = this.src;
			var iPos = aImgsSrc.indexOf(sSrcAct) + 1;
			if(iPos >= aImgsSrc.length){ //final de array, se muestra la primera (rotacion)
				iPos = 0;
			}
			this.src = aImgsSrc[iPos];

			fPie({
				pie: aImgsSrcExt[iPos].tit || '',
				desc: aImgsSrcExt[iPos].desc || ''
			});
		});

		this.eventAdd('click', function (ev){
			JaSper.event.preventDefault(ev); //evita que se siga un <a> cuando las imagenes a mostrar son las de href
			oImg.src = (JaSper.funcs.isFunction(oOps.origen)) ? oOps.origen.call(this) : this.getAttribute(oOps.origen);

			fPie({
				pie: (JaSper.funcs.isFunction(oOps.pie)) ? oOps.pie.call(this) : this.getAttribute(oOps.pie),
				desc: (JaSper.funcs.isFunction(oOps.descripcion)) ? oOps.descripcion.call(this) : this.getAttribute(oOps.descripcion)
			});

			oOps.contenedor.style.display = 'flex'; //TODO hacer con toggle?
		}).each(function (){
			var sAttr = JaSper.funcs.isFunction(oOps.origen) ? oOps.origen.call(this) : this.getAttribute(oOps.origen);
			if(sAttr){
				if(aImgsSrc.indexOf(sAttr) < 0){ //no se guardan repetidas
					oImg.src = sAttr; //si la ruta en codigo es relativa al asignarla al atributo src se convierte en absoluta, al hacer click en la imagen en lightbox no funciona la rotacion de imagenes al no coincidir "aImgsSrc.indexOf(sSrcAct)"
					aImgsSrcExt[aImgsSrc.length] = {
						tit: JaSper.funcs.isFunction(oOps.pie) ? oOps.pie.call(this) : this.getAttribute(oOps.pie),
						desc: JaSper.funcs.isFunction(oOps.descripcion) ? oOps.descripcion.call(this) : this.getAttribute(oOps.descripcion)
					};
					aImgsSrc[aImgsSrc.length] = oImg.src;
				}
				oImg.src = '';
			}
		});

		return this;
	}

});
