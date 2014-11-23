/*Copyright (C) 2009 José Manuel Carnero <jmanuel@sargazos.net>

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
 * Funciones AJAX para JaSper
 * IE cachea las respuestas con la misma url, se ve claro en el ejemplo (que devuelve un numero aleatorio, pero siempre con la solicitado a la misma url); se puede solucionar añadiendo algo aleatorio a la url de peticion
 * 
 */

/*traducciones*/
JaSper.funcs.extendTrads({
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

JaSper.funcs.extend(JaSper.funcs, {
	/**
	 * Crear nuevo elemento AJAX y lo devuelve para su uso
	 * 
	 * @since 2010-12-14
	 * @return object
	 */
	nuevoAjax: function(){
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
						JaSper.funcs.debugShow('-JaSper::ajax- ' + JaSper.funcs._tradR('ajax/ajax_1'));
					}
				}
			}
		}

		if(!xmlhttp) JaSper.funcs.debugShow('-JaSper::nuevoAjax- No se pudo crear el objeto AJAX.');

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
	 * No permite encadenado de metodos
	 *
	 * @since 2010-12-14
	 * @param string url Direccion que devolvera los datos por ajax
	 * @param string valores Valores que se enviaran, si la peticion es POST
	 * @param string metodo Metodo de comunicacion con url (GET o POST)
	 * @param boolean asincrono Si true -> asincrono (continua ejecucion sin esperar), false -> isocrono
	 * @param function cbEnd Callback a ejecutar cuando se ha recibido la respuesta AJAX, recibe automaticamente el objeto en curso (primer parametro) y el objeto AJAX (segundo parametro)
	 * @param function cbStart Callback a ejecutar cuando se inicia la peticion AJAX, recibe automaticamente el objeto en curso (primer parametro) y el objeto AJAX (segundo parametro)
	 * @param function cbFail Callback a ejecutar cuando falla la peticion AJAX, recibe automaticamente el objeto en curso (primer parametro) y el objeto AJAX (segundo parametro)
	 * @return object
	 */
	ajax: function(url, valores, metodo, asincrono, cbEnd, cbStart, cbFail){
		if(!valores) var valores = null;
		else if(!metodo) var metodo = 'post';
		if(!metodo) var metodo = 'get';

		//callback de fin de peticion (con exito), carga el texto devuelto en el objeto
		if(!cbEnd) var cbEnd = function(jsf, xhr){if(jsf.tagName == 'INPUT'){jsf.value = xhr.responseText;}else{jsf.innerHTML = xhr.responseText;}return;};
		//callback de inicio de peticion, por defecto pone en el objeto el mensaje "Cargando..." al inicio de la petición AJAX
		if(!cbStart) var cbStart = function(jsf, xhr){jsf.innerHTML = JaSper.funcs._tradR('ajax/ajax_2') + '...';return;};
		//callback de fin de peticion (con error), muestra un mensaje en el objeto para error 404 y otro para el resto
		if(!cbFail) var cbFail = function(jsf, xhr){
			switch(xhr.status){
				case 0: //0 Respuesta vacia, puede ser peticion a otro dominio
					JaSper.funcs.debugShow('-JaSper::ajax- ' + JaSper.funcs._tradR('ajax/ajax_3'));
					jsf.innerHTML = JaSper.funcs._tradR('ajax/ajax_3');
					break;
				case 401: //401: Unauthorized
					JaSper.funcs.debugShow('-JaSper::ajax- ' + JaSper.funcs._tradR('ajax/ajax_4'));
					jsf.innerHTML = JaSper.funcs._tradR('ajax/ajax_4');
					break;
				case 403: //403: Forbidden
					JaSper.funcs.debugShow('-JaSper::ajax- ' + JaSper.funcs._tradR('ajax/ajax_5'));
					jsf.innerHTML = JaSper.funcs._tradR('ajax/ajax_5');
					break;
				case 404: //404: Not Found
					JaSper.funcs.debugShow('-JaSper::ajax- ' + JaSper.funcs._tradR('ajax/ajax_6'));
					jsf.innerHTML = JaSper.funcs._tradR('ajax/ajax_6');
					break;
				default: //algun otro error
					JaSper.funcs.debugShow('-JaSper::ajax- ' + JaSper.funcs._tradR('ajax/ajax_7') + ': ' + xhr.status + ', ' + xhr.statusText + ' (' + xhr.responseText + ')');
					jsf.innerHTML = JaSper.funcs._tradR('ajax/ajax_7') + ': ' + xhr.status;
			}
			return;
		};

		if(typeof asincrono != 'boolean') var asincrono = true; //tercer parametro de "ajax.open": true -> asincrono (continua ejecucion sin esperar), false -> isocrono (espera hasta finalizar para continuar)

		metodo = metodo.toUpperCase();

		this.each(function (url, valores, metodo, asincrono){
			var ajax = JaSper.funcs.nuevoAjax();

			if(!ajax){
				JaSper.funcs.debugShow('-JaSper::ajax- ' + JaSper.funcs._tradR('ajax/ajax_1'));
				this.innerHTML = JaSper.funcs._tradR('ajax/ajax_1');
				return(false);
			}

//HEAD request
/*xmlhttp.open("HEAD", "/faq/index.html",true);
xmlhttp.onreadystatechange = function(){
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

			_callback = function(){
			//ajax.onreadystatechange = function(){ //debe ir despues de "ajax.send()" o no funciona en firefox (4 o superior), no esta claro en que orden deben ir send y onreadystatechange (revisar)
				/*0: (No inicializado) - Los datos de la petición no se han definido // The request is uninitialized (before you've called open()).
				1: (Abierto) - La recepción de datos está en curso // The request is set up, but not sent (before you've called send()).
				2: (Cargado) - La recepción de datos ha finalizado pero los datos no están disponibles // The request was sent and is in process (you can usually get content headers from the response at this point).
				3: (Interactive) - El objeto aún no está listo para otra petición pero ha recibido ya los datos. // The request is in process; often some partial data is available from the response, but the server isn't finished with its response.
				4: (Completado) - El objeto está listo para otra petición // The response is complete; you can get the server's response and use it.*/

				if(ajax.readyState < 4){
					JaSper.funcs.debugShow('-JaSper::ajax- Peticion recibida, ajax.readyState = ' + ajax.readyState + '; ajax.responseText = ' + (!ajax.responseText?'':ajax.responseText));
					return cbStart(obj, ajax); //callback de inicio de peticion y espera
				}
				else if(ajax.readyState == 4){
					if(ajax.status == 200){ //respuesta correcta recibida
						JaSper.funcs.debugShow('-JaSper::ajax- Respuesta recibida, proceso completado');
						return cbEnd(obj, ajax); //callback de fin de peticion (CON exito)
					}
					else return cbFail(obj, ajax); //callback de fin de peticion (SIN exito)
				}
			};

			if(!asincrono) _callback();
			else if(ajax.readyState === 4) setTimeout(_callback, 0); //(IE6 & IE7) necesario si esta en cache y ha sido recuperado directamente
			else ajax.onreadystatechange = _callback;

			delete ajax; //limpia de memoria el objeto
		}, [url, valores, metodo, asincrono]);

		return;
	}

});

