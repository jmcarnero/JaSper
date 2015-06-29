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

/*****************************************************
* Funciones de validacion de formularios para JaSper *
*****************************************************/

/*traducciones*/
JaSper.funcs.extendTrads({
"en":{
	'valida/bic':'BIC/SWIFT bank number invalid',
	'valida/clave':'Check that you entered the same password in both boxes',
	'valida/email':'Invalid e-mail',
	'valida/fechas':'Incorrect date.\nRecommended format for your dates: ',
	'valida/fichero':'File type not allowed.',
	'valida/iban':'IBAN bank number invalid',
	'valida/nif1':'NIE wrong.',
	'valida/nif2':'NIF wrong.',
	'valida/numeros1':'Range between ',
	'valida/numeros2':' and ',
	'valida/obligatorio':' can not be empty.',
	'valida/obligatorioRadio':' should have checked some option.',
	'valida/url':'Invalid URL.\nRecommended format: "http://dominio.tld"'},
"es":{
	'valida/bic':'Código bancario BIC/SWIFT incorrecto',
	'valida/clave':'Compruebe que ha escrito la misma clave en ambas casillas',
	'valida/email':'e-mail no v\u00E1lido',
	'valida/fechas':'Fecha incorrecta.\nFormato recomendado para las fechas: ',
	'valida/fichero':'Tipo de fichero no permitido.',
	'valida/iban':'Código bancario IBAN incorrecto',
	'valida/nif1':'NIE incorrecto',
	'valida/nif2':'NIF incorrecto',
	'valida/numeros1':'Rango entre ',
	'valida/numeros2':' y ',
	'valida/obligatorio':' no puede estar vac\u00EDo.',
	'valida/obligatorioRadio':' debe tener marcada alguna opci\u00F3n.',
	'valida/url':'URL no v\u00E1lida.\nFormato recomendado: "http://dominio.tld"'}
});

