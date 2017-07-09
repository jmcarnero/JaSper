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
'es':{
	'Background Color': 'Color de fondo',
	'Bold': 'Negrita',
	'Center Align': 'Centrado',
	'Copy': 'Copiar',
	'Cut': 'Cortar',
	'Font Size': 'Tamaño de fuente',
	'Font Family': 'Fuente',
	'Font Format': 'Formato de fuente',
	'Foreground Color': 'Color',
	'Horizontal Rule': 'Línea horizontal',
	'Image': 'Imagen',
	'Indent Text': 'Indentar',
	'Insert Ordered List': 'Insertar lista numerada',
	'Italic': 'Cursiva',
	'Justify Align': 'Justificar',
	'Left Align': 'Alinear izquierda',
	'Link': 'Enlace',
	'Paste': 'Pegar',
	'Redo': 'Rehacer',
	'Remove Indent': 'Quitar indentación',
	'Remove Formatting': 'Quitar formato',
	'Right Align': 'Alinear derecha',
	'Strike Through': 'Tachar',
	'See code': 'Ver código',
	'Subscript': 'Subíndice',
	'Superscript': 'Superíndice',
	'Insert Unordered List': 'Insertar lista',
	'Underline': 'Subrayar',
	'Undo': 'Deshacer',
	'Unlink': 'Quitar enlace',
	'XHTML mode': 'Modo XHTML'}
});

/**
 * Funciones Rich Text Box para JaSper
 * Añade controles para texto enriquecido a los elementos seleccionados (textbox o input text)
 *
 * @author José M. Carnero
 * @since 2012-05-15
 * @version 1.3
 */