/*
notacion json (en json)

var objeto = {
	"propiedad1": valor_simple_1, 
	"propiedad2": valor_simple_2,
	"propiedad3": [array1_valor1, array1_valor2], 
	"propiedad4": { "propiedad anidada": valor },
	"metodo1": nombre_funcion_externa, 
	"metodo2": function() { ... },
	"metodo3": function() { ... },
	"metodo4": function() { ... }
};
*/

/*var AjaxQueue = {
	batchSize: 1, //No.of simultaneous AJAX requests allowed, Default : 1
	urlQueue: [], //Request URLs will be pushed into this array
	elementsQueue: [], //Element IDs of elements to be updated on completion of a request ( as in Ajax.Updater )
	optionsQueue: [], //Request options will be pushed into this array
	setBatchSize: function(bSize){ //Method to set a different batch size. Recommended: Set batchSize before making requests
		this.batchSize = bSize;
	},
	push: function(url, options, elementID){ //Push the request in the queue. elementID is optional and required only for Ajax.Updater calls
		this.urlQueue.push(url);
		this.optionsQueue.push(options);
		if(elementID!=null){
			this.elementsQueue.push(elementID);
		} else {
			this.elementsQueue.push("NOTSPECIFIED");
		}

		this._processNext();
	},
	_processNext: function() { // Method for processing the requests in the queue. Private method. Don't call it explicitly
		if(Ajax.activeRequestCount < AjaxQueue.batchSize) // Check if the currently processing request count is less than batch size
		{
			if(AjaxQueue.elementsQueue.first()=="NOTSPECIFIED") { //Check if an elementID was specified
				// Call Ajax.Request if no ElementID specified
				//Call Ajax.Request on the first item in the queue and remove it from the queue
				new Ajax.Request(AjaxQueue.urlQueue.shift(), AjaxQueue.optionsQueue.shift()); 

				var junk = AjaxQueue.elementsQueue.shift();
			} else {
				// Call Ajax.Updater if an ElementID was specified.
				//Call Ajax.Updater on the first item in the queue and remove it from the queue
				new Ajax.Updater(AjaxQueue.elementsQueue.shift(), AjaxQueue.urlQueue.shift(), AjaxQueue.optionsQueue.shift());
			}
		}
	}
};
Ajax.Responders.register({
  //Call AjaxQueue._processNext on completion ( success / failure) of any AJAX call.
  onComplete: AjaxQueue._processNext
});

/************* SYNTAX ***************
AjaxQueue.setBatchSize(size);

AjaxQueue.push(URL , OPTIONS, [ElementID]);

************** USAGE ***************
AjaxQueue.setBatchSize(4);
AjaxQueue.push("http://www.testingqueue.com/process/",{onSucess: funcSuccess, onfailure: funcFailure});
AjaxQueue.push("http://www.testingqueue.com/process1/",{onSucess: funcSuccess1, onfailure: funcFailure1}, "myDiv");
AjaxQueue.push("http://www.testingqueue.com/process2/",{onSucess: funcSuccess2, onfailure: funcFailure2});
AjaxQueue.push("http://www.testingqueue.com/process3/",{onSucess: funcSuccess3, onfailure: funcFailure3});
AjaxQueue.push("http://www.testingqueue.com/process4/",{onSucess: funcSuccess4, onfailure: funcFailure4});
AjaxQueue.push("http://www.testingqueue.com/process5/",{onSucess: funcSuccess5, onfailure: funcFailure5});
**********************************/
