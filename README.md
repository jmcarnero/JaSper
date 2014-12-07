# JaSper v3.0b [José M. Carnero](http://sargazos.net)
===

## JavaScript framework.

- Selector XPath y CSS.
- Carga dinámica de componentes.
- Gestión de nodos y eventos.
- Traducción automática de textos.
- AJAX con callbacks para inicio, fin y fallo de peticion.
- Movimiento de objetos (en desarrollo).

*Ejemplo:*
```javascript
$(document).setDebug(true).ready(function(){
	$('<body>').evAdd('click', function(ev){
		$('//p').toggle();
	}).evAdd('mousewheel', function(ev){
		if(JaSper.funcs.windowPosition().indexOf('bottom') > -1 && ev.wheelDelta == -3) alert('fin de página');
	});
});
```
====
**In English:**

## JavaScript framework.

- XPath selector and CSS selector.
- Dynamic loading of components.
- Node and events management.
- Text translation automatic.
- AJAX with start callback, end callback and fail callback.
- Object movement (draft version).

*Example:*
```javascript
$(document).setDebug(true).ready(function(){
	$('<body>').evAdd('click', function(ev){
		$('//p').toggle();
	}).evAdd('mousewheel', function(ev){
		if(JaSper.funcs.windowPosition().indexOf('bottom') > -1 && ev.wheelDelta == -3) alert('end of page');
	});
});
```

