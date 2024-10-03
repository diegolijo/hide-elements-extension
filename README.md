# Ocultar Elementos - Extensión de Chrome

## Descripción

La extensión "Ocultar Elementos" permite a los usuarios ocultar elementos en una página web al hacer clic sobre ellos. Este modo de ocultar se habilita a través de un botón en el popup de la extensión y es funcional solo para un clic, tras el cual se desactiva automáticamente, volviendo el cursor a su estado predeterminado.

## Instalación

1. Clona o descarga este repositorio en tu ordenador.
2. Abre Google Chrome y dirígete a `chrome://extensions/`.
3. Activa el "Modo de desarrollador" en la esquina superior derecha.
4. Haz clic en "Cargar sin empaquetar" y selecciona la carpeta donde se encuentra este proyecto.
5. La extensión debería aparecer ahora en tu lista de extensiones de Chrome.

## Uso

1. Haz clic en el icono de la extensión "Ocultar Elementos" en la barra de herramientas de Google Chrome.
2. Observa que el cursor cambia a una cruz (`crosshair`), indicando que el modo de ocultar está activado.
3. Haz clic en cualquier elemento de la página que desees ocultar. El elemento será eliminado de la vista aplicándole un estilo `display: none !important`.
4. El cursor volverá automáticamente a su forma normal después del clic, deshabilitando el modo de ocultar.
5. Si deseas ocultar otro elemento, repite el proceso iniciando desde el paso 1.

## Archivos Importantes

- `manifest.json`: Archivo de configuración de la extensión.
- `background.js`: Maneja eventos de fondo de la extensión.
- `content.js`: Contiene la lógica para ocultar elementos y manejar cambios de cursor.
- `style.css`: Define estilos personalizados, incluyendo la clase del cursor.
- `popup.html` y `popup.js`: Definen el popup de la extensión y manejan la activación del modo de ocultar.

## Iconos

Incluye iconos en diversos tamaños en el directorio `icons/` (16x16, 48x48, 128x128) que puedes personalizar según tus necesidades. *TODO

## Contribuciones

Si tienes ideas para mejorar esta extensión o encuentras problemas, por favor crea un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT. Puedes hacer lo que quieras con él, solo recuerda dar crédito al autor original.
