# Ocultar Elementos

Extensión de Chrome (Manifest V3) para inspeccionar un elemento de la página, copiarlo, ocultarlo y editar su estilo con botones.

## Instalación

1. Abre `chrome://extensions/`.
2. Activa el modo de desarrollador.
3. Pulsa "Cargar sin empaquetar" y elige esta carpeta.

## Uso

1. Pulsa el icono de la extensión. El cursor pasa a `not-allowed` y el icono cambia.
2. Al pasar el ratón, el elemento se pinta de rojo.
3. Al hacer clic, queda seleccionado en naranja y se abre el panel flotante.
4. La X cierra el panel y quita el naranja. El modo sigue activo hasta que vuelves a pulsar el icono.

### Panel

- Arriba: sube al padre.
- Abajo: baja al primer hijo.
- Izquierda y derecha: recorren los hermanos.
- **C**: copia el elemento, sin sus hijos, al portapapeles y al texto de abajo del panel.
- **B**: borra el elemento. Si no puede quitarlo del DOM, lo oculta con `display: none`.
- **E**: abre o cierra el editor.
- Imprimir: escribe el DOM de la página en la consola y lo copia al portapapeles. El panel no entra en esa copia.

El panel se arrastra desde la cabecera.

### Editor

Pestañas de botones, sin campos de texto: Estilos, Caja, Posición, Espacio, Display y Color.

Estilos muestra el estilo calculado del elemento, venga de una clase o de un estilo en línea, y debajo el árbol de su DOM. En Posición, `absolute`, `fixed` y `sticky` usan deslizadores para top, right, bottom y left. Espacio reúne los de margen y relleno: cerca de cero el recorrido es más fino. En Display, la opción activa sale en naranja: si el elemento es `flex` o `inline-flex`, esa pestaña se abre sola con dirección, wrap, justify, align y gap ya marcados. En Color hay selector y cuentagotas.

Los cambios se escriben como estilo en línea del elemento.

## Volcado

Pega el texto del botón imprimir en un archivo dentro de `dumps/`. Esos HTML no se versionan.

## Vista local

Abre `dev/preview.html` en el navegador para probar el panel sin cargar la extensión. El icono de la extensión y el cuentagotas hay que probarlos en Chrome.

## Licencia

MIT. Copyright (c) 2024-2026 Diego Santiago. Ver [LICENSE](LICENSE).
