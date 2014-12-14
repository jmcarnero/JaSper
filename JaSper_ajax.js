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
JaSper.funcs.extend(JaSper.langs, {
"en":{
	'ajax/ajax_1':'This browser can\'t create AJAX objects.',
	'ajax/ajax_2':'Loading',
	'ajax/ajax_3':'The AJAX request was empty.\nMaybe the destination URL is not accesible from this script.',
	'ajax/ajax_4':'Unauthorized (code 401).',
	'ajax/ajax_5':'Forbidden (code 403).',
	'ajax/ajax_6':'Not Found (code 404).',
	'ajax/ajax_7':'Error'},
"es":{
	'ajax/ajax_1':'Su navegador no puede crear objetos AJAX.',
	'ajax/ajax_2':'Cargando',
	'ajax/ajax_3':'La respuesta AJAX está vacía.\nPuede que la URL de destino no sea accesible desde esta máquina/dominio.',
	'ajax/ajax_4':'No tiene autorización (código 401).',
	'ajax/ajax_5':'Acceso no permitido (código 403).',
	'ajax/ajax_6':'La dirección no existe (código 404).',
	'ajax/ajax_7':'Error'}
});

/*******************************
** Funciones AJAX para JaSper **
*******************************/
JaSper.funcs.extend(JaSper.funcs, { //IE cachea las respuestas con la misma url; se puede solucionar añadiendo algo aleatorio a la url de peticion

	/**
	 * Crear nuevo elemento AJAX y lo devuelve para su uso
	 * 
	 * @since 2010-12-14
	 * @return object
	 */
	nuevoAjax: function (){
		var xmlhttp = false;
		if(typeof XMLHttpRequest != 'undefined'){ //no IE
			xmlhttp = new XMLHttpRequest();
		}
		else{ //IE
			try{
				xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
			}
			catch(e){
				try{
					xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
				}
				catch(e2){
					try{
						xmlhttp = new ActiveXObject('Msxml2.XMLHTTP.4.0');
					}
					catch(e3){
						JaSper.funcs.log('-JaSper::ajax- ' + JaSper.funcs._t('ajax/ajax_1'), 2);
					}
				}
			}
		}

		if(!xmlhttp) JaSper.funcs.log('-JaSper::nuevoAjax- No se pudo crear el objeto AJAX.', 2);

		return xmlhttp;
	}
});

