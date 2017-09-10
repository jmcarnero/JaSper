/*Copyright (C) 2016 José M. Carnero <jm_carnero@sargazos.net>

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
 * Cliente REST
 *
 * @author José M. Carnero
 * @since 2016-03-23
 * @version 1.0b
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * Peticiones a servicio REST
	 * 
	 * ejemplo de uso:
	 * <code>
$('#contents').rest('get', 'http://pan/api/getTime', {}, {
	end: function (xhr){
			$('#contents').html(xhr.responseText);
			console.log('conseguido');
			return;
		}
});
	 * </code>
	 * @param {string} sTipo Tipo de peticion: get, post
	 * @param {string} sUrl Url a la que hacer la peticion
	 * @param {Object} oValores Valores de la peticion: {clave: valor}; solo aquellos que se deban firmar, se concatenaran a la URL como &clave=valor
	 * @param {Object} oCallbacks Llamada al inicio de la peticion (start), al final (end) y si falla (fail); el unico parametro que reciben en todos los casos es el elemento ajax que se haya utilizado
	 * @return {Object} JaSper
	 */
	rest: function (sTipo, sUrl, oValores, oCallbacks){
		'use strict';

		if(sTipo != 'get' && sTipo != 'post'){
			JaSper.log('[JaSper::rest] Tipo de petición desconocido o no soportado.', 1);
		}

		JaSper.rest[sTipo](sUrl, oValores, oCallbacks);

		//TODO decidir si ha de ir ligado a los elementos encontrados por el selector
		/*this.each(function (){
			return JaSper.rest[sTipo](sUrl, oValores, this);
		});*/

		return this;
	}

});

