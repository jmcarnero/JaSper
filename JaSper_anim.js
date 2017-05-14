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
 * Animaciones de elementos DOM
 *
 * @author José M. Carnero
 * @since 2015-05-15
 * @version 1.0
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * Alterna la propiedad display entre 'none' y visible
	 * 
	 * @param {string} oTipo Tipo de desvanecimiento: in (de invisible a visible), out (de visible a invisible)
	 * @param {number} iMiliSec Duracion del efecto en milisegundos
	 * @return {Object} JaSper
	 */
	fade: function (oTipo, iMiliSec){
		'use strict';

		this.each(function (){
			return JaSper.anim.fade(this, oTipo, iMiliSec);
		});

		return this;
	},

	/**
	 * Alterna la propiedad display entre 'none' y visible
	 * 
	 * @param {number} fade Tiempo en milisegundos del fade, si se pasa 0 no hace este efecto
	 * @return {Object} JaSper
	 */
	toggle: function (fade){
		'use strict';

		fade = fade || 0;
		if(fade){
			fade = parseInt(fade) || 200; //si no es entero el valor se toma 200 ms
		}

		this.each(function (){
			//TODO deberia aceptar otros tipos de nodo?
			if(this.nodeType != 1) return; //solo nodos tipo ELEMENT_NODE

			var sActDisplay = JaSper.css.getStyle(this, 'display');

			if(fade){
				var sTipoFade = sActDisplay == 'none' ? 'in' : 'out';
				return JaSper.anim.fade(this, sTipoFade, fade);
			}
			else{
				JaSper.css.original(this, 'display');

				if(sActDisplay != 'none' ) sActDisplay = 'none';
				else sActDisplay = JaSper.nodo.extend(this).css.original.display;

				JaSper.css.setStyle(this, 'display', sActDisplay);
			}
		});

		return this;
	}

});

JaSper.anim = {

	fade: function (oDOMElem, sTipo, iMiliSec, iIntervalo){
		'use strict';

		if(oDOMElem.nodeType != 1) return false; //solo nodos tipo ELEMENT_NODE

		iMiliSec = iMiliSec || 300;
		iIntervalo = iIntervalo || 50;
		var bIn = (sTipo || 'in') === 'in', iOpacidad = bIn ? 0 : 1/*, iSalto = iIntervalo / iMiliSec*/;

		JaSper.css.original(oDOMElem, 'display');
		//JaSper.css.original(oDOMElem, 'fontSize');

		if(bIn){
			oDOMElem.style.display = JaSper.nodo.extend(oDOMElem).css.original.display;

			if(oDOMElem.filters !== undefined) //IE <= 8
				oDOMElem.filters.item("DXImageTransform.Microsoft.Alpha").opacity = iOpacidad * 100;
			else
				oDOMElem.style.opacity = iOpacidad;
		}

		var bFin = JaSper.time.interval({
			intervalo: iIntervalo,
			duracion: iMiliSec,
			accion: function(fDelta){
				var iOpacidad = bIn ? fDelta : 1 - fDelta;
		
				if(oDOMElem.filters !== undefined)
					oDOMElem.filters.item("DXImageTransform.Microsoft.Alpha").opacity = iOpacidad * 100;
				else
					oDOMElem.style.opacity = iOpacidad;
		
				//oDOMElem.style.fontSize = iOpacidad * parseFloat(JaSper.nodo.extend(oDOMElem).css.original.fontSize); //TODO corregir, el cambio de fontSize afectara a todos los elementos contenidos en oDOMElem, que no nocesariamente tendran el mismo tamaño de texto

				if(iOpacidad <= 0)
					oDOMElem.style.display = 'none';
			}
		});

		return bFin;
	},

	/**
	 * @todo resto de direcciones y punto de inicio
	 * @todo alternativa a transition (es CSS3)
	 */
	/*slide: function (oDOMElem, sTipo, iMiliSec){
		'use strict';

		if(oDOMElem.nodeType != 1) return false; //solo nodos tipo ELEMENT_NODE

		iMiliSec = iMiliSec || 0.3;
		var isDown = (sTipo || 'down') === 'down', sIniHeight = oDOMElem.scrollHeight;

		oDOMElem.style.transition = "all " + iMiliSec + "s";

		if(isDown)
			oDOMElem.style.height = sIniHeight + 'px';
		else
			oDOMElem.style.height = '0';

		return true;
	}*/

};

JaSper.extend(JaSper.css, {

	/**
	 * Devuelve si la propiedad CSS sProp esta disponible en el navegador
	 * ej.: JaSper.css.isValid('transition')
	 *
	 * De una idea original de https://gist.github.com/jackfuchs/556448
	 * 
	 * @param {string} sProp Nombre de la propiedad a comprobar
	 * @return {bool}
	 */
	isValid: function (sProp){
		'use strict';

		var oStyle = (document.body || document.documentElement).style;

		if(typeof oStyle[sProp] == 'string'){
			return true;
		}

		var aVars = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
		sProp = sProp.charAt(0).toUpperCase() + sProp.substr(1);

		for(var i=0; i < aVars.length; i++){
			if(typeof oStyle[aVars[i] + sProp] == 'string')
				return true;
		}

		return false;
	}

});
