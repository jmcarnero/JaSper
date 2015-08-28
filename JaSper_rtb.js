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

'use strict';

/*traducciones*/
JaSper.extend(JaSper.langs, {
'es':{
	'Background Color': 'Color de fondo',
	'Bold': 'Negrita',
	'Center Align': 'Centrado',
	'Font Size': 'Tamaño de fuente',
	'Font Family': 'Fuente',
	'Font Format': 'Formato de fuente',
	'Foreground Color': 'Color',
	'Horizontal Rule': 'Línea horizontal',
	'See HTML': 'Ver HTML',
	'Image': 'Imagen',
	'Indent Text': 'Indentar',
	'Italic': 'Cursiva',
	'Justify Align': 'Justificar',
	'Left Align': 'Alinear izquierda',
	'Link': 'Enlace',
	'Insert Ordered List': 'Insertar lista numerada',
	'Remove Indent': 'Quitar indentación',
	'Remove Formatting': 'Quitar formato',
	'Right Align': 'Alinear derecha',
	'Strike Through': 'Tachar',
	'Subscript': 'Subíndice',
	'Superscript': 'Superíndice',
	'Insert Unordered List': 'Insertar lista',
	'Underline': 'Subrayar',
	'Unlink': 'Quitar enlace'}
});

/**
 * Funciones Rich Text Box para JaSper
 * Añade controles para texto enriquecido a los elementos seleccionados (textbox o input text)
 *
 * @author José M. Carnero
 * @since 2012-05-15
 * @version 1.0b
 */

