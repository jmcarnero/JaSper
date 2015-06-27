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
 * Animaciones de elementos DOM 
 *
 * @author José M. Carnero
 * @since 2015-05-15
 * @version 1b
 */
_JaSper.funcs.extend(_JaSper.prototype, {

	/**
	 * Alterna la propiedad display entre 'none' y visible
	 * 
	 * @param {string} oTipo Tipo de desvanecimiento: in (de invisible a visible), out (de visible a invisible)
	 * @param {number} iMiliSec Duracion del efecto en milisegundos
	 * @return {Object} JaSper
	 */
	fade: function (oTipo, iMiliSec){
		this.each(function (){
			return _JaSper.anim.fade(this, oTipo, iMiliSec);
		});

		return this;
	},

	/**
	 * Alterna la propiedad height entre '0' y alto inicial
	 * Poniendo la velocidad con transition css
	 * 
	 * @autor Alin Moraru
	 * @since 2015-06-23
	 * @todo resto de direcciones y punto de inicio
	 * @param {string} sTipo Tipo de slide: down (de arriba hacia abajo), up (de abajo hacia arriba)
	 * @param {number} iMiliSec velocidad animacion en milisegundos para transition
	 * @return {Object} JaSper
	 */
	slide: function (sTipo, iMiliSec){
		this.each(function (){
			return _JaSper.anim.slide(this, sTipo, iMiliSec);
		});

		return this;
	},

	/**
	 * Alterna la propiedad height entre '0' y alto inicial
	 * Poniendo la velocidad con transition css
	 * 
	 * @autor Alin Moraru
	 * @since 2015-06-23
	 * @param {number} iMiliSec velocidad animacion en milisegundos para transition
	 * @return {Object} JaSper
	 */
	slideToggle: function (iMiliSec){
		this.each(function (){
			//TODO deberia aceptar otros tipos de nodo?
			if(this.nodeType != 1) return; //solo nodos tipo ELEMENT_NODE

			var sActHeight = _JaSper.funcs.getStyle(this, 'height');
			sActHeight = sActHeight.replace('px', '');

			if(sActHeight == '0'){
				_JaSper.anim.slide(this, 'down', iMiliSec);
			}
			else{
				_JaSper.anim.slide(this, 'up', iMiliSec);
			}
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
		fade = fade || 0;
		if(fade) fade = parseInt(fade) || 200; //si no es entero el valor se toma 200 ms

		this.each(function (){
			//TODO deberia aceptar otros tipos de nodo?
			if(this.nodeType != 1) return; //solo nodos tipo ELEMENT_NODE

			var sActDisplay = _JaSper.funcs.getStyle(this, 'display');

			if(fade){
				var sTipoFade = sActDisplay == 'none' ? 'in' : 'out';
				return _JaSper.anim.fade(this, sTipoFade, fade);
			}
			else{
				_JaSper.anim.originalDisplay(this);

				if(sActDisplay != 'none' ) sActDisplay = 'none';
				else sActDisplay = this.originalDisplay;

				_JaSper.funcs.setStyle(this, 'display', sActDisplay);
			}
		});

		return this;
	}

});

_JaSper.anim = {};

_JaSper.funcs.extend(_JaSper.anim, {

	fade: function (oDOMElem, sTipo, iMiliSec, iIntervalo){
		if(oDOMElem.nodeType != 1) return false; //solo nodos tipo ELEMENT_NODE

		iMiliSec = iMiliSec || 300;
		iIntervalo = iIntervalo || 50;
		var bIn = (sTipo || 'in') === 'in', iOpacidad = bIn ? 0 : 1, iSalto = iIntervalo / iMiliSec;

		_JaSper.anim.originalDisplay(oDOMElem);

		if(bIn){
			oDOMElem.style.display = oDOMElem.originalDisplay;
			oDOMElem.style.opacity = iOpacidad;
		}

		var rDesvanece = window.setInterval(func, iIntervalo);

		function func() {
			iOpacidad = bIn ? iOpacidad + iSalto : iOpacidad - iSalto;
			oDOMElem.style.opacity = iOpacidad;

			if(iOpacidad <= 0)
				oDOMElem.style.display = 'none';
			if(iOpacidad <= 0 || iOpacidad >= 1)
				window.clearInterval(rDesvanece);
		}

		return true;
	},

	//busca y guarda el valor original de la propiedad display de un elemento, y lo guarda como propiedad del propio elemento
	originalDisplay: function (oDOMElem){
		if(!oDOMElem.originalDisplay){
			var sActDisplay = _JaSper.funcs.getStyle(oDOMElem, 'display');

			if(oDOMElem.style.display == 'none' || !oDOMElem.style.display){
				var oElem = document.createElement(oDOMElem.nodeName);
				JaSper(document.body).append(oElem);

				oDOMElem.originalDisplay = _JaSper.funcs.getStyle(oElem, 'display');

				JaSper(document.body).remove(oElem);
			}
			oDOMElem.originalDisplay = (oDOMElem.originalDisplay || (sActDisplay != 'none' ? sActDisplay : ''));
		}

		return;
	},

	slide: function (oDOMElem, sTipo, iMiliSec){
		if(oDOMElem.nodeType != 1) return false; //solo nodos tipo ELEMENT_NODE

		iMiliSec = iMiliSec || 0.3;
		var isDown = (sTipo || 'down') === 'down', sIniHeight = oDOMElem.scrollHeight;

		oDOMElem.style.transition = "all " + iMiliSec + "s";

		if(isDown)
			oDOMElem.style.height = sIniHeight + 'px';
		else
			oDOMElem.style.height = '0';

		return true;
	}

});
