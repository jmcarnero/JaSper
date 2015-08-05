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
 * Funciones de fechas y de tiempo
 * Datepicker
 * Countdown
 * Timepicker
 *
 * @author José M. Carnero
 * @since 2015-06-24
 * @version 1.0
 */
JaSper.extend(JaSper.prototype, {

	/**
	 * Crea un marcador de cuenta atras
	 * pinta segundos, minutos, horas y dias donde corresponda
	 *
	 * @see para las funciones de canvas depende de la libreria JaSper_canvas.js
	 * @todo añadir semanas por mes (variable), meses (28, 29, 30 o 31 dias) y años
	 * @param {integer} iPeriodo Numero de segundos a ir descontando //se calcula con respecto al inicio unix del tiempo, 1970-01-01, si es negativo o mayor que el numero de segundos hasta la actualidad dara problemas
	 * @param {function} fCallback lanza esta funcion para cada parte de tiempo, ej.: para los segundos la lanzara 60 veces por minuto, pasandole como primer parametro el segundo actual (de 1 a 60) y segundo el divisor (en este caso 60, total de segundos); this dentro del callback sera el span correspondiente (en el ej. seria el de segundos)
	 */
	countdown: function (iPeriodo, fCallback){
		iPeriodo = iPeriodo || Date.now() / 1000 + 100;

		var oCallback = function (oObj, iTiempo, iTotal){
			if(fCallback){
				oObj = oObj || null;
				return fCallback.apply(oObj, [iTiempo, iTotal]);
			}
		};

		var oPinta = function (oObjs, iPeriodo){
			var oTiemposTotales = {seg: 0, min: 0, hor: 0, dia: 0, sem: 0};
			var oTiemposParciales = {seg: 0, min: 0, hor: 0, dia: 0, sem: 0};

			oTiemposTotales.seg = iPeriodo - (Date.now() / 1000);
			oTiemposParciales.seg = Math.floor(oTiemposTotales.seg % 60);

			oTiemposTotales.min = oTiemposTotales.seg / 60;
			oTiemposParciales.min = Math.floor(oTiemposTotales.min % 60);

			oTiemposTotales.hor = oTiemposTotales.min / 60;
			oTiemposParciales.hor = Math.floor(oTiemposTotales.hor % 24);

			oTiemposTotales.dia = oTiemposTotales.hor / 24;
			oTiemposParciales.dia = Math.floor(oTiemposTotales.dia % 30);

			if(oTiemposTotales.seg){
				oObjs.seg.innerHTML = oTiemposParciales.seg;
				oCallback(oObjs.seg, oTiemposParciales.seg, 60);
			}
			if(oTiemposTotales.min){
				oObjs.min.innerHTML = oTiemposParciales.min;
				oCallback(oObjs.min, oTiemposParciales.min, 60);
			}
			if(oTiemposTotales.hor){
				oObjs.hor.innerHTML = oTiemposParciales.hor;
				oCallback(oObjs.hor, oTiemposParciales.hor, 24);
			}
			if(oTiemposTotales.dia){
					oObjs.dia.innerHTML = Math.floor(oTiemposTotales.dia);
					//oCallback(oObjs.dia, oTiemposParciales.dia, 30);
					oCallback(oObjs.dia, Math.floor(oTiemposTotales.dia), 365); //TODO toma como referencia la duracion de un año, cambiar?
			}

			var callCountdown = setTimeout(function (){oPinta(oObjs, iPeriodo);}, 1000); //espera un segundo
		}

		this.each(function (){
			var oCont = JaSper.nodo.crear('p', {class: 'JaSper countdown'}, this);

			//objetos a pintar (span de segundos, minutos, etc)
			var oObjs = {
				dia: JaSper.nodo.crear('span', {class: 'dias'}, oCont),
				hor: JaSper.nodo.crear('span', {class: 'horas'}, oCont),
				min: JaSper.nodo.crear('span', {class: 'minutos'}, oCont),
				seg: JaSper.nodo.crear('span', {class: 'segundos'}, oCont)
			};

			oPinta(oObjs, iPeriodo);
		});

		return this;
	},

	/**
	 * Construye un selector de fechas
	 * 
	 * @param {props} Propiedades del selector de fechas
	 * @return {Object} JaSper
	 */
	datePicker: function (props){
		props = props || {};
		props.contenedor = props.contenedor || 'JaSperDatePicker'; //clase CSS del contenedor, tambien usado para data-
		props.fechaMin = new Date(props.fechaMin || '1970-01-01'); //fecha minima a mostrar
		props.fechaIni = new Date(props.fechaIni || new Date()); //fecha inicial
		props.fechaMax = new Date(props.fechaMax || '2222-01-01'); //fecha maxima a mostrar
		props.formato = props.formato || 'yyyy-mm-dd'; //formato de fecha
		props.semana = props.semana || ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']; //Dias, nombres completos
		props.semanaCorta = props.semanaCorta || ['L', 'M', 'X', 'J', 'V', 'S', 'D']; //Iniciales de dias
		props.mesesCorto = props.mesesCorto || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']; //Meses en formato corto

		var append = function (oElem, sHtml, sId){
			var elem = JaSper.nodo.crear('div', {innerHTML: sHtml, class: sId});

			if(oElem.nodeType == 1)
				return oElem.parentNode.appendChild(elem);
		}

		//devuelve un array con fechaBotonMesAnterior, fechaActual, fechaBotonMesSiguiente
		//tomando como fecha actual la que recibe por parametro
		var fechasCaption = function (fecha){
			var aPartesFecha = {t: fecha, a: fecha.getFullYear(), m: fecha.getMonth() + 1, d: fecha.getDate()};

			var sMesAnterior = aPartesFecha.a + '-' + ('00' + (aPartesFecha.m - 1)).slice(-2) + '-01'; //fecha para el boton de mes anterior
			if(aPartesFecha.m == 1){ //cambia de anio si el mes sale de rango
				var sMesAnterior = (aPartesFecha.a - 1) + '-12-01';
			}

			var sMesSiguiente = aPartesFecha.a + '-' + ('00' + (aPartesFecha.m + 1)).slice(-2) + '-01'; //fechas para el boton de mes siguiente
			if(aPartesFecha.m == 12){ //cambia de anio si el mes sale de rango
				var sMesSiguiente = (aPartesFecha.a + 1) + '-01-01';
			}

			return [sMesAnterior, aPartesFecha.a + ' - ' + props.mesesCorto[aPartesFecha.m], sMesSiguiente];
		};

		var mesTablaBody = function (fecha){
			var aPartesFecha = {t: fecha, a: fecha.getFullYear(), m: fecha.getMonth() + 1, d: fecha.getDate()};

			var iDiaInicial = (new Date(aPartesFecha.a, aPartesFecha.m - 1, 1)).getDay() - 1; //que dia de la semana es el dia 1 del mes a pintar
			iDiaInicial = iDiaInicial < 0 ? 6 : iDiaInicial;
			var iDiasEnMes = JaSper.datetime.diasEnMes(aPartesFecha.t);

			var aMesAnterior = [aPartesFecha.a, aPartesFecha.t.getMonth() - 1]; //fecha del mes anterior
			if(aMesAnterior < 0){ //cambia de anio si el mes sale de rango
				aMesAnterior[0] = aMesAnterior[0]--;
				aMesAnterior[1] = 11;
			}
			var iDiasEnMesPasado = JaSper.datetime.diasEnMes(aMesAnterior[0], aMesAnterior[1]);

			/*var aMesSiguiente = [aPartesFecha.a, aPartesFecha.t.getMonth() + 1]; //fecha del mes siguiente
			if(aMesSiguiente > 11){ //cambia de anio si el mes sale de rango
				aMesSiguiente[0] = aMesSiguiente[0]++;
				aMesSiguiente[1] = 1;
			}
			var iDiasEnMesSiguiente = JaSper.datetime.diasEnMes(aMesSiguiente[0], aMesSiguiente[1]);/**/

			var sDataTag = ' data-' + props.contenedor;

			var sMesTabla = '';
			for(var i = -iDiaInicial; i < iDiasEnMes;){
				var sSemana = '<tr>';

				for(var j = 0; j < props.semanaCorta.length; j++){
					var sClase, iAnio = aPartesFecha.a, iMes = aPartesFecha.m, iDia = i + j + 1;

					if(iDia <= 0){
						iDia = iDiasEnMesPasado + iDia;
						if(--iMes < 1){
							iAnio--;
							iMes = 12;
						}
						sClase = 'mesPasado';
					}
					else if(iDia > iDiasEnMes){
						iDia = iDia - iDiasEnMes;
						if(++iMes > 12){
							iAnio++;
							iMes = 1;
						}
						sClase = 'mesSiguiente';
					}
					else{
						sClase = 'mesActual';
					}

					sSemana += '<td class="' + sClase + '"' + sDataTag + '="' + (iAnio + '-' + iMes + '-' + iDia) + '">' + iDia + '</td>';
				}
				i = i + j;
				sSemana += '</tr>';

				sMesTabla += sSemana;
			}

			return sMesTabla;
		};

		var mesTabla = function (fecha){
			var aPartesFecha = {t: fecha, a: fecha.getFullYear(), m: fecha.getMonth() + 1, d: fecha.getDate()};

			var sDataTag = ' data-' + props.contenedor;

			var aFechasCaption = fechasCaption(fecha);

			var sMesTabla = '<table>';
			sMesTabla += '<caption><span class="butMesAnterior"' + sDataTag + '="' + aFechasCaption[0] + '">&lt;&lt;</span>&nbsp;&nbsp;&nbsp;<span class="mesActual">' + aFechasCaption[1] + '</span>&nbsp;&nbsp;&nbsp;<span class="butMesSiguiente"' + sDataTag + '="' + aFechasCaption[2] + '">&gt;&gt;</span></caption>';

			sMesTabla += '<thead><tr>';
			for(var i = 0; i < props.semanaCorta.length; i++){
				sMesTabla += '<td>' + props.semanaCorta[i] + '</td>';
			}
			sMesTabla += '</tr></thead>';

			sMesTabla += '<tbody>';
			sMesTabla += mesTablaBody(fecha);
			sMesTabla += '</tbody>';

			sMesTabla += '</table>';
			return sMesTabla;
		};

		this.each(function (sDP, sCont){
			var sDataTag = 'data-' + sCont, oInput = this, oContenedor = append(this, sDP, sCont);

			JaSper(oInput).eventAdd('click', function (ev){
				oContenedor.style.display = 'block';
			});

			var eMuestraTabla = function (ev){ //onclick en cualquier dia del calendario
				oContenedor.style.display = 'none';
				oInput.value = JaSper.nodo.attrib(this, sDataTag);
			}
	
			JaSper('tbody td.mesPasado, tbody td.mesActual, tbody td.mesSiguiente', oContenedor).eventAdd('click', eMuestraTabla); //TODO cambiar de mes al darle a un dia de otro mes?

			JaSper('caption span.butMesAnterior, caption span.butMesSiguiente', oContenedor).eventAdd('click', function (ev){
				JaSper('tbody td.mesPasado, tbody td.mesActual, tbody td.mesSiguiente', oContenedor).eventRemove('click', eMuestraTabla); //TODO comprobar si al eliminar este grupo de eventos se eliminan de todos los "each" o solo del interesado
				var oFecha = new Date(JaSper.nodo.attrib(this, sDataTag));
				JaSper('tbody', oContenedor).html(mesTablaBody(oFecha));

				var aFechasCaption = fechasCaption(oFecha);

				JaSper('caption span.butMesAnterior', oContenedor).attrib(sDataTag, aFechasCaption[0]);
				JaSper('caption span.mesActual', oContenedor).html(aFechasCaption[1]);
				JaSper('caption span.butMesSiguiente', oContenedor).attrib(sDataTag, aFechasCaption[2]);

				JaSper('tbody td.mesPasado, tbody td.mesActual, tbody td.mesSiguiente', oContenedor).eventAdd('click', eMuestraTabla);
			});
		}, [mesTabla(props.fechaIni), props.contenedor]);

		return this;
	},

	/**
	 * Construye un selector de horas
	 * 
	 * @param {props} Propiedades del selector de horas
	 * @return {Object} JaSper
	 */
	timePicker: function (props){
		props = props || {};

		this.each(function (){
			return JaSper.anim.fade(this, oTipo, iMiliSec);
		});

		return this;
	}

});

