# JaSper v3.0b [José M. Carnero](http://sargazos.net)
===

## JavaScript framework.

- Selector XPath y CSS.
- Carga dinámica de componentes.
- Gestión de nodos y eventos.
- Traducción automática de textos.
- [AJAX](JaSper_ajax.js) con callbacks para inicio, fin y fallo de peticion.
- [Canvas](JaSper_canvas.js)  (en desarrollo).
- [Movimiento de objetos](JaSper_move.js) (en desarrollo).
- [Valoración](JaSper_rating.js).

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

_Testeo en Firefox_

====
**In English:**

## JavaScript framework.

- XPath selector and CSS selector.
- Dynamic loading of components.
- Node and events management.
- Text translation.
- [AJAX](JaSper_ajax.js) with start callback, end callback and fail callback.
- [Canvas](JaSper_canvas.js)  (draft version).
- [Object movement](JaSper_move.js) (draft version).
- [Rating](JaSper_rating.js).

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

_Tested on Firefox_