JaSper.funcs.extend(JaSper.prototype, {
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
valores: 'param1=val1&param2=val2', //string Valores que se enviaran, si la peticion es POST
metodo: 'post', //string Metodo de comunicacion con url (GET o POST)
asincrono: true, //boolean Si true -> asincrono (continua ejecucion sin esperar), false -> isocrono
cbEnd: function (jsf, xhr){if(jsf.tagName == 'INPUT'){jsf.value = xhr.responseText;}else{jsf.innerHTML = xhr.responseText;}return;}, //function Callback a ejecutar cuando se ha recibido la respuesta AJAX, recibe automaticamente el objeto en curso (primer parametro) y el objeto AJAX (segundo parametro)
cbStart: function (jsf, xhr){jsf.innerHTML = JaSper.funcs._t('ajax/ajax_2') + '...';return;}, //function Callback a ejecutar cuando se inicia la peticion AJAX, recibe automaticamente el objeto en curso (primer parametro) y el objeto AJAX (segundo parametro)
cbFail: function (jsf, xhr){return;}, //function Callback a ejecutar cuando falla la peticion AJAX, recibe automaticamente el objeto en curso (primer parametro) y el objeto AJAX (segundo parametro)
}
	 * </code>
	 * 
	 * No permite encadenado de metodos
	 *
	 * @since 2010-12-14
	 * @param string url Direccion que devolvera los datos por ajax (obligatorio)
	 * @param string valores Valores que se enviaran, si la peticion es POST
	 * @param string metodo Metodo de comunicacion con url (GET o POST)
	 * @return object
	 */
	ajax: function (url, valores, metodo){

		if(typeof url === 'object'){
			var obj = url;
			var url = obj.url || null;
			var valores = obj.valores || null;
			var metodo = obj.metodo || null;
			var asincrono = obj.asincrono || null;
			var cbEnd = obj.cbEnd || null;
			var cbStart = obj.cbStart || null;
			var cbFail = obj.cbFail || null;
		}

		if(!url) return false; //no tiene sentido si no hay URL a la que llamar

		if(!valores) var valores = null;
		else if(!metodo) var metodo = 'post';
		if(!metodo) var metodo = 'get';

		//callback de fin de peticion (con exito), carga el texto devuelto en el objeto
		if(!cbEnd) var cbEnd = function (jsf, xhr){if(jsf.tagName == 'INPUT'){jsf.value = xhr.responseText;}else{jsf.innerHTML = xhr.responseText;}return;};
		//callback de inicio de peticion, por defecto pone en el objeto el mensaje "Cargando..." al inicio de la petición AJAX
		if(!cbStart) var cbStart = function (jsf, xhr){jsf.innerHTML = JaSper.funcs._t('ajax/ajax_2') + '...';return;};
		//callback de fin de peticion (con error), muestra un mensaje en el objeto para error 404 y otro para el resto
		if(!cbFail) var cbFail = function (jsf, xhr){
			switch(xhr.status){
				case 0: //0 Respuesta vacia, puede ser peticion a otro dominio
					JaSper.funcs.log('-JaSper::ajax- ' + JaSper.funcs._t('ajax/ajax_3'), 1);
					jsf.innerHTML = JaSper.funcs._t('ajax/ajax_3');
					break;
				case 401: //401: Unauthorized
					JaSper.funcs.log('-JaSper::ajax- ' + JaSper.funcs._t('ajax/ajax_4'), 1);
					jsf.innerHTML = JaSper.funcs._t('ajax/ajax_4');
					break;
				case 403: //403: Forbidden
					JaSper.funcs.log('-JaSper::ajax- ' + JaSper.funcs._t('ajax/ajax_5'), 1);
					jsf.innerHTML = JaSper.funcs._t('ajax/ajax_5');
					break;
				case 404: //404: Not Found
					JaSper.funcs.log('-JaSper::ajax- ' + JaSper.funcs._t('ajax/ajax_6'), 1);
					jsf.innerHTML = JaSper.funcs._t('ajax/ajax_6');
					break;
				default: //algun otro error
					JaSper.funcs.log('-JaSper::ajax- ' + JaSper.funcs._t('ajax/ajax_7') + ': ' + xhr.status + ', ' + xhr.statusText + ' (' + xhr.responseText + ')', 2);
					jsf.innerHTML = JaSper.funcs._t('ajax/ajax_7') + ': ' + xhr.status;
			}
			return;
		};

		if(typeof asincrono !== 'boolean') var asincrono = true; //tercer parametro de "ajax.open": true -> asincrono (continua ejecucion sin esperar), false -> isocrono (espera hasta finalizar para continuar)

		metodo = metodo.toUpperCase();

		this.each(function (url, valores, metodo, asincrono){
			var ajax = JaSper.funcs.nuevoAjax();

			if(!ajax){
				JaSper.funcs.log('-JaSper::ajax- ' + JaSper.funcs._t('ajax/ajax_1'));
				this.innerHTML = JaSper.funcs._t('ajax/ajax_1');
				return(false);
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
if ( s.username ) xhr.open( s.type, s.url, s.async, s.username, s.password );*/
			ajax.open(metodo, url, asincrono);

			if(metodo == 'POST'){
				ajax.setRequestHeader('Method', 'POST ' + url + ' HTTP/1.1');
				ajax.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
				//ajax.setRequestHeader("Content-length", valores.length); //esta y la siguiente las pone el navegador automaticamente, no se deben asignar a mano (problemas de seguridad)
				//ajax.setRequestHeader("Connection", "close");
			}
			ajax.setRequestHeader('Pragma', 'cache=no');
			ajax.setRequestHeader('Cache-Control', 'no-transform');
			ajax.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			if(ajax.overrideMimeType){ajax.overrideMimeType('text/xml; charset=utf-8'); /*Firefox & Safari*/}

			//FIXME si metodo == 'GET', valores debe ser nulo concatenando previamente lo que tuviese a url
			ajax.send(valores);

			var obj = this;

			var _callback = function (){
			//ajax.onreadystatechange = function (){ //debe ir despues de "ajax.send()" o no funciona en firefox (4 o superior), no esta claro en que orden deben ir send y onreadystatechange (revisar)
				/*0: (No inicializado) - Los datos de la petición no se han definido // The request is uninitialized (before you've called open()).
				1: (Abierto) - La recepción de datos está en curso // The request is set up, but not sent (before you've called send()).
				2: (Cargado) - La recepción de datos ha finalizado pero los datos no están disponibles // The request was sent and is in process (you can usually get content headers from the response at this point).
				3: (Interactive) - El objeto aún no está listo para otra petición pero ha recibido ya los datos. // The request is in process; often some partial data is available from the response, but the server isn't finished with its response.
				4: (Completado) - El objeto está listo para otra petición // The response is complete; you can get the server's response and use it.*/

				if(ajax.readyState < 4){
					JaSper.funcs.log('-JaSper::ajax- Peticion recibida, ajax.readyState = ' + ajax.readyState + '; ajax.responseText = ' + (!ajax.responseText?'':ajax.responseText));
					return cbStart(obj, ajax); //callback de inicio de peticion y espera
				}
				else if(ajax.readyState == 4){
					if(ajax.status == 200){ //respuesta correcta recibida
						JaSper.funcs.log('-JaSper::ajax- Respuesta recibida, proceso completado');
						return cbEnd(obj, ajax); //callback de fin de peticion (CON exito)
					}
					else return cbFail(obj, ajax); //callback de fin de peticion (SIN exito)
				}
			};

			if(!asincrono) _callback();
			else if(ajax.readyState === 4) setTimeout(_callback, 0); //(IE6 & IE7) necesario si esta en cache y ha sido recuperado directamente
			else ajax.onreadystatechange = _callback;

			//delete ajax; //limpia de memoria el objeto
		}, [url, valores, metodo, asincrono]);

		return;
	}

});
