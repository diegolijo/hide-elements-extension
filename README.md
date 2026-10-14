# Clic DOM

Extensión de Chrome (Manifest V3) para inspeccionar un elemento de la página, copiarlo, ocultarlo y editar su estilo con botones.

## Instalación

1. Abre `chrome://extensions/`.
2. Activa el modo de desarrollador.
3. Pulsa "Cargar sin empaquetar" y elige esta carpeta.

## Uso

1. Pulsa el icono de la extensión. El cursor pasa a cruz de selección y el icono pasa al verde. Al volver a pulsarlo, vuelve el icono amarillo.
2. Al pasar el ratón, el elemento se pinta de naranja suave.
3. Al hacer clic, queda seleccionado en verde y se abre el panel flotante.
4. La X cierra el panel y quita el verde. El modo sigue activo hasta que vuelves a pulsar el icono o cambias de pestaña. Al cambiar de pestaña el panel se cierra y el icono vuelve al amarillo.

### Panel

- El puntero del encabezado activa el clic en la página: el cursor vuelve al normal y el ratón deja de pintar. Otro clic en ese botón recupera la cruz y el resalte.
- Arriba: sube al padre. Abajo vuelve por el mismo camino; si no hay camino, baja al primer hijo.
- El árbol muestra los padres y, en cada nivel, los hermanos en la misma línea. El seleccionado queda arriba del recuadro.
- Izquierda y derecha: recorren los hermanos.
- `«` y `»`: mueven el elemento entre sus hermanos.
- Copiar: el elemento, sin sus hijos, al portapapeles.
- Tijeras: copia el elemento completo, con sus hijos, y lo borra.
- Pegar: inserta el HTML del portapapeles justo después del elemento seleccionado.
- Imprimir: escribe el DOM de la página en la consola y lo copia al portapapeles. El panel no entra en esa copia.

El panel se arrastra desde la cabecera.

### Editor

El árbol del elemento queda siempre bajo las flechas. Las pestañas, en inglés y en azul, son Styles, Box, Position, Space, Display, Border y Color. La opción activa de cada pestaña sigue en naranja.

Styles muestra el estilo calculado y se puede tachar. Position, Space y Border usan deslizadores con el nombre CSS (`top`, `margin-top`, `border-radius`…). Si el elemento es `flex` o `inline-flex`, Display se abre sola. Color tiene selector y cuentagotas.

Los cambios se escriben como estilo en línea del elemento.

## Volcado

Pega el texto del botón imprimir en un archivo dentro de `dumps/`. Esos HTML no se versionan.

## Vista local

Abre `dev/preview.html` en el navegador para probar el panel sin cargar la extensión. El icono de la extensión y el cuentagotas hay que probarlos en Chrome.

## Licencia

MIT. Copyright (c) 2024-2026 Diego Santiago. Ver [LICENSE](LICENSE).
