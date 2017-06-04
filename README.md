# JaSper v3.5 [José M. Carnero](https://sargazos.net)
===

## Librería multi propósito JavaScript.

- Selector DOM XPath y CSS.
- Extremadamente ligero.
- Fácil de extender y modularizar.
- Carga dinámica (en demanda) de componentes (normal y minificado).
- Gestión de nodos.
- Gestión de eventos. Permite añadir varios (separados por comas) al mismo elemento DOM y mismo callback. Permite eliminar todos los eventos de un elemento DOM (incluyendo aquellos con callback anónimo), sólo los asociados a un determinado evento, etc.
- Traducción automática de textos.
- 'use strict'
- Agregador de eventos (DOM y/o personalizados).

###Módulos incluidos:

- [AJAX](JaSper_ajax.js) con callbacks para inicio, fin y fallo de peticion.
- [Animaciones CSS](JaSper_anim.js).
- [Beautifier](JaSper_beautify.js) en un estado muy primitivo, aún.
- [Canvas](JaSper_canvas.js) (en desarrollo).
- [Carrusel de imágenes](JaSper_lightbox.js) con callbacks para pie de imagen, descripción y origen.
- [Editor de texto enriquecido](JaSper_rtb.js).
- [Fechas](JaSper_datetime.js) con cuenta atrás y selector de fechas.
- [Movimiento de objetos](JaSper_move.js) con callbacks de inicio, fin y durante el movimiento; información del objeto bajo el movimiento; dispositivos táctiles.
- [REST](JaSper_rest.js) cliente, de momento solo GET y POST.
- [Validación de formularios](JaSper_formazo.js) con previsualizacion de imágenes a subir y callbacks de inicio, fin y fallo de validación.
- [Valoración](JaSper_rating.js) con estrellas, en desarrollo con barras.

###*Ejemplo:*
```javascript
$(document).debug().ready(function(){
	$('<body>').eventAdd('click', function(ev){
		$('//p').toggle(500); //XPATH no funciona en IE
	}).eventAdd('mousewheel', function(ev){
		if(JaSper.funcs.windowPosition().indexOf('bottom') > -1 && ev.wheelDelta == -3) alert('fin de página');
	}).eventAdd('custom_event', function(ev){
		alert('evento personalizado');
	}).eventFire('custom_event');
});
```

_Testeo en Firefox_.

_También funciona en Chrome e IE_.

====
**In English:**

## JavaScript library.

- DOM XPath selector and CSS selector.
- Extremely lightweight.
- Easy to extend and modularize.
- Dynamic loading (on demand) of components (normal and minified).
- Node management.
- Event management. You can add multiple events (comma separated) to one DOM element and one unique callback. Can delete all events associated to a DOM element (included anonymous callbacks), or only those associated with a specific event, ...
- Text translation.
- 'use strict'
- Event aggregator (DOM and/or custom).

###Modules included:

- [AJAX](JaSper_ajax.js) with start callback, end callback and fail callback.
- [Beautifier](JaSper_beautify.js) in a very early stage yet.
- [Canvas](JaSper_canvas.js) (draft version).
- [CSS animations](JaSper_anim.js).
- [Dates](JaSper_datetime.js) with countdown and date picker.
- [Forms validation](JaSper_formazo.js) with upload image preview and callbacks for validation start (inicio), validation end (fin) and validation fail (fallo).
- [Image carousel](JaSper_lightbox.js) with callbacks for image foot, description and origin.
- [Object movement](JaSper_move.js) with movement start callback, end movement callback and in move callback; under mouse object information; touch devices.
- [Rating](JaSper_rating.js) with stars, bars in development.
- [REST](JaSper_rest.js) client, by now only GET and POST.
- [Rich text box](JaSper_rtb.js).

###*Example:*
```javascript
$(document).debug().ready(function(){
	$('<body>').eventAdd('click', function(ev){
		$('//p').toggle(500); //XPATH don't work in IE
	}).eventAdd('mousewheel', function(ev){
		if(JaSper.funcs.windowPosition().indexOf('bottom') > -1 && ev.wheelDelta == -3) alert('end of page');
	}).eventAdd('custom_event', function(ev){
		alert('custom event');
	}).eventFire('custom_event');
});
```

_Tested on Firefox_.

_Also works on Chrome and IE_.
