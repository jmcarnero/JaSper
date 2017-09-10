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
		'ajax/ajax_1': 'This browser can\'t create AJAX objects.',
		'ajax/ajax_2': 'Loading',
		'ajax/ajax_3': 'The AJAX request was empty.\nMaybe the destination URL is not accesible from this script.',
		'ajax/ajax_4': 'Unauthorized (code 401).',
		'ajax/ajax_5': 'Forbidden (code 403).',
		'ajax/ajax_6': 'Not Found (code 404).',
		'ajax/ajax_7': 'Error'
	},
	'es': {
		'ajax/ajax_1': 'Su navegador no puede crear objetos AJAX.',
		'ajax/ajax_2': 'Cargando',
		'ajax/ajax_3': 'La respuesta AJAX está vacía.\nPuede que la URL de destino no sea accesible desde esta máquina/dominio.',
		'ajax/ajax_4': 'No tiene autorización (código 401).',
		'ajax/ajax_5': 'Acceso no permitido (código 403).',
		'ajax/ajax_6': 'La dirección no existe (código 404).',
		'ajax/ajax_7': 'Error'
	}
});

/**
 * Funciones AJAX para JaSper
 *
 * @author José M. Carnero
 * @version 1.0
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * AJAX
	 * 
	 * Ejemplo de uso POST (no usar &amp; como separador de campos, solo &): <form method="post" onsubmit="$(descriptor/objeto).ajax('ajax.php','campo1='+document.getElementById('campo1').value+'&campo2='+document.getElementById('campo2').value,'post'); return false" action="#">
	 * Ejemplo de uso GET: $(descriptor/objeto).ajax('ajax.php?campo1='+document.getElementById('campo1').value+'&amp;campo2='+document.getElementById('campo2').value);
	 *
	 * Este metodo devuelve lo que devuelva el callback (nada, por defecto)
	 * Tener en cuenta que cada cambio de ajax.readyState puede devolver lo que devuelva el callback asociado
	 * 
	 * El primer parametro puede ser un objeto (en cuyo caso se ignoran el resto de parametros, si los hubiera)
	 * con las siguientes propiedades (puede omitirse cualquiera excepto url):
	 * <code>
{
url: 'ajax.php', //string Direccion que devolvera los datos por ajax
cabeceras: {}, //Object Cabeceras a enviar con la peticion, ej.: contentType: 'application/json; charset=utf-8'
valores: 'param1=val1&param2=val2', //string Valores que se enviaran, si la peticion es POST
metodo: 'post', //string Metodo de comunicacion con url (GET o POST)
asincrono: true, //boolean Si true -> asincrono (continua ejecucion sin esperar), false -> isocrono
formatoDatos: 'text', //string Formato en que se espera recibir los datos; otros valores: json, xml
cbEnd: function (jsf, xhr){if(jsf.tagName == 'INPUT'){jsf.value = xhr.responseText;}else{jsf.innerHTML = xhr.responseText;}return;}, //function Callback a ejecutar cuando se ha recibido la respuesta AJAX, recibe automaticamente el objeto en curso (primer parametro) y el objeto AJAX (segundo parametro)
cbStart: function (jsf, xhr){jsf.innerHTML = JaSper._t('ajax/ajax_2') + '...';return;}, //function Callback a ejecutar cuando se inicia la peticion AJAX, recibe automaticamente el objeto en curso (primer parametro) y el objeto AJAX (segundo parametro)
cbFail: function (jsf, xhr){return;}, //function Callback a ejecutar cuando falla la peticion AJAX, recibe automaticamente el objeto en curso (primer parametro) y el objeto AJAX (segundo parametro)
}
	 * </code>
	 *
	 * @since 2010-12-14
	 * @param {string} url Direccion que devolvera los datos por ajax (obligatorio)
	 * @param {string} valores Valores que se enviaran, si la peticion es POST
	 * @param {string} metodo Metodo de comunicacion con url (GET o POST)
	 * @return {object}
	 */
	ajax: function (url, valores, metodo){
		var cabeceras = {}; //headers
		var asincrono = null;
		var formatoDatos = 'text';
		var cbEnd = null;
		var cbStart = null;
		var cbFail = null;

		if(typeof url === 'object'){
			var obj = url;
			url = obj.url || null;
			cabeceras = obj.cabeceras || {};
			valores = obj.valores || null;
			metodo = obj.metodo || null;
			asincrono = obj.asincrono || null;
			formatoDatos = obj.formatoDatos || 'text';
			cbEnd = obj.cbEnd || null;
			cbStart = obj.cbStart || null;
			cbFail = obj.cbFail || null;
		}

		//callback de fin de peticion (con exito), carga el texto devuelto en el objeto
		cbEnd = cbEnd || function (oDomElem, oXhr){if(oDomElem.tagName === 'INPUT'){oDomElem.value = oXhr.responseText;}else{oDomElem.innerHTML = oXhr.responseText;}return;};
		//callback de inicio de peticion, por defecto pone en el objeto el mensaje "Cargando..." al inicio de la petición AJAX
		cbStart = cbStart || function (oDomElem, oXhr){oDomElem.innerHTML = JaSper._t('ajax/ajax_2') + '...'; return null;};
		//callback de fin de peticion (con error), muestra un mensaje en el objeto para error 404 y otro para el resto
		cbFail = cbFail || function (oDomElem, oXhr){
			switch(oXhr.status){
				case 0: //0 Respuesta vacia, puede ser peticion a otro dominio
					JaSper.log('-JaSper::ajax- ' + JaSper._t('ajax/ajax_3'), 1);
					oDomElem.innerHTML = JaSper._t('ajax/ajax_3');
					break;
				case 401: //401: Unauthorized
					JaSper.log('-JaSper::ajax- ' + JaSper._t('ajax/ajax_4'), 1);
					oDomElem.innerHTML = JaSper._t('ajax/ajax_4');
					break;
				case 403: //403: Forbidden
					JaSper.log('-JaSper::ajax- ' + JaSper._t('ajax/ajax_5'), 1);
					oDomElem.innerHTML = JaSper._t('ajax/ajax_5');
					break;
				case 404: //404: Not Found
					JaSper.log('-JaSper::ajax- ' + JaSper._t('ajax/ajax_6'), 1);
					oDomElem.innerHTML = JaSper._t('ajax/ajax_6');
					break;
				default: //algun otro error
					JaSper.log('-JaSper::ajax- ' + JaSper._t('ajax/ajax_7') + ': ' + oXhr.status + ', ' + oXhr.statusText + ' (' + oXhr.responseText + ')', 2);
					oDomElem.innerHTML = JaSper._t('ajax/ajax_7') + ': ' + oXhr.status;
			}
			return null;
		};

		this.each(function (sUrl, oCabeceras, sValores, sMetodo, bAsincrono, sFormatoDatos){
			JaSper.ajax.send({
				url: sUrl,
				cabeceras: oCabeceras,
				valores: sValores,
				metodo: sMetodo,
				asincrono: bAsincrono,
				formatoDatos: sFormatoDatos,
				elementoDom: this,
				cbEnd: cbEnd,
				cbFail: cbFail,
				cbStart: cbStart
			});
		}, [url, cabeceras, valores, metodo, asincrono, formatoDatos]);

		return this;
	}

});

