# Sistema de Monitoreo IoT para el Cuidado de Plantas con ESP32

## Integrantes
- Edinso Barros Lopez

## Descripción del proyecto
Este proyecto consiste en un sistema de monitoreo IoT que mide en tiempo real la temperatura, la humedad del aire y la humedad del suelo de una planta. Un microcontrolador ESP32 lee los sensores DHT11 (temperatura y humedad ambiente) y YL-69 con módulo HW-080 (humedad de suelo), y publica los datos mediante el protocolo MQTT al broker público de HiveMQ. Un dashboard web (HTML, CSS y JavaScript) se conecta a ese mismo broker vía WebSocket y muestra la información en tiempo real mediante tarjetas de métricas, medidores semicirculares (gauges), una gráfica histórica y un sistema de alertas, permitiendo evaluar la salud de la planta sin necesidad de revisarla físicamente.

## Problema identificado
En el cuidado de plantas domésticas o pequeños cultivos, el riego y la revisión de condiciones ambientales suelen hacerse de forma manual y sin conocer datos reales de humedad del suelo o del aire. Esto provoca que muchas veces se riegue de más o de menos, o que no se detecten a tiempo condiciones de estrés hídrico o térmico para la planta. Sin un monitoreo constante, el cuidado depende únicamente de la memoria o la intuición de la persona, lo que puede afectar el crecimiento de la planta y generar desperdicio de agua.

## Objetivo general
Diseñar e implementar un sistema de monitoreo IoT que mida la temperatura, la humedad del aire y la humedad del suelo de una planta, y visualice esta información en tiempo real mediante un dashboard web conectado por MQTT.

## Objetivos específicos
- Medir la temperatura y humedad del aire mediante un sensor DHT11 conectado al ESP32.
- Medir la humedad del suelo mediante un sensor YL-69 con módulo HW-080, aplicando calibración y suavizado de lectura.
- Publicar los datos leídos hacia un broker MQTT público en formato JSON cada 5 segundos.
- Desarrollar un dashboard web que se conecte al broker MQTT por WebSocket y visualice los datos en tiempo real.
- Implementar indicadores visuales (gauges, tendencias, alertas) y una gráfica histórica para facilitar la interpretación de los datos.

## Componentes utilizados

| Componente | Cantidad | Función |
|---|---:|---|
| ESP32 | 1 | Controlador principal, lectura de sensores y publicación MQTT |
| Sensor DHT11 | 1 | Medición de temperatura y humedad del aire |
| Sensor de humedad de suelo YL-69 + módulo HW-080 | 1 | Medición de humedad del suelo |
| Cables y protoboard | Varios | Conexión del circuito |
| Fuente de alimentación (cable USB / fuente 5V) | 1 | Alimentación del ESP32 |

## Arquitectura del sistema

```
DHT11 ────────┐
              ├──► ESP32 ──► WiFi ──► Broker MQTT (HiveMQ) ──► WebSocket ──► Dashboard Web
YL-69/HW-080 ─┘                         (topic: planta/datos)
```

El ESP32 se conecta a una red WiFi y publica un mensaje JSON al topic `planta/datos` en el broker público `broker.hivemq.com`. El dashboard web, ejecutado en el navegador, se suscribe al mismo topic mediante una conexión WebSocket (`wss://broker.hivemq.com:8884/mqtt`) y actualiza la interfaz cada vez que llega un nuevo dato.

También se puede incluir una imagen del diagrama:
```
![Diagrama de bloques](docs/imagenes/diagrama_bloques.png)
```

## Funcionamiento
1. El ESP32 se conecta a la red WiFi y luego al broker MQTT.
2. Cada 5 segundos, el ESP32 lee la temperatura y humedad del DHT11, y promedia 10 lecturas del sensor de suelo para reducir el ruido del ADC.
3. La lectura de humedad de suelo se convierte a porcentaje (0-100%) usando valores de calibración reales (seco = 4095, mojado = 1800).
4. El ESP32 construye un mensaje JSON con los tres valores y lo publica en el topic `planta/datos`.
5. El dashboard web, conectado al mismo broker por WebSocket, recibe el mensaje y lo interpreta.
6. La interfaz actualiza las tarjetas de métricas, los gauges, la gráfica histórica y el estado de las alertas (riego, estrés hídrico, riesgo de hongos).
7. El sistema también calcula valores derivados como el índice de calor y el punto de rocío, detecta riegos (cuando el suelo sube ≥20% entre lecturas) y guarda los mínimos/máximos del día.

## Evidencias del proyecto

### Fotos
Las fotos del montaje y del circuito deben guardarse en:
```
docs/imagenes/
```
Ejemplos de nombres recomendados:
- `montaje_inicial.jpg`
- `conexion_sensores.jpg`
- `prototipo_final.jpg`
- `dashboard_funcionando.jpg`

