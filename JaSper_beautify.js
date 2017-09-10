/*Copyright (C) 2017 José M. Carnero <jm_carnero@sargazos.net>

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
 * Formateador de bloques de código
 *
 * ejemplo:
 * <code>
$('pre.code').beautify();
 * </code>
 * @author José M. Carnero
 * @since 2017-03-05
 * @version 0.9b
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * Formatea el bloque de código dentro del elemento seleccionado
	 *
	 * @param {Object} oOps Opciones
	 * @return {Object} JaSper
	 */
	beautify: function (oOps){
		'use strict';

		oOps = oOps || {};
		oOps.formato = oOps.formato || 'plano'; //formato para interpretar el contenido del elemento

		this.each(function (){
			this.innerHTML = JaSper.beautify.format(this.innerHTML, oOps.formato);
			return;
		});

		return this;
	}

});

JaSper.beautify = {

	/**
	 * Ajusta el formato en que se interpretara el contenido a uno valido
	 *
	 * @param {String} sTexto Texto a formatear
	 * @param {String} sFormato Formato
	 * @return {String} HTML formateado
	 */
	format: function (sTexto, sFormato){
		'use strict';

		sTexto = sTexto || '';
		sFormato = (sFormato || '').toLowerCase();
		var sTextoRet = sTexto;

		switch(sFormato){
			case 'md': //markdown
				sTextoRet = JaSper.beautify.md(sTexto);
				break;
			default: //cualquier formato no reconocido no se interpreta
				sFormato = 'plano'; //texto plano, no se interpreta
		}

		return sTextoRet;
	},

	/**
	 * Da formato a texto MarkDown
	 *
	 * Siguiendo las normas de http://daringfireball.net/projects/markdown/syntax
	 *
	 * @param {String} sTexto Texto a formatear
	 * @return {String} HTML formateado
	 */
	md: function (sTexto){
		var sTextoRet = '';

		var oReglas = {
			'block': {
				'h6': '###### (.*?)#*$',
				'h5': '##### (.*?)#*$',
				'h4': '#### (.*?)#*$',
				'h3': '### (.*?)#*$',
				'h2': '## (.*?)#*$',
				'h1': '# (.*?)#*$',
				//'blockquote': '>',
				'ul': ['[*|+|-] (.*?)$', '<ul>$1'],
				'ol': ['\\d+\\. (.*?)$', '<ol>$1'],
				//'hr': ['\*\*\*|\* \* \*|\---|\- - -', '<hr />'],
				//'code': ['```(.*?)$([^]+?)^```', '<code type="$1">$2</code>'] //con saltos de linea
			},
			'inline': {
				'strong': ['\\*\\*(.+?)\\*\\*|__(.+?)__', '<strong>$1$2</strong>'],
				'em': '\\*(.+?)\\*|_(.+?)_',
				'code': '`(?!`)(.+?)`'
			}
		};

		var aFragmentos = JaSper.beautify.tokenizer(sTexto, oReglas);

		var aStack = []; //pila de anidacion de elementos, ul, ol, etc
		var controlStack = function (sElemento){ //controla el stack
			var sRet = '';
			var sStackLast = aStack[aStack.length - 1] || '';

			if(sElemento === 'ol' && sStackLast !== 'ol'){
				sRet = '<ol>';
				aStack.push('ol');
			}
			else if(sElemento === 'ul' && sStackLast !== 'ul'){
				sRet = '<ul>';
				aStack.push('ul');
			}
			else if(!sElemento && (sStackLast === 'ol' || sStackLast === 'ul')){
				sRet = '</' + aStack.pop() + '>';
			}

			return sRet;
		};

		for(var iCont = 0, iFin = aFragmentos.length; iCont < iFin; iCont++){
			//aFragmentos[iCont] = JaSper.funcs.htmlEntities(aFragmentos[iCont]);

			if(!aFragmentos[iCont]){ //ignora lineas vacias, no pintan nada en HTML
				continue;
			}
			else if(aFragmentos[iCont].indexOf('<ol>') == 0){
				aFragmentos[iCont] = controlStack('ol') + aFragmentos[iCont].replace('<ol>', '<li>') + '</li>';
			}
			else if(aFragmentos[iCont].indexOf('<ul>') == 0){
				aFragmentos[iCont] = controlStack('ul') + aFragmentos[iCont].replace('<ul>', '<li>') + '</li>';
			}
			else if(aFragmentos[iCont].indexOf('\v') == 0){
				aFragmentos[iCont] = controlStack() + '<p>' + aFragmentos[iCont].replace('\v', '') + '</p>';
			}
			else{
				aFragmentos[iCont] = controlStack() + aFragmentos[iCont];
			}

			sTextoRet += aFragmentos[iCont];
		}

		//sTextoRet = sTextoRet.replace(/#/gi, '<h1>');
		return sTextoRet;
	},

	/**
	 * Convierte el texto pasado en un array de elementos categorizados segun las reglas indicadas
	 *
	 * Los elementos inline se envuelven entre tags de inicio y fin, si se omiten se construye como XML: '<' + clave + '>' y '</' + clave + '>'
	 * Si dentro de la expresion regular quiere usarse el caracter / debera ir escapado (\/), ya que se usa como delimitador de la expresion regular
	 * Todos los reemplazos son globales, las expresiones regulares deberan tener esto en cuenta; y se realizan en el mismo orden que se encuentren en el objeto oReglas
	 *
	 * @param {String} sTexto Texto a formatear
	 * @param {Object} oReglas Reglas para marcar bloques, en forma de expresiones regulares: {'block': {reglas de bloques}, 'inline': {[reglas de dentro de texto, tag de apertura, tag de cierre]}}
	 * @return {Array} Elementos categorizados
	 */
	tokenizer: function (sTexto, oReglas){
		var sTextoRet = sTexto || '';

		if(oReglas){

			oReglas = oReglas || {};
			oReglas.block = oReglas.block || {};
			oReglas.inline = oReglas.inline || {};

			var aRegSubst = []; //array con regla y cadena de reemplazo

			//reglas inline
			var iNumParentesis = 0; //cuantos parentesis se usan en la expresion regular, para luego sustituir correctamente
			var sRegExpGrupos = ''; //grupos a recuperar de la expresion regular, tantos como iNumParentesis se encuentren, $1$2$[etc]
			for(var sClave in oReglas.inline){
				aRegSubst = JaSper.funcs.isArray(oReglas.inline[sClave]) ? oReglas.inline[sClave] : [oReglas.inline[sClave], '<' + sClave + '>\v</' + sClave + '>'];
				aRegSubst[0] = new RegExp(aRegSubst[0], 'g');

				if(aRegSubst[1].indexOf('\v') > -1){ //solo se hace sustitucion automatica de parentesis encontrados si se encuentra tabulador vertical
					iNumParentesis = (aRegSubst[0].source.match(/\(/g) || []).length; //TODO controlar si es un parentesis escapado o lookahead; javascript no soporta 'negative lookbehind': /(?<!\\)\(/g

					if(!iNumParentesis){ //si no hay parentesis se ponen a la cadena entera
						aRegSubst[0] = '(' + aRegSubst[0] + ')';
						iNumParentesis = 1;
					}

					sRegExpGrupos = '';
					for(var i = 1; i <= iNumParentesis; i++){
						sRegExpGrupos += '$' + i;
					}

					aRegSubst[1] = aRegSubst[1].replace('\v', sRegExpGrupos);
				}

				sTextoRet = sTextoRet.replace(aRegSubst[0], aRegSubst[1]);
			}

			//reglas block
			//TODO se podria comprobar en el texto completo cuales se van a usar y quitar de oReglas las que no para simplificar
			for(var sClave in oReglas.block){
				oReglas.block[sClave] = JaSper.funcs.isArray(oReglas.block[sClave]) ? oReglas.block[sClave] : [oReglas.block[sClave], '<' + sClave + '>\v</' + sClave + '>'];
				oReglas.block[sClave][0] = new RegExp(oReglas.block[sClave][0], 'g');
			}

			var aFragmentos = sTextoRet.split('\n'); //TODO comprobar que tipos de saltos de carro se usan en el documento para hacer este corte correcto

			for(var iCont = 0, iFin = aFragmentos.length; iCont < iFin; iCont++){
				if(!aFragmentos[iCont]){ //se ignoran las lineas vacias
					continue;
				}

				aRegSubst = [];

				for(var sClave in oReglas.block){
					if(oReglas.block[sClave][0].test(aFragmentos[iCont])){
						aRegSubst = oReglas.block[sClave];
						break;
					}
				}

				if(!aRegSubst.length){
					aFragmentos[iCont] = '\v' + aFragmentos[iCont]; //TODO de momento si no hay coincidencia se marcan las lineas con tabulador vertical, ver que hacer con no coincidencias
					continue;
				}

				if(aRegSubst[1].indexOf('\v') > -1){ //solo se hace sustitucion automatica de parentesis encontrados si se encuentra tabulador vertical
					iNumParentesis = (aRegSubst[0].source.match(/\(/g) || []).length; //TODO controlar si es un parentesis escapado o lookahead; javascript no soporta 'negative lookbehind': /(?<!\\)\(/g

					if(!iNumParentesis){ //si no hay parentesis se ponen a la cadena entera
						aRegSubst[0] = '(' + aRegSubst[0] + ')';
						iNumParentesis = 1;
					}

					sRegExpGrupos = '';
					for(var i = 1; i <= iNumParentesis; i++){
						sRegExpGrupos += '$' + i;
					}

					aRegSubst[1] = aRegSubst[1].replace('\v', sRegExpGrupos);
				}

				aFragmentos[iCont] = aFragmentos[iCont].replace(aRegSubst[0], aRegSubst[1]);
			}

		}

		return aFragmentos;
	}

};
