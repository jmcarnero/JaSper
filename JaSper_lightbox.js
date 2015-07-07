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

'use strict';

/**
 * Muestra detalle de imagenes en pantalla completa
 *
 * @author José M. Carnero
 * @since 2015-07-07
 * @version 1.0b
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * Detalle de imagenes
	 * Opciones:
	 *  origen -> donde encontrar la ruta a la imagen completa a mostrar, debe ser un "data-" del propio elemento, ej.: data-image="http://url.com/image.jpg", se recogeria con origen: 'data-image', o href de un a; se anula la accion por defecto
	 *  contenedor -> elemento contenedor de todas las imagenes que se vayan a mostrar
	 *
	 * @param {Object} oOps Opciones
	 * @return {Object} JaSper
	 */
	lightbox: function (oOps){
		oOps = oOps || {};
		oOps.origen = oOps.origen || 'href'; //"href" de un <a> (por defecto)

		if(!oOps.contenedor){
			oOps.contenedor = JaSper.nodo.crear('div' 
				, {className: 'JaSper_lightbox'
					, id: 'JaSper_lightbox'
					, title: 'JaSper Lightbox'
					, style: "display:none;background:rgba(221, 221, 221, 0.7) none repeat scroll 0 0;height:100%;left:0;position:fixed;text-align:center;top:0;width:100%;z-index:9999;"}
			, document.getElementsByTagName('body')[0]);
		}

		var aImgsSrc = []; //src's de las imagenes, para poder hacer carrusel con ellas

		//imagen dentro del contenedor, ira mostrando los distintos src
		var oImgStyle = 'height:auto;margin-top:2.5%;max-height:90%;max-width:90%;width:auto;'; //estilos por defecto para las imagenes
		var oImg = JaSper.nodo.crear('img', {className: 'JaSper_lightbox_img', alt: 'JaSper Lightbox image', src: '', style: oImgStyle});
		oOps.contenedor.appendChild(oImg);

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
		});

		this.eventAdd('click', function (ev){
			JaSper.event.preventDefault(ev); //evita que se siga un a cuando las imagenes a mostrar son las de href
			oImg.src = this.getAttribute(oOps.origen);
			oOps.contenedor.style.display = 'block'; //TODO hacer con toggle?
		}).each(function (){
			if(this.getAttribute(oOps.origen)){
				var sAttr = this.getAttribute(oOps.origen);
				if(aImgsSrc.indexOf(sAttr) < 0){ //no se guardan repetidas
					aImgsSrc[aImgsSrc.length] = sAttr;
				}
				/*var sSrc = this.getAttribute(oOps.origen); //se espera que sea una url de imagen valida
				var oImg = JaSper.nodo.crear('img', {className: 'JaSper_lightbox_img', alt: 'JaSper Lightbox image', src: sSrc, style: oImgStyle});
				oOps.contenedor.appendChild(oImg);*/
			}
		});

		return this;
	}

});