JaSper.rest = {

	/**
	 * Genera y guarda la autentificacion de peticiones a servicio REST
	 * 
	 * @param {string} sNombre Nombre de usuario; si se omite intenta coger lo ya guardado en cookie
	 * @param {string} sClave Clave de usuario
	 * @param {object} oParametros Parametros
	 * @return {string}
	 */
	auth: function (sNombre, sClave, oParametros){
		'use strict';

		var sRest = '';
		var sToken = JaSper.cookie.get('JaSper_RestToken'); //se intenta recuperar el token ya generado guardado en cookie

		if(!sToken && sNombre){
			if(!md5 && !sha1){ //carga de las librerias de hash
				JaSper.load.script('md5.min.js');
				JaSper.load.script('sha1.min.js');
				for(var i = 0; i < 50; i++){ //esperara hasta 5 segundos
					if(typeof md5 === 'function' && typeof sha1 === 'function'){
						sToken = sha1(sha1(sNombre) + md5(sClave));
						break;
					}
					JaSper.time.wait(100); //espera hasta completar la carga
				}
			}
		}

		if(!sToken){
			JaSper.log('-JaSper::rest.auth- Sin token de seguridad', 1);
			return oReturn;
		}

		var sTimestamp = Math.floor(new Date().getTime() / 1000); //en segundos
		sRest = sha1(sToken + sTimestamp) + sTimestamp;

		JaSper.cookie.set('JaSper_RestToken', sToken, 30); //cada vez que se hace una peticion se reguarda la firma, durante un maximo de 30 dias
		return sRest;
	},

	/**
	 * Peticiones GET a servicio REST
	 * 
	 * @param {string} sUrl URL a la que enviar la peticion
	 * @param {Object} oValores Valores de la peticion: {clave: valor}; solo aquellos que se deban firmar, se concatenaran a la URL como &clave=valor
	 * @param {Object} oCallbacks Llamada al inicio de la peticion (start), al final (end) y si falla (fail); el unico parametro que reciben en todos los casos es el elemento ajax que se haya utilizado
	 * @return {boolean}
	 */
	get: function (sUrl, oValores, oCallbacks){
		'use strict';

		if(!sUrl){ //no tiene sentido si no hay URL a la que llamar
			JaSper.log('-JaSper::rest.get- Sin URL que consultar', 1);
			return false;
		}

		oCallbacks = oCallbacks || {};
		oCallbacks.start = oCallbacks.start || function (oXhr){console.log('Start'); return;};
		oCallbacks.end = oCallbacks.end || function (oXhr){console.log('End'/*oXhr.responseText*/); return;};
		oCallbacks.fail = oCallbacks.fail || function (oXhr){console.log('Fail'); return;};

		//se ejecutara cuando se cargue la libreria y solo si se consigue cargar
		var oAjaxSend = function (){
			var oCabeceras = {
				contentType: 'application/json; charset=utf-8'
			};
			var sReturnData = 'json';

			JaSper.ajax.send({
				url: sUrl,
				cabeceras: oCabeceras,
				valores: oValores,
				metodo: 'get',
				asincrono: null,
				formatoDatos: sReturnData,
				elementoDom: null,
				cbEnd: function (oDomElem, oXhr){return oCallbacks.end(oXhr);},
				cbFail: function (oDomElem, oXhr){return oCallbacks.fail(oXhr);},
				cbStart: function (oDomElem, oXhr){return oCallbacks.start(oXhr);}
			});
		};

		if(!JaSper.ajax){
			JaSper.load.queue.push({fn: oAjaxSend, ctx: null});

			JaSper.load.script('JaSper_ajax' + JaSper.trait.minificado + '.js');
		}
		else{
			oAjaxSend.call(null);
		}

		return true;
	},

	/**
	 * Peticiones POST a servicio REST
	 * 
	 * @param {string} sUrl URL a la que enviar la peticion
	 * @param {Object} oValores Valores de la peticion: {clave: valor}; o una cadena en la forma clave=valor&clave2=valor2
	 * @param {Object} oCallbacks Llamada al inicio de la peticion (start), al final (end) y si falla (fail); el unico parametro que reciben en todos los casos es el elemento ajax que se haya utilizado
	 * @return {boolean}
	 */
	post: function (sUrl, oValores, oCallbacks){
		'use strict';

		if(!sUrl){ //no tiene sentido si no hay URL a la que llamar
			JaSper.log('-JaSper::rest.post- Sin URL que consultar', 1);
			return false;
		}

		oCallbacks = oCallbacks || {};
		oCallbacks.start = oCallbacks.start || function (oXhr){console.log('Start');return;};
		oCallbacks.end = oCallbacks.end || function (oXhr){console.log('End'/*oXhr.responseText*/); return;};
		oCallbacks.fail = oCallbacks.fail || function (oXhr){console.log('Fail'); return;};

		var oAjaxSend = function (){
			var oCabeceras = {
				contentType: 'application/json; charset=utf-8'
			};
			var sReturnData = 'json';

			JaSper.ajax.send({
				url: sUrl,
				cabeceras: oCabeceras,
				valores: oValores,
				metodo: 'post',
				asincrono: null,
				formatoDatos: sReturnData,
				elementoDom: null,
				cbEnd: function (oDomElem, oXhr){return oCallbacks.end(oXhr);},
				cbFail: function (oDomElem, oXhr){return oCallbacks.fail(oXhr);},
				cbStart: function (oDomElem, oXhr){return oCallbacks.start(oXhr);}
			});
		};

		if(!JaSper.ajax){
			JaSper.load.queue.push({fn: oAjaxSend, ctx: null});

			JaSper.load.script('JaSper_ajax' + JaSper.trait.minificado + '.js');
		}
		else{
			oAjaxSend.call(null);
		}

		return true;
	},

	/**
	 * Firma los parametros que se envien a servicio REST
	 * 
	 * @param {object} oParametros Parametros a firmar; se firman en el orden que se reciben
	 * @param {string} sAuth Token de autentificacion recuperado de JaSper.cookie.auth(), se pasa por parametro para evitar discrepancias con el timestamp
	 * @return {object}
	 */
	sign: function (oParametros, sAuth){
		'use strict';

		oParametros = oParametros || {};

		var sSignature = '';
		var sToken = sAuth || JaSper.cookie.auth();

		if(!sha1 || !sToken){
			return null;
		}
		//si no hay parametros la firma y el token de autentificacion deben ser iguales
		for(var sKey in oParametros){
			if(oParametros[sKey]){
				sSignature += oParametros[sKey];
			}
		}

		sRet = sToken;
		if(sSignature){
			sRet = sha1(sToken + sSignature);
		}

		return sRet;
	}

};