//IE cachea las respuestas con la misma url; se puede solucionar añadiendo algo aleatorio a la url de peticion
JaSper.ajax = {

	/**
	 * Crear nuevo elemento AJAX y lo devuelve para su uso
	 * 
	 * @since 2010-12-14
	 * @return {object}
	 */
	nuevo: function (){
		'use strict';

		var xmlhttp = false;
		if(typeof XMLHttpRequest !== 'undefined'){ //no IE
			xmlhttp = new XMLHttpRequest();
		}
		else{ //IE
			try{
				xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
			}
			catch(oErr){
				try{
					xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
				}
				catch(oErr2){
					try{
						xmlhttp = new ActiveXObject('Msxml2.XMLHTTP.4.0');
					}
					catch(oErr3){
						JaSper.log('-JaSper::ajax- ' + JaSper._t('ajax/ajax_1'), 2);
					}
				}
			}
		}

		if(!xmlhttp){
			JaSper.log('-JaSper::nuevoAjax- No se pudo crear el objeto AJAX.', 2);
		}

		return xmlhttp;
	},

	/**
	 * Envia peticiones AJAX
	 *
	 * {string} oParams.url Direccion a la que hacer la peticion ajax (obligatorio)
	 * {Object} oParams.cabeceras Headers a enviar con la petición: -tipo:"valor"-; se intenta poner todos los enviados, aunque se puedan pisar o entrar en conflicto
	 * {Object|string} oParams.valores Valores que se enviaran, si la peticion es POST; cadena en la forma "clave=valor&clave2=valor2" u objeto en la forma "{clave: 'valor', clave2: 'valor2'}" (en este caso se protegen los datos con "encodeURIComponent", tanto claves como valores) //TODO concatenar a la url en peticiones GET
	 * {string} oParams.metodo Metodo de comunicacion con url (GET o POST)
	 * {boolean} oParams.asincrono tercer parametro de "ajax.open": true -> asincrono (continua ejecucion sin esperar), false -> isocrono (espera hasta finalizar para continuar)
	 * {string} oParams.returnData Formato en que se espera recibir los datos, por defecto "text"; otros valores: json, xml
	 * {object} oParams.elementoDom Elemento DOM que recibira la informacion devuelta por la peticion AJAX
	 * {object} oParams.cbEnd Callback de fin (exito) de peticion AJAX
	 * {object} oParams.cbFail Callback de fallo de peticion AJAX
	 * {object} oParams.cbStart Callback de inicio de peticion AJAX
	 * 
	 * @todo contentType: 'application/json' // application/x-www-form-urlencoded; charset=utf-8 // text/html; charset=windows-1251 // dataType
	 * @since 2016-03-28
	 * @param {string} oParams Objeto de parametros
	 * @return {object}
	 */
	send: function (oParams){
	//send: function (url, cabeceras, valores, metodo, asincrono, returnData, element, cbEnd, cbFail, cbStart){
		'use strict';

		if(typeof oParams !== 'object' || !oParams.url){ //no tiene sentido si no hay URL a la que llamar
			JaSper.log('-JaSper::ajax.send- Sin URL que consultar', 1);
			return false;
		}

		oParams.cabeceras = oParams.cabeceras || {}; //headers
		oParams.valores = oParams.valores || null;
		oParams.metodo = (oParams.metodo || 'get').toUpperCase();
		oParams.asincrono = typeof oParams.asincrono !== 'boolean' ? true : oParams.asincrono;
		oParams.returnData = oParams.returnData || 'text';
		oParams.elementoDom = oParams.elementoDom || null;

		//callback de fin de peticion (con exito), carga el texto devuelto en log
		oParams.cbEnd = oParams.cbEnd || function (oDomElem, oXhr){JaSper.log(oXhr.responseText); return;};
		//callback de inicio de peticion, por defecto log del mensaje "Cargando..." al inicio de la petición AJAX
		oParams.cbStart = oParams.cbStart || function (oDomElem, oXhr){JaSper.log(JaSper._t('ajax/ajax_2') + '...'); return;};
		//callback de fin de peticion (con error), muestra mensajes para error
		oParams.cbFail = oParams.cbFail || function (oDomElem, oXhr){
			switch(oXhr.status){
				case 0: //0 Respuesta vacia, puede ser peticion a otro dominio
					JaSper.log('-JaSper::ajax.send- ' + JaSper._t('ajax/ajax_3'), 1);
					break;
				case 401: //401: Unauthorized
					JaSper.log('-JaSper::ajax.send- ' + JaSper._t('ajax/ajax_4'), 1);
					break;
				case 403: //403: Forbidden
					JaSper.log('-JaSper::ajax.send- ' + JaSper._t('ajax/ajax_5'), 1);
					break;
				case 404: //404: Not Found
					JaSper.log('-JaSper::ajax.send- ' + JaSper._t('ajax/ajax_6'), 1);
					break;
				default: //algun otro error
					JaSper.log('-JaSper::ajax.send- ' + JaSper._t('ajax/ajax_7') + ': ' + oXhr.status + ', ' + oXhr.statusText + ' (' + oXhr.responseText + ')', 2);
			}
			return;
		};

		var oAjax = JaSper.ajax.nuevo();

		if(!oAjax){
			JaSper.log('-JaSper::ajax.send- ' + JaSper._t('ajax/ajax_1'));
			if(oParams.elementoDom){
				oParams.elementoDom.innerHTML = JaSper._t('ajax/ajax_1');
			}
			return false;
		}

		//HEAD request
		/*xmlhttp.open("HEAD", "/faq/index.html",true);
xmlhttp.onreadystatechange = function (){
if(xmlhttp.readyState == 4){
	alert(xmlhttp.getAllResponseHeaders());
	alert("File was last modified on - " + xmlhttp.getResponseHeader("Last-Modified"));
	if(xmlhttp.status==200) alert("URL Exists!") //file_exists
	else if (xmlhttp.status==404) alert("URL doesn't exist!")
	else alert("Status is "+xmlhttp.status)
}
};
xmlhttp.send(null);*/
		/*FIXME Passing null username, generates a login popup on Opera (#2865)
if ( s.username ) oXhr.open( s.type, s.url, s.async, s.username, s.password );*/
		oAjax.open(oParams.metodo, oParams.url, oParams.asincrono);

		if(oParams.metodo === 'POST'){
			oAjax.setRequestHeader('Method', 'POST ' + oParams.url + ' HTTP/1.1');
			oAjax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			//oAjax.setRequestHeader("Content-length", sValores.length); //esta y la siguiente las pone el navegador automaticamente, no se deben asignar a mano (problemas de seguridad)
			//oAjax.setRequestHeader("Connection", "close");
		}
		oAjax.setRequestHeader('Pragma', 'cache=no'); //es posible que sea necesario poner en la url un numero aleatorio en cada peticion para evitar la cache (IE), ej.: sumar a la url "new Date().getTime()"
		oAjax.setRequestHeader('Cache-Control', 'no-transform');
		oAjax.setRequestHeader('X-Requested-With', 'JaSper XMLHttpRequest');
		if(oAjax.overrideMimeType){oAjax.overrideMimeType('text/xml; charset=utf-8'); /*Firefox & Safari*/}

		for(var sCabecera in oParams.cabeceras){
			oAjax.setRequestHeader(sCabecera, oParams.cabeceras[sCabecera]);
		}

		oAjax.responseType = oParams.returnData;

		var sValores = oParams.valores;
		if(typeof oParams.valores === 'object'){
			var aValores = [];

			for(var sValor in oParams.valores){
				aValores[aValores.length] = encodeURIComponent(sValor) + '=' + encodeURIComponent(oParams.valores[sValor]);
			}
			sValores = aValores.join('&');
		}
		//FIXME si metodo == 'GET', sValores debe ser nulo concatenando previamente lo que tuviese a url
		oAjax.send(sValores);

		var oCallback = function (){
		//ajax.onreadystatechange = function (){ //debe ir despues de "ajax.send()" o no funciona en firefox (4 o superior), no esta claro en que orden deben ir send y onreadystatechange (revisar)
			/*0: (No inicializado) - Los datos de la petición no se han definido // The request is uninitialized (before you've called open()). //UNSENT 	Client has been created. open() not called yet.
			1: (Abierto) - La recepción de datos está en curso // The request is set up, but not sent (before you've called send()). //OPENED 	open() has been called. //HEADERS_RECEIVED 	send() has been called, and headers and status are available.
			2: (Cargado) - La recepción de datos ha finalizado pero los datos no están disponibles // The request was sent and is in process (you can usually get content headers from the response at this point).
			3: (Interactive) - El objeto aún no está listo para otra petición pero ha recibido ya los datos. // The request is in process; often some partial data is available from the response, but the server isn't finished with its response. //LOADING 	Downloading; responseText holds partial data.
			4: (Completado) - El objeto está listo para otra petición // The response is complete; you can get the server's response and use it. //DONE 	The operation is complete.*/

			if(oAjax.readyState < 4){ //TODO otro callback para los cambios de estado?
				JaSper.log('-JaSper::ajax.send- Peticion recibida, ajax.readyState = ' + oAjax.readyState + '; ajax.responseText = ' + (!oAjax.responseText ? '' : oAjax.responseText));
				return oParams.cbStart(oParams.elementoDom, oAjax); //callback de inicio de peticion y espera
			}
			else if(oAjax.readyState === 4){
				if(oAjax.status === 200){ //respuesta correcta recibida
					JaSper.log('-JaSper::ajax.send- Respuesta recibida, proceso completado');
					return oParams.cbEnd(oParams.elementoDom, oAjax); //callback de fin de peticion (CON exito)
				}

				return oParams.cbFail(oParams.elementoDom, oAjax); //callback de fin de peticion (SIN exito)
			}
		};

		if(!oParams.asincrono){
			oCallback();
		}
		else if(oAjax.readyState === 4){
			setTimeout(oCallback, 0); //(IE6 & IE7) necesario si esta en cache y ha sido recuperado directamente
		}
		else{
			oAjax.onreadystatechange = oCallback;
		}

		//delete ajax; //limpia de memoria el objeto
	}

};
