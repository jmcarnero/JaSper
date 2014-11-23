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
 * Selector de elementos DOM, mediante id, clase, tag, etc. (ver detalles en constructor)
 * 
 * Basada inicialmente en Getme.js Version 1.0.4 (Rob Reid)
 * y en otros (se menciona donde corresponda si se conoce su origen)
 * 
 * @since 2010-06-21
 * @version 2.0b
 */
(function(){

var window = this, //acelera las referencias a window
	undefined, //creamos una variable indefinida que podemos usar para probar contra otras indefinidas
	_$ = window.$, // $ alias, simplifica la escritura
	//_JaSper = window.JaSper,
	query = !!document.querySelectorAll; //comprueba si querySelectorAll esta disponible para su uso

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

	this.version = 'JaSper v2.0b',
	this.nodes = this.nodes || [],
	this.context = context || window.document; //contexto por defecto es document

	this.debug = window.debug || false;

	//comprueba si es cadena HTML, ID o class
	var re_JaSper = /^<([^> ]+)[^>]*>(?:.|\n)+?<\/\1>$|^(\#([-\w]+)|\.(\w[-\w]+)|@(\w[-\w]+))$/i,
		//busca tags <SPAN> <P> <H1>
		re_tag = /<([a-z1-9]+?)>,?/ig,
		match;

	//si se ha pasado una cadena (sin distincion inicial), puede ser un ID, clase CSS, tag HTML o una cadena HTML
	if(typeof(sel) === 'string'){
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
					JaSper.funcs.debugShow('-JaSper::constructor- "' + context.toString() + '" no es un contexto v\u00E1lido.', 1);
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
				if(query && this.context === document){
					this.nodes = JaSper.funcs.selector(sel);
				}else{
					//pasarselo a Sizzle (mas eficiente con navegadores antiguos)
					try{this.nodes = JaSper.find(sel,this.context);}
					catch(e){this.nodes = [];} //ninguna forma de localizar los nodos pedidos
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

// we do this so that JaSper can be used as a constructor as well as part of the prototype
JaSper.prototype = {

	//que navegador se esta usando
	navigator: (navigator.userAgent.toLowerCase().match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1], //version
	msie: /msie/.test(navigator.userAgent.toLowerCase()) && !/opera/.test(navigator.userAgent.toLowerCase()),
	mozilla: /mozilla/.test(navigator.userAgent.toLowerCase()) && !/(compatible|webkit)/.test(navigator.userAgent.toLowerCase()),
	opera: /opera/.test(navigator.userAgent.toLowerCase()),
	webkit: /webkit/.test(navigator.userAgent.toLowerCase()),
	/*
	navigator.browserLanguage : default browser language
	navigator.userLanguage : local language via ControlPanel>Regional&Language
	navigator.systemLanguage : OS language
	*/

	//referencia automatica a la funcion foreach pasandole la lista de nodos, ej. $('<SPAN>').each(function(){});
	each: function(callback, args){
		if(!args) this.foreach(this.nodes, callback);
		else this.foreach(this.nodes, callback, args);

		return this;
	},

	//devuelve un elemento concreto de la lista de nodos
	get: function(idx){
		if(this.nodes && this.nodes.length > 0){
			return (typeof(idx) == 'number')?this.nodes[idx]:this.nodes[0];
		}else{
			return null;
		}
	},

	/**
	 * Devuelve codigo HTML de los nodos
	 * 
	 * @param combinado Booleano o cadena; si falso o vacio se recupera el codigo HTML del primer nodo, si contiene algo se concatena al codigo recuperado de todos los nodos
	 * @return string
	 */
	getHtml: function(combinado){
		if(this.nodes && this.nodes.length>0){
			if(this.nodes.length>1){
				var totalhtml = '';
				this.each(function(){
					var html = this.innerHTML;
					if(combinado) totalhtml += html + combinado;
					else totalhtml += html;
				});
				return totalhtml;
			}else{
				return this.nodes[0].innerHTML;
			}
		}
	},

	//comprueba si algun elemento tiene el atributo con el valor
	hasAtts: function (attribute, val){
		if(attribute){
			this.each(function(){
				//eval('this.' + attribute == val);
				try{
					return eval('this.' + attribute + '==' + val);
				}
				catch(err){
					JaSper.funcs.debugShow('-JaSper::hasAtts- error: "' + err + '"');
					//return false;
				}
			});
		}
		return false;
	},

	//asigna atributos a un elemento
	setAtts: function (attribute, val){
		if(attribute){
			var self = this,
				ol,
				atts;
			// may have passed att=val pair or a object hash for atts

			if(val !== undefined){
				// create object hash
				// make sure class is converted to className as it will break in IE
				if(attribute == 'class') attribute = 'className';
				atts = eval('({'+attribute+':"'+val+'"})');
			}else{
				atts = attribute;
			}

			// call our internal foreach method which will run a callback function against each value in an array/nodeList
			// we supply the current node list into this function
			this.each(function(){
				self.setProperties.call(this,atts);
			});
		}
		return this;
	},

	/**
	 * Debug
	 *
	 * @since 2011-03-24
	 * @param debug Se muestran mensajes de debug (true) o no (false)
	 * @return object
	 */
	setDebug: function(debug){
		if(!debug) window.debug = false;
		else this.debug = window.debug = debug || true;

		return(this);
	},

	setHtml: function(content){
		if(content){
			//si se ha pasado un nodo tomamos su innerHTML
			if(content.nodeType){
				html = content.innerHTML;
			}else if(typeof(content) === 'string'){
				html = content;
			}else{
				html = '';
			}

			this.each(function(){
				if(this.hasChildNodes()){
					while(this.childNodes.length >= 1){
						this.removeChild(this.firstChild);
					}
				}
				this.innerHTML = html;
			});
		}
		return this;
	},

	/**
	 * Metodo para manejar varias funcionalidades
	 * asigna valores de estilo, clases, atributos y propiedades de objetos
	 * para nodos HTML puede dar valor a atributos, valores de estilo pueden afectar a multiples atributos de un elemento - solo para uso interno. setAtts
	 */
	setProperties: function (atts){
		//enumObj(atts)
		var obj = this;

		if(obj && atts){
			//si el objeto es un nodo HTML
			if(obj.nodeType){
				for(var a in atts){
					if(a == 'class' || a == 'className'){
						// handle class specially
						obj.className = atts[a];
					}else if(a == "style"){
						//usa cssText para poner multiples estilos de una vez
						obj.style.cssText = atts[a];
					}else{
						//otros atributos
						obj.setAttribute(a,atts[a]);
					}
				}
			// if we passed in a style object - duck type test we can reformat the value to camelCase
			}else if('cssText' in obj){
				var js;
				for(var a in atts){
					//asegurarse de que el valor de estilo va en el correcto camelCase
					var js = a.replace(/\-(\w)/g, function(all, letter){return letter.toUpperCase();});
					//asignar propiedad de estilo
					obj[js] = atts[a];
				}
			//en otro caso extendemos el objeto con cada par propiedad/valor del objeto atts
			}else{
				JaSper.funcs.extend(obj,atts);
			}
		}
		return obj;
	},

	setStyle: function (style, val){
		if(style){
			var self = this,
				atts;
			// may have passed att=val pair or a object hash for atts

			if(val !== undefined){
				// create object hash
				// we wrap property names in quotes to handle styles such as font-size which is invalid
				atts = eval('({"' + style + '":"' + val + '"})');
			}else{
				atts = style;
			}

			this.each(function(){
				self.setProperties.call(this.style,atts);
			});
		}
		return this;
	}

};

//funciones estaticas referenciables por si mismas,  ej. var a = JaSper.funcs.getDetails(obj)
//tambien extiende JaSper.prototype para que cualquier instancia tenga estos metodos
JaSper.funcs = {

	/**
	 * Traduccion de los textos de funciones.
	 * Con la variable "window.jsAcceptLanguage" (generada por PHP por ejemplo: $_SESSION['l10n']) 
	 * que contenga el codigo de lenguaje que actualmente solicita el navegador; 
	 * ya que javascript no puede leer directamente las cabeceras que envia el navegador;
	 * si no se proporciona detecta el lenguaje del navegador (no los configurados por el usuario).
	 * 
	 * Devuelve el mensaje traducido o falso; no permite encadenado de metodos
	 * 
	 * @param array func Clave de la traduccion a devolver y parametros que requiera
	 * @param string langDef Lenguaje por defecto
	 * @return string/boolean
	 */
	//TODO convertir en metodo interno y publicos los arrays de traducciones?
	_tradR: function(func, langDef){
		if(!JaSper.funcs.isArray(func)) func = [func];

/*solo IE
navigator.browserLanguage : default browser language
navigator.userLanguage : local language via ControlPanel>Regional&Language
navigator.systemLanguage : OS language*/
		if(!langDef) var langDef = 'es'; //castellano
		if(window.jsAcceptLanguage) lang = window.jsAcceptLanguage; //codigo de lenguaje proporcionado por PHP
		else{
			var lang = navigator.language ? navigator.language.substr(0,2) : navigator.userLanguage.substr(0,2); //lenguaje actual del navegador
		}

		//textos (array "_trads") en el mismo orden que el array "_trads_keys"

		if(JaSper.funcs._trads[lang] && JaSper.funcs._trads[lang][func[0]]) func[0] = JaSper.funcs._trads[lang][func[0]];
		else if(JaSper.funcs._trads[langDef] && JaSper.funcs._trads[langDef][func[0]]) func[0] = JaSper.funcs._trads[langDef][func[0]]; //lenguaje por defecto

		return(JaSper.funcs.sprintf.apply(this, func));
	},

	_trads: {'en':{}, 'es':{}},

	/**
	 * ejemplos:
	 * takesCallback(callback(myFunction,{scope:myObject,args:[myArgOne,myArgTwo],suppressArgs:true}));
	 * takesCallback(myObject.myMethod,{scope:myObject,args:[myArgOne]});
	 *
	 * @author Marco Ramirez (http://onemarco.com)
	 * @since 20111-05-16
	 * @param {Function} func the callback function
	 * @param {Object} opts an object literal with the following
	 * @param scope: the object to bind the function to (what the "this" keyword will refer to) (optional)
	 * @param args: an array of arguments to pass to the function when it is called, these will be appended after any arguments passed by the caller (optional)
	 * @param suppressArgs: boolean, whether to supress the arguments passed by the caller. This default is false. (optional)
	 */
	/*callback: function(func, opts){
		// A utility function for callback()
		function toArray(arrayLike){
			var arr = [];
			for(var i = 0; i < arrayLike.length; i++) arr.push(arrayLike[i]);
			return arr;
		}

		var cb = function(){
			var args = opts.args ? opts.args : [];
			var scope = opts.scope ? opts.scope : this;
			var fargs = opts.supressArgs === true ? [] : toArray(arguments);
			func.apply(scope, fargs.concat(args));
		}
		return cb;
	},*/

	/* devuelve la cadena en formato camelCase */
	camelize : function(s) {
		return s.replace(/\-(.)/g, function(m, l){return l.toUpperCase()});
	},

	/**
	 * Muestra mensajes de debug, si "this.debug" es true
	 * Muestra los mensajes en el elemento con id "jsframeDebug" o en un elemento nuevo bajo el primer nodo de this
	 * Ej. de uso: 
	 * $('#capa').setDebug(true).ajax('ej_respuesta.php');
	 * 
	 * @todo mostrar el mensaje con la linea correcta en que se ha producido (no la linea de este metodo)
	 * @since 2011-03-24
	 * @param string mens Mensaje de debug a mostrar
	 * @param integer lev Nivel de error a mostrar; 0 -> info (por defecto), 1 -> warn, 2 -> error
	 * @return object
	 */
	debugShow: function(mens, lev){
		if(!window.debug) return(false);
		if(!mens) var mens = 'JaSper debug';
		if(!lev) var lev = 0;

		if(typeof console != 'object'){
			//contenedor de los mensajes de debug
			var e = document.getElementById('jsframeDebug'); //TODO en firefox adquiere los metodos de JaSper, en ie no
			if(!e){
				e = document.createElement('ul');
				e.className = 'jsframeDebug ';
				e.id = 'jsframeDebug'; //TODO diferenciar id's, por si se crea mas de uno
				_JaSper('<body>').insertAfter(e);
			}

			//cada uno de los mensajes de debug
			var m = document.createElement('li');
			m.className = 'jsframeDebug' + (lev == 2?'error':(lev == 1?'warn':'info'));
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
	 */
	extend: function(extendObj,addObj){
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
			if(!JaSper.funcs._trads[lang]) JaSper.funcs._trads[lang] = {};

			for(var key in obj[lang]){
				JaSper.funcs._trads[lang][key] = obj[lang][key];
			}
		}
		return;
	},

	//recorre una lista de nodos o array, ejecutando la funcion pasada en cada resultado
	foreach: function(list, callback, args){
		var obj;

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
	 *
	 * @todo revisar funcionamiento, random no garantiza unico
	 * @since 2011-06-09
	 * @param int largo Longitud minima del identificador
	 * @return string
	 */
	genId: function(largo){
		var gid = 'jsf_';
		if(!largo) var largo = 8;
		else if(largo.length < gid.length) largo = gid.length + 1;
		var chars = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";

		var rnum;
		
		while(gid.length < largo || document.getElementById(gid)){
			rnum = Math.floor(Math.random() * (chars.length - 1));
			gid += chars.substr(rnum, 1 );
		}

		return gid;
	},

	//devuelve detalles de un nodo
	getDetails: function(o){
		var d = 'NA';
		if(o){
			d = (o === window) ? 'window' : (o === document) ? 'document' : (o.nodeName) ? o.nodeName : 'UNKNOWN';
			d += (o.id) ? '.' + o.id : (o.name) ? '.' + o.name : (o.nodeValue) ? ' [' + o.nodeValue + ']' : '';
		}
		return d;
	},

	//devuelve elementos filtrados por className, nodo y tag
	getElementsByClassName: function(clsName,node,tag){
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
		//window, cadenas (y funciones) tambien tienen longitud
		return (o && o.length && !this.isFunction(o) && !this.isString(o) && o !== window);
	},

	isFunction: function(o){
		return ((o) instanceof Function);
	},

	isString: function(o){
		return (typeof(o) == 'string');
	},

	readyFuncs: [],

	/*
	 * Carga scripts javascript que no se hayan cargado durante la carga de la pagina
	 * @todo asegurarse de no estar cargando un script ya cargado (principalmente los cargados durante la carga de la pagina u otro que se se pueda identificar con el id automatico aqui asignado)
	 *
	 * @since 2011-05-10
	 * @param string scrPath Ruta absoluta ("http://ruta/script.js") o relativa a donde se encuentre "JaSper.js" (como "ruta/script.js")
	 */
	loadScript: function(scrPath){
		var scrId = 'JaSper_script_' + scrPath.replace(/[^a-zA-Z\d_]+/, '');
		if(document.getElementById(scrId)){
			JaSper.funcs.debugShow('-JaSper::loadScript- Script (id->' + scrId + ') ya cargado.');
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
						//alert(srcMatch[1] + ' -- ' + scrPath);
						break;
					}
				}
			}
		}

		/*try{
			//inserting via DOM fails in Safari 2.0, so brute force approach
			document.write('<script type="text/javascript" src="' + scrPath + '"><\/script>');
			JaSper.funcs.debugShow('-JaSper::loadScript- Script (id->' + scrId + ') leido con "document.write".');
		}
		catch(e){*/
			//for xhtml+xml served content, fall back to DOM methods
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
						//alert("Script is ready! IE");
						for(mt in scriptQueue){
							try{
								(function(cb, ctx){
									return(cb.call(ctx));
								})(scriptQueue[mt]['fn'], scriptQueue[mt]['ctx']);
							}
							catch(e){
								JaSper.funcs.debugShow('-JaSper::loadScript- No se ha podido ejecutar un método. ' + e);
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
					//alert("Script is ready!");
					for(mt in scriptQueue){
						try{
							(function(cb, ctx){
								return(cb.call(ctx));
							})(scriptQueue[mt]['fn'], scriptQueue[mt]['ctx']);
						}
						catch(e){
							JaSper.funcs.debugShow('-JaSper::loadScript- No se ha podido ejecutar un método. ' + e);
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
			// The window, strings (and functions) also have 'length'
			if(!this.isArrayLike(a)){
				ret[0] = a;
			}else{
				var i = a.length;
				while(i){ret[--i] = a[i];}
			}
		}
		return ret;
	},

	//evita conflictos con otros frameworks que usen $
	noConflict: function(deep){
		if(window.$ === JaSper) window.$ = _$;
		if(deep && window.JaSper === JaSper) window.JaSper = _JaSper;
		return JaSper;
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
		if(this.readyFuncs.push(f) > 1) return;
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

	runReady: function (){for (var i = 0; i < this.readyFuncs.length; i++) this.readyFuncs[i]();},

	// returns elements by selector e.g DIV P SPAN
	// supported in later browsers IE 8 (standards mode), FF 3.1+, Safari 3.1+
	// for older browser support use sizzle.js and map the public methods to JaSper methods e.g
	// at the bottom of the sizzle file replace the jQuery methods with the following
	/*
		// EXPOSE Sizzle to JaSper.js

		window.Sizzle = Sizzle;

		JaSper.find = Sizzle;
		JaSper.filter = Sizzle.filter;
		JaSper.expr = Sizzle.selectors;
		JaSper.expr[":"] = JaSper.expr.filters;
	*/
	selector: function(query){
		try{
			// Always ensure results are array like - not had a problem so far but...
			return this.makeArray(document.querySelectorAll(query));
		}catch(e){
			return [];
		}
	},

	/*
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
	}

};

//extiende el prototipo con los metodos encontrados en JaSper.funcs
JaSper.funcs.extend(JaSper.prototype, JaSper.funcs);

})();

/*
metodos css
*/
JaSper.funcs.extend(JaSper.prototype, {

	/**
	 * Añade una clase CSS
	 *
	 * @since 2011-09-07
	 * @param string cName Nombre de la clase
	 * @return object
	 */
	addClass: function (cName){
		if(typeof cName === "string"){
			this.each(
				function (){
					if(this.className.indexOf(cName) == -1) this.className += ' ' + cName; 
				}
			);
		}

		return this;
	},

	/**
	 * Inserta nuevas reglas o clases CSS
	 *
	 * ej.
<code>
// Crea un nueva regla stylesheet para los parrafos.
newStyle=addCSSRule('p');
// Cambia todos los parrafos anteriores al color azul.
newStyle.style.color='blue';

// Creamos una nueva CSS class llamada fancyStyle.
newStyle=addCSSRule('.fancyStyle');
// Aplicamos un fondo verde a todos los elementos con la clase fancyStyle.
newStyle.backgroundColor='green';
</code>
	 *
	 * @since 2011-06-12
	 * @param string ruleName Nombre de la clase/regla a insertar (ej. '.una_clase')
	 * @return object
	 */
	addCSSRule: function(ruleName){
		if(document.styleSheets){
			if(!getCSSRule(ruleName)){
				if(document.styleSheets[0].addRule) document.styleSheets[0].addRule(ruleName, null,0);
				else document.styleSheets[0].insertRule(ruleName+' { }', 0);
			}
		}
		return getCSSRule(ruleName);
	},

	/**
	 * Devuelve un objeto que corresponde a los estilos CSS asociados a una determinada clase
	 *
	 * ej.
<code>
// devuelve el objeto para la clase ".una_clase"
una_clase = getCSSRule('.una_clase');
// aplica la propiedad underline a la decoración del texto del objeto anterior
una_clase.style.textDecoration = 'underline';
</code>
	 *
	 * @since 2011-06-12
	 * @param string ruleName Nombre de la clase a buscar (ej. '.una_clase')
	 * @param string deleteFlag Si contiene 'delete' borrara la clase y sus propiedades
	 * @return object
	 */
	getCSSRule: function(ruleName, deleteFlag){
		if(document.styleSheets){
			for(var i=0; i<document.styleSheets.length; i++){
				var styleSheet = document.styleSheets[i];
				var ii = 0;
				var cssRule = false;
				do{
					if(styleSheet.cssRules) cssRule = styleSheet.cssRules[ii];
					else cssRule = styleSheet.rules[ii];

					if(cssRule){
						if(cssRule.selectorText==ruleName){
							if(deleteFlag=='delete'){
								if(styleSheet.cssRules) styleSheet.deleteRule(ii);
								else styleSheet.removeRule(ii);

								return true;
							}
							else return cssRule;
						}
					}
					ii++;
				} while(cssRule);
			}
		}
		return false;
	},

	/* recupera una regla css de document o del elemento pasado
	*/
	getStyle: function(elem, cssRule){
		/*var doc = (!elem)?document.defaultView:elem; 
		if(this.nodeType == 1)
		return (doc && doc.getComputedStyle) ? doc.getComputedStyle(this, null).getPropertyValue(cssRule) : this.currentStyle[this.camelize(cssRule)];*/

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
	 * Elimina una clase CSS
	 *
	 * @since 2011-09-07
	 * @param string cName Nombre de la clase
	 * @return object
	 */
	removeClass: function(cName){
		if(typeof cName === "string"){
			this.each(
				function (){
					if(this.className.indexOf(cName) > -1) this.className = this.className.substr(0, this.className.indexOf(cName) - 1) + this.className.substr(this.className.indexOf(cName) + cName.length);
				}
			);
		}

		return this;
	},

	/* pone una regla css de document o del elemento pasado al valor pasado
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
	 * Toggle an element's display
	 */
	toggle: function() {
		this.each(
			function(){
				//TODO deberia aceptar otros tipos de nodo?
				if(this.nodeType != 1) return; //solo nodos tipo ELEMENT_NODE

				//_JaSper(this).setStyle(this, 'display', 'inline');
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

				//this.style.display = sActDisplay;
				_JaSper(this).setStyle(this, 'display', sActDisplay);
			}
		);

		return this;
	}

});

window.eventName = ''; //guarda el nombre del ultimo evento disparado mediante gestion de eventos (a continuacion)

/**
 * Esta funcion es llamada en cada evento; independiente de objetos JaSper.
 * Tiene una gemela JaSper.eventTrigger() (deshabilitada)
 * 'this' es el objeto que lo haya llamado
 * 
 * @param ev Nombre del evento
 * @return void
 */
if(typeof window.eventTrigger != 'function'){
	window.eventTrigger = function (ev){
		//return(true);
	};
}

//emulacion de eventos mouseenter y mouseleave en los navegadores que no lo soportan (todos menos ie)
//mousewheel para navegadores gecko
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
		//var key = xb.Helper.getObjectGUID(func);
		//var f = xb.Helper.retrieveHandler(key);
		if(typeof f === 'undefined'){
			f = function(e){
				e.wheelDelta = -(e.detail);
				func.call(this, e);
				e.wheelDelta = null;
			};
			//xb.Helper.storeHandler(key, f);
		}
		return f;
	},

	/**
	 * Correccion de codigo de tecla pulsada.
	 * Para keypress corresponde con codigos ascii,
	 * para keyup o keydown no necesariamente (ej: "." devuelve 190 y no 46 -ascii-); este metodo corrige la correspondencia devolviendo el ascii correcto
	 * Devuelve -1 si se llama con un evento que no sea keyXXX
	 *
	 * @todo completar mapa de correspondencia de teclas
	 * @since 2011-09-08
	 * @access public
	 * @return integer
	 */
	key_code: function (e){
		e = e || window.event;
		var code = e.keyCode || e.which, etype = e.type.toLowerCase().replace('on', ''); //, char = String.fromCharCode(code);

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
			if(navigator.appName=="Netscape" && parseInt(navigator.appVersion)==4){ //netscape 4
				var mString =(e.modifiers+32).toString(2).substring(3,6);
				shiftControlAlt += (mString.charAt(0)=="1")?1:0;
				shiftControlAlt += (mString.charAt(1)=="1")?1:0;
				shiftControlAlt += (mString.charAt(2)=="1")?1:0;
			}
			else{ //resto
				shiftControlAlt += e.shiftKey?1:0;
				shiftControlAlt += e.altKey?1:0;
				shiftControlAlt += e.ctrlKey?1:0;
			}

			if(typeof keycodes[code] != 'undefined'){
				if(typeof keycodes[code][shiftControlAlt] != 'undefined') return(keycodes[code][shiftControlAlt]); //devuelve exacto
				else if(typeof keycodes[code][0] != 'undefined') return(keycodes[code][0]); //devuelve correspondencia sin modificadores
			}
			return(code); //no hay correspondencia, devuelve keycode
		}

		return(-1); //evento incoherente
	}

});

/**
 * Gestion de eventos
 */
JaSper.funcs.extend(JaSper.prototype, {
	/**
	 * guarda el ultimo evento que se ha disparado, sirve como controlador para que otros eventos puedan lanzarse (o no) en funcion del previo
	asignar en cada funcion afectada (las que se lancen en los eventos), donde interese
	 * 
	 * @param e Evento
	 * @return string
	 */
	eventName: function (e){
		/*this.eventName = window.eventName = evento.toLowerCase(); //se guarda el nombre del ultimo evento disparado para cada objeto JaSper; y el ultimo de todos en window.eventName
		evento = this.eventName;*/

		var e = e || window.event;
		return(e);
	},

	/**
	 * Esta función es llamada en cada evento; una vez por evento para este objeto.
	 * Tiene una gemela window.eventTrigger()
	 * 
	 * @param e Evento
	 * @return boolean
	 */
	/*eventTrigger: (function (e){
		return(true);
	}),*/

	/**
	 * Devuelve el objeto que ha disparado un evento.
	 * 
	 * @param e Evento
	 * @return object
	 */
	eventOrigin: function (e){
		var e = e || window.event, targ = false;

		if(e.type == 'mouseover') targ = e.relatedTarget || e.fromElement; //origen para mouseover
		else targ = e.target || e.srcElement; //w3c o ie

		if(targ.nodeType == 3 || targ.nodeType == 4) targ = targ.parentNode; // defeat Safari bug

		return(targ);
	},

	/**
	* Devuelve el objeto destino de un evento (como a donde va el raton en mouseout).
	* 
	* @param e Evento
	* @return object
	*/
	eventDestination: function (e){
		var e = e || window.event, dest = false;
		if(e.type == 'mouseover') dest = e.relatedTarget || e.toElement; //destino en mouseout
		else dest = e.target || e.srcElement; //w3c o ie

		return(dest);
	},

	/**
	 * Evita la propagacion de eventos.
	 * Recordar llamar desde cada funcion que lo necesite.
	 * 
	 * @access public
	 * @param e Objeto evento
	 * @return boolean
	 */
	eventStopPropagation: function (e){
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
		//alert(e);
		return this;
	},

	/**
	 * Detiene un evento en cualquier momento
	 * 
	 * @access public
	 * @param e Objeto evento
	 * @return boolean
	 */
	eventStop: function (e){
		var e = e || window.event;

		if(e.stopPropagation) e.stopPropagation(); //modelo DOM
		else e.cancelBubble = true; //modelo MSIE
	},

	/**
	 * Manejador de eventos.
	 * 
	 * this.each elementos (DOM)
onAbort (NS3, NS4, IE4, IE5) se genera cuando el visitante detiene el navegador antes de que se cargue completamente una imagen (por ejemplo, cuando el usuario hace clic en el botón Detener del navegador mientras se está cargando una imagen).
onAfterUpdate (IE4, IE5) se genera cuando un elemento de datos vinculados de la página termina de actualizar el origen de los datos.
onBeforeUpdate (IE4, IE5) se genera cuando un elemento de datos vinculados de la página ha cambiado y va a perder foco (y, por consiguiente, va a actualizar el origen de los datos).
onBlur (NS3, NS4, IE3, IE4, IE5) es lo contrario a onFocus. El evento onBlur se genera cuando el elemento especificado deja de ser el foco de interacción del visitante. Por ejemplo, cuando un visitante hace clic fuera de un campo de texto después de haber hecho clic en él, el navegador genera un evento onBlur para el campo de texto.
onBounce (IE4, IE5) se genera cuando el contenido de un elemento de marquesina ha alcanzado el límite de la marquesina.
onChange (NS3, NS4, IE3, IE4, IE5) se genera cuando el visitante cambia un valor de la página, como, por ejemplo, cuando el visitante elige un elemento de un menú o cambia el valor de un campo de texto y, seguidamente, hace clic en algún otro lugar de la página.
onClick (NS3, NS4, IE3, IE4, IE5) se genera cuando el visitante hace clic en el elemento especificado, como, por ejemplo, un vínculo, un botón o un mapa de imagen. (El clic no termina hasta que el visitante suelta el botón del ratón; puede usar onMouseDown para que se produzca una acción en el momento en que se presiona el botón.)
onDblClick (NS4, IE4, IE5) se genera cuando el visitante hace doble clic en el elemento especificado. (Hacer doble clic consiste en presionar y soltar rápidamente el botón del ratón mientras se señala al elemento.)
onError (NS3, NS4, IE4, IE5) se genera cuando se produce un error en el navegador al cargar una página o una imagen.
onFinish (IE4, IE5) se genera cuando el contenido de un elemento de marquesina completa un bucle.
onFocus (NS3, NS4, IE3, IE4, IE5) se genera cuando el elemento especificado se convierte en el foco de interacción del visitante. Por ejemplo, al hacer clic en un campo de texto de un formulario, se genera un evento onFocus.
onHelp (IE4, IE5) se genera cuando el visitante hace clic en el botón de Ayuda o elige Ayuda del menú de un navegador.
onKeyDown (NS4, IE4, IE5) se genera en el momento en que el visitante presiona cualquier tecla. No es preciso que el visitante suelte la tecla para que se genere este evento.) Los codigos de teclas recuperados no corresponden necesariamente a codigos ascii.
onKeyPress (NS4, IE4, IE5) se genera cuando el visitante presiona y suelta cualquier tecla; este evento es una combinación de los eventos onKeyDown y onKeyUp.
onKeyUp (NS4, IE4, IE5) se genera cuando el visitante suelta una tecla después de presionarla. Los codigos de teclas recuperados no corresponden necesariamente a codigos ascii.
onLoad (NS3, NS4, IE3, IE4, IE5) se genera cuando termina de cargarse una imagen o una página.
onMouseDown (NS4, IE4, IE5) se genera cuando el visitante presiona el botón del ratón. No es necesario que el usuario suelte el botón del ratón para que se genere este evento.
onMouseMove (IE3, IE4, IE5) se genera cuando el visitante mueve el ratón mientras señala al elemento especificado. (Es decir, el puntero permanece dentro de los límites del elemento.)
onMouseOut (NS3, NS4, IE4, IE5) se genera cuando el puntero abandona el elemento especificado. Normalmente, el elemento especificado es una imagen, o un vínculo adjuntado a una imagen. Este evento se usa a menudo junto con el comportamiento Restaurar imagen intercambiada para devolver una imagen a su estado original cuando el visitante deja de señalarla con el puntero del ratón.
onMouseOver (NS3, NS4, IE3, IE4, IE5) se genera cuando el ratón se mueve por primera vez para señalar el elemento epecificado (es decir, cuando el puntero pasa de no estar señalando a estar señalando el elemento). El elemento especificado para este evento es generalmente un vínculo.
onMouseUp (NS4, IE4, IE5) se genera cuando se suelta un botón del ratón que se encuentra presionado.
onMove (NS4) se genera cuando se mueve una ventana o un marco.
onReadyStateChange (IE4, IE5) se genera cuando cambia el estado del elemento especificado. Entre los estados posibles del elemento figuran: uninitialized (sin inicializar), loading (cargando) y complete (terminado).
onReset (NS3, NS4, IE3, IE4, IE5) se genera cuando se restauran los valores predeterminados de un formulario.
onResize (NS4, IE4, IE5) se genera cuando el visitante cambia el tamaño de la ventana del navegador o de un marco.
onRowEnter (IE4, IE5) se genera cuando ha cambiado el puntero de registro actual del origen de datos vinculados.
onRowExit (IE4, IE5) se genera cuando va a cambiar el puntero de registro actual del origen de datos vinculados.
onScroll (IE4, IE5) se genera cuando el visitante desplaza la página hacia arriba o hacia abajo.
onSelect (NS3, NS4, IE3, IE4, IE5) se genera cuando el usuario selecciona texto en un campo de texto.
onStart (IE4, IE5) se genera cuando el contenido de un elemento de marquesina inicia un bucle.
onSubmit (NS3, NS4, IE3, IE4, IE5) se genera cuando el visitante envía un formulario.
onUnload (NS3, NS4, IE3, IE4, IE5) se genera cuando el visitante abandona la página

## DOM Level 0 ##
* DOMElement.onclick = EventListener; -> Add an event handler
* DOMElement.onclick = null; -> Remove the event handler
The default action can be cancelled by returning false in the event handler:
<a href="http://www.example.com" onclick="helloWorld(); return false;">here</a>
In the example above, the browser will not go to "example.com" when the hyperlink is clicked.

## DOM Level 2 ##
* DOMElement.addEventListener(DOMString type, EventListener listener, boolean useCapture) -> Allows the registration of event listeners on the event target.
* DOMElement.removeEventListener(DOMString type, EventListener listener, boolean useCapture) -> Allows the removal of event listeners from the event target.
* dispatchEvent(Event evt) -> Allows to send the event to the subscribed event listeners.
To prevent an event from bubbling, developers must call the "stopPropagation()" method of the event object.
To prevent the default action of the event to be called, developers must call the "preventDefault" method of the event object.
The main difference from the traditional model is that multiple event handlers can be registered for the same event. The useCapture option can also be used to specify that the handler should be called in the capture phase instead of the bubbling phase. This model is supported by Mozilla, Opera, Safari, Chrome and Konqueror.

	 * 
	 * @param string evento Nombre del evento, ej: "click" (como "onclick" sin "on")
	 * @param function funcion Funcion que se lanzara con el evento; cadena de nombre de funcion o nombre de la funcion sin mas, tambien se permiten funciones anonimas: "function(){ alert('hello!'); }"
	 * @param boolean capt Captura el evento cuando entra (fase de captura, true) o cuando sale (burbujeo, false, por defecto)
	 * @return boolean
	 * @access public
	 */
	addEvent: function (evento, funcion, capt){
		//TODO concatena a la definicion de la funcion la asignacion de "eventName" para controlar que evento ha sido disparado
		/*funcion = eval(funcion.toString() + " window.eventName='" + evento + "';");
		alert(funcion.toString());*/

		if(typeof funcion == 'string') funcion = window[funcion];
		//if(typeof funcion=="string") funcion = eval('function(e){ ' + funcion + ' }');
		//if(typeof argumentos == 'undefined') argumentos = '';
		if(!capt) var capt = false;

		//TODO comprobar aqui si se han pasado elementos?
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
							//if we're dealing with a Gecko browser, the event name and handler need some adjustment
							var ua = navigator.userAgent.toLowerCase(); //TODO identificar con el propio JaSper
							if(ua.indexOf('khtml') === -1 && ua.indexOf('gecko') !== -1){
								evt = 'DOMMouseScroll';
								func = mouseWheel(func);
							}
						default: //resto de eventos
							this.addEventListener(evt, func, ct);
					}
				}, [evento, funcion, capt]);
			if(window.eventTrigger) this.each(
				function (evt, ct){
					if(!this || this.nodeType == 3 || this.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios
					this.addEventListener(evt, function (){window.eventTrigger.call(this, evt);}, ct);
				}, [evento, capt]);
			//elemento.addEventListener(evento, eval('function(){ ' + funcion + ' }'), false);
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

					//eval('this.on' + evt + ' = func;');
				}, [evento, funcion]);
			if(window.eventTrigger) this.each(
				function (evt){
					if(!this || this.nodeType == 3 || this.nodeType == 8) return undefined; //sin eventos en nodos texto y comentarios
					this['on' + evt] = function (){window.eventTrigger.call(this, evt);};
				}, [evento]);
		}

		return this;
	},

	removeEvent: function (evento, funcion, capt){
		//TODO eliminar todos los eventos del elemento si no se pasan parametros
		if(typeof funcion == 'string') funcion = window[funcion]; //TODO try para distinguir nombre_de_funcion de nombre_de_funcion(params) (evaluar esta ultima)
		//if(typeof funcion=="string") funcion = eval('function(e){ ' + funcion + ' }');
		//if(typeof argumentos == 'undefined') argumentos = '';
		if(!capt) var capt = false;

		if(document.addEventListener){
			this.each(
				function (evt, func, ct){
					//TODO problemas para quitar eventos con funciones anonimas (como el retorno de mouseEnter); asignarlo previamente a una variable cuando se pone el evento?
					//eventos mouseenter, mouseleave y mousewheel sobre una idea original encontrada en http://blog.stchur.com
					switch(evt){
						case 'mouseenter':
							this.removeEventListener('mouseover', mouseEnter(func), ct);
							break;
						case 'mouseleave':
							this.removeEventListener('mouseout', mouseEnter(func), ct);
							break;
						case 'mousewheel':
							//if we're dealing with a Gecko browser, the event name and handler need some adjustment
							var ua = navigator.userAgent.toLowerCase(); //TODO identificar con el propio JaSper
							if(ua.indexOf('khtml') === -1 && ua.indexOf('gecko') !== -1){
								evt = 'DOMMouseScroll';
								func = mouseWheel(func);
							}
						default: //resto de eventos
							this.removeEventListener(evt, func, ct);
					}
				}, [evento, funcion, capt]);
		}
		else if(document.attachEvent){
			//this.each(function (evento, funcion){this.detachEvent('on' + evento, this[evento+funcion]);}, new Array(evento, funcion)), //correcto con coma?
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
	}

/*
//It is possible to list all event listeners in javascript: Is not that hard; you just have to hack the prototype method of the HTML elements (before adding the listeners)
function reportIn(e){
	var a = this.lastListenerInfo[this.lastListenerInfo.length-1];
	console.log(a)
}
HTMLAnchorElement.prototype.realAddEventListener = HTMLAnchorElement.prototype.addEventListener;
HTMLAnchorElement.prototype.addEventListener = function(a,b,c){
	this.realAddEventListener(a,reportIn,c); 
	this.realAddEventListener(a,b,c); 
	if(!this.lastListenerInfo){  this.lastListenerInfo = new Array()};
	this.lastListenerInfo.push({a : a, b : b , c : c});
};
//Now every anchor element ( < a > ) will have a 'lastListenerInfo' propierty wich contains all of its listeneres. And it even works for removing listeners with anonymous functions.
*/

/*
//boton derecho del raton
function doSomething(e) {
	var rightclick;
	if (!e) var e = window.event;
	if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);
	alert('Rightclick: ' + rightclick); // true or false
}
*/
/*
//posicion del raton
function doSomething(e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY){
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY){
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
}
*/
});

/**
 * Gestion de nodos
 * 
 */
JaSper.funcs.extend(JaSper.prototype, {

	/*domManip: function( args, table, callback ) {
		if ( this[0] ) {
			var fragment = (this[0].ownerDocument || this[0]).createDocumentFragment(),
				scripts = jQuery.clean( args, (this[0].ownerDocument || this[0]), fragment ),
				first = fragment.firstChild;
	
			if ( first )
				for ( var i = 0, l = this.length; i < l; i++ )
					callback.call( root(this[i], first), this.length > 1 || i > 0 ?
							fragment.cloneNode(true) : fragment );
		
			if ( scripts )
				jQuery.each( scripts, evalScript );
		}
	
		return this;
		
		function root( elem, cur ) {
			return table && jQuery.nodeName(elem, "table") && jQuery.nodeName(cur, "tr") ?
				(elem.getElementsByTagName("tbody")[0] ||
				elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
				elem;
		}
	},*/

	/**
	 * Clona un objeto (DOM o cualquier otro).
	 * Tener en cuenta que un clon tendra las mismas id's que el original, etc.
	 * Para encadenados: devuelve el resultado de la clonacion, no el original
	 * 
	 * @since 2011-09-08
	 * @param object obj Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return object
	 */
	clone: function (obj){
		var obj = obj || this; //se usa el objeto JaSper actual si no se pasa ninguno

		var cln = function (obj){
			for(var prop in obj){
				//if(obj.hasOwnProperty(prop)){} //esto evita tomar propiedades heredadas, fuerza a coger solo las propias del objeto
				this[prop] = obj[prop];
			}
		};
		return new cln(obj);
	},

	/**
	 * 
	 * 
	 * @since 2010-12-09
	 * @param nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return object
	 */
	/*add: function(el, dest) {
		var el = this.get(el);
		var dest = this.get(dest);
		dest.appendChild(el);
	},*/

	remove: function(elem) {
		//var el = this.get(el);
		this.each(function (el){
			el.parentNode.removeChild(el);
		}, [elem]);

		return(this);
	},

	/**
	 * Inserta un elemento antes del nodo seleccionado
	 * 
	 * @since 2010-12-09
	 * @param nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return object
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

		return(this);
	},

	/**
	 * Inserta un elemento despues del nodo seleccionado
	 * 
	 * @since 2010-12-09
	 * @param nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @return object
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

		return(this);
	},

	/**
	 * Añade un nodo hijo al seleccionado, despues de los existentes
	 * 
	 * @since 2010-12-14
	 * @param nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @param ancla Elemento al que se añadira nodo; si va vacio se usa this (los nodos de JaSper)
	 * @return object
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

		return(this);
	},

	/**
	 * Añade un nodo hijo al seleccionado, antes de los existentes
	 * 
	 * @since 2010-12-16
	 * @param nodo Elemento a insertar o matriz con sus caracteristicas (en este orden: tag (sin llaves angulares), [texto|NULL], [clase css|NULL], [id|NULL])
	 * @param ancla Elemento al que se añadira nodo; si va vacio se usa this (los nodos de JaSper)
	 * @return object
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

		return(this);
	}/*,

	end: function(){
		return this.prevObject || JaSper( [] );
	}*/

});

/**
 * Metodos para ejecucion periodica de funciones
 * 
 */
JaSper.funcs.extend(JaSper.prototype, {

	/**
	 * Ejecuta la funcion pasada de forma periodica, indefinidamente o no
	 *
	 * @since 2010-12-16
	 * @param func Funcion a ejecutar; nombre de la funcion (string), referencia o anonima
	 * @param intervalo Cada cuanto se ejecuta la funcion
	 * @param lapso Tiempo tras el cual deja de ejecutarse (ambos en milisegundos, 1000ms = 1s)
	 * @return object
	 */
	//TODO devolver los id para controlarlos fuera; this en la funcion pasada deben ser los nodos JaSper?
	callPeriodic: function(func, intervalo, lapso){
		this.each(function (fn, it, lp){
			if(!it){ //ejecucion pasado un periodo
				if(lp) idt = setTimeout(fn, lp);
			}
			else{ //ejecucion por intervalos
				var idi = setInterval(fn, it);
				if(lp) idt = setTimeout('clearInterval(' + idi + ')', lp); //final de ejecucion
			}
		}, [func, intervalo, lapso]);

		return(this);
	}

});

/* get, set, and delete cookies */
/*function getCookie( name ) {
	var start = document.cookie.indexOf( name + "=" );
	var len = start + name.length + 1;
	if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
		return null;
	}
	if ( start == -1 ) return null;
	var end = document.cookie.indexOf( ";", len );
	if ( end == -1 ) end = document.cookie.length;
	return unescape( document.cookie.substring( len, end ) );
}
	
function setCookie( name, value, expires, path, domain, secure ) {
	var today = new Date();
	today.setTime( today.getTime() );
	if ( expires ) {
		expires = expires * 1000 * 60 * 60 * 24;
	}
	var expires_date = new Date( today.getTime() + (expires) );
	document.cookie = name+"="+escape( value ) +
		( ( expires ) ? ";expires="+expires_date.toGMTString() : "" ) + //expires.toGMTString()
		( ( path ) ? ";path=" + path : "" ) +
		( ( domain ) ? ";domain=" + domain : "" ) +
		( ( secure ) ? ";secure" : "" );
}
	
function deleteCookie( name, path, domain ) {
	if ( getCookie( name ) ) document.cookie = name + "=" +
			( ( path ) ? ";path=" + path : "") +
			( ( domain ) ? ";domain=" + domain : "" ) +
			";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}*/

/**
 * Navegacion y carga de contenidos por hash bang (#!)
 * 
 */
JaSper.funcs.extend(JaSper.funcs, {

	/**
	 * Sustituye todos los enlaces por su version hash bang
	 *
	 * @since 2011-10-05
	 * @return object
	 */
	//TODO devolver los id para controlarlos fuera; this en la funcion pasada deben ser los nodos JaSper?
	hrefHashBang: function(){
		//_JaSper().ready(function (){
			_JaSper('<a>').addEvent('click', function(e){
				//alert(this.href);
				if(this.href[0] == "/"){
					JaSper(this).eventStopPropagation(e);
					window.location.hash = "#!" + this.href;
				}
			});
		//});
		return(this);
	}/*,

Path.default(function(){
	$.get(window.location.hash.replace("#!", ""), function(data){
		$("#contents").html(data);
	});
});

Path.listen();*/
});

/**
 * Carga dinamica de metodos. Se cargan bajo demanda si estan aqui incluidos.
 * todos los .js deben estar en el mismo directorio que este o subdirectorios de este
 */
JaSper.funcs.extend(JaSper.prototype, {

	/*
	 * Llama al metodo de carga de metodos en librerias no cargadas
	 *
	 * @since 2011-05-16
	 * @todo funcionan cadenas?
	 * @param string method Nombre del metodo
	 * @param array args Argumentos del metodo
	 * @param string library JS a cargar
	 */
	loadMethod: function(method, args, library){
		if(!library){
			switch(method){
				case 'ajax':
					library = 'JaSper_ajax.js';
					break;
				case 'formulario':
					library = 'JaSper_formazo.js';
					break;
				case 'move':
					library = 'JaSper_move.js';
					break;
				case 'ratingStars':
					library = 'JaSper_rating.js';
					break;
				case 'rtb':
					library = 'JaSper_rtb.js';
					break;
				default:
					library = false;
					JaSper.funcs.debugShow('-JaSper::loadMethod- Intenta cargar dinamicamente una librería desconocida para el metodo: ' + method);
			}
		}

		var tempCall = (function (obj, as){
			return(function (){eval('obj.' + method + '.apply(obj, as);');});
		})(this, args);
		tempId = method + args.toString() + library;

		if(library){
			JaSper.funcs.loadScriptQueue.push({'fn':tempCall,'ctx':this});
			JaSper.funcs.loadScript('packer.php?scriptJs=' + library); //version con empaquetador/minificador "class.JavaScriptPacker.php"
			//if(library) JaSper.funcs.loadScript(library, tempCall, this); //version sin empaquetador
		}
	},

	/*
	 * AJAX *
	 */
	/*ajax: function(){
		var ret = false; //retorno del metodo

		/*var tempCall = 'function (){this.ajax(';
		for(var i = 0;i < arguments.length; i++){
			if(typeof arguments[i] == 'string') tempCall += ("'" + arguments[i] + "'");
			else tempCall += ("eval(" + arguments[i] + ")");
		}
		tempCall += ');}';
		var tempCall = (function (obj, args){
			return(function (){obj.ajax.apply(obj, args);});
		})(this, arguments);

		ret = JaSper.funcs.loadScript('JaSper_ajax.js', tempCall, this);

		//TODO funcionan cadenas?
		//return(ret);
	},*/
	ajax: function(){return(this.loadMethod('ajax', arguments));},

	/*
	 * Rating bar *
	 */
	ratingStars: function(){return(this.loadMethod('ratingStars', arguments));},

	/*
	 * Rich Text Box *
	 */
	rtb: function(){return(this.loadMethod('rtb', arguments));},

	/*
	 * Formazo *
	 */
	llena_select: function(){return(this.loadMethod('formulario', arguments));},
	limpiaForm: function(){return(this.loadMethod('formulario', arguments));},
	valClave: function(){return(this.loadMethod('formulario', arguments));},
	valEmail: function(){return(this.loadMethod('formulario', arguments));},
	valFechas: function(){return(this.loadMethod('formulario', arguments));},
	valFichero: function(){return(this.loadMethod('formulario', arguments));},
	valNif: function(){return(this.loadMethod('formulario', arguments));},
	valNumeros: function(){return(this.loadMethod('formulario', arguments));},
	valObligatorio: function(){return(this.loadMethod('formulario', arguments));},
	valObligatorioRadio: function(){return(this.loadMethod('formulario', arguments));},
	valTeclasFechas: function(){return(this.loadMethod('formulario', arguments));},
	valTeclasNumeros: function(){return(this.loadMethod('formulario', arguments));},
	valUrl: function(){return(this.loadMethod('formulario', arguments));},

	/*
	 * Movimiento de elementos *
	 */
	move: function(){return(this.loadMethod('move', arguments));}

});

/*function isset(variable_name) {
try {
	if(typeof(eval(variable_name)) != 'undefined')
		if(eval(variable_name) != null)
			return true;
}catch(e){}
return false;
}*/

//sin categorizar (aun)
/*JaSper.funcs.extend(JaSper.prototype, {


	/ **
	 * Detect if the view port is located to the corner of page.
	 * /
	detectPagePosition: function() {
		/ **
		 * Determine if the page scrolled to bottom or right.
		 * /
		var isScrollToPageEnd = function(coordinate) {
			var docElement = document.documentElement;
			if (coordinate == 'x') return docElement.clientWidth + document.body.scrollLeft == document.body.scrollWidth;
			else if (coordinate == 'y') return docElement.clientHeight + document.body.scrollTop == document.body.scrollHeight;
		};

		if (document.body.scrollTop == 0 && document.body.scrollLeft == 0) {
			return 'top_left';
		} else if (document.body.scrollTop == 0 && isScrollToPageEnd('x')) {
			return 'top_right';
		} else if (isScrollToPageEnd('y') && document.body.scrollLeft == 0) {
			return 'bottom_left';
		} else if (isScrollToPageEnd('y') && isScrollToPageEnd('x')) {
			return 'bottom_right';
		}
		return null;
	},

	hasScrollBar: function(axis) {
		var body = document.body;
		var docElement = document.documentElement;
		if (axis == 'x') {
			if (window.getComputedStyle(body).overflowX == 'scroll')
				return true;
			return Math.abs(body.scrollWidth - docElement.clientWidth) >= page.defaultScrollBarWidth;
		} else if (axis == 'y') {
			if (window.getComputedStyle(body).overflowY == 'scroll')
				return true;
			return Math.abs(body.scrollHeight - docElement.clientHeight) >= page.defaultScrollBarWidth;
		}
	},

	calculateSizeAfterZooming: function(originalSize) {
		var originalViewPortWidth = page.originalViewPortWidth;
		var currentViewPortWidth = document.documentElement.clientWidth;
		if (originalViewPortWidth == currentViewPortWidth)
			return originalSize;
		return Math.round(originalViewPortWidth * originalSize / currentViewPortWidth);
	},

	getZoomLevel: function() {
		return page.originalViewPortWidth / document.documentElement.clientWidth;
	},

	/ **
	 * Check if the page is only made of invisible embed elements.
	 * /
	checkPageIsOnlyEmbedElement: function() {
		var bodyNode = document.body.children;
		var isOnlyEmbed = false;
		for (var i = 0; i < bodyNode.length; i++) {
			var tagName = bodyNode[i].tagName;
			if (tagName == 'OBJECT' || tagName == 'EMBED' || tagName == 'VIDEO' || tagName == 'SCRIPT' || tagName == 'LINK') {
				isOnlyEmbed = true;
			} else if (bodyNode[i].style.display != 'none'){
				isOnlyEmbed = false;
				break;
			}
		}
		return isOnlyEmbed;
	},

	injectCssResource: function(cssResource) {
		var css = document.createElement('LINK');
		css.type = 'text/css';
		css.rel = 'stylesheet';
		css.href = chrome.extension.getURL(cssResource);
		(document.head || document.body || document.documentElement).appendChild(css);
	},

	injectJavaScriptResource: function(scriptResource) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.charset = "utf-8";
		script.src = chrome.extension.getURL(scriptResource);
		(document.head || document.body || document.documentElement).appendChild(script);
	}

//create the nodeType constants if the Node object is not defined
if(!window.Node){
	var Node = {
		ELEMENT_NODE                : 1,
		ATTRIBUTE_NODE              : 2,
		TEXT_NODE                   : 3,
		CDATA_SECTION_NODE          : 4,
		ENTITY_REFERENCE_NODE       : 5,
		ENTITY_NODE                 : 6,
		PROCESSING_INSTRUCTION_NODE : 7,
		COMMENT_NODE                : 8,
		DOCUMENT_NODE               : 9,
		DOCUMENT_TYPE_NODE          : 10,
		DOCUMENT_FRAGMENT_NODE      : 11,
		NOTATION_NODE               : 12
	};}

});*/

//extiende con los metodos encontrados en JaSper.funcs, permite llamadas mas directas: JaSper.metodo();
JaSper.funcs.extend(JaSper, JaSper.funcs);
