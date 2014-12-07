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

/**
 * Selector de elementos DOM, mediante id, clase, tag, etc. (ver detalles en constructor)
 * 
 * Basada inicialmente en Getme.js Version 1.0.4 (Rob Reid)
 * y en otros (se menciona donde corresponda si se conoce su origen)
 *
 * @author José M. Carnero
 * @since 2010-06-21
 * @version 3.0b
 * @see Al final del archivo estan las extensiones necesarias de prototipos de objetos del sistema
 */
(function(){

	var window = this, //acelera las referencias a window
	undefined; //creamos una variable indefinida que podemos usar para probar contra otras indefinidas

	//alias, como $ (para simplificar las llamadas al constructor)
	JaSper = _JaSper = window.JaSper = window.$ = function(sel, context){
		return new JaSper(sel, context);
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
	 */
	JaSper = function(sel, context){
		//si no se pasa ningun selector se usa document
		sel = sel || document;

		this.version = 'JaSper v3.0b',
		this.nodes = this.nodes || [],
		this.context = context || window.document; //contexto por defecto es document

		this.debug = window.JaSperDebug || false; //TODO revisar si debe ser una variable global; al ser global el valor se conserva hasta que se cambia explicitamente

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
					JaSper.funcs.log('[JaSper::constructor] [XPath] Arbol del documento modificado durante la iteracion.', 1);
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
							JaSper.funcs.log('[JaSper::constructor] "' + context.toString() + '" no es un contexto v\u00E1lido.', 1);
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
						this.nodes = JaSper.funcs.getElementsByClassName(match[4], this.context);
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
						if(!!document.querySelectorAll && this.context === document){
							this.nodes = JaSper.funcs.selector(sel);
						}else{
							//pasarselo a Sizzle (mas eficiente con navegadores antiguos)
							try{this.nodes = JaSper.find(sel,this.context);}
							catch(e){this.nodes = [];} //ninguna forma de localizar los nodos pedidos
						}
					}
				}

			}
		}else if(sel.nodeType){
			// already got a node add
			this.context = this.nodes[0] = sel;
		}else if(JaSper.funcs.isArray(sel)){
			this.nodes = sel;
		}else{
			this.nodes = JaSper.funcs.makeArray(sel);
		}

		this.length = this.nodes.length;
		return this; //nodos;
	};

	//con esto JaSper puede ser usado como constructor y como parte del prototype
	JaSper.prototype = {
		//que navegador se esta usando
		navigator: (navigator.userAgent.toLowerCase().match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1], //version
		msie: /msie/.test(navigator.userAgent.toLowerCase()) && !/opera/.test(navigator.userAgent.toLowerCase()),
		mozilla: /mozilla/.test(navigator.userAgent.toLowerCase()) && !/(compatible|webkit)/.test(navigator.userAgent.toLowerCase()),
		opera: /opera/.test(navigator.userAgent.toLowerCase()),
		webkit: /webkit/.test(navigator.userAgent.toLowerCase()),
		gecko: /gecko/.test(navigator.userAgent.toLowerCase()) && !/khtml/.test(navigator.userAgent.toLowerCase()),

		/**
		 * Referencia automatica a la funcion foreach pasandole la lista de nodos, ej. $('<SPAN>').each(function(){});
		 * 
		 * @return object JaSper
		 */
		each: function(callback, args){
			if(!!this.nodes && this.nodes.length){ //no se hace nada si no hay nodos
				if(!args) JaSper.funcs.foreach(this.nodes, callback);
				else JaSper.funcs.foreach(this.nodes, callback, args);
			}

			return this;
		},

		/**
		 * Ejecuta la funcion pasada cuando se haya cargado todo el arbol DOM
		 * 
		 * $().ready(function(){[...]});
		 * 
		 * http://snipplr.com/view.php?codeview&id=6156
		 */
		ready: function (f){
			if(!this.msie && !this.webkit && document.addEventListener) return document.addEventListener('DOMContentLoaded', f, false);
			if(JaSper.funcs.readyFuncs.push(f) > 1) return;
			if(this.msie){
				(function (){
					try {document.documentElement.doScroll('left'); JaSper.funcs.runReady();}
					catch (err){setTimeout(arguments.callee, 0);}
				})();
			}
			else if(this.webkit){
				var t = setInterval(function (){
					if (/^(loaded|complete)$/.test(document.readyState)) clearInterval(t), JaSper.funcs.runReady();
				}, 0);
			}
		},

		/**
		 * Debug
		 *
		 * @since 2011-03-24
		 * @param debug Se muestran mensajes de debug (true) o no (false)
		 * @return object JaSper
		 */
		setDebug: function(debug){
			if(!debug) window.JaSperDebug = false;
			else this.debug = window.JaSperDebug = debug || true;
	
			return this;
		}

	};

	//funciones estaticas referenciables por si mismas,  ej. var a = JaSper.funcs.getDetails(obj)
	JaSper.funcs = {

		/**
		 * Muestra mensajes de debug, si "this.debug" es true
		 * Muestra los mensajes en el elemento con id "JaSperDebug" o en un elemento nuevo bajo el primer nodo de this
		 * Ej. de uso:
		 * <code>
$('#capa').setDebug(true).ajax('ej_respuesta.php');
		 * </code>
		 * 
		 * @todo mostrar el mensaje con la linea correcta en que se ha producido (no la linea de este metodo)
		 * @since 2011-03-24
		 * @param string mens Mensaje de debug a mostrar
		 * @param integer lev Nivel de error a mostrar; 0 -> info (por defecto), 1 -> warn, 2 -> error
		 * @return boolean
		 */
		log: function(mens, lev){
			if(!window.JaSperDebug) return false;
			if(!mens) var mens = 'JaSper debug';
			if(!lev) var lev = 0;

			if(typeof console != 'object'){
				//contenedor de los mensajes de debug
				var e = document.getElementById('JaSperDebug'); //TODO en firefox adquiere los metodos de JaSper, en ie no
				if(!e){
					e = document.createElement('ul');
					e.className = 'JaSperDebug ';
					e.id = 'JaSperDebug'; //TODO diferenciar id's, por si se crea mas de uno
					_JaSper('<body>').insertAfter(e);
				}

				//cada uno de los mensajes de debug
				var m = document.createElement('li');
				m.className = 'JaSperDebug' + (lev == 2?'error':(lev == 1?'warn':'info'));
				m.appendChild(document.createTextNode(mens));
				_JaSper('<body>').append(m, e);
			}else{
				if(typeof mens != 'string') console.dir(mens); //show objects

				switch(lev){
				case 2: //error
					console.error(mens);
					//console.trace();
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

		/**
		 * Extiende un objeto con otro
		 * 
		 * @param object extendObj Objeto original a extender
		 * @param object addObj Objeto con metodos que se agregaran a extendObj
		 */
		extend: function(extendObj, addObj){
			for(var a in addObj){
				extendObj[a] = addObj[a];
			}
		},

		/**
		 * Amplia las traducciones
		 *
		 * @since 2011-06-15
		 * @param object obj Objeto con nuevas traducciones, ej. {'en':{'key':'key traduction'}, 'es':{'clave':'clave traduccion'}},
		 * @return void
		 */
		extendTrads: function(obj){
			for(var lang in obj){
				if(!JaSper.funcs.trads[lang]) JaSper.funcs.trads[lang] = {};

				for(var key in obj[lang]){
					JaSper.funcs.trads[lang][key] = obj[lang][key];
				}
			}
			return;
		},

		/**
		 * Recorre una lista de nodos o array, ejecutando la funcion pasada en cada resultado
		 * 
		 * @return list Lista de nodos u objetos
		 */
		foreach: function(list, callback, args){
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

		//devuelve elementos filtrados por className, nodo y tag
		getElementsByClassName: function(clsName, node, tag){
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
				for(var i=0,j=els.length;i<j;i++){
					re.test(els[i].className) ? retVal.push(els[i]) : '';
				}
				return retVal;
			}
		},

		isArray: function(o){
			return Object.prototype.toString.call(o) == '[object Array]';
		},

		//objetos con propiedades tipo array (array/nodelist)
		isArrayLike: function(o){
			// window, strings (y functions) tambien tienen 'length'
			return (o && o.length && !this.isFunction(o) && !this.isString(o) && o !== window);
		},

		isFunction: function(o){
			return ((o) instanceof Function);
		},

		isString: function(o){
			return (typeof(o) == 'string');
		},

		/**
		 * Carga scripts javascript que no se hayan cargado durante la carga de la pagina
		 * @todo asegurarse de no estar cargando un script ya cargado (principalmente los cargados durante la carga de la pagina u otro que se se pueda identificar con el id automatico aqui asignado)
		 *
		 * @since 2011-05-10
		 * @param string scrPath Ruta absoluta ("http://ruta/script.js") o relativa a donde se encuentre "JaSper.js" (como "ruta/script.js")
		 */
		loadScript: function(scrPath){
			var scrId = 'JaSper_script_' + scrPath.replace(/[^a-zA-Z\d_]+/, '');
			if(document.getElementById(scrId)){
				JaSper.funcs.log('-JaSper::loadScript- Script (id->' + scrId + ') ya cargado.');
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
				JaSper.funcs.log('-JaSper::loadScript- Script (id->' + scrId + ') leido con "document.write".');
			}
			catch(e){*/ //for xhtml+xml served content, fall back to DOM methods
				var script = document.createElement('script');
				script.id = scrId;
				//script.charset = "windows-1250";
				script.type = 'text/javascript';
				script.src = scrPath; //relativo o absoluto, ej: 'http://path.to.javascript/file.js'

				if(script.readyState){ //IE
					script.onreadystatechange = function(){
						if(script.readyState == "loaded" || script.readyState == "complete"){
							script.onreadystatechange = null;
							var scriptQueue = JaSper.funcs.loadScriptQueue;
							JaSper.funcs.loadScriptQueue = [];
							JaSper.funcs.log('-JaSper::loadScript- Script [' + script.src + '] listo! ... en IE');
							for(mt in scriptQueue){
								try{
									(function(cb, ctx){
										return(cb.call(ctx));
									})(scriptQueue[mt]['fn'], scriptQueue[mt]['ctx']);
								}
								catch(ex){
									JaSper.funcs.log('-JaSper::loadScript- No se ha podido ejecutar un método. ' + ex, 1);
									return;
								}
							}
							JaSper.funcs.loadScriptQueue = [];
						}
					};
				}
				else{
					script.onload = function(){
						var scriptQueue = JaSper.funcs.loadScriptQueue;
						JaSper.funcs.loadScriptQueue = [];
						JaSper.funcs.log('-JaSper::loadScript- Script [' + script.src + '] cargado!');
						for(mt in scriptQueue){
							try{
								(function(cb, ctx){
									return(cb.call(ctx));
								})(scriptQueue[mt]['fn'], scriptQueue[mt]['ctx']);
							}
							catch(ex){
								JaSper.funcs.log('-JaSper::loadScript- No se ha podido ejecutar un método. ' + ex, 1);
								return;
							}
						}
					};
				}

				var h = document.getElementsByTagName("head").length ? document.getElementsByTagName("head")[0] : document.body;
				h.appendChild(script);
			//}

			return(this);
		},

		//cola de ejecucion de los metodos pedientes de la carga de algun script dinamico
		loadScriptQueue: [],

		makeArray: function(a){
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

JaSper.find = Sizzle;
JaSper.filter = Sizzle.filter;
JaSper.expr = Sizzle.selectors;
JaSper.expr[":"] = JaSper.expr.filters;
		 *
		 * @param string query Cadena con selector o selectores a buscar
		 * @return array Nodos
		 */
		selector: function(query){
			try{
				// Always ensure results are array like - not had a problem so far but...
				return this.makeArray(document.querySelectorAll(query));
			}catch(e){
				return [];
			}
		},

		/**
		 * Emulacion de la funcion "sprintf".
		 * El primer parametro debe ser una cadena, los siguientes los valores a sustituir (en el mismo orden que aparezcan en la cadena)
		 *
		 * @todo Reconoce '%s' (string), '%u' (unsigned)  y '%%' (%)
		 * @since 2011-06-20
		 * @return string
		 */
		sprintf: function(){
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
			return(cadena);
		},

		/**
		 * Traduccion de los textos de funciones.
		 * Con la variable "window.jsAcceptLanguage" (generada por PHP por ejemplo: $_SESSION['l10n']) 
		 * que contenga el codigo de lenguaje que actualmente solicita el navegador; 
		 * ya que javascript no puede leer directamente las cabeceras que envia el navegador;
		 * si no se proporciona detecta el lenguaje del navegador (no los configurados por el usuario).
		 * 
		 * Devuelve el mensaje traducido o falso
		 * NO permite encadenado de metodos
		 * 
		 * @todo optimizar codigo
		 * @param array func Clave de la traduccion a devolver y parametros que requiera
		 * @param string langDef Lenguaje por defecto
		 * @return string/boolean
		 */
		_t: function(func, langDef){
			if(!JaSper.funcs.isArray(func)) func = [func];

			if(!langDef) var langDef = 'es'; //castellano
			if(window.jsAcceptLanguage) lang = window.jsAcceptLanguage; //codigo de lenguaje proporcionado por PHP
			else{
				var lang = navigator.language ? navigator.language.substr(0,2) : navigator.userLanguage.substr(0,2); //lenguaje actual del navegador
			}

			//textos (array "trads") en el mismo orden que el array "trads_keys"

			if(JaSper.funcs.trads[lang] && JaSper.funcs.trads[lang][func[0]]) func[0] = JaSper.funcs.trads[lang][func[0]];
			else if(JaSper.funcs.trads[langDef] && JaSper.funcs.trads[langDef][func[0]]) func[0] = JaSper.funcs.trads[langDef][func[0]]; //lenguaje por defecto

			return(JaSper.funcs.sprintf.apply(this, func));
		},

		trads: {'en':{}, 'es':{}}, //traducciones en todos los lenguajes que sean necesarios, definidos por codigo iso 639

		/**
		 * Posicion de la ventana de visualizacion respecto al total de la pagina cargada
		 * 
		 * ej. para comprobar si se ha llegado al final de la pagina y se esta intentando intentando bajar mas:
		 * <code>
$('<body>').addEvent('mousewheel', function(ev){
	if(JaSper.funcs.pagePosition().indexOf('bottom') > -1 && ev.wheelDelta == -3) alert('fin de pagina');
});

//probar con (window.scrollY >= window.scrollMaxY) || (window.scrollY >= window.pageYOffset)
//pero comprobar que navegadores lo soportan
		 * </code>
		 * @todo devolver posicion de elementos en lugar de la ventana?
		 * @return string Devuelve que bordes del documento estan visibles respecto a la ventana visible (center si no esta en alguno de los bordes)
		 */
		windowPosition: function() {
			//TODO probar en mas navegadores
			var isScrollToPageEnd = function(coordinate) { //comprueba si la ventana esta en los limites del documento
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

	//puede extenderse el prototipo con los metodos encontrados en JaSper.funcs con:
	//JaSper.funcs.extend(JaSper.prototype, JaSper.funcs);

})();

/****************
** Metodos css **
*****************/
JaSper.funcs.extend(JaSper.prototype, {

	/**
	 * recupera una regla css de document o del elemento pasado
	 */
	getStyle: function(elem, cssRule){
		elem = (!elem)?document.defaultView:elem; 
		var sRet = '';
		if(elem.nodeType == 1){
			if(document.defaultView && document.defaultView.getComputedStyle) sRet = document.defaultView.getComputedStyle(elem, "")[cssRule]; //Firefox
			else if(elem.currentStyle) sRet = elem.currentStyle[cssRule]; //IE
			else sRet = elem.style[cssRule]; //try and get inline style
		}
		return sRet;
	},

	/**
	 * pone una regla css de document o del elemento pasado al valor pasado
	 */
	setStyle: function(elem, cssRule, value){
		elem = (!elem)?document.defaultView:elem; 

		if(elem.nodeType == 1){
			//elem.style.cssText = value;
			elem.style[cssRule] = value;
			return true;
		}
		return false;
	},

	/**
	 * Alterna la propiedad display entre 'none' y visible
	 * 
	 * @return object JaSper
	 */
	toggle: function() {
		this.each(
			function(){
				//TODO deberia aceptar otros tipos de nodo?
				if(this.nodeType != 1) return; //solo nodos tipo ELEMENT_NODE

				var sActDisplay = _JaSper(this).getStyle(this, 'display');
				if(this.style.display == 'none' || !this.style.display){

					var elem = document.createElement(this.nodeName);
					_JaSper(document.body).append(elem);

					this.origDisp = _JaSper(this).getStyle(elem, 'display');

					_JaSper(document.body).remove(elem);
				}
				this.origDisp = (this.origDisp || (sActDisplay != 'none' ? sActDisplay : ''));

				if(sActDisplay != 'none' ) sActDisplay = 'none';
				else sActDisplay = this.origDisp;

				_JaSper(this).setStyle(this, 'display', sActDisplay);
			}
		);

		return this;
	}

});

/**
 * Esta funcion es llamada en cada evento; independiente de objetos JaSper.
 * 'this' es el objeto que lo haya llamado
 * 
 * @param ev Nombre del evento
 */
if(typeof window.eventTrigger != 'function'){
	window.eventTrigger = function (ev){
		//return true;
	};
}

/**
 * emulacion de eventos mouseenter y mouseleave en los navegadores que no lo soportan (todos menos ie)
 * mousewheel para navegadores gecko
 * 
 * para controlar el movimiento de la rueda:
 * <code>
$('<p>').addEvent('mousewheel', function(ev){
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
JaSper.funcs.extend(JaSper.funcs, {

	mouseEnter: function(func){
		var isAChildOf = function(_parent, _child){
			if(_parent === _child) {return false;}
			while(_child && _child !== _parent) {_child = _child.parentNode;}
			return _child === _parent;
		};

		return function (e){
		var rel = e.relatedTarget;
		if(this === rel || isAChildOf(this, rel)) return;

		func.call(this, e);
		};
	},

	mouseWheel: function(func){
		if(typeof f === 'undefined'){
			f = function(e){
				e.wheelDelta = -(e.detail);
				func.call(this, e);
				e.wheelDelta = null;
			};
		}
		return f;
	}

});

/***********************
** Gestion de eventos **
***********************/
JaSper.funcs.extend(JaSper.prototype, {

	/**
	 * Manejador de eventos.
	 * 
	 * @param string evento Nombre del evento, ej: "click" (como "onclick" sin "on")
	 * @param function funcion Funcion que se lanzara con el evento; cadena de nombre de funcion o nombre de la funcion sin mas, tambien se permiten funciones anonimas: "function(){ alert('hello!'); }"
	 * @param boolean capt Captura el evento cuando entra (fase de captura, true) o cuando sale (burbujeo, false, por defecto)
	 * @return object JaSper
	 */
	evAdd: function (evento, funcion, capt){

		if(typeof funcion == 'string') funcion = window[funcion];
		if(!capt) var capt = false;

		if(document.addEventListener){ //w3c
			this.each(
				function (evt, func, ct){
					if(!this || this.nodeType == 3 || this.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios

					//eventos mouseenter, mouseleave y mousewheel sobre una idea original encontrada en http://blog.stchur.com
					switch(evt){
						case 'mouseenter':
							this.addEventListener('mouseover', JaSper.funcs.mouseEnter(func), ct);
							break;
						case 'mouseleave':
							this.addEventListener('mouseout', JaSper.funcs.mouseEnter(func), ct);
							break;
						case 'mousewheel':
							if(_JaSper().gecko){ //si estamos en un navegador Gecko, el nombre y manejador de evento requieren ajustes
								evt = 'DOMMouseScroll';
								func = JaSper.funcs.mouseWheel(func);
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
					elemento[clave] = function(){elemento['e' + clave](window.event);};
					elemento.attachEvent('on' + evt, elemento[clave]);
				}, [evento, funcion]);
			if(window.eventTrigger) this.each(
				function (evt){
					var elemento = this, clave = elemento + evt + window.eventTrigger;

					if(!elemento || elemento.nodeType == 3 || elemento.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios

					elemento['e' + clave] = function (){window.eventTrigger.call(elemento, evt);};
					elemento[clave] = function(){elemento['e' + clave](window.event);};
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
						this['on' + evt] = function(){
							if(old_evt) old_evt();
							func();
						}
					}
				}, [evento, funcion]);
			if(window.eventTrigger) this.each(
				function (evt){
					if(!this || this.nodeType == 3 || this.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios
					this['on' + evt] = function (){window.eventTrigger.call(this, evt);};
				}, [evento]);
		}

		return this;
	},

	/**
	 * guarda el ultimo evento que se ha disparado, sirve como controlador para que otros eventos puedan lanzarse (o no) en funcion del previo
	 * asignar en cada funcion afectada (las que se lancen en los eventos), donde interese
	 * 
	 * @todo revisar
	 * @param e Evento
	 * @return string
	 */
	evName: function (e){
		/*this.nombreEvento = window.nombreEvento = evento.toLowerCase(); //se guarda el nombre del ultimo evento disparado para cada objeto jsframe; y el ultimo de todos en window.nombreEvento
		evento = this.nombreEvento;*/

		var e = e || window.event;
		return(e);
	},

	/**
	 * Anula la accion por defecto de un elemento, como click en <a>
	 * 
	 * @param e Objeto evento
	 * @return object JaSper
	 */
	evPreventDefault: function (e){
		var e = e || window.event;

		if(e.preventDefault){ //modelo DOM
			//e.stopPropagation();
			e.preventDefault();
		}
		else if(window.event){ //modelo MSIE
			//e.keyCode = 0;  //<<< esto ayuda a que funcione bien en iExplorer
			//e.cancelBubble = true;
			e.returnValue = false;
			e.retainFocus = true;
		}

		return this;
	},

	/**
	 * Elimina eventos
	 * 
	 * @param string evento Nombre del evento, ej: "click" (como "onclick" sin "on")
	 * @param function funcion Funcion que se lanzara con el evento; cadena de nombre de funcion o nombre de la funcion sin mas, tambien se permiten funciones anonimas: "function(){ alert('hello!'); }"
	 * @param boolean capt Captura el evento cuando entra (fase de captura, true) o cuando sale (burbujeo, false, por defecto)
	 * @return object JaSper
	 */
	evRemove: function (evento, funcion, capt){
		//TODO eliminar todos los eventos del elemento si no se pasan parametros
		if(typeof funcion == 'string') funcion = window[funcion]; //TODO try para distinguir nombre_de_funcion de nombre_de_funcion(params) (evaluar esta ultima)
		if(!capt) var capt = false;

		if(document.addEventListener){  //w3c
			this.each(
				function (evt, func, ct){
					//TODO problemas para quitar eventos con funciones anonimas (como el retorno de mouseEnter); asignarlo previamente a una variable cuando se pone el evento?
					//eventos mouseenter, mouseleave y mousewheel sobre una idea original encontrada en http://blog.stchur.com
					switch(evt){
						case 'mouseenter':
							this.removeEventListener('mouseover', JaSper.funcs.mouseEnter(func), ct);
							break;
						case 'mouseleave':
							this.removeEventListener('mouseout', JaSper.funcs.mouseEnter(func), ct);
							break;
						case 'mousewheel':
							if(_JaSper().gecko){ //si estamos en un navegador Gecko, el nombre y manejador de evento requieren ajustes
								evt = 'DOMMouseScroll';
								func = JaSper.funcs.mouseWheel(func);
							}
						default: //resto de eventos
							this.removeEventListener(evt, func, ct);
					}
				}, [evento, funcion, capt]);
		}
		else if(document.attachEvent){ //ie
			this.each(
				function (evt, func){
					this.detachEvent('on' + evt, this[evt + func]);
					this[evt + func] = null;
					this["e" + evt + func]=null;
				}, [evento, funcion]);
		}
		else{ //DOM level 0
			this.each(
				function (evt){
					eval('this.on' + evt + ' = null;');
				}, [evento]);
		}

		return this;
	},

	/**
	 * Devuelve el objeto que ha disparado un evento.
	 * 
	 * @param e Evento
	 * @return object
	 */
	evSource: function (e){
		var e = e || window.event, targ = false;

		if(e.type == 'mouseover') targ = e.relatedTarget || e.fromElement; //origen para mouseover
		else targ = e.target || e.srcElement; //w3c o ie

		if(targ.nodeType == 3 || targ.nodeType == 4) targ = targ.parentNode; // defeat Safari bug

		return(targ);
	},

	/**
	 * Evita la propagacion de eventos, como que se disparen el del contenedor de un elemento y el del elemento
	 * poniendo esto en uno de ellos evita los demas
	 * 
	 * @param e Objeto evento
	 * @return object JaSper
	 */
	evStop: function (e){
		var e = e || window.event;

		if(e.stopPropagation) e.stopPropagation(); //modelo DOM
		else e.cancelBubble = true; //modelo MSIE

		return this;
	},

	/**
	* Devuelve el objeto destino de un evento (como a donde va el raton en mouseout).
	* 
	* @param e Evento
	* @return object
	*/
	evTarget: function (e){
		var e = e || window.event, dest = false;
		if(e.type == 'mouseover') dest = e.relatedTarget || e.toElement; //destino en mouseout
		else dest = e.target || e.srcElement; //w3c o ie

		return(dest);
	}

});

/*********************
** Gestion de nodos **
*********************/
JaSper.funcs.extend(JaSper.prototype, {

	/**
	 * Añade un nodo hijo al seleccionado, despues de los existentes
	 * 
	 * @todo debe funcionar con each (para toda la lista de nodos que se le pase)
	 * @since 2010-12-14
	 * @param nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @param ancla Elemento al que se añadira nodo; si va vacio se usa this (los nodos de JaSper)
	 * @return object JaSper
	 */
	append: function(nodo, ancla){
		nodo = nodo || this; //se usa el objeto JaSper actual si no se pasa ninguno (o si se pasa null); util para clonar, por ej.

		if(JaSper.funcs.isArray(nodo)){
			elem = document.createElement(nodo[0]);
			elem.innerHTML = nodo[1];
			elem.className = nodo[1];
			elem.id = nodo[1];
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
	 * Devuelve el HTML de los nodos si no se le pasa nada
	 * Sustituye el HTML de los nodos con el que se pase por parametro devolviendo el HTML que hubiese previamente
	 * Devuelve NULL si se le pasa una lista vacia de nodos
	 * 
	 * NO permite encadenado de metodos
	 * 
	 * @todo solo funciona para nodos que tengan la propiedad innerHTML, extender para todos los nodos construyendo los objetos que se pasen por parametro y luego append al nodo?
	 * @param string html HTML que sustituira el de los nodos
	 * @return string HTML encontrado
	 */
	html: function(html, separador) {
		var ret = [];
		if(!html) var html = false;
		if(!separador) var separador = '';

		this.each(function (h){
			if(!!this.innerHTML){ //si el nodo no tiene la propiedad innerHTML no se hace nada
				//TODO separar las cadenas HTML encontradas para un posterior split?
				ret[ret.length] = this.innerHTML; //guarda el HTML actual del nodo

				if(!!h){ //sustituye con el HTML pasado por parametro
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
	 * @param nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return object JaSper
	 */
	insertAfter: function (nodo){
		if(JaSper.funcs.isArray(nodo)){
			elem = document.createElement(nodo[0]);
			elem.innerHTML = nodo[1];
			elem.className = nodo[1];
			elem.id = nodo[1];
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
	 * @param nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return object JaSper
	 */
	insertBefore: function (nodo){
		if(JaSper.funcs.isArray(nodo)){
			elem = document.createElement(nodo[0]);
			elem.innerHTML = nodo[1];
			elem.className = nodo[2];
			elem.id = nodo[3];
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
	 * @since 2010-12-16
	 * @param nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @param ancla Elemento al que se añadira nodo; si va vacio se usa this (los nodos de JaSper)
	 * @return object JaSper
	 */
	prepend: function(nodo, ancla){
		nodo = nodo || this; //se usa el objeto JaSper actual si no se pasa ninguno; util para clonar, por ej.

		if(JaSper.funcs.isArray(nodo)){
			elem = document.createElement(nodo[0]);
			elem.innerHTML = nodo[1];
			elem.className = nodo[1];
			elem.id = nodo[1];
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
	 * @param elem Elemento a eliminar
	 * @return object JaSper
	 */
	remove: function(elem) {
		//var el = this.get(el);
		this.each(function (el){
			el.parentNode.removeChild(el);
		}, [elem]);

		return this;
	}

});

/**************************************************
** Metodos para ejecucion periodica de funciones **
**************************************************/
JaSper.funcs.extend(JaSper.prototype, {

	/**
	 * Ejecuta la funcion pasada de forma periodica, indefinidamente o no
	 *
	 * @since 2010-12-16
	 * @param func Funcion a ejecutar; nombre de la funcion (string), referencia o anonima
	 * @param intervalo Cada cuanto se ejecuta la funcion, si 0 se ejecutara una sola vez cuando se cumpla lapso (si hay lapso)
	 * @param lapso Tiempo tras el cual deja de ejecutarse (ambos en milisegundos, 1000ms = 1s)
	 * @return object
	 */
	//TODO devolver los id para controlarlos fuera; this en la funcion pasada deben ser los nodos JaSper?
	callPeriodic: function(func, intervalo, lapso){
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
JaSper.funcs.extend(JaSper.prototype, {
	/*
	 * Se cargan bajo demanda si estan aqui incluidos.
	 * todos los .js deben estar en el mismo directorio que este o subdirectorios de este
	 */

	/**
	 * Llama al metodo de carga de metodos en librerias no cargadas
	 *
	 * @since 2011-05-16
	 * @todo funcionan cadenas?
	 * @param string method Nombre del metodo
	 * @param array args Argumentos del metodo
	 * @param string library JS a cargar
	 */
	loadMethod: function(method, args, library){
		if(!library) var library = method;

		switch(library){
			case 'ajax':
				library = 'JaSper_ajax.js';
				break;
			case 'move':
				library = 'JaSper_move.js';
				break;
			default:
				library = false;
				JaSper.funcs.log('-JaSper::loadMethod- Intenta cargar dinamicamente una librería desconocida para el metodo: ' + method, 1);
		}

		var tempCall = (function (obj, as){
			return(function (){eval('obj.' + method + '.apply(obj, as);');});
		})(this, args);
		tempId = method + args.toString() + library;

		if(library){
			JaSper.funcs.loadScriptQueue.push({'fn':tempCall,'ctx':this});
			//JaSper.funcs.loadScript('packer.php?scriptJs=' + library); //version con empaquetador/minificador "class.JavaScriptPacker.php"
			JaSper.funcs.loadScript(library); //version sin empaquetador
		}
	},

	ajax: function(){return(this.loadMethod('ajax', arguments));},

	/*
	 * Movimiento de elementos *
	 */
	move: function(){return(this.loadMethod('move', arguments));},

});

/**************************
** EXtensiones prototype **
**************************/

/**
 * Array.indexOf(obj)
 * No existe en versiones viejas de IE
 * Existe en Firefox, pero no en MOZ.
 * 
 * Devuelve el indice de la primera posicion en que aparezca obj, si no se encuentra devuelve -1
 * 
 * @since 2010-12-17
 * @param obj Object a localizar dentro del array
 * @return integer
 */
if(typeof this.indexOf != "function"){
	Array.prototype.indexOf = function (obj){
		for(var i = 0, len = this.length; i < len; i++){
			if(this[i] == obj) return i;
		}
		return -1;
	};
}