JaSper.extend(JaSper.prototype, {

	/**
	 * editor Rich Text Box
	 * 
	 * @since 2011-05-31
	 * @return object
	 */
	rtb: function (){
		var oBotones = {
			bgcolor: {comando: false, css: null, nombre: JaSper._t('Background Color'), tags: [], tecla: ''},
			bold: {comando: 'bold', css: {'font-weight' : 'bold'}, nombre: JaSper._t('Bold'), tags: ['B','STRONG'], tecla: 'b'},
			center: {comando: 'justifycenter', css: null, nombre: JaSper._t('Center Align'), tags: [], tecla: ''},
			fontSize: {comando: false, css: null, nombre: JaSper._t('Font Size'), tags: [], tecla: ''},
			fontFamily: {comando: false, css: null, nombre: JaSper._t('Font Family'), tags: [], tecla: ''},
			fontFormat: {comando: false, css: null, nombre: JaSper._t('Font Format'), tags: [], tecla: ''},
			forecolor: {comando: false, css: null, nombre: JaSper._t('Foreground Color'), tags: [], tecla: ''},
			hr: {comando: 'insertHorizontalRule', css: null, nombre: JaSper._t('Horizontal Rule'), tags: [], tecla: ''},
			html: {comando: false, css: null, nombre: JaSper._t('See HTML'), tags: [], tecla: ''},
			image: {comando: false, css: null, nombre: JaSper._t('Image'), tags: false, tecla: ''},
			indent: {comando: 'indent', css: null, nombre: JaSper._t('Indent Text'), tags: [], tecla: ''},
			italic: {comando: 'Italic', css: {'font-style' : 'italic'}, nombre: JaSper._t('Italic'), tags: ['EM','I'], tecla: 'i'},
			justify: {comando: 'justifyfull', css: null, nombre: JaSper._t('Justify Align'), tags: [], tecla: ''},
			left: {comando: 'justifyleft', css: null, nombre: JaSper._t('Left Align'), tags: [], tecla: ''},
			link: {comando: false, css: null, nombre: JaSper._t('Link'), tags: [], tecla: ''},
			ol: {comando: 'insertorderedlist', css: null, nombre: JaSper._t('Insert Ordered List'), tags: ['OL'], tecla: ''},
			outdent: {comando: 'outdent', css: null, nombre: JaSper._t('Remove Indent'), tags: [], tecla: ''},
			removeformat: {comando: 'removeformat', css: null, nombre: JaSper._t('Remove Formatting'), tags: [], tecla: ''},
			right: {comando: 'justifyright', css: null, nombre: JaSper._t('Right Align'), tags: [], tecla: ''},
			strikethrough: {comando: 'strikeThrough', css: {'text-decoration' : 'line-through'}, nombre: JaSper._t('Strike Through'), tags: [], tecla: ''},
			subscript: {comando: 'subscript', css: null, nombre: JaSper._t('Subscript'), tags: ['SUB'], tecla: ''},
			superscript: {comando: 'superscript', css: null, nombre: JaSper._t('Superscript'), tags: ['SUP'], tecla: ''},
			ul: {comando: 'insertunorderedlist', css: null, nombre: JaSper._t('Insert Unordered List'), tags: ['UL'], tecla: ''},
			underline: {comando: 'Underline', css: {'text-decoration' : 'underline'}, nombre: JaSper._t('Underline'), tags: ['U'], tecla: 'u'},
			unlink: {comando: false, css: null, nombre: JaSper._t('Unlink'), tags: [], tecla: ''}
		},
		aBotonesLista = ['bold','italic','underline','left','center','right','justify','ol','ul','fontSize','fontFamily','fontFormat','indent','outdent','image','link','unlink','forecolor','bgcolor'];

		//inicializando
		this.each(function (){
			var sTagName = this.tagName ? this.tagName.toLowerCase() : '', sType = this.type ? this.type.toLowerCase() : '';

			var tipoTag = (sTagName == 'input' && sType == 'text') ? 'text' : ((sTagName == 'textarea' && sType == 'textarea') ? 'textarea' : false); //comprueba si se puede aplicar rtb sobre el elemento
			if(!tipoTag){
				JaSper.log('[JaSper::rtb] No se soportan elementos [' + this.toString() + '].', 0);
				return;
			}

			//ocultar el elemento
			var thisX = JaSper.css.getStyle('width', this) || this.clientWidth;
			var thisY = JaSper.css.getStyle('height', this) || this.clientHeight;
			this.style.display = 'none';

			//poner el sustituto
			var cont = JaSper.nodo.crear('div', {
				id: this.id + '_rtb',
				className: 'JaSper_rtb contenedor'
			}); //contenedor
			cont.style.width = thisX + 'px';
			cont.style.height = (tipoTag == 'text')?'':thisY + 'px';

			var edit = JaSper.nodo.crear('div', {
				id: this.id + '_rtb_div',
				className: 'JaSper_rtb editable'
			}); //div editable
			if(!((edit.contentEditable = 'true') || (window.document.designMode = 'on'))){ //window.document.designMode Firefox < 3
				JaSper.log('[JaSper::rtb] No se puede poner el elemento [' + edit.id + '] en modo editable.', 1);
				return false;
			}
			edit.style.height = (thisY - 18) + 'px';
			edit.innerHTML = JaSper.rtb.decode_entities(tipoTag == 'text' ? this.value : this.innerHTML);
			edit.innerHTML = (edit.innerHTML == '' ? '<br />'  : edit.innerHTML); //si no, pinta un cursor que ocupa todo el alto a la izquierda
			edit.spellcheck || false;
			edit.styleWithCSS = false; //sin esto se crean estilos en linea

			var toolbar = JaSper.nodo.crear('div', { //barra herramientas
				innerHTML: '',
				className: 'JaSper_rtb toolbar'
			});
			for(var i = 0; i < aBotonesLista.length; i++){
				var oBoton = oBotones[aBotonesLista[i]];
				if(!oBoton.comando)
					continue;

				//si se hace en onclick se pierde el foco del elemento editable y no funciona; onmouseout debe devolver o anular el evento para que no se pierda el foco del elemento editable
				var sTemp = '<div class="JaSper_rtb button ' + aBotonesLista[i] + '" title="' + oBoton.nombre + '" ';
				sTemp += 'onmousedown="JaSper.rtb.command(\'' + edit.id + '\', \'' + oBoton.comando + '\', null);return false;">';
				sTemp += oBoton.tecla;
				sTemp += '</div>';

				toolbar.innerHTML += sTemp;
			}

			cont.appendChild(toolbar);
			cont.appendChild(edit);

			var oOriginal = this;
			JaSper.event.add(edit, 'blur', function (){ //FIXME no esta guardando correctamente en el elemento del formulario
				if(tipoTag == 'text') oOriginal.value = this.innerHTML;
				else oOriginal.innerHTML = this.innerHTML;
			});
		
			this.parentNode.insertBefore(cont, this.nextSibling);
		});

	}

});

JaSper.rtb = {};

JaSper.extend(JaSper.rtb, {

	/**
	 * execCommand
	 */
	command: function (oElemId, sCommand, sParamsCommand){
		sParamsCommand = sParamsCommand || null;

		//var oElem = document.getElementById(oElemId);
		//oElem.focus();

		try{
			return document.execCommand(sCommand, false, sParamsCommand);
		}
		catch(ex){
			JaSper.log('[JaSper::rtb.command] No se puede ejecutar el comando [' + sCommand + '] en el elemento [' + oElemId + '].', 1);
			return false;
		}
	},

	/**
	 * Convierte entidades (&[...];) en su correspondiente simbolo
	 */
	decode_entities: function (text){
		var result = text
						.replace(/&lt;/gi, '<')
						.replace(/&gt;/gi, '>');

		return result;
	}

});
