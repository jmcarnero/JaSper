# JaSper v3.1b [José M. Carnero](http://sargazos.net)
===

## JavaScript framework.

- Selector XPath y CSS.
- Carga dinámica de componentes (normal y minificado).
- Gestión de nodos y eventos.
- Traducción automática de textos.
- [AJAX](JaSper_ajax.js) con callbacks para inicio, fin y fallo de peticion.
- [Animaciones CSS](JaSper_anim.js).
- [Canvas](JaSper_canvas.js)  (en desarrollo).
- [Movimiento de objetos](JaSper_move.js) (en desarrollo).
- [Validación de formularios](JaSper_formazo.js).
- [Valoración](JaSper_rating.js).

*Ejemplo:*
```javascript
$(document).debug().ready(function(){
	$('<body>').eventAdd('click', function(ev){
		$('//p').toggle(500); //XPATH no funciona en IE
	}).eventAdd('mousewheel', function(ev){
		if(JaSper.funcs.windowPosition().indexOf('bottom') > -1 && ev.wheelDelta == -3) alert('fin de página');
	});
});
```

_Testeo en Firefox_

====
**In English:**

## JavaScript framework.

- XPath selector and CSS selector.
- Dynamic loading of components (normal and minified).
- Node and events management.
- Text translation.
- [AJAX](JaSper_ajax.js) with start callback, end callback and fail callback.
- [Canvas](JaSper_canvas.js)  (draft version).
- [CSS animations](JaSper_anim.js).
- [Forms validation](JaSper_formazo.js).
- [Object movement](JaSper_move.js) (draft version).
- [Rating](JaSper_rating.js).

*Example:*
```javascript
$(document).debug().ready(function(){
	$('<body>').eventAdd('click', function(ev){
		$('//p').toggle(500); //XPATH don't work in IE
	}).eventAdd('mousewheel', function(ev){
		if(JaSper.funcs.windowPosition().indexOf('bottom') > -1 && ev.wheelDelta == -3) alert('end of page');
	});
});
```

_Tested on Firefox_