JaSper.funcs.extend(JaSper.prototype, {

	/**
	 * Valida formularios
	 * @param {Object} oProps Propiedades para las validaciones
	 * @return {Object} JaSper
	 */
	validar: function(props){

		props = props || {};
		props.clases = props.clases || {};

		props = { //opciones de configuracion del metodo
			alert: props.alert === undefined ? true : props.alert, //se muestra un alert con los mensajes de error (true)
			preview: props.preview === undefined ? false : props.preview, //muestra una prevista de imagenes cuando se preparan para subir en un input file; el input file ha de llevar un data-previewId="id_donde_mostrar_preview"

			clases: { //clases css e identificadores de filtros
				error: props.clases.error || 'frmError', //clase de errores
				obligatorio: props.clases.obligatorio || 'frmObligatorio',
				clave: props.clases.clave || 'clave',
				email: props.clases.email || 'frmEmail',
				entero: props.clases.entero || 'entero',
				fichero: props.clases.fichero || 'fichero',
				fecha: props.clases.fecha || 'fecha',
				nif: props.clases.nif || 'nif',
				numerico: props.clases.numerico || 'frmNumerico',
				telefono: props.clases.telefono || 'telefono',
				url: props.clases.url || 'url'
			}
		};

		var filters = {}; //validaciones
		filters[props.clases.obligatorio] = function (el){return JaSper.valida.obligatorio(el);};
		filters[props.clases.clave] = function (el){return JaSper.valida.clave(el, document.getElementById('objId2'));};
		filters[props.clases.email] = function (el){return JaSper.valida.email(el);};
		filters[props.clases.entero] = function (el){return JaSper.valida.numeros(el);}; //numerico de tipo entero, no permite decimales ni separadores de miles, solo numeros
		filters[props.clases.fichero] = function (el){return JaSper.valida.fichero(el);};
		filters[props.clases.fecha] = function (el){return JaSper.valida.fechas(el);};
		filters[props.clases.nif] = function (el){return JaSper.valida.nif(el);};
		filters[props.clases.numerico] = function (el){return JaSper.valida.numeros(el);}; //permite decimales, con "."
		filters[props.clases.telefono] = function (el){return JaSper.valida.numeros(el);};
		filters[props.clases.url] = function (el){return JaSper.valida.url(el);};

		var filters_keys = {};
		filters_keys[props.clases.entero] = function (ev, el){return JaSper.valida.teclasNumeros(el, ev, false);}; //numerico de tipo entero, no permite decimales ni separadores de miles, solo numeros
		filters_keys[props.clases.fecha] = function (ev, el){return JaSper.valida.teclasFechas(el, ev);};
		filters_keys[props.clases.numerico] = function(ev, el){return JaSper.valida.teclasNumeros(el, ev, true);}; //permite decimales, con "."

		this.each(function (){
			//bloqueos de teclas, se busca en cada formulario los elementos bloqueables
			JaSper('<input>,<textarea>', this).each(function(ev){
				var el = this;
				if(el.className != 'undefined'){
					var csplit = el.className.split(" ");
					for(var i = 0; i < csplit.length; i++){
						if(JaSper.funcs.isFunction(filters_keys[csplit[i]])){
							var fun = csplit[i];
							JaSper(el).eventAdd('keydown', function (ev){
								if(filters_keys[fun](ev, el)){
									JaSper.event.preventDefault(ev);
									JaSper.event.stop(ev);
									return false;
								}
								//alert(filters_keys[fun](e, el) + ' - ' + e.keyCode + ' - ' + this.id);
							});
						}
					}
				}
			});

			//muestra vista previa de la imagen cargada en un input file
			if(props.preview){
				JaSper('input[type="file"]', this).each(function (){
					var sPreviewId = (this.dataset.previewId || this.getAttribute('data-previewId')) || null;
					if(!sPreviewId) //no hay id en la que hacer preview
						return false;
					else
						sPreviewId = '#' + sPreviewId;

					$(this).eventAdd('change', function (){
						if(typeof FileReader !== "function"){ //No para navegadores antiguos
							JaSper.funcs.log('Vista previa no disponible', 0);
							return false;
						}

						var obtenerTipoMIME = function obtenerTipoMIME(cabecera){ //lee el tipo MIME de la cabecera de la imagen
							return cabecera.replace(/data:([^;]+).*/, '\$1');
						};

						var oElement = this;
						var oArchivo = oElement.files;

						if(oArchivo.length > 0){
							var oLector = new FileReader();
							oLector.onloadend = function(ev){
								//Envia la imagen a la pantalla
								var origen = ev.target; //objeto FileReader

								var tipo = obtenerTipoMIME(origen.result.substring(0, 30)); //Prepara la informacion sobre la imagen

								//Si el tipo de archivo es valido lo muestra, sino muestra un mensaje
								if(tipo !== 'image/jpeg' && tipo !== 'image/png' && tipo !== 'image/gif'){
									JaSper(sPreviewId).attrib('src', '');
									oElement.value = '';
									JaSper.funcs.log('No se puede mostrar preview del fichero seleccionado', 1);
								}
								else{
									JaSper(sPreviewId).attrib('src', origen.result);
								}
							};

							oLector.onerror = function(ev){
								JaSper.funcs.log(ev, 2);
							};

							oLector.readAsDataURL(oArchivo[0]);
						}
						else{
							JaSper(sPreviewId).attrib('src', '');
						}
					});
				});
			}
		});

		//validacion al envio
		this.eventAdd('submit', function(ev){
			window.errMens = [];

			if(typeof filters == 'undefined') return;
			JaSper('<input>,<textarea>,<select>', this).each(function(x){
				var el = this;
				if(el.className != 'undefined'){
					var csplit = el.className.split(" ");
					var aErrTemp = [];
					for(var i = 0; i < csplit.length; i++){
						if(JaSper.funcs.isFunction(filters[csplit[i]])){
							var errTemp = filters[csplit[i]](el);
							if(errTemp !== false)
								aErrTemp[aErrTemp.length] = filters[csplit[i]](el);
						}
					}

					if(aErrTemp.length){
						JaSper(el).addClass(props.clases.error);
						window.errMens[window.errMens.length] = aErrTemp.join("\n");
					}
					else
						JaSper(el).removeClass(props.clases.error);
				}
			});

			if(JaSper('.' + props.clases.error, this).length > 0){
				JaSper.event.preventDefault(ev);
				JaSper.event.stop(ev);

				/*JaSper('.' + props.clases.error).each( //marcar los errores
							function(){alert(this.name + ' error');}
						);*/
				if(props.alert)
					alert("Se han producido los siguientes errores:\n\n" + window.errMens.join("\n"));

				return false;
			}

			return true;
		});

		return this;
	}
});