JaSper.extend(JaSper.prototype, {

	/**
	 * Selector de colores
	 *
	 * Basado en FlexiColorPicker (licencia MIT) de David Durman
	 * http://www.daviddurman.com/flexi-color-picker
	 *
	 * @since 2015-09-12
	 */
	colorPicker: function (){
		'use strict';

		var sTipo = (window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");

		//barra de colores
		var oSlide = JaSper.nodo.crear('div', {
			class: 'JaSper slide wrapper',
			innerHTML: '<div class="indicator">slide</div>'
		});
		//caja de seleccion
		var oPicker = JaSper.nodo.crear('div', {
			class: 'JaSper picker wrapper',
			innerHTML: '<div class="indicator">picker</div>'
		});

		if(sTipo == 'SVG'){
			/*if(!document.namespaces['svg']){
				document.namespaces.add('svg', 'urn:http://www.w3.org/2000/svg', '');
			}*/

			JaSper.nodo.crear('div', {}, oSlide, [
				JaSper.nodo.crear('svg', {xmlns: 'http://www.w3.org/2000/svg', version: '1.1', style: 'width:100%;height:100%;'}, null, [
					JaSper.nodo.crear('defs', {}, null, [
						JaSper.nodo.crear('linearGradient', {id: 'gradient-hsv', x1: '0%', y1: '100%', x2: '0%', y2: '0%'}, null, [
							JaSper.nodo.crear('stop', {offset: '0%', 'stop-color': '#FF0000', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '13%', 'stop-color': '#FF00FF', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '25%', 'stop-color': '#8000FF', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '38%', 'stop-color': '#0040FF', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '50%', 'stop-color': '#00FFFF', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '63%', 'stop-color': '#00FF40', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '75%', 'stop-color': '#0BED00', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '88%', 'stop-color': '#FFFF00', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '100%', 'stop-color': '#FF0000', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
						], 'http://www.w3.org/2000/svg')
					], 'http://www.w3.org/2000/svg'),
					JaSper.nodo.crear('rect', {x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-hsv)'}, null, [], 'http://www.w3.org/2000/svg')
				], 'http://www.w3.org/2000/svg')
			]);

			JaSper.nodo.crear('div', {}, oPicker, [
				JaSper.nodo.crear('svg', {xmlns: 'http://www.w3.org/2000/svg', version: '1.1', style: 'width:100%;height:100%;'}, null, [
					JaSper.nodo.crear('defs', {}, null, [
						JaSper.nodo.crear('linearGradient', {id: 'gradient-black', x1: '0%', y1: '100%', x2: '100%', y2: '100%'}, null, [
							JaSper.nodo.crear('stop', {offset: '0%', 'stop-color': '#000000', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '100%', 'stop-color': '#CC9A81', 'stop-opacity': '0'}, null, [], 'http://www.w3.org/2000/svg'),
						], 'http://www.w3.org/2000/svg'),
						JaSper.nodo.crear('linearGradient', {id: 'gradient-white', x1: '0%', y1: '100%', x2: '100%', y2: '100%'}, null, [
							JaSper.nodo.crear('stop', {offset: '0%', 'stop-color': '#FFFFFF', 'stop-opacity': '1'}, null, [], 'http://www.w3.org/2000/svg'),
							JaSper.nodo.crear('stop', {offset: '100%', 'stop-color': '#CC9A81', 'stop-opacity': '0'}, null, [], 'http://www.w3.org/2000/svg'),
						], 'http://www.w3.org/2000/svg')
					], 'http://www.w3.org/2000/svg'),
					JaSper.nodo.crear('rect', {x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-white)'}, null, [], 'http://www.w3.org/2000/svg'),
					JaSper.nodo.crear('rect', {x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-black)'}, null, [], 'http://www.w3.org/2000/svg')
				], 'http://www.w3.org/2000/svg')
			]);
		}
		else if(sTipo == 'VML'){
			if (!document.namespaces['vml']){
				document.namespaces.add('vml', 'urn:schemas-microsoft-com:vml', '#default#VML');
			}

			JaSper.nodo.crear('div', {}, oSlide, [
				JaSper.nodo.crear('div', {
					innerHTML: '<vml:rect style="position:absolute;top:0;left:0;width:100%;height:100%" stroked="f" filled="t"><vml:fill type="gradient" method="none" angle="0" color="red" color2="red" colors="8519f fuchsia;.25 #8000ff;24903f #0040ff;.5 aqua;41287f #00ff40;.75 #0bed00;57671f yellow"></vml:fill></vml:rect>',
					style: 'position:relative;width:100%;height:100%;'
				})
			]);

			JaSper.nodo.crear('div', {}, oPicker, [
				JaSper.nodo.crear('div', {
					innerHTML: '<vml:rect style="position:absolute;left:-1px;top:-1px;width:101%;height:101%" stroked="f" filled="t"><vml:fill type="gradient" method="none" angle="270" color="#FFFFFF" opacity="100%" color2="#CC9A81" o:opacity2="0%"></vml:fill></vml:rect><vml:rect style="position: absolute; left: 0px; top: 0px; width: 100%; height: 101%" stroked="f" filled="t"><vml:fill type="gradient" method="none" angle="0" color="#000000" opacity="100%" color2="#CC9A81" o:opacity2="0%"></vml:fill></vml:rect>',
					style: 'position:relative;width:100%;height:100%;'
				})
			]);
		}
		else{
			JaSper.log('[JaSper::rtb.colorPicker] No se puede construir.', 1);
			return false;
		}

		this.each(function (){
			this.parentNode.appendChild(oSlide);
			this.parentNode.appendChild(oPicker);
		});

	},

	/**
	 * Editor Rich Text Box
	 * 
	 * El comando de un boton personalizado puede ser un fragmento de codigo en la forma: f:codigo_javascript_valido; el texto "rtbId" se sustituira por el id del objeto RTB correspondiente
	 * 
	 * @since 2011-05-31
	 * @param {object} oPreferencias Preferencias: botones -> array de botones que se mostraran (permite botones personalizados de usuario), custom -> propiedades del los botones personalizados
	 * @return {object}
	 */
	rtb: function (oPreferencias){
		'use strict';

		oPreferencias = oPreferencias || {};

		var oBotones = {
			backColor: {comando: 'HiliteColor', css: null, nombre: JaSper._t('Background Color'), tags: [], tecla: ''}, //IE usa BackColor (fuera de IE backColor pone color de fondo del elemento entero, no de la seleccion)
			bold: {comando: 'Bold', css: {'font-weight' : 'bold'}, nombre: JaSper._t('Bold'), tags: ['B','STRONG'], tecla: 'b'},
			center: {comando: 'JustifyCenter', css: null, nombre: JaSper._t('Center Align'), tags: [], tecla: ''},
			fontSize: {comando: 'FontSize', css: null, nombre: JaSper._t('Font Size'), tags: [], tecla: ''}, //Changes the font size for the selection or at the insertion point. This requires an HTML font size (1-7) to be passed in as a value argument
			fontFamily: {comando: 'FontName', css: null, nombre: JaSper._t('Font Family'), tags: [], tecla: ''}, //Changes the font name for the selection or at the insertion point. This requires a font name string ("Arial" for example) to be passed in as a value argument
			fontFormat: {comando: false, css: null, nombre: JaSper._t('Font Format'), tags: [], tecla: ''},
			foreColor: {comando: 'ForeColor', css: null, nombre: JaSper._t('Foreground Color'), tags: [], tecla: ''}, //Changes a font color for the selection or at the insertion point. This requires a color value string to be passed in as a value argument
			hr: {comando: 'InsertHorizontalRule', css: null, nombre: JaSper._t('Horizontal Rule'), tags: [], tecla: ''}, //Inserts a horizontal rule at the insertion point (deletes selection)
			image: {comando: 'InsertImage', css: null, nombre: JaSper._t('Image'), tags: false, tecla: ''}, //Inserts an image at the insertion point (deletes selection). Requires the image SRC URI string to be passed in as a value argument. The URI must contain at least a single character, which may be a white space. (Internet Explorer will create a link with a null URI value.)
			indent: {comando: 'Indent', css: null, nombre: JaSper._t('Indent Text'), tags: [], tecla: ''},
			italic: {comando: 'Italic', css: {'font-style' : 'italic'}, nombre: JaSper._t('Italic'), tags: ['EM','I'], tecla: 'i'},
			justify: {comando: 'JustifyFull', css: null, nombre: JaSper._t('Justify Align'), tags: [], tecla: ''},
			left: {comando: 'JustifyLeft', css: null, nombre: JaSper._t('Left Align'), tags: [], tecla: ''},
			link: {comando: false, css: null, nombre: JaSper._t('Link'), tags: [], tecla: ''},
			ol: {comando: 'InsertOrderedList', css: null, nombre: JaSper._t('Insert Ordered List'), tags: ['OL'], tecla: ''},
			outdent: {comando: 'Outdent', css: null, nombre: JaSper._t('Remove Indent'), tags: [], tecla: ''},
			redo: {comando: 'Redo', css: null, nombre: JaSper._t('Redo'), tags: [], tecla: ''}, //Redoes the previous undo command
			removeFormat: {comando: 'RemoveFormat', css: null, nombre: JaSper._t('Remove Formatting'), tags: [], tecla: ''},
			right: {comando: 'Justifyright', css: null, nombre: JaSper._t('Right Align'), tags: [], tecla: ''},
			strikeThrough: {comando: 'StrikeThrough', css: {'text-decoration' : 'line-through'}, nombre: JaSper._t('Strike Through'), tags: [], tecla: ''},
			subscript: {comando: 'Subscript', css: null, nombre: JaSper._t('Subscript'), tags: ['SUB'], tecla: ''},
			superscript: {comando: 'Superscript', css: null, nombre: JaSper._t('Superscript'), tags: ['SUP'], tecla: ''},
			ul: {comando: 'InsertUnorderedList', css: null, nombre: JaSper._t('Insert Unordered List'), tags: ['UL'], tecla: ''},
			underline: {comando: 'Underline', css: {'text-decoration' : 'underline'}, nombre: JaSper._t('Underline'), tags: ['U'], tecla: 'u'},
			undo: {comando: 'Undo', css: null, nombre: JaSper._t('Undo'), tags: [], tecla: ''}, //Undoes the last executed command
			unlink: {comando: false, css: null, nombre: JaSper._t('Unlink'), tags: [], tecla: ''},
			verCodigo: {comando: 'f:JaSper.rtb.verCodigo(\'rtbId\');return false;', css: null, nombre: JaSper._t('See code'), tags: [], tecla: ''}, //TODO mejorar llamadas a funciones

			copy: {comando: 'copy', css: null, nombre: JaSper._t('Copy'), tags: [], tecla: ''},
			cut: {comando: 'cut', css: null, nombre: JaSper._t('Cut'), tags: [], tecla: ''},
			paste: {comando: 'paste', css: null, nombre: JaSper._t('Paste'), tags: [], tecla: ''},

			xhtml: {comando: false, css: null, nombre: JaSper._t('XHTML mode'), tags: [], tecla: ''}
		};

		var aBotonesLista = oPreferencias.botones || ['bold', 'italic', 'underline', 'left', 'center', 'right', 'justify', 'ol', 'ul', 'fontSize', 'fontFamily', 'fontFormat', 'indent', 'outdent', 'image', 'link', 'unlink', 'foreColor', 'backColor', 'undo', 'redo', 'removeFormat', 'copy', 'cut', 'paste', 'verCodigo'];

		//botones personalizados
		//TODO falta icono
		if(oPreferencias.custom){
			for(var oBoton in oPreferencias.custom){
				oBotones[oBoton] = oPreferencias.custom[oBoton];
			}
		}

		//inicializando
		this.each(function (){
			if(!this.id){
				JaSper.log('[JaSper::rtb] No se soportan elementos sin ID.', 1);
				return false;
			}
	
			var oOriginal = this; //referencia a conservar para eventos
			var sOriginalTagName = oOriginal.tagName ? oOriginal.tagName.toLowerCase() : '', sOriginalType = oOriginal.type ? oOriginal.type.toLowerCase() : '';

			var sOriginalTipoCont = (sOriginalTagName == 'input' && sOriginalType == 'text') ? 'value' : ((sOriginalTagName == 'textarea' && sOriginalType == 'textarea') ? 'value' : false); //Que propiedad almacenara el contenido enriquecido //TODO otros tipos permitidos?
			if(!sOriginalTipoCont){
				JaSper.log('[JaSper::rtb] No se soportan elementos [' + this.toString() + '].', 0);
				return;
			}

			//ocultar el elemento
			var thisX = JaSper.css.getStyle('width', this) || this.clientWidth;
			var thisY = JaSper.css.getStyle('height', this) || this.clientHeight;
			this.style.display = 'none';

			//poner el sustituto
			var oContenedor = JaSper.nodo.crear('div', {
				id: this.id + '_rtb',
				className: 'JaSper_rtb contenedor'
			}); //contenedor
			oContenedor.style.width = thisX + 'px';
			oContenedor.style.minHeight = thisY + 'px';

			var oEditable = JaSper.nodo.crear('div', {
				id: this.id + '_rtb_div',
				className: 'JaSper_rtb editable'
			}); //div editable
			if(!((oEditable.contentEditable = 'true') || (window.document.designMode = 'on'))){ //window.document.designMode Firefox < 3
				JaSper.log('[JaSper::rtb] No se puede poner el elemento [' + oEditable.id + '] en modo editable.', 1);
				return false;
			}
			oEditable.style.height = (thisY - 18) + 'px';
			//oEditable.innerHTML = JaSper.rtb.decode_entities(this[sOriginalTipoCont]);
			oEditable.innerHTML = (this[sOriginalTipoCont] == '' ? '<br />'  : this[sOriginalTipoCont]); //si no, pinta un cursor que ocupa todo el alto a la izquierda
			oEditable.spellcheck || false;
			oEditable.styleWithCSS = false; //false - crea elementos para dar formato, true - estilos en linea

			var oToolbar = JaSper.nodo.crear('div', { //barra herramientas
				innerHTML: '',
				className: 'JaSper_rtb toolbar'
			});
			for(var i = 0; i < aBotonesLista.length; i++){
				var oBoton = oBotones[aBotonesLista[i]];
				if(!oBoton.comando){
					continue;
				}

				var sNoSoporte = '';
				var sComando = '';
				if(oBoton.comando.indexOf('f:') !== -1){ //FIXME esto permite pasar codigo en la lista de botones como "f:nombreFuncion"
					sComando = oBoton.comando.substr(2);
					sComando = sComando.replace('rtbId', oEditable.id);
				}
				else{
					sComando = 'JaSper.rtb.command(\'' + oEditable.id + '\', \'' + oBoton.comando + '\', null);return false;';
					if(!JaSper.rtb.commandSupport(oBoton.comando)){
						sNoSoporte = ' noSoporte';
					}
				}

				var sTemp = '<div class="JaSper_rtb button ' + aBotonesLista[i] + sNoSoporte + '" title="' + oBoton.nombre + '" ';
				sTemp += 'onmousedown="' + sComando + '">'; //si se hace en onclick se pierde el foco del elemento editable y no funciona; onmouseout debe devolver o anular el evento para que no se pierda el foco del elemento editable
				sTemp += oBoton.tecla || '&nbsp;';
				sTemp += '</div>';

				oToolbar.innerHTML += sTemp;
			}

			oContenedor.appendChild(oToolbar);
			oContenedor.appendChild(oEditable);

			JaSper.event.add(oEditable, 'blur', function (){
				oOriginal[sOriginalTipoCont] = this.innerHTML;
			});

			JaSper.event.add(oOriginal, 'blur', function (){ //cuando se muestra el codigo tambien debe actualizarse la caja de edicion rtb (que estara oculta)
				oEditable.innerHTML = oOriginal[sOriginalTipoCont];
			});
		
			this.parentNode.insertBefore(oContenedor, this.nextSibling);
			oContenedor.insertBefore(this, oToolbar.nextSibling);
		});

	}

});

JaSper.rtb = {

	/**
	 * Wrapper execCommand
	 *
	 * @param {Object} oElemId Objeto sobre el que aplicar el comando si es una funcion
	 * @param {string} sCommand Comando a comprobar o funcion
	 * @param {string} sParamsCommand Parametros para el comando
	 * @return {boolean}
	 */
	command: function (oElemId, sCommand, sParamsCommand){
		'use strict';

		if(!JaSper.rtb.commandSupport(sCommand)){
			JaSper.log('[JaSper::rtb.command] Comando [' + sCommand + '] no soportado por el navegador.', 1);
			return false;
		}

		sParamsCommand = sParamsCommand || null;

		//var oElem = document.getElementById(oElemId);
		//oElem.focus();

		try{
			if(JaSper.funcs.isFunction(sCommand)){
				return sCommand.call(document.getElementById(oElemId));
			}
			else{ //si es una cadena de texto es para execCommand
				return document.execCommand(sCommand, false, sParamsCommand);
			}
		}
		catch(ex){
			JaSper.log('[JaSper::rtb.command] No se puede ejecutar el comando [' + sCommand + '] en el elemento [' + oElemId + '].', 1);
			return false;
		}
	},

	/**
	 * Devuelve si un comando esta soportado por document.execCommand en el navegador
	 *
	 * @param {string} sCommand Comando a comprobar
	 * @return {boolean}
	 */
	commandSupport: function (sCommand){
		'use strict';

		return !!document.queryCommandSupported(sCommand);
	},

	/**
	 * Convierte entidades (&[...];) en su correspondiente simbolo
	 */
	/*decode_entities: function (text){
		'use strict';

		var result = text.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');

		return result;
	},*/

	/**
	 * Devuelve el texto seleccionado en la pagina, tambien en input o textarea
	 *
	 * @author Tim Down [https://stackoverflow.com/users/96100/tim-down]
	 * @return {string}
	 */
	getSeleccion: function (){
		var sText = "";
		var activeEl = document.activeElement;
		var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;

		if((activeElTagName == 'textarea') || (activeElTagName == 'input' && /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) && (typeof activeEl.selectionStart == 'number')){
			sText = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
		}
		else if(window.getSelection){
			sText = window.getSelection().toString();
		}
		else if(window.selection){ //IE
			sText = document.selection.createRange().htmlText;
		}

		return sText;
	},

	/**
	 * Si no se pasan parametros devuelve el texto o nodos actualmente seleccionados
	 * Si se pasan parametros crea una seleccion a partir de lo que reciba, si fin es igual a inicio no hay seleccion sino simplemente la posicion del cursor
	 *
	 * @param {object} oNodoIni Nodo de inicio de seleccion
	 * @param {object} oNodoFin Nodo de fin de seleccion
	 * @param {object} oSelIni Nodo de fin de seleccion
	 * @param {object} oSelFin Nodo de fin de seleccion
	 * @return {object}
	 */
	seleccion: function (oNodoIni, oNodoFin, oSelIni, oSelFin){
		'use strict';

		var oSeleccion = window.getSelection() || document.selection.createRange(); //segunda version para IE

		if(!oNodoIni){ //devuelve lo actualmente seleccionado
			var oNodoIni = oSeleccion.anchorNode, oNodoFin = oSeleccion.focusNode;
			var oSelIni = oSeleccion.anchorOffset, oSelFin = oSeleccion.focusOffset;
		}
		else{ //intenta recrear la seleccion pasada
			var oRango = document.createRange();
			x = oNodoIni.compareDocumentPosition(oNodoFin);

			if (x == 4 || (x == 0 && oSelIni < oSelFin)){
				oRango.setStart(oNodoIni, oSelIni);
				oRango.setEnd(oNodoFin, oSelFin);
			}else{
				 oRango.setStart(oNodoFin, oSelFin);
				 oRango.setEnd(oNodoIni, oSelIni);
			}

			oSeleccion.removeAllRanges(); 
			oSeleccion.addRange(oRango);
		}

		return {
			nodoIni: oNodoIni,
			nodoFin: oNodoFin,
			selIni: oSelIni,
			selFin: oSelFin
		};
	},

	/**
	 * Alterna entre ver la caja RTB o la caja original (text, textarea, ...)
	 * Recibe como this la caja RTB
	 * 
	 * @since 2015-09-27
	 * @todo ocultar botones cuando se esta en modo codigo
	 * @param {string} sId Id de la objeto RTB
	 */
	verCodigo: function (sId){
		'use strict';

		var oRtb = document.getElementById(sId);
		var oOriginal = document.getElementById(sId.substr(0, sId.indexOf('_rtb_div'))); //objeto fuente
		var oElemDisplay = oOriginal.style.display;

		var sOriginalTagName = oOriginal.tagName ? oOriginal.tagName.toLowerCase() : '', sOriginalType = oOriginal.type ? oOriginal.type.toLowerCase() : '';
		var sOriginalTipoCont = (sOriginalTagName == 'input' && sOriginalType == 'text') ? 'value' : ((sOriginalTagName == 'textarea' && sOriginalType == 'textarea') ? 'value' : false); //*codigo repetido*

		if(oElemDisplay == 'none'){
			oOriginal[sOriginalTipoCont] = oRtb.innerHTML;

			oRtb.style.display = oOriginal.style.display;
			oOriginal.style.display = 'block';
		}
		else{
			oRtb.innerHTML = oOriginal[sOriginalTipoCont];

			oOriginal.style.display = oRtb.style.display;
			oRtb.style.display = 'block';
		}
	}

};

/*
This code is a IE8 (and below), polyfill for HTML5 Range object's startContainer,
startOffset, endContainer and endOffset properties.
https://gist.github.com/Munawwar

function onBtnClick() {
	var range=window.getSelection().getRangeAt(0);
	if (range) {
		console.log(range.startContainer.nodeValue.substr(range.startOffset));
		console.log(range.startOffset);
		console.log(range.endContainer.nodeValue.substr(0, range.endOffset));
		console.log(range.endOffset);
	}
}*/
(function () {
	function findTextNode(node, text) {
		//Iterate through all the child text nodes and check for matches
		//As we go through each text node keep removing the text value (substring) from the beginning of the text variable.
		do {
			if(node.nodeType==3) {//Text node
				var find = node.nodeValue;
				if (text.length > 0 && text.indexOf(find) === 0 && text !== find) { //text==find is a special case
					text = text.substring(find.length);
				} else {
					//cosole.log(node.nodeValue);
					return {node: node, offset: text.length}; //nodeInfo
				}
			} else if (node.nodeType === 1) {
				var range = document.body.createTextRange();
				range.moveToElementText(node);
				text = text.substring(range.text.length);
			}
		} while ((node=node.nextSibling));
		return null;
	}
	/**
	 * @param {Boolean} startOfSelection Set to true to find the startContainer and startOffset,
	 * else set to false (to find endContainer and endOffset).
	 */
	function getSelectionInfo(range, startOfSelection) {
		if(!range) return null;
		var rangeCopy = range.duplicate(), //Create two copies
			rangeObj = range.duplicate();
		rangeCopy.collapse(startOfSelection); //If true, go to beginning of the selection else go to the end.
		var parentElement = rangeCopy.parentElement();
		//If user clicks the input button without selecting text, then moveToElementText throws an error.
		if (parentElement instanceof HTMLInputElement) {
			return null;
		}
		//console.log(parentElement.nodeName); //Should return the parent.
		/* However IE8- cannot have the selection end at the zeroth index of
		 * the parentElement's first text node.
		 */
		rangeObj.moveToElementText(parentElement); //Select all text of parentElement
		rangeObj.setEndPoint('EndToEnd', rangeCopy); //Move end point to rangeCopy
		//rangeCopy.text gives you text from parentElement's first character upto rangeCopy.
		//Now traverse through sibling nodes to find the exact Node and the selection's offset.
		return findTextNode(parentElement.firstChild, rangeObj.text);
	}
	function getIERange() {
		var range=window.document.selection.createRange(), //Microsoft TextRange Object
			start = getSelectionInfo(range, true),
			end = getSelectionInfo(range, false);
		if (start && end) {
			return {
				commonAncestorContainer: range.parentElement(),
				startContainer: start.node,
				startOffset: start.offset,
				endContainer: end.node,
				endOffset: end.offset
			};
		}
		return null;
	}
	if (!window.getSelection && window.document.selection) { //IE8-
		window.getSelection = function () { //Gets the first range object
			var range = getIERange();
			return {
				rangeCount: range ? 1 : 0,
				getRangeAt: function () {
					return range;
				}
			};
		};
	}
}());
