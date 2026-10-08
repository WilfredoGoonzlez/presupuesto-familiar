# Presupuesto Familiar: Mes de Pruebas

Simulador de finanzas domésticas en el que se asignan gastos mensuales, se
responde a un imprevisto médico y se avanza durante cuatro semanas.

## Requisitos

- Node.js compatible con Vite 8.
- npm.

## Estructura del proyecto

```text
.
├── index.html          # Documento HTML y punto de entrada de la aplicación
├── package.json        # Dependencias y comandos npm
├── package-lock.json   # Versiones bloqueadas de dependencias
├── tsconfig.json       # Configuración de TypeScript
└── src/
    ├── logica.ts       # Estado y reglas del presupuesto
    ├── main.ts         # Interfaz, renderizado y manejadores de interacción
    └── style.css       # Estilos y diseño adaptable
```

## Instalación y ejecución

Desde la carpeta del proyecto, instala las dependencias y ejecuta el servidor
de desarrollo:

```sh
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local de la aplicación. Ábrela en un
navegador; el servidor recarga la aplicación al guardar cambios.

Para compilar la aplicación para producción:

```sh
npm run build
```

Para servir localmente esa compilación:

```sh
npm run preview
```

## Interacciones

- Asigna Alimentos, Servicios y Transporte haciendo clic en sus botones.
- En la semana 1, las teclas `1`, `2` y `3` asignan esas categorías,
  respectivamente.
- Al comenzar la semana 2 aparece el imprevisto médico. Elige una opción con
  un botón o pulsa `1` para pagar la consulta completa y `2` para arriesgarse
  con el gasto menor.
- Avanza con el botón **Avanzar semana** o con la barra espaciadora. Los gastos
  asignados se descuentan proporcionalmente durante las cuatro semanas.

## Pruebas y verificación

El proyecto no tiene actualmente un comando ni un framework de pruebas
automatizadas configurado. `npm run build` comprueba los tipos de TypeScript y
genera la compilación de producción.

Al verificar cambios manualmente en el navegador, cubrir estos casos:

1. La partida inicia con un saldo de `$500` y las tres categorías sin asignar.
2. No se puede avanzar hasta asignar las tres categorías; una vez asignadas,
   cada semana descuenta `$75`.
3. El imprevisto aparece al comenzar la semana 2; la opción de consulta
   descuenta `$100` y la opción de farmacia menor descuenta `$20`.
4. Resolver el imprevisto habilita el avance de semana; no resolverlo lo
   bloquea.
5. Completar la semana 4 con saldo positivo muestra la victoria; llegar a cero
   o menos muestra bancarrota.
6. Los clics, las teclas admitidas y el reinicio actualizan la interfaz sin
   errores; en anchos móviles no hay desbordamiento horizontal y los botones
   conservan un área táctil de al menos `44px`.