JaSper.valida = {};

//validaciones
JaSper.funcs.extend(JaSper.valida, {

	/**
	 * validador BIC (Business Identifier Codes) o SWIFT
	 *
	 * @param {Object} sBic Objeto con codigo BIC a validar
	 * @return {boolean}
	 */
	bic: function(oBic){
		var bRet = true;

		oBic.value = oBic.value.toString().trim() || '';
		if(!oBic.value) //no se hacen mas comprobaciones, vacio no es BIC
			bRet = false;

		if(! /^[a-z]{6}[0-9a-z]{2}([0-9a-z]{3})?$/i.test(oBic.value)){
			bRet = false;
		}

		if(bRet) return false; //pass valida
		else return JaSper.funcs._t('valida/bic'); //pass no valida
	},

	/**
	 * Validacion de campos password
	 * 
	 * @param {Object} oClave Campo de clave original
	 * @param {Object} objId2 Id del campo de clave repetido
	 * @return {string}
	 */
	clave: function (oClave, oClave2){
		if(!oClave2)
			return false; //no se comprueba el campo de clave desde el de confirmacion

		var bRet = true;


		if(!oClave && oClave2.value != '' && oClave != oClave2.value)
			bRet = false;

		if(bRet) return false; //pass valida
		else return JaSper.funcs._t('valida/clave'); //pass no valida
	},

	/**
	 * Validacion de campos e-mail
	 *
	 * @param {Object} oEmail Email a validar
	 * @return {boolean}
	 */
	email: function (oEmail){
		var bRet = true, filtro = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		oEmail.value = oEmail.value.toString().trim() || '';

		if(oEmail.value != ''){
			if(filtro.test(oEmail.value))
				bRet = true; //e-mail valido
			else
				bRet = false; //e-mail no valido
		}

		if(bRet) return false;
		else return JaSper.funcs._t('valida/email'); //e-mail no valido
	},

	/**
	 * Validacion de campos de fechas
	 * Comprueba que una fecha introducida es valida y la convierte al formato aaaa-mm-dd hh:mm:ss; no distingue formato europeo de americano, puede dar errores en esa confusion
	 * 
	 * @param {Object} oFecha Fecha a validar
	 * @param {string} formato Formato de la fecha
	 * @return {boolean}
	 */
	fechas: function (oFecha, formato){
		if(!formato)
			formato = 'aaaa-mm-dd hh:mm:ss';

		var bRet = false; //fecha incorrecta
		oFecha.value = oFecha.value.toString().trim() || '';

		if(oFecha.value != ''){
			var fechaInt = Date.parse(oFecha.value.replace(/-/g, '/'));
			if(!isNaN(fechaInt)){
				var fecha = new Date();
				fecha.setTime(fechaInt);
				if(fecha != 'Invalid Date'){
					bRet = true; //fecha correcta
				}
			}
		}

		if(bRet) return false;
		else return (JaSper.funcs._t('valida/fechas') + formato); //fecha incorrecta
	},

	/**
	 * Validacion de campos fichero, comprueba la extension del archivo entre las permitidas
	 * 
	 * @param {Object} oFichero Fichero a validar
	 * @param {string} extensiones Extensiones permitidas
	 * @return {boolean}
	 */
	fichero: function (oFichero, extensiones){
		var bRet = true;

		oFichero.value = oFichero.value.toString().trim() || '';
		if(oFichero.value != ''){
			var aTemp = new Array();
			aTemp = oFichero.value.split('.');

			if(extensiones.indexOf(aTemp[aTemp.length - 1].toLowerCase()) >= 0)
				bRet = true; //tipo de fichero correcto
			else
				bRet = false; //tipo de fichero no permitido
		}

		if(bRet) return false;
		else return JaSper.funcs._t('valida/fichero'); //tipo de fichero no permitido
	},

	/**
	 * validador IBAN (International Bank Account Number)
	 * incluido el formato de cuenta especifico de cada pais
	 *
	 * @see https://github.com/jzaefferer/jquery-validation/blob/master/src/additional/iban.js
	 * @param {Object} oIban Codigo IBAN a validar
	 * @return {boolean}
	 */
	iban: function(oIban){
		var bRet = true;

		oIban.value = oIban.value.toString().trim() || '';
		if(oIban.value != ''){
			// remove spaces and to upper case
			var iban = oIban.value.replace(/[^a-zA-Z0-9]/img, "").toUpperCase(),
				ibancheckdigits = "",
				leadingZeroes = true,
				cRest = "",
				cOperator = "",
				ibancheck, charAt, cChar, ibanregexp, i, p;

			// check the country code and find the country specific format
			var countrycode = iban.substring(0, 2);
			var bbancountrypatterns = {
				"AD": "\\d{8}[\\dA-Z]{12}", "AE": "\\d{3}\\d{16}", "AL": "\\d{8}[\\dA-Z]{16}", "AT": "\\d{16}", "AZ": "[\\dA-Z]{4}\\d{20}",
				"BA": "\\d{16}", "BE": "\\d{12}", "BG": "[A-Z]{4}\\d{6}[\\dA-Z]{8}", "BH": "[A-Z]{4}[\\dA-Z]{14}", "BR": "\\d{23}[A-Z][\\dA-Z]",
				"CH": "\\d{5}[\\dA-Z]{12}", "CR": "\\d{17}", "CY": "\\d{8}[\\dA-Z]{16}", "CZ": "\\d{20}",
				"DE": "\\d{18}", "DK": "\\d{14}", "DO": "[A-Z]{4}\\d{20}",
				"EE": "\\d{16}", "ES": "\\d{20}",
				"FI": "\\d{14}", "FO": "\\d{14}", "FR": "\\d{10}[\\dA-Z]{11}\\d{2}",
				"GB": "[A-Z]{4}\\d{14}", "GE": "[\\dA-Z]{2}\\d{16}", "GI": "[A-Z]{4}[\\dA-Z]{15}", "GL": "\\d{14}", "GR": "\\d{7}[\\dA-Z]{16}", "GT": "[\\dA-Z]{4}[\\dA-Z]{20}",
				"HR": "\\d{17}", "HU": "\\d{24}",
				"IE": "[\\dA-Z]{4}\\d{14}", "IL": "\\d{19}", "IS": "\\d{22}", "IT": "[A-Z]\\d{10}[\\dA-Z]{12}",
				"KW": "[A-Z]{4}[\\dA-Z]{22}", "KZ": "\\d{3}[\\dA-Z]{13}",
				"LB": "\\d{4}[\\dA-Z]{20}", "LI": "\\d{5}[\\dA-Z]{12}", "LT": "\\d{16}", "LU": "\\d{3}[\\dA-Z]{13}", "LV": "[A-Z]{4}[\\dA-Z]{13}",
				"MC": "\\d{10}[\\dA-Z]{11}\\d{2}", "MD": "[\\dA-Z]{2}\\d{18}", "ME": "\\d{18}", "MK": "\\d{3}[\\dA-Z]{10}\\d{2}", "MR": "\\d{23}", "MT": "[A-Z]{4}\\d{5}[\\dA-Z]{18}", "MU": "[A-Z]{4}\\d{19}[A-Z]{3}",
				"NL": "[A-Z]{4}\\d{10}", "NO": "\\d{11}",
				"PK": "[\\dA-Z]{4}\\d{16}", "PL": "\\d{24}", "PS": "[\\dA-Z]{4}\\d{21}", "PT": "\\d{21}",
				"RO": "[A-Z]{4}[\\dA-Z]{16}", "RS": "\\d{18}",
				"SA": "\\d{2}[\\dA-Z]{18}", "SE": "\\d{20}", "SI": "\\d{15}", "SK": "\\d{20}", "SM": "[A-Z]\\d{10}[\\dA-Z]{12}",
				"TN": "\\d{20}", "TR": "\\d{5}[\\dA-Z]{17}",
				"VG": "[\\dA-Z]{4}\\d{16}"
			};

			var bbanpattern = bbancountrypatterns[countrycode];

			if(typeof bbanpattern === "undefined") //pais desconocido
				bRet = false;

			ibanregexp = new RegExp("^[A-Z]{2}\\d{2}" + bbanpattern + "$", "");
			if(!(ibanregexp.test(iban))){
				bRet = false; // invalid country specific format
			}

			// now check the checksum, first convert to digits
			ibancheck = iban.substring(4, iban.length) + iban.substring(0, 4);
			for(i = 0; i < ibancheck.length; i++){
				charAt = ibancheck.charAt(i);
				if(charAt !== "0"){
					leadingZeroes = false;
				}
				if(!leadingZeroes){
					ibancheckdigits += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(charAt);
				}
			}

			// calculate the result of: ibancheckdigits % 97
			for(p = 0; p < ibancheckdigits.length; p++){
				cChar = ibancheckdigits.charAt(p);
				cOperator = "" + cRest + "" + cChar;
				cRest = cOperator % 97;
			}
			bRet = (cRest === 1);
		}

		if(bRet) return false;
		else return JaSper.funcs._t('valida/iban');
	},

	/**
	 * Validacion de campos NIF/NIE
	 * NIF sin espacios, 10 caracteres (NIE) maximo
	 *
	 * @param {Object} oNif NIF a validar
	 * @return {boolean}
	 */
	nif: function (oNif){
		var bRet = true, mensaje = '';

		oNif.value = (oNif.value.toString().trim() || '').toUpperCase();
		if(oNif.value != ''){
			dni = oNif.value.substr(0, oNif.value.length-1); //NIF
			if(oNif.value.charAt(0) == 'X')
				dni = dni.substr(1); //NIE

			letra = oNif.value.charAt(sNif.length-1);

			if(dni.length == 8 && isNaN(letra)){
				var control = 'TRWAGMYFPDXBNJZSQVHLCKE';
				pos = dni % 23;
				control = control.charAt(pos);

				if(control==letra)
					bRet = true; //nif correcto
			}
			else{
				if(oNif.value.charAt(0) == 'X')
					mensaje += JaSper.funcs._t('valida/nif1'); //NIE
				else
					mensaje += JaSper.funcs._t('valida/nif2'); //NIF

				bRet = false; //nif incorrecto
			}
		}

		if(bRet) return false;
		else return mensaje;
	},

	/**
	 * Validacion de numericos, con rango entre "menor" y "mayor" (opcionales ambos)
	 *
	 * @param {Object} oNumero Objeto a evaluar
	 * @param {number} menor Rango minimo
	 * @param {number} mayor Rango máximo
	 * @return {boolean}
	 */
	numeros: function (oNumero, menor, mayor){
		var bRet = true;

		oNumero.value = oNumero.value.toString().trim() || '';
		if(oNumero.value != ''){
			if(typeof menor == 'undefined')
				menor = 0;
			if(typeof mayor == 'undefined')
				mayor = Math.pow(10, oNumero.maxLength);

			var num = parseInt(oNumero.value);

			if((num >= menor && num <= mayor) || oNumero == '')
				bRet = true;
			else
				bRet = false;
		}

		if(bRet) return false;
		else return (JaSper.funcs._t('valida/numeros1') + menor + JaSper.funcs._t('valida/numeros2') + mayor); //numero incorrecto
	},

	/**
	 * Campo de caracter obligatorio, no puede tener valor nulo
	 * Se llama en el envio del formulario
	 *
	 * @param {Object} oCampo Campo a validar
	 * @return {boolean}
	 */
	obligatorio: function (oCampo){
		var bRet = true, text = '';

		//evita problemas con elementos tipo file (por ejemplo), no se puede cambiar su valor
		try{oCampo.value = oCampo.value.toString().trim() || '';}
		catch(ex){JaSper.funcs.log('No se puede alterar el valor de <' + oCampo.tagName + ' id="' + oCampo.id + '" type="' + oCampo.type + '" />', 1);}

		if(oCampo.value != '') bRet = true;
		else{
			text = JaSper('<label>', oCampo.parentNode).text(); //title for error container
			bRet = false;
		}

		if(bRet) return false;
		else return ('"' + text + '"' + JaSper.funcs._t('valida/obligatorio'));
	},

	/*version para radio buttons*/
	obligatorioRadio: function (oRadio){
		var bRet = true;

		var cnt = -1, objName = oRadio;
		for(var i=objName.length-1; i > -1; i--){
			if(objName[i].checked){
				cnt = i; i = -1;
			}
		}

		if(cnt > -1) bRet = true;
		else{
			text = JaSper('<label>', oRadio.parentNode).text(); //title for error container
			bRet = false;
		}

		if(bRet) return false;
		else return ('"' + text + '"' + JaSper.funcs._t('valida/obligatorioRadio'));
	},

	/**
	 * Fuerza la entrada de solo numeros barra (/) y guion (-)
	 * Llamar con: onkeypress="return JaSper(this).valTeclasFechas(event);"
	 * o 'JaSper('#objId').addEvent("keypress", function (e){this.valTeclasFechas(e);});'
	 * 
	 * @param {Object} oCampo Campo a limitar
	 * @param {event} ev Event
	 * @return {boolean}
	 */
	teclasFechas: function (oCampo, ev){
		var bRet = false;
		ev = ev || window.event;

		var charCode = JaSper.event.keyCode(ev);
		//permite la entrada de numeros, espacio, dos puntos, barra y guion
		if(charCode > 31 && (charCode < 48 || charCode > 58) && charCode != 32 && charCode != 47 && charCode != 45){
			bRet = true; //alert("No son caracteres de fecha");
			JaSper.event.preventDefault(ev); //evita la pulsacion
		}
		else{
			bRet = false;
			if(oCampo.value.indexOf(' ') != -1 && charCode == 32)
				bRet = true;
		}

		return bRet;
	},

	/**
	 * Fuerza la entrada de solo numeros y coma decimal
	 * Llamar con: onkeypress="return valTeclasNumeros(event);"
	 * o 'JaSper('#objId').addEvent("keypress", function (e){this.valTeclasNumeros(e);});'
	 * 
	 * @param {bject} oCampo Campo a limitar
	 * @param {event} ev Evento
	 * @param {boolean} decimal true\~spanish permite punto decimal\~english allow decimal point\~
	 * @return {boolean}
	 */
	teclasNumeros: function (oCampo, ev, decimal){
		var bRet = false;
		ev = ev || window.event;
		decimal = typeof(decimal) != 'undefined' ? decimal : true;

		var char_code = JaSper.event.keyCode(ev);
		if(decimal){ //permite la entrada de numeros y punto decimal
			if(char_code > 31 && (char_code < 48 || char_code > 57) && char_code != 46){
				bRet = true; //alert("no es un numero")
				JaSper.event.preventDefault(ev); //evita la pulsacion
			}
			else{
				bRet = false;
				if(oCampo.value.indexOf('.') != -1 && char_code == 46)
					bRet = true;
			}
		}
		else{ //permite la entrada de numeros sin punto decimal
			if(char_code > 31 && (char_code < 48 || char_code > 57)){
				bRet = false; //alert("no es un numero")
				JaSper.event.preventDefault(ev); //evita la pulsacion
			}
			else
				bRet = false;
		}

		return bRet;
	},

	/**
	 * Validacion de campos URL
	 * 
	 * @param {object} oUrl Objeto a validar
	 * @return {boolean}
	 */
	url: function (oUrl){
		var bRet = true;
		var filtro = /(((ht|f)tp(s?):\/\/)|(www\.[^ [\]()\n\r\t]+)|(([012]?[0-9]{1,2}\.){3}[012]?[0-9]{1,2})\/)([^ [\](),;"'<>\n\r\t]+)([^. [\](),;"'<>\n\r\t])|(([012]?[0-9]{1,2}\.){3}[012]?[0-9]{1,2})/;
		//var filtro = /((ht|f)tp(s?):\/\/)([^ [\](),;"'<>\n\r\t]+)([^. [\](),;"'<>\n\r\t])/; //fuerza a que haya "http://" (o lo que corresponda) al principio

		oUrl.value = oUrl.value.toString().trim() || '';
		if(oUrl.value != ''){
			if(filtro.test(this.nodes[i].value))
				bRet = true; //url valida
			else
				bRet = false; //url no valida
		}

		if(bRet) return false;
		else return JaSper.funcs._t('valida/url');
	}

});