Para insertarlas en este README:
```
![Montaje del circuito](docs/imagenes/montaje_inicial.jpg)
```

### Videos
Los videos de funcionamiento deben guardarse en `docs/videos/` o subirse a una plataforma externa (YouTube, Drive, etc.) y enlazarse así:
```
[Ver video de funcionamiento](docs/videos/prueba_funcionamiento.mp4)
```
El video debe mostrar el sistema completo funcionando: ESP32 enviando datos y el dashboard actualizándose en tiempo real.

## Código fuente
El código se organiza en dos partes dentro de la carpeta `codigo/`:

```
codigo/
├── esp32_monitor/
│   └── esp32_monitor.ino
└── dashboard_web/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```

**Firmware ESP32** (`codigo/esp32_monitor/esp32_monitor.ino`): lee el DHT11 y el sensor de suelo YL-69/HW-080, calcula el porcentaje de humedad del suelo con calibración propia, y publica un JSON cada 5 segundos al broker MQTT.

**Dashboard web** (`codigo/dashboard_web/`): aplicación web hecha con HTML, CSS, Bootstrap 5 y JavaScript, que se conecta vía MQTT.js (WebSocket) al broker HiveMQ, procesa los datos recibidos y los muestra mediante tarjetas, gauges SVG y una gráfica histórica con Chart.js.

[Ver código del ESP32](codigo/programa_principal/_planta.ino)
[Ver código del dashboard](codigo/Pagina-Web/index.html)
[Ver código completo del dashboard](codigo/Pagina-Web/)

## Esquema de conexiones
```
![Esquema de conexión](esquemas/diagrama_conexion.png)
```
El esquema debe mostrar:
- ESP32 como controlador principal.
- Sensor DHT11 conectado al pin digital 4.
- Sensor de suelo YL-69/HW-080 conectado al pin analógico 35.
- Alimentación de 3.3V/5V según corresponda a cada sensor.

## Pruebas realizadas

| Prueba | Descripción | Resultado |
|---|---|---|
| Lectura del DHT11 | Se midió temperatura y humedad en distintos momentos del día | El sensor respondió correctamente, sin errores de lectura |
| Calibración del sensor de suelo | Se registraron los valores ADC en suelo seco (4095) y en agua (1800) | Se obtuvo un rango de calibración estable para el cálculo de porcentaje |
| Publicación MQTT | Se verificó el envío del JSON cada 5 segundos al topic `planta/datos` | Los mensajes se publicaron correctamente y fueron recibidos por el dashboard |
| Conexión del dashboard | Se probó la suscripción del dashboard al broker vía WebSocket | El dashboard mostró los datos en tiempo real y registró el log de actividad MQTT |
| Detección de riego | Se simuló un aumento brusco de humedad del suelo | El sistema detectó el riego y actualizó el contador correspondiente |

*(Agrega fotos o capturas de pantalla de estas pruebas en `evidencias/pruebas/`.)*

## Estado actual del proyecto
El proyecto se encuentra en fase de pruebas finales. El ESP32 ya lee correctamente los dos sensores y publica los datos por MQTT, y el dashboard web los recibe y visualiza en tiempo real con todas sus funciones (gauges, alertas, historial y estadísticas).

## Dificultades encontradas
Durante las pruebas, el sensor de humedad de suelo YL-69 presentaba lecturas inestables debido al ruido propio del ADC del ESP32. Para solucionarlo, se implementó un promedio de 10 muestras antes de calcular el porcentaje final, y se realizó una calibración manual registrando los valores reales de ADC en condición seca y mojada, en lugar de usar los extremos teóricos (0-4095).

## Mejoras futuras
- Migrar de DHT11 a DHT22 para mayor precisión en las lecturas.
- Agregar persistencia de datos históricos (base de datos o archivo) en lugar de mantenerlos solo en memoria del navegador.
- Implementar notificaciones (correo o Telegram) cuando se detecten alertas críticas.
- Hostear el dashboard en un servicio como GitHub Pages para acceso remoto sin abrir el archivo localmente.
- Agregar un actuador (bomba de riego) para automatizar el riego según el umbral de humedad del suelo.

## Conclusiones
El proyecto permitió integrar sensores, un microcontrolador ESP32 y el protocolo MQTT para construir un sistema de monitoreo IoT funcional. Se comprobó que es posible transmitir datos en tiempo real desde un dispositivo embebido hacia una interfaz web mediante WebSocket, y que la calibración adecuada de los sensores es clave para obtener lecturas confiables, especialmente en sensores analógicos como el de humedad de suelo.
