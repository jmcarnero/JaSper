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

/**
 * Selector de elementos DOM, mediante id, clase, tag, etc. (ver detalles en constructor)
 * 
 * Basada inicialmente en Getme.js Version 1.0.4 (Rob Reid)
 * y en otros (se menciona donde corresponda si se conoce su origen)
 *
 * @author José M. Carnero
 * @since 2010-06-21
 * @version 3.0b
 * @see Al final del archivo estan las extensiones necesarias de prototipos de objetos del sistema (polyfills)
 */
(function (window, undefined){

	if(window.JaSper !== undefined) //evita problemas si se carga la libreria varias veces
		return;

	//window como parametro acelera las referencias a window
	//undefined como parametro evita confilctos y se puede usar para probar contra otras indefinidas

	//_JaSper es la llamada estatica: _JaSper.[funcion]
	//JaSper y $ son alias, para simplificar las llamadas al selector: $('selector').funcion()
	window._JaSper = window.JaSper = window.$ = function (sel, context){
		return new _JaSper(sel, context);
	};

	/**
	 * Constructor JaSper; permite varios tipos de selector
	 *
	 * [ID|#ID] selecciona el elemento con la id ID; sin # puede confundirse e intentar seleccionar todo aquello que coincida (clase = ID, tag = ID, etc)
	 * [CLASS|.clase] selecciona elementos por clase; sin . similar a anterior
	 * [NAME|@nombre] selecciona elementos por nombre (name="nombre"); sin @ similar a anterior
	 * [TAG|<tag>] selecciona todos los elementos con tipo de nodo tag (tambien lista de tags separados por coma); sin <> similar a anterior
	 * [div p span] selecciona todos los elementos que esten contenidos en un tag span que esten contenidos en un tag p que esten contenidos en div (descendientes de div que sean descendientes de p que sean span)
	 * [<div><span>texto</span></div>] selecciona los elementos que contenga la cadena HTML especificada
	 *
	 * @constructor
	 */
	_JaSper = function (sel, context){
		//si no se pasa ningun selector se usa document
		sel = sel || document;

		this.version = _JaSper.version = 'JaSper v3.0b',
		this.nodes = this.nodes || [],
		//this.funcs = {}, //funciones estaticas generales
		//this.event = {}, //funciones estaticas de eventos
		this.context = context || window.document; //contexto por defecto es document

		_JaSper.debug = _JaSper.debug || false; //TODO revisar si debe ser una variable global; al ser global el valor se conserva hasta que se cambia explicitamente

		//lenguaje para las traducciones, puede asignarse desde PHP para ser consistente con lo recibido desde el servidor
		//si no se proporciona detecta el lenguaje del navegador (no los configurados por el usuario); si no se detecta fuerza castellano (es)
		this.lang = _JaSper.lang = _JaSper.lang || (navigator.language ? navigator.language.substr(0,2) : (navigator.userLanguage ? navigator.userLanguage.substr(0,2) : 'es'));

		//si se ha pasado una cadena (sin distincion inicial), puede ser un ID, clase CSS, tag HTML o una cadena HTML
		if(typeof sel === 'string'){
			if(sel.substring(0,2) =='//'){ //selector XPath
				//para que se reconozca como tal debe comenzar con //
				var iterator = this.context.evaluate(sel, this.context, null, XPathResult.ANY_TYPE, null);
				try {
					var thisNode;
					while (thisNode = iterator.iterateNext()){
						this.nodes.push(thisNode);
					}
				}
				catch(ex){
					_JaSper.funcs.log('[JaSper::constructor] [XPath] Arbol del documento modificado durante la iteracion.', 1);
				}
			}
			else{ //selector con reglas CSS
				var re_JaSper = /^<([^> ]+)[^>]*>(?:.|\n)+?<\/\1>$|^(\#([-\w]+)|\.(\w[-\w]+)|@(\w[-\w]+))$/i, //comprueba si es cadena HTML, ID o class
				re_tag = /<([a-z1-9]+?)>,?/ig, //busca tags <SPAN> <P> <H1>
				match;

				//busca un solo tag HTML, ej. <P> o <SPAN>
				//o una lista de ellos separada por comas, ej. <h1>,<div>,<strong>
				match = re_tag.exec(sel);
				if(match && match[1]){
					match = sel.match(re_tag);
					for(var i = 0;i < match.length;i++){
						//devuelve todos los nodos coincidentes con el tag
						if(typeof this.context.getElementsByTagName == 'function'){
							var temp = this.context.getElementsByTagName(match[i].replace(/[<>,]/g, ''));
							try{ //slice necesita javascript 1.2
								this.nodes = this.nodes.concat(Array.prototype.slice.call(temp)); //convierte en array el objeto temp y lo añade a this.nodes
							}
							catch(e){
								for(var j = 0;j < temp.length;j++){
									this.nodes[this.nodes.length] = temp[j];
								}
							}
						}
						else{ //no se ha pasado un contexto valido
							_JaSper.funcs.log('[JaSper::constructor] "' + context.toString() + '" no es un contexto v\u00E1lido.', 1);
						}
					}
				}else{
					//busca ID, class o cadena HTML
					// match[1] = cadena HTML - tag inicial y final
					// match[3] = ID
					// match[4] = class
					// match[5] = attribute
					var match = re_JaSper.exec(sel) || [];

					if(match[3]){ //id, con o sin # ej. #myid o myid
						this.nodes[0] = document.getElementById(match[3]);
					}else if(match[4]){ //nombre de clase ej. .myClass
						this.nodes = _JaSper.funcs.getElementsByClassName(match[4], this.context, '*');
					}else if(match[5]){ //atributo name ej. @myName
						this.nodes = document.getElementsByName(match[5]);
					}else if(match[1]){ //cadena HTML valida, ej. <P><STRONG>hello</STRONG></P>
						//permite crear nodos desde el html que se le pase
						var div = document.createElement('DIV');
						div.innerHTML = sel;
						this.nodes = div.childNodes;
						document.removeChild(div);
					}else{
						// if querySelectorAll is available for modern browsers we can use that e.g
						// FF 3.2+, Safari 3.2+, Opera 10, Chrome 3, IE 8 (standards mode)
						if(document.querySelectorAll){
							this.nodes = _JaSper.funcs.selector(sel, this.context);
						}else{
							//pasarselo a Sizzle (mas eficiente con navegadores antiguos)
							if(_JaSper.find){this.nodes = _JaSper.find(sel, this.context);}
							else{this.nodes = [];} //ninguna forma de localizar los nodos pedidos
						}
					}
				}

			}
		}else if(sel.nodeType){
			// already got a node add
			this.context = this.nodes[0] = sel;
		}else if(_JaSper.funcs.isArray(sel)){
			this.nodes = sel;
		}else{
			this.nodes = _JaSper.funcs.makeArray(sel);
		}

		this.length = this.nodes.length;
		return this; //nodos;
	};

	//con esto JaSper puede ser usado como constructor y como parte del prototype
	_JaSper.prototype = {
		//que navegador se esta usando
		navigator: (navigator.userAgent.toLowerCase().match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1], //version
		msie: /msie/.test(navigator.userAgent.toLowerCase()) && !/opera/.test(navigator.userAgent.toLowerCase()),
		mozilla: /mozilla/.test(navigator.userAgent.toLowerCase()) && !/(compatible|webkit)/.test(navigator.userAgent.toLowerCase()),
		opera: /opera/.test(navigator.userAgent.toLowerCase()),
		webkit: /webkit/.test(navigator.userAgent.toLowerCase()),
		gecko: /gecko/.test(navigator.userAgent.toLowerCase()) && !/khtml/.test(navigator.userAgent.toLowerCase()),

		/**
		 * Debug
		 *
		 * @since 2011-03-24
		 * @param debug Se muestran mensajes de debug (true) o no (false)
		 * @returns object JaSper
		 */
		debug: function (debug){
			debug = debug || true;
			_JaSper.debug = debug;

			return this;
		},

		/**
		 * Referencia automatica a la funcion foreach pasandole la lista de nodos, ej. $('<SPAN>').each(function (){});
		 * 
		 * @return {Object} JaSper
		 */
		each: function (callback, args){
			if(!!this.nodes && this.nodes.length){ //no se hace nada si no hay nodos
				if(!args) _JaSper.funcs.foreach(this.nodes, callback, undefined);
				else _JaSper.funcs.foreach(this.nodes, callback, args);
			}

			return this;
		},

		/**
		 * Ejecuta la funcion pasada cuando se haya cargado todo el arbol DOM
		 * 
		 * $().ready(function (){[...]});
		 * 
		 * http://snipplr.com/view.php?codeview&id=6156
		 */
		ready: function (f){
			if(!this.msie && !this.webkit && document.addEventListener) return document.addEventListener('DOMContentLoaded', f, false);
			if(_JaSper.funcs.readyFuncs.push(f) > 1) return;
			if(this.msie){
				(function (){
					try {document.documentElement.doScroll('left'); _JaSper.funcs.runReady();}
					catch (err){setTimeout(f, 0);}
					//catch (err){setTimeout(arguments.callee, 0);}
				})();
			}
			else if(this.webkit){
				var t = setInterval(function (){
					if (/^(loaded|complete)$/.test(document.readyState)) clearInterval(t), _JaSper.funcs.runReady();
				}, 0);
			}
		}

	};

	_JaSper.langs = {'en':{}, 'es':{}}; //traducciones en todos los lenguajes que sean necesarios, definidos por codigo iso 639

	//funciones estaticas referenciables por si mismas,  ej. var winPos = _JaSper.funcs.windowPosition()
	_JaSper.funcs = {

		/**
		 * Extiende un objeto con otro
		 * 
		 * @param {Object} extendObj Objeto original a extender
		 * @param {Object} addObj Objeto con metodos que se agregaran a extendObj
		 */
		extend: function (extendObj, addObj){
			if(extendObj === _JaSper.langs){ //extiende traducciones
				_JaSper.funcs.extendTrads(addObj);
				return;
			}

			//if(!extendObj) extendObj = {}; //crea el objeto si no existe

			for(var a in addObj){
				extendObj[a] = addObj[a];
			}
		},

		/**
		 * Amplia las traducciones
		 *
		 * @since 2011-06-15
		 * @param {Object} obj Objeto con nuevas traducciones, ej. {'en':{'key':'key traduction'}, 'es':{'clave':'clave traduccion'}},
		 * @return {void}
		 */
		extendTrads: function (obj){
			for(var lang in obj){
				if(!_JaSper.langs[lang]) _JaSper.langs[lang] = {};

				for(var key in obj[lang]){
					_JaSper.langs[lang][key] = obj[lang][key];
				}
			}
			return;
		},

		/**
		 * Recorre una lista de nodos o array, ejecutando la funcion pasada en cada resultado
		 * 
		 * @return list Lista de nodos u objetos
		 */
		foreach: function (list, callback, args){
			if(this.isFunction(list)){ //si se ha pasado una funcion se ejecuta para generar la lista de nodos
				list = list.call();
			}

			//two loops one for array like objects the other for hash objects
			//la condicion evita que se usen objetos inexistentes (revisar cuando se añade evento para una id que no existe, y luego se dispara el mismo evento para una id existente, esta dispara ambos ya que el primero se asigna a window)
			if(this.isArrayLike(list)){
				if(args){
					for(var x=0,l=list.length;x<l;x++) if(list[x]) callback.apply(list[x],args);
				}else{
					for(var x=0,l=list.length;x<l;x++) if(list[x]) callback.call(list[x]);
				}
			}else{
				if(args){
					for(var x in list) if(list[x]) callback.apply(list[x],args);
				}else{
					for(var x in list) if(list[x]) callback.call(list[x]);
				}
			}
			return list;
		},

		/**
		 * Crea un identificador unico
		 * Solo debe ser unico mientras exista la pagina y para la propia pagina
		 *
		 * @todo revisar funcionamiento, random no garantiza unico
		 * @since 2011-06-09
		 * @param {number} len Longitud minima del identificador
		 * @return string
		 */
		genId: function (len){
			var gid = 'JaSper_';
			if(!len || (len.length < (gid.length + 5))) len = gid.length + 5;

			var chars = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
			var rnum;

			while(gid.length < len || document.getElementById(gid)){
				/*rnum = Math.abs(Math.sin(_JaSper.funcs.getTimer())) * (chars.length - 1); //sin es ciclica, no garantiza unicos
				gid += chars.substr(rnum, 1 );*/
				rnum = Math.floor(Math.random() * (chars.length - 1));
				gid += chars.substr(rnum, 1 );
			}

			return gid;
		},

		//devuelve elementos filtrados por className, nodo y tag
		getElementsByClassName: function (clsName, node, tag){
			node = node || this.context || document,
			tag = tag || '*';
			//usa funcion nativa si existe, FF3 Safari Opera
			if(document.getElementsByClassName){
				if(tag == '*'){
					var els = node.getElementsByClassName(clsName);
					return els;
				}else{
					var cls = node.getElementsByClassName(clsName),
					els = [],
					tag = tag.toUpperCase();
					for(var x=0,l = cls.length;x < l;x++){
						if(cls[x].nodeName == tag) els.push(cls[x]);
					}
					return els;
				}
			}else{ //para navegadores viejos e IE 8, a mano
				//usa document.all si es posible
				var retVal = [], 
				els = (tag == '*' && node.all) ? node.all : node.getElementsByTagName(tag),
						re = new RegExp("(^|\\s)" + clsName.replace(/\-/,"\\-") + "(\\s|$)");
				for(var i = 0 , j = els.length; i < j; i++){
					if(re.test(els[i].className))
						retVal.push(els[i]);
				}
				return retVal;
			}
		},

		/**
		 * recupera una regla css de document o del elemento pasado
		 */
		getStyle: function (elem, cssRule){
			elem = (!elem)?document.defaultView:elem; 
			var sRet = '';
			if(elem.nodeType == 1){
				if(document.defaultView && document.defaultView.getComputedStyle) sRet = document.defaultView.getComputedStyle(elem, "")[cssRule]; //Firefox
				else if(elem.currentStyle) sRet = elem.currentStyle[cssRule]; //IE
				else sRet = elem.style[cssRule]; //try and get inline style
			}
			return sRet;
		},

		//devuelve si es un nodo o elemento DOM
		//TODO cambiar el retorno para distinguir nodo de elemento
		isDOMObject: function (o){
			var bNode = (
					typeof Node === "object" ? o instanceof Node : 
						o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
			);

			var bElement = (
					typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
						o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
			);

			return bNode || bElement;
		},

		isArray: function (o){
			return Object.prototype.toString.call(o) == '[object Array]';
		},

		//objetos con propiedades tipo array (array/nodelist)
		isArrayLike: function (o){
			// window, strings (y functions) tambien tienen 'length'
			return (o && o.length && !this.isFunction(o) && !this.isString(o) && o !== window);
		},

		isFunction: function (o){
			return ((o) instanceof Function);
		},

		isString: function (o){
			return (typeof o == 'string');
		},

		/**
		 * Carga scripts javascript que no se hayan cargado durante la carga de la pagina
		 * @todo asegurarse de no estar cargando un script ya cargado (principalmente los cargados durante la carga de la pagina u otro que se se pueda identificar con el id automatico aqui asignado)
		 *
		 * @since 2011-05-10
		 * @param {string} scrPath Ruta absoluta ("http://ruta/script.js") o relativa a donde se encuentre "JaSper.js" (como "ruta/script.js")
		 */
		loadScript: function (scrPath){
			var scrId = 'JaSper_script_' + scrPath.replace(/[^a-zA-Z\d_]+/, '');
			if(document.getElementById(scrId)){
				_JaSper.funcs.log('-JaSper::loadScript- Script (id->' + scrId + ') ya cargado.', 0);
				return(false); //ya cargado
			}

			//si se ha pasado una ruta no absoluta se le suma la misma ruta en que se encuentre "JaSper.js"
			if(scrPath.indexOf('http://') === -1){
				var temp_js = new RegExp("(^|(.*?\\/))(JaSper\.js)(\\?|$)");
				var scripts = document.getElementsByTagName('script');
				for(var i = 0, lon = scripts.length; i < lon ; i++){
					var src = scripts[i].getAttribute('src');
					if(src){
						var srcMatch = src.match(temp_js);
						if(srcMatch){
							scrPath = srcMatch[1] + scrPath; //pone la misma ruta que "JaSper.js"
							break;
						}
					}
				}
			}

			/*try{ //insertar via DOM en Safari 2.0 falla, asi que aproximacion por fuerza bruta
				document.write('<script type="text/javascript" src="' + scrPath + '"><\/script>');
				_JaSper.funcs.log('-JaSper::loadScript- Script (id->' + scrId + ') leido con "document.write".');
			}
			catch(e){*/ //for xhtml+xml served content, fall back to DOM methods
				var script = document.createElement('script');
				script.id = scrId;
				//script.charset = "windows-1250";
				script.type = 'text/javascript';
				script.src = scrPath; //relativo o absoluto, ej: 'http://path.to.javascript/file.js'

				if(script.readyState){ //IE
					script.onreadystatechange = function (){
						if(script.readyState == "loaded" || script.readyState == "complete"){
							script.onreadystatechange = null;
							var scriptQueue = _JaSper.funcs.loadScriptQueue;
							_JaSper.funcs.loadScriptQueue = [];
							_JaSper.funcs.log('-JaSper::loadScript- Script [' + script.src + '] listo! ... en IE', 0);
							for(var mt in scriptQueue){
								try{
									(function (cb, ctx){
										return(cb.call(ctx));
									})(scriptQueue[mt]['fn'], scriptQueue[mt]['ctx']);
								}
								catch(ex){
									_JaSper.funcs.log('-JaSper::loadScript- No se ha podido ejecutar un método. ' + ex, 1);
									return;
								}
							}
							_JaSper.funcs.loadScriptQueue = [];
						}
					};
				}
				else{
					script.onload = function (){
						var scriptQueue = _JaSper.funcs.loadScriptQueue;
						_JaSper.funcs.loadScriptQueue = [];
						_JaSper.funcs.log('-JaSper::loadScript- Script [' + script.src + '] cargado!', 0);
						for(var mt in scriptQueue){
							try{
								(function (cb, ctx){
									return(cb.call(ctx));
								})(scriptQueue[mt]['fn'], scriptQueue[mt]['ctx']);
							}
							catch(ex){
								_JaSper.funcs.log('-JaSper::loadScript- No se ha podido ejecutar un método. ' + ex, 1);
								return;
							}
						}
					};
				}

				var h = document.getElementsByTagName("head").length ? document.getElementsByTagName("head")[0] : document.body;
				h.appendChild(script);
			//}

			return this;
		},

		//cola de ejecucion de los metodos pedientes de la carga de algun script dinamico
		loadScriptQueue: [],

		/**
		 * Muestra mensajes de debug, si "_JaSper.debug" es true
		 * Muestra los mensajes en el elemento con id "JaSperDebug" o lo crea bajo el primer nodo de this
		 * Ej. de uso:
		 * <code>
$('#capa').setDebug(true).ajax('ej_respuesta.php');
		 * </code>
		 * 
		 * @todo mostrar el mensaje con la linea correcta en que se ha producido (no la linea de este metodo)
		 * @since 2011-03-24
		 * @param {string} mens Mensaje de debug a mostrar
		 * @param {number} lev Nivel de error a mostrar; 0 -> info (por defecto), 1 -> warn, 2 -> error
		 * @return {void}
		 */
		log: function (mens, lev){
			if(!_JaSper.debug) return false;

			//intenta recuperar donde se origino el mensaje de aviso, basta con buscar desde donde se llama a este metodo
			var sStack = '', aStack = [];
			try{
				sStack = new Error().stack; //fuerza error para generar la traza
			}catch(ex){
				//alert("name:" + ex.name + "\nmessage:" + ex.message);
				if (ex.stack) sStack = ex.stack;
				else if(ex.stacktrace) sStack = ex.stacktrace; //TODO pendiente de verificacion
				else sStack = ex.message; //opera
			}finally{
				if(sStack){
					var lineas = sStack.split('\n');
					for(var i = 0, len = lineas.length; i < len; i++){
						if(lineas[i].match(/^\s*[A-Za-z0-9\-_$]+/)){
							aStack.push(lineas[i]);

							//en opera las lineas impares tienen el mensaje de error, las impares donde se ha producido
							/*var entry = lineas[i];
							if(lineas[i+1]) entry += ' at ' + lineas[++i];
							aStack.push(entry);*/
						}
					}
					//aStack.shift(); //elimina la llamada a este metodo
				}
			}

			mens = mens || 'JaSper debug';
			mens += '\n[' + aStack[1] + ']'; //hacer esta informacion opcional o solo mostrar fichero y linea de la llamada?
			lev = lev || 0;

			if(typeof console != 'object'){
				//contenedor de los mensajes de debug
				var e = document.getElementById('JaSperDebug'); //TODO en firefox adquiere los metodos de JaSper, en ie no
				if(!e){
					e = document.createElement('ul');
					e.className = 'JaSperDebug ';
					e.id = 'JaSperDebug'; //TODO diferenciar id's, por si se crea mas de uno
					JaSper('<body>').insertAfter(e);
				}

				//cada uno de los mensajes de debug
				var m = document.createElement('li');
				m.className = 'JaSperDebug' + (lev == 2 ? 'error' : (lev == 1 ? 'warn' : 'info'));
				m.appendChild(document.createTextNode(mens));
				JaSper('<body>').append(m, e);
			}else{
				if(typeof mens != 'string') console.dir(mens); //show objects

				switch(lev){
				case 2: //error
					console.error(mens);
					break;
				case 1: //warn
					console.warn(mens);
					break;
				case 0: //info
				default:
					console.info(mens);
				}
			}
			return;
		},

		makeArray: function (a){
			var ret = [];
			if(a != null){
				// window, strings (y functions) tambien tienen 'length'
				if(!this.isArrayLike(a)){
					ret[0] = a;
				}else{
					var i = a.length;
					while(i){ret[--i] = a[i];}
				}
			}
			return ret;
		},

		readyFuncs: [],

		runReady: function (){for (var i = 0; i < this.readyFuncs.length; i++) this.readyFuncs[i]();},

		/**
		 * Devuelve elementos por selector ej. DIV P SPAN
		 * soportado en IE 8 (standards mode), FF 3.1+, Safari 3.1+
		 * 
		 * EXPONER Sizzle a JaSper.js
		 * En navegadores mas antiguos debera usarse sizzle.js mapeando los metodos publicos a metodos JaSper,
		 * en el final del fichero de sizzle reemplazar los metodos con lo siguiente:
window.Sizzle = Sizzle;

_JaSper.find = Sizzle;
_JaSper.filter = Sizzle.filter;
_JaSper.expr = Sizzle.selectors;
_JaSper.expr[":"] = _JaSper.expr.filters;
		 *
		 * @param {string} query Cadena con selector o selectores a buscar
		 * @return {array} Nodos
		 */
		selector: function (query, context){
			context = context || document;

			try{
				return this.makeArray(context.querySelectorAll(query));
			}catch(ex){ //fuerza devolucion de array...
				return [];
			}
		},

		/**
		 * pone una regla css de document o del elemento pasado al valor pasado
		 */
		setStyle: function (elem, cssRule, value){
			elem = (!elem)?document.defaultView:elem; 

			if(elem.nodeType == 1){
				//elem.style.cssText = value;
				elem.style[cssRule] = value;
				return true;
			}
			return false;
		},

		/**
		 * Emulacion de la funcion "sprintf".
		 * El primer parametro debe ser una cadena, los siguientes los valores a sustituir (en el mismo orden que aparezcan en la cadena)
		 *
		 * @todo Reconoce '%s' (string), '%u' (unsigned)  y '%%' (%)
		 * @since 2011-06-20
		 * @return {string} Cadena procesada
		 */
		sprintf: function (){
			if(!arguments || !arguments.length) return;
			if(arguments.length == 1) return arguments[0]; //devuelve la cadena (primer argumento) si no se pasa nada mas
			var cadena = arguments[0];


			var regExp = /(%[s%])/; //busca todos los %s o %%
			var sust = [], cont = 0;

			while(sust = regExp.exec(cadena)){
				switch(sust[1]){
				case '%%': //%
					cadena = cadena.substr(0, sust.index) + '%' + cadena.substr(sust.index + 2);
					break;
				case '%s': //string
					cadena = cadena.substr(0, sust.index) + arguments[++cont].toString() + cadena.substr(sust.index + 2);
					break;
				case '%u': //unsigned
					cadena = cadena.substr(0, sust.index) + parseInt(arguments[++cont], 10)  + cadena.substr(sust.index + 2);
					break;
				default:
					cadena = cadena.substr(0, sust.index) + '-tipo desconocido-' + cadena.substr(sust.index + 2);
				cont++;
				}
			}
			return cadena;
		},

		/**
		 * Traduccion de los textos de funciones.
		 * Con la variable "_JaSper.lang" (generada por PHP por ejemplo: $_SESSION['l10n']) 
		 * que contenga el codigo de lenguaje que actualmente solicita el navegador; 
		 * ya que javascript no puede leer directamente las cabeceras que envia el navegador;
		 * 
		 * Devuelve el mensaje traducido o falso
		 * NO permite encadenado de metodos
		 * 
		 * @todo optimizar codigo
		 * @param {array} trad Clave de la traduccion a devolver y parametros que requiera, ej. 'clave a traducir'; otro ej. ['%s a %s', 'clave', 'traducir'], la clave que se busca para la traduccion es el parametro unico o el primer indice y el resto del array parametros para sprintf
		 * @param {string} lang Lenguaje al que traducir, si no se pasa ninguno se toma el de _JaSper.lang
		 * @returns {string} Cadena traducida, original si no se encuentra traduccion
		 */
		_t: function (trad, lang){
			if(!trad) return '';
			lang = lang || _JaSper.lang;

			if(!_JaSper.funcs.isArray(trad)) trad = [trad];
			if(_JaSper.langs[lang] && _JaSper.langs[lang][trad[0]]) trad[0] = _JaSper.langs[lang][trad[0]];

			return(_JaSper.funcs.sprintf.apply(this, trad));
		},

		/**
		 * Posicion de la ventana de visualizacion respecto al total de la pagina cargada
		 * 
		 * ej. para comprobar si se ha llegado al final de la pagina y se esta intentando intentando bajar mas:
		 * <code>
$('<body>').addEvent('mousewheel', function (ev){
	if(_JaSper.funcs.pagePosition().indexOf('bottom') > -1 && ev.wheelDelta == -3) alert('fin de pagina');
});

//probar con (window.scrollY >= window.scrollMaxY) || (window.scrollY >= window.pageYOffset)
//pero comprobar que navegadores lo soportan
		 * </code>
		 * @todo devolver posicion de elementos en lugar de la ventana?
		 * @return {string} Que bordes del documento estan visibles respecto a la ventana visible (center si no esta en alguno de los bordes)
		 */
		windowPosition: function () {
			//TODO probar en mas navegadores
			var isScrollToPageEnd = function (coordinate) { //comprueba si la ventana esta en los limites del documento
				if(coordinate == 'x') return (window.innerWidth + window.scrollX) >= document.body.offsetWidth;
				else if (coordinate == 'y') return (window.innerHeight + window.scrollY) >= document.documentElement.clientHeight;
			};

			var aRet = [];
			/*if(document.body.scrollTop == 0 && document.body.scrollLeft == 0){
				sRet = 'top_left';
			} else if(document.body.scrollTop == 0 && isScrollToPageEnd('x')){
				sRet = 'top_right';
			} else if(isScrollToPageEnd('y') && document.body.scrollLeft == 0){
				sRet = 'bottom_left';
			} else if(isScrollToPageEnd('y') && isScrollToPageEnd('x')){
				sRet = 'bottom_right';
			}*/

			if(document.body.scrollTop == 0){
				aRet[aRet.length] = 'top';
			}
			if(document.body.scrollLeft == 0){
				aRet[aRet.length] = 'left';
			}
			if(isScrollToPageEnd('x')){
				aRet[aRet.length] = 'right';
			}
			if(isScrollToPageEnd('y')){
				aRet[aRet.length] = 'bottom';
			}
			if(!aRet.length){
				aRet[aRet.length] = 'center';
			} else if(aRet.indexOf('left') == -1 && aRet.indexOf('right') == -1){
				aRet[aRet.length] = 'centerY';
			} else if(aRet.indexOf('top') == -1 && aRet.indexOf('bottom') == -1){
				aRet[aRet.length] = 'centerX';
			}

			return aRet;
		}

	};
	
	_JaSper.event = {};

	//puede extenderse el prototipo con los metodos encontrados en _JaSper.funcs con:
	//_JaSper.funcs.extend(_JaSper.prototype, _JaSper.funcs);

})(window, undefined);

/****************
** Metodos css **
*****************/
_JaSper.funcs.extend(_JaSper.prototype, {

	/**
	 * Añade una clase CSS
	 *
	 * @since 2011-09-07
	 * @param {string} cName Nombre de la clase
	 * @return {Object} JaSper
	 */
	addClass: function (cName){
		if(typeof cName === "string"){
			this.each(
				function (){
					if(this.className.indexOf(cName) == -1)
						this.className += ' ' + cName; 
				}
			);
		}

		return this;
	},

	/**
	 * Alterna la propiedad display entre 'none' y visible
	 * 
	 * @param {string} Type Tipo de desvanecimiento: in (de invisible a visible), out (de visible a invisible)
	 * @param {number} ms Duracion del efecto en milisegundos
	 * @return {Object} JaSper
	 */
	fade: function (type, ms){
		ms = ms || 300;

		var isIn = (type || 'in') === 'in', opacity = isIn ? 0 : 1, interval = 50, gap = interval / ms;

		this.each(function (){
			if(this.nodeType != 1) return; //solo nodos tipo ELEMENT_NODE

			var sActDisplay = _JaSper.funcs.getStyle(this, 'display');
			if(this.style.display == 'none' || !this.style.display){

				var elem = document.createElement(this.nodeName);
				JaSper(document.body).append(elem);

				this.originalDisplay = _JaSper.funcs.getStyle(elem, 'display');

				JaSper(document.body).remove(elem);
			}
			this.originalDisplay = (this.originalDisplay || (sActDisplay != 'none' ? sActDisplay : ''));

			if(isIn){
				this.style.display = this.originalDisplay;
				this.style.opacity = opacity;
			}

			var oObjOpac = this;
			function func() {
				opacity = isIn ? opacity + gap : opacity - gap;
				oObjOpac.style.opacity = opacity;

				if(opacity <= 0)
					oObjOpac.style.display = 'none'
				if(opacity <= 0 || opacity >= 1)
					window.clearInterval(fading);
			}

			var fading = window.setInterval(func, interval);
		});

		return this;
	},

	/**
	 * recupera una regla css de document o del elemento pasado
	 */
	getStyle: function (cssRule){
		var elem = this.nodes[0];
		return _JaSper.funcs.getStyle(elem, cssRule);
	},

	/**
	 * Elimina una clase CSS
	 *
	 * @since 2011-09-07
	 * @param {string} cName Nombre de la clase
	 * @return {Object} JaSper
	 */
	removeClass: function(cName){
		if(typeof cName === "string"){
			this.each(
				function (){
					if(this.className.indexOf(cName) > -1)
						this.className = this.className.substr(0, this.className.indexOf(cName) - 1) + this.className.substr(this.className.indexOf(cName) + cName.length);
				}
			);
		}

		return this;
	},

	/**
	 * pone una regla css de document o del elemento pasado al valor pasado
	 */
	setStyle: function (cssRule, value){
		this.each(function (rul, val){
			var elem = this;
			return _JaSper.funcs.setStyle(elem, rul, val);
		}, [cssRule, value]);

		return this;
	},

	/**
	 * Alterna la propiedad display entre 'none' y visible
	 * 
	 * @param {number} fade Tiempo en milisegundos del fade, si se pasa 0 no hace este efecto
	 * @return {Object} JaSper
	 */
	toggle: function (fade){
		fade = parseInt(fade || 0);

		var oJaSper = this;

		this.each(function (){
			//TODO deberia aceptar otros tipos de nodo?
			if(this.nodeType != 1) return; //solo nodos tipo ELEMENT_NODE

			var sActDisplay = _JaSper.funcs.getStyle(this, 'display');

			if(fade){
				if(sActDisplay == 'none'){
					oJaSper.fade('in', fade);
				}
				else{
					oJaSper.fade('out', fade);
				}
			}
			else{
				if(this.style.display == 'none' || !this.style.display){
					var elem = document.createElement(this.nodeName);
					_JaSper(document.body).append(elem);

					this.originalDisplay = _JaSper.funcs.getStyle(elem, 'display');

					_JaSper(document.body).remove(elem);
				}
				this.originalDisplay = (this.originalDisplay || (sActDisplay != 'none' ? sActDisplay : ''));

				if(sActDisplay != 'none' ) sActDisplay = 'none';
				else sActDisplay = this.originalDisplay;

				_JaSper.funcs.setStyle(this, 'display', sActDisplay);
			}
		});

		return this;
	}

});

/**
 * Esta funcion es llamada en cada evento; independiente de objetos JaSper.
 * 'this' es el objeto que lo haya llamado
 * 
 * @param ev Nombre del evento
 */
/*if(typeof window.eventTrigger != 'function'){
	window.eventTrigger = function (ev){
		//return true;
	};
}*/

/**
 * emulacion de eventos mouseenter y mouseleave en los navegadores que no lo soportan (todos menos ie)
 * mousewheel para navegadores gecko
 * 
 * para controlar el movimiento de la rueda:
 * <code>
$('<p>').addEvent('mousewheel', function (ev){
	var rolled = 0;
	if('wheelDelta' in ev) {
		rolled = ev.wheelDelta; //devuelve 3 (se ha movido la rueda hacia arriba) o -3 (rueda hacia abajo)
	}
	else{
		rolled = -40 * ev.detail; //iguala los valores de esta propiedad con los que devuelve ev.wheelDelta
	}
	alert(rolled);
});
 * </code>
 */
_JaSper.funcs.extend(_JaSper.event, {

	/**
	 * Correccion de codigo de tecla pulsada.
	 * Para keypress corresponde con codigos ascii,
	 * para keyup o keydown no necesariamente (ej: "." devuelve 190 y no 46 -ASCII-); este metodo corrige la correspondencia devolviendo el ascii correcto
	 * Devuelve -1 si se llama con un evento que no sea keyXXX
	 *
	 * @todo completar mapa de correspondencia de teclas
	 * @since 2011-09-08
	 * @return {number} Codigo de la tecla (o combinacion) pulsada
	 */
	keyCode: function (ev){
		ev = ev || window.event;
		var code = ev.keyCode || ev.which, etype = ev.type.toLowerCase().replace('on', ''); //, char = String.fromCharCode(code);

		if(etype == 'keypress') return(code);
		else if(etype == 'keydown' || etype == 'keyup'){
			var keycodes = { //keycode:[ascii_normal, ascii_shiftKey, ascii_controlkey, ascii_altKey]
				8:[8], //Backspace
				9:[9], //Tab
				13:[13], //Enter
				/*16:[], //Shift
				17:[], //Ctrl
				18:[], //Alt
				19:[], //Pause
				20:[], //Caps Lock
				27:[], //Escape
				33:[], //Page Up
				34:[], //Page Down
				35:[], //End
				36:[], //Home
				37:[], //Arrow Left
				38:[], //Arrow Up
				39:[], //Arrow Right
				40:[], //Arrow Down
				45:[], //Insert*/
				46:[127], //Delete
				48:[48], //0
				49:[49], //1
				50:[50], //2
				51:[51], //3
				52:[52], //4
				53:[53], //5
				54:[54], //6
				55:[55], //7
				56:[56], //8
				57:[57], //9
				65:[97, 65], //A
				66:[98, 66], //B
				67:[99, 67], //C
				68:[100, 68], //D
				69:[101, 69], //E
				70:[102, 70], //F
				71:[103, 71], //G
				72:[104, 72], //H
				73:[105, 73], //I
				74:[106, 74], //J
				75:[107, 75], //K
				76:[108, 76], //L
				77:[109, 77], //M
				78:[110, 78], //N
				79:[111, 79], //O
				80:[112, 80], //P
				81:[113, 81], //Q
				82:[114, 82], //R
				83:[115, 83], //S
				84:[116, 84], //T
				85:[117, 85], //U
				86:[118, 86], //V
				87:[119, 87], //W
				88:[120, 88], //X
				89:[121, 89], //Y
				90:[122, 90], //Z
				/*91:[], //Left Windows
				92:[], //Right Windows
				93:[], //Context Menu*/
				96:[48], //NumPad 0
				97:[49], //NumPad 1
				98:[50], //NumPad 2
				99:[51], //NumPad 3
				100:[52], //NumPad 4
				101:[53], //NumPad 5
				102:[54], //NumPad 6
				103:[55], //NumPad 7
				104:[56], //NumPad 8
				105:[57], //NumPad 9
				106:[42], //NumPad *
				107:[43], //NumPad +
				109:[45], //NumPad -
				110:[46], //NumPad .
				111:[47], //NumPad /
				/*112:[], //F1
				113:[], //F2
				114:[], //F3
				115:[], //F4
				116:[], //F5
				117:[], //F6
				118:[], //F7
				119:[], //F8
				120:[], //F9
				121:[], //F10
				122:[], //F11
				123:[], //F12
				144:[], //Num Lock
				145:[], //Scroll Lock*/
				186:[59], //;
				187:[61], //=
				188:[44], //,
				189:[45], //-
				190:[46], //.
				191:[47], ///
				192:[96], //`
				219:[91], //[
				220:[92], //\
				221:[93], //]
				222:[39] //'
			};

			var shiftControlAlt = 0;
			if(navigator.appName == "Netscape" && parseInt(navigator.appVersion, 10) == 4){ //netscape 4
				var mString = (ev.modifiers + 32).toString(2).substring(3, 6);
				shiftControlAlt += (mString.charAt(0) == '1') ? 1 : 0;
				shiftControlAlt += (mString.charAt(1) == '1') ? 1 : 0;
				shiftControlAlt += (mString.charAt(2) == '1') ? 1 : 0;
			}
			else{ //resto
				shiftControlAlt += ev.shiftKey ? 1 : 0;
				shiftControlAlt += ev.altKey ? 1 : 0;
				shiftControlAlt += ev.ctrlKey ? 1 : 0;
			}

			if(typeof keycodes[code] != 'undefined'){
				if(typeof keycodes[code][shiftControlAlt] != 'undefined')
					return(keycodes[code][shiftControlAlt]); //devuelve exacto
				else if(typeof keycodes[code][0] != 'undefined')
					return(keycodes[code][0]); //devuelve correspondencia sin modificadores
			}
			return code; //no hay correspondencia, devuelve keycode
		}

		return -1; //evento incoherente
	},

	mouseEnter: function (func){
		var isAChildOf = function (_parent, _child){
			if(_parent === _child){
				return false;
			}
			while(_child && _child !== _parent){
				_child = _child.parentNode;
			}
			return _child === _parent;
		};

		return function (ev){
			var rel = ev.relatedTarget;
			if(this === rel || isAChildOf(this, rel)) return;
			func.call(this, ev);
		};
	},

	mouseWheel: function (func){
		if(typeof func === 'undefined'){
			func = function (e){
				e.wheelDelta = -(e.detail);
				func.call(this, e);
				e.wheelDelta = null;
			};
		}
		return func;
	},

	/**
	 * guarda el ultimo evento que se ha disparado, sirve como controlador para que otros eventos puedan lanzarse (o no) en funcion del previo
	 * asignar en cada funcion afectada (las que se lancen en los eventos), donde interese
	 * 
	 * @todo revisar
	 * @param {event} ev Evento
	 * @return {event} Evento
	 */
	name: function (ev){
		/*this.nombreEvento = window.nombreEvento = evento.toLowerCase(); //se guarda el nombre del ultimo evento disparado para cada objeto jsframe; y el ultimo de todos en window.nombreEvento
		evento = this.nombreEvento;*/

		var ev = ev || window.event;
		return ev;
	},

	/**
	 * Anula la accion por defecto de un elemento, como click en <a>
	 * 
	 * @param {event} ev Objeto evento
	 * @return {boolean}
	 */
	preventDefault: function (ev){
		var ev = ev || window.event;

		if(ev.preventDefault){ //modelo DOM
			//ev.stopPropagation();
			ev.preventDefault();
		}
		else if(window.event){ //modelo MSIE
			//ev.keyCode = 0;  //<<< esto ayuda a que funcione bien en iExplorer
			//ev.cancelBubble = true;
			ev.returnValue = false;
			ev.retainFocus = true;
		}

		return false;
	},

	/**
	 * Devuelve el objeto que ha disparado un evento.
	 * 
	 * @param {event} ev Evento
	 * @return {Object} Objeto target del evento
	 */
	source: function (ev){
		var ev = ev || window.event, targ = false;

		/*if(ev.type == 'mouseover') targ = ev.relatedTarget || ev.fromElement; //origen para mouseover
		else*/ targ = ev.target || ev.srcElement; //w3c o ie

		if(targ.nodeType == 3 || targ.nodeType == 4) targ = targ.parentNode; // defeat Safari bug

		return targ;
	},

	/**
	 * Evita la propagacion de eventos, como que se disparen el del contenedor de un elemento y el del elemento
	 * poniendo esto en uno de ellos evita los demas
	 * 
	 * @param {event} ev Objeto evento
	 * @return {boolean}
	 */
	stop: function (ev){
		var ev = ev || window.event;

		if(ev.stopPropagation) ev.stopPropagation(); //modelo DOM
		else ev.cancelBubble = true; //modelo MSIE

		return false;
	},

	/**
	* Devuelve el objeto destino de un evento (como a donde va el raton en mouseout).
	* 
	* @param {event} ev Evento
	* @return {Object} Objeto destino del evento
	*/
	target: function (ev){
		var ev = ev || window.event, dest = false;

		if(ev.type == 'mouseout') dest = ev.relatedTarget || ev.toElement; //destino en mouseout
		else dest = ev.target || ev.srcElement; //w3c o ie

		return dest;
	}

});

/***********************
** Gestion de eventos **
***********************/
_JaSper.funcs.extend(_JaSper.prototype, {

	/**
	 * Manejador de eventos.
	 *
	 * @param {string} evento Nombre del evento, ej: "click" (como "onclick" sin "on")
	 * @param {Function} funcion Funcion que se lanzara con el evento; cadena de nombre de funcion o nombre de la funcion sin mas, tambien se permiten funciones anonimas: "function (){ alert('hello!'); }"
	 * @param {boolean} capt Captura el evento cuando entra (fase de captura, true) o cuando sale (burbujeo, false, por defecto)
	 * @return {Object} JaSper
	 */
	eventAdd: function (evento, funcion, capt){

		if(typeof funcion == 'string')
			funcion = window[funcion];

		capt = capt || false;

		if(document.addEventListener){ //w3c
			this.each(
				function (evt, func, ct){
					if(!this || this.nodeType == 3 || this.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios

					//eventos mouseenter, mouseleave y mousewheel sobre una idea original encontrada en http://blog.stchur.com
					switch(evt){
						case 'mouseenter':
							this.addEventListener('mouseover', _JaSper.event.mouseEnter(func), ct);
							break;
						case 'mouseleave':
							this.addEventListener('mouseout', _JaSper.event.mouseEnter(func), ct);
							break;
						case 'mousewheel':
							//recoger el movimiento de la rueda con "ev.wheelDelta = ev.wheelDelta || -(ev.detail);" (3 rueda arriba, -3 rueda abajo)
							if(JaSper().gecko){ //si estamos en un navegador Gecko, el nombre y manejador de evento requieren ajustes
								evt = 'DOMMouseScroll';
								func = _JaSper.event.mouseWheel(func);
							}
						default: //resto de eventos
							this.addEventListener(evt, func, ct);
					}
				}, [evento, funcion, capt]);
			if(window.eventTrigger){
				this.each(function (evt, ct){
					if(!this || this.nodeType == 3 || this.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios
					this.addEventListener(evt, function (){window.eventTrigger.call(this, evt);}, ct);
				}, [evento, capt]);
			}
		}
		else if(document.attachEvent){ //ie
			this.each(
				function (evt, func){
					var elemento = this, clave = elemento + evt + func;

					if(!elemento || elemento.nodeType == 3 || elemento.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios

					elemento['e' + clave] = func;
					elemento[clave] = function (){elemento['e' + clave](window.event);};
					elemento.attachEvent('on' + evt, elemento[clave]);
				}, [evento, funcion]);
			if(window.eventTrigger) this.each(
				function (evt){
					var elemento = this, clave = elemento + evt + window.eventTrigger;

					if(!elemento || elemento.nodeType == 3 || elemento.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios

					elemento['e' + clave] = function (){window.eventTrigger.call(elemento, evt);};
					elemento[clave] = function (){elemento['e' + clave](window.event);};
					elemento.attachEvent('on' + evt, elemento[clave]);
				}, [evento]);
		}
		else{ //DOM level 0
			this.each(
				function (evt, func){
					if(!this || this.nodeType == 3 || this.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios

					//idea original de Simon Willison
					var old_evt = this['on' + evt];
					if(typeof this['on' + evt] != 'function') this['on' + evt] = func;
					else{
						this['on' + evt] = function (){
							if(old_evt) old_evt();
							func();
						}
					}
				}, [evento, funcion]);
			if(window.eventTrigger) this.each(
				function (evt){
					if(!this || this.nodeType == 3 || this.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios
					var old_evt = this['on' + evt];
					this['on' + evt] = function (){
						if(old_evt) old_evt();
						window.eventTrigger.call(this, evt);
					};
				}, [evento]);
		}

		return this;
	},

	/**
	 * Elimina eventos
	 *
	 * @param {string} evento Nombre del evento, ej: "click" (como "onclick" sin "on")
	 * @param {Function} funcion Funcion que se lanzara con el evento; cadena de nombre de funcion o nombre de la funcion sin mas, tambien se permiten funciones anonimas: "function (){ alert('hello!'); }"
	 * @param {boolean} capt Captura el evento cuando entra (fase de captura, true) o cuando sale (burbujeo, false, por defecto)
	 * @return {Object} JaSper
	 */
	eventRemove: function (evento, funcion, capt){
		//TODO eliminar todos los eventos del elemento si no se pasan parametros
		if(typeof funcion == 'string')
			funcion = window[funcion]; //TODO try para distinguir nombre_de_funcion de nombre_de_funcion(params) (evaluar esta ultima)

		capt = capt || false;

		if(document.addEventListener){ //w3c
			this.each(
				function (evt, func, ct){
					//TODO problemas para quitar eventos con funciones anonimas (como el retorno de mouseEnter); asignarlo previamente a una variable cuando se pone el evento?
					//eventos mouseenter, mouseleave y mousewheel sobre una idea original encontrada en http://blog.stchur.com
					switch(evt){
						case 'mouseenter':
							this.removeEventListener('mouseover', _JaSper.event.mouseEnter(func), ct);
							break;
						case 'mouseleave':
							this.removeEventListener('mouseout', _JaSper.event.mouseEnter(func), ct);
							break;
						case 'mousewheel':
							if(JaSper().gecko){ //si estamos en un navegador Gecko, el nombre y manejador de evento requieren ajustes
								evt = 'DOMMouseScroll';
								func = _JaSper.event.mouseWheel(func);
							}
						default: //resto de eventos
							this.removeEventListener(evt, func, ct);
					}
				}, [evento, funcion, capt]);
			if(window.eventTrigger){
				this.each(function (evt, ct){
					this.removeEventListener(evt, function (){window.eventTrigger.call(this, evt);}, ct);
				}, [evento, capt]);
			}
		}
		else if(document.attachEvent){ //ie
			this.each(
				function (evt, func){
					this.detachEvent('on' + evt, this[evt + func]);
					this[evt + func] = null;
					this["e" + evt + func] = null;
				}, [evento, funcion]);
			if(window.eventTrigger) this.each(
				function (evt){
					var func = function (){window.eventTrigger.call(this, evt);};
					this.detachEvent('on' + evt, this[evt + func]);
					this[evt + func] = null;
					this["e" + evt + func] = null;
				}, [evento]);
		}
		else{ //DOM level 0
			this.each(
				function (evt){
					eval('this.on' + evt + ' = null;');
				}, [evento]);
		}

		return this;
	}

});

/*********************
** Gestion de nodos **
*********************/
_JaSper.funcs.extend(_JaSper.prototype, {

	/**
	 * Añade un nodo hijo al seleccionado, despues de los existentes
	 * 
	 * @todo debe funcionar con each (para toda la lista de nodos que se le pase)
	 * @todo si "nodo" es un objeto JaSper debe moverlo en lugar de añadir
	 * @since 2010-12-14
	 * @param {Object} nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @param {Object} ancla Elemento al que se añadira nodo; si va vacio se usa this (los nodos de JaSper)
	 * @return {Object} JaSper
	 */
	append: function (nodo, ancla){
		nodo = nodo || this; //se usa el objeto JaSper actual si no se pasa ninguno (o si se pasa null); util para clonar, por ej.

		var elem = null;
		if(_JaSper.funcs.isArray(nodo)){
			elem = document.createElement(nodo[0]);
			elem.innerHTML = nodo[1];
			elem.className = nodo[1];
			elem.id = nodo[1]; //TODO no repetir
		}
		else elem = nodo;

		if(!ancla){
			this.each(function (el){
				if(this.nodeType == 1) this.appendChild(el);
			}, [elem]);
		}
		else{
			if(typeof ancla == 'string') ancla = document.getElementById(ancla); //se ha pasado el id y no el objeto
			if(ancla.nodeType == 1) ancla.appendChild(elem);
		}

		return this;
	},

	/**
	 * Cambia o consulta atributos de elementos
	 * No confundir con consulta/asignacion de estilos CSS
	 * 
	 * @todo si se intenta cambiar una propiedad (como value) deberia cambiarse directamente (elem.value = 'valor'); bien controlando los casos o enviando a metodos especificos
	 * @since 2015-06-11
	 * @param {string} atributo Atributo a cambiar/consultar
	 * @param {string} valor Nuevo valor para el atributo, si no se pasa nada se devuelve el valor actual
	 * @return {Object} JaSper
	 */
	attrib: function (atributo, valor){
		var ret = this;

		this.each(function (atr, val){
			if(val === undefined){ //no se ha pasado valor, solo consulta, se devuelve el valor del primer nodo
				if(ret == this){
					ret = this.getAttribute(atr);
				}
				return;
			}
			else{
				if(val){
					this.setAttribute(atr, val);
				}
				else{ //si se quiere borrar un atributo no debe hacerse con setAttribute
					this.removeAttribute(atr);
				}
			}
		}, [atributo, valor]);

		return ret;
	},

	/**
	 * Devuelve el HTML de los nodos si no se le pasa nada
	 * Sustituye el HTML de los nodos con el que se pase por parametro devolviendo el HTML que hubiese previamente
	 *
	 * NO permite encadenado de metodos
	 *
	 * @todo solo funciona para nodos que tengan la propiedad innerHTML, extender para todos los nodos construyendo los objetos que se pasen por parametro y luego append al nodo?
	 * @param {string} html HTML que sustituira el de los nodos
	 * @return {string} HTML encontrado
	 */
	html: function (html, separador){
		var ret = [];
		html = html || '';
		separador = separador || '';

		this.each(function (h){
			if(!!this.innerHTML){ //si el nodo no tiene la propiedad innerHTML no se hace nada
				//TODO separar las cadenas HTML encontradas para un posterior split?
				ret[ret.length] = this.innerHTML; //guarda el HTML actual del nodo

				if(h){ //sustituye con el HTML pasado por parametro
					this.innerHTML = h;
				}
			}
		}, [html]);

		return ret.join(separador);
	},

	/**
	 * Inserta un elemento despues del nodo seleccionado
	 * 
	 * @todo debe funcionar con each (para toda la lista de nodos que se le pase)
	 * @since 2010-12-09
	 * @param {Object} nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return {Object} JaSper
	 */
	insertAfter: function (nodo){
		if(_JaSper.funcs.isArray(nodo)){
			elem = document.createElement(nodo[0]);
			elem.innerHTML = nodo[1];
			elem.className = nodo[1];
			elem.id = nodo[1]; //TODO no repetir
		}
		else elem = nodo;

		this.each(function (el){
			/*if (tn.lastChild) tn.insertBefore(e, tn.lastChild);
			else tn.appendChild(e);*/
			this.parentNode.insertBefore(el, this.nextSibling);
		}, [elem]);

		return this;
	},

	/**
	 * Inserta un elemento antes del nodo seleccionado
	 * 
	 * @todo debe funcionar con each (para toda la lista de nodos que se le pase)
	 * @since 2010-12-09
	 * @param {Object} nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return {Object} JaSper
	 */
	insertBefore: function (nodo){
		if(_JaSper.funcs.isArray(nodo)){
			elem = document.createElement(nodo[0]);
			elem.innerHTML = nodo[1];
			elem.className = nodo[2];
			elem.id = nodo[3]; //TODO no repetir
		}
		else elem = nodo;

		this.each(function (el){
			this.parentNode.insertBefore(el, this);
		}, [elem]);

		return this;
	},

	/**
	 * Añade un nodo hijo al seleccionado, antes de los existentes
	 * 
	 * @todo debe funcionar con each (para toda la lista de nodos que se le pase)
	 * @todo si "nodo" es un objeto JaSper debe moverlo en lugar de añadir
	 * @since 2010-12-16
	 * @param {Object} nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @param {Object} ancla Elemento al que se añadira nodo; si va vacio se usa this (los nodos de JaSper)
	 * @return {Object} JaSper
	 */
	prepend: function (nodo, ancla){
		nodo = nodo || this; //se usa el objeto JaSper actual si no se pasa ninguno; util para clonar, por ej.

		if(_JaSper.funcs.isArray(nodo)){
			elem = document.createElement(nodo[0]);
			elem.innerHTML = nodo[1];
			elem.className = nodo[1];
			elem.id = nodo[1]; //TODO no repetir
		}
		else elem = nodo;

		if(!ancla){
			this.each(function (el){
				if(this.nodeType == 1) this.insertBefore(el, this.firstChild);
			}, [elem]);
		}
		else{
			if(typeof ancla == 'string') ancla = document.getElementById(ancla); //se ha pasado el id y no el objeto
			if(ancla.nodeType == 1) ancla.insertBefore(el, ancla.firstChild);
		}

		return this;
	},

	/**
	 * Elimina un elemento
	 * 
	 * @todo eliminar eventos asociados y cualquier otra informacion
	 * @param {Object} elem Elemento a eliminar
	 * @return {Object} JaSper
	 */
	remove: function (elem) {
		//var el = this.get(el);
		this.each(function (el){
			el.parentNode.removeChild(el);
		}, [elem]);

		return this;
	},

	/**
	 * Devuelve el texto de los nodos si no se le pasa nada
	 * Sustituye el texto de los nodos con el que se pase por parametro, devolviendo el texto que hubiese previamente
	 *
	 * NO permite encadenado de metodos
	 *
	 * @param {string} text Texto que sustituira el de los nodos
	 * @param {string} separador Cadena para separar cuando se devuelven varios fragmentos de texto
	 * @return {string} Texto encontrado
	 */
	text: function (text, separador){
		var ret = [];
		text = text || '';
		separador = separador || '';

		//TODO comprobar cross browser
		//TODO devolver value para elementos de formulario?
		this.each(function (t){
			if(!!this.textContent){ //si el nodo no tiene la propiedad text no se hace nada
				//TODO separar las cadenas encontradas para un posterior split?
				ret[ret.length] = this.textContent || this.nodeValue; //guarda el texto actual del nodo

				if(t){ //sustituye con el texto pasado por parametro
					this.textContent = t;
				}
			}
		}, [text]);

		return ret.join(separador);
	}

});

/**************************************************
** Metodos para ejecucion periodica de funciones **
**************************************************/
_JaSper.funcs.extend(_JaSper.prototype, {

	/**
	 * Ejecuta la funcion pasada de forma periodica, indefinidamente o no
	 *
	 * @since 2010-12-16
	 * @param {Object} func Funcion a ejecutar; nombre de la funcion (string), referencia o anonima
	 * @param {number} intervalo Cada cuanto se ejecuta la funcion, si 0 se ejecutara una sola vez cuando se cumpla lapso (si hay lapso)
	 * @param {number} lapso Tiempo tras el cual deja de ejecutarse (ambos en milisegundos, 1000ms = 1s)
	 * @return {Object} JaSper
	 */
	//TODO devolver los id para controlarlos fuera; this en la funcion pasada deben ser los nodos JaSper?
	callPeriodic: function (func, intervalo, lapso){
		if(!!func){ //si no hay nada que ejecutar se sale

			this.each(function (fn, it, lp){
				if(!it){ //ejecucion pasado un periodo
					if(lp) idt = setTimeout(fn, lp);
				}
				else{ //ejecucion por intervalos
					var idi = setInterval(fn, it);
					if(lp) idt = setTimeout('clearInterval(' + idi + ')', lp); //final de ejecucion
				}
			}, [func, intervalo, lapso]);
		}

		return this;
	}

});
/******************************
** Carga dinamica de metodos **
******************************/
_JaSper.funcs.extend(_JaSper.prototype, {
	/*
	 * Se cargan bajo demanda si estan aqui incluidos.
	 * todos los .js deben estar en el mismo directorio que este o subdirectorios de este
	 */

	/**
	 * Llama al metodo de carga de metodos en librerias no cargadas
	 *
	 * @since 2011-05-16
	 * @todo funcionan cadenas?
	 * @todo decidir si devolver algo
	 * @param {string} method Nombre del metodo
	 * @param {array} args Argumentos del metodo
	 * @param {string} library JS a cargar
	 * @return {Object} JaSper
	 */
	loadMethod: function (method, args, library){
		library = library || method;

		switch(library){
			case 'ajax':
				library = 'JaSper_ajax.js';
				break;
			case 'move':
				library = 'JaSper_move.js';
				break;
			case 'rating':
				library = 'JaSper_rating.js';
				break;
			case 'animate':
			case 'canvas':
				library = 'JaSper_canvas.js';
				break;
			case 'rtb':
				library = 'JaSper_rtb.js';
				break;
			case 'validar':
				library = 'JaSper_formazo.js';
				break;
			default:
				library = false;
				_JaSper.funcs.log('-JaSper::loadMethod- Intenta cargar dinamicamente una librería desconocida para el metodo: ' + method, 1);
		}

		var tempCall = (function (obj, as){
			return(function (){eval('obj.' + method + '.apply(obj, as);');});
		})(this, args);
		//tempId = method + args.toString() + library;

		if(library){
			_JaSper.funcs.loadScriptQueue.push({'fn':tempCall,'ctx':this});
			//_JaSper.funcs.loadScript('packer.php?scriptJs=' + library); //version con empaquetador/minificador "class.JavaScriptPacker.php"
			_JaSper.funcs.loadScript(library); //version sin empaquetador
		};

		return this;
	},

	ajax: function (){return(this.loadMethod('ajax', arguments));},

	/* Movimiento de elementos */
	move: function (){return(this.loadMethod('move', arguments));},

	/* Sistema de valoracion, Rating */
	rating: function (){return(this.loadMethod('rating', arguments));},

	/* Canvas */
	animate: function (){return(this.loadMethod('animate', arguments));},
	canvas: function (){return(this.loadMethod('canvas', arguments));},

	/* Rich Text Box */
	rtb: function (){return(this.loadMethod('rtb', arguments));},

	/* Validacion de formularios */
	validar: function (){return(this.loadMethod('validar', arguments));}
});

/**************
** polyfills **
**************/

if(!Array.prototype.indexOf){
	//No existe en versiones viejas de IE; existe en Firefox, pero no en MOZ
	Array.prototype.indexOf = function (obj){
		for(var i = 0, len = this.length; i < len; i++){
			if(this[i] == obj) return i;
		}
		return -1;
	};
};

if(!String.prototype.trim){
	String.prototype.trim = function (){
		// Make sure we trim BOM and NBSP
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		return this.replace(rtrim, '');
	};
};

//From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if(!Object.keys){
	Object.keys = (function(){
		'use strict';
		var hasOwnProperty = Object.prototype.hasOwnProperty,
		hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
		dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
		dontEnumsLength = dontEnums.length;

		return function(obj){
			if(typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)){
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [], prop, i;

			for(prop in obj){
				if(hasOwnProperty.call(obj, prop)){
					result.push(prop);
				}
			}

			if(hasDontEnumBug){
				for(i = 0; i < dontEnumsLength; i++){
					if(hasOwnProperty.call(obj, dontEnums[i])){
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
};