JaSper.datetime = {};

JaSper.extend(JaSper.datetime, {

	/*function firstDayInPreviousMonth(yourDate) {
		return new Date(yourDate.getFullYear(), yourDate.getMonth() - 1, 1);
	}*/

	/**
	 * Devuelve cuantos dias tiene un mes
	 *
	 * @param {integer|Date} year Anio u objeto fecha
	 * @param {integer} month Mes
	 * @return {number}
	 */
	diasEnMes: function (anio, mes){
		if(JaSper.datetime.esFecha(anio)){
			mes = anio.getMonth();
			anio = anio.getFullYear();
		}

		if(!JaSper.funcs.isNumber(anio) || !JaSper.funcs.isNumber(mes))
			return false;

		//compensan si se pasan cantidades de meses fuera de rango
		var resto = Math.ceil((mes - 11) / 12);
		mes = resto > 0 ? 11 : (resto < 0 ? 0 : mes);
		anio = anio + resto;

		return [31, JaSper.datetime.esBisiesto(anio) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mes];
	},

	//ano bisiesto
	//Matti Virkkunen: http://stackoverflow.com/a/4881951
	esBisiesto: function (anio){
		return anio % 4 === 0 && anio % 100 !== 0 || anio % 400 === 0;
	},

	esFecha: function (fecha){
		return (/Date/).test(Object.prototype.toString.call(fecha)) && !isNaN(fecha.getTime());
	},

	esFinde: function (fecha){
		var day = fecha.getDay();
		return day === 0 || day === 6;
	},

});
