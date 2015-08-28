# JaSper v3.3 [José M. Carnero](http://sargazos.net)
===

## JavaScript framework.

- Selector XPath y CSS.
- Extremadamente ligero.
- Fácil de extender y modularizar.
- Carga dinámica (en demanda) de componentes (normal y minificado).
- Gestión de nodos.
- Gestión de eventos. Permite añadir varios (separados por comas) al mismo elemento DOM y mismo callback. Permite eliminar todos los eventos de un elemento DOM (incluyendo aquellos con callback anónimo), sólo los asociados a un determinado evento, etc.
- Traducción automática de textos.
- 'use strict'

Módulos incluidos:

- [AJAX](JaSper_ajax.js) con callbacks para inicio, fin y fallo de peticion.
- [Animaciones CSS](JaSper_anim.js).
- [Canvas](JaSper_canvas.js) (en desarrollo).
- [Carrusel de imágenes](JaSper_lightbox.js).
- [Fechas](JaSper_datetime.js) con cuenta atrás y selector de fechas.
- [Movimiento de objetos](JaSper_move.js) con callbacks de inicio, fin y durante el movimiento; información del objeto bajo el movimiento; dispositivos táctiles.
- [Validación de formularios](JaSper_formazo.js) con previsualizacion de imágenes a subir.
- [Valoración](JaSper_rating.js) con estrellas, en desarrollo con barras.
- [Editor de texto enriquecido](JaSper_rtb.js) (en desarrollo).

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

_Testeo en Firefox_.

_También funciona en Chrome e IE_.

====
**In English:**

## JavaScript framework.

- XPath selector and CSS selector.
- Extremely lightweight.
- Easy to extend and modularize.
- Dynamic loading (on demand) of components (normal and minified).
- Node management.
- Event management. You can add multiple events (comma separated) to one DOM element and one unique callback. Can delete all events associated to a DOM element (included anonymous callbacks), or only those associated with a specific event, ...
- Text translation.
- 'use strict'

Modules included:

- [AJAX](JaSper_ajax.js) with start callback, end callback and fail callback.
- [Canvas](JaSper_canvas.js) (draft version).
- [CSS animations](JaSper_anim.js).
- [Dates](JaSper_datetime.js) with countdown and date picker.
- [Forms validation](JaSper_formazo.js) with upload image preview.
- [Image carousel](JaSper_lightbox.js).
- [Object movement](JaSper_move.js) with movement start callback, end movement callback and in move callback; under mouse object information; touch devices.
- [Rating](JaSper_rating.js) with stars, bars in development.
- [Rich text box](JaSper_rtb.js) (draft version).

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

_Tested on Firefox_.

_Also works on Chrome and IE_.
