# Sistema de Monitoreo IoT para el Cuidado de Plantas con ESP32

## Integrantes
- [cite_start]Edinso Barros Lopez [cite: 48, 49]

## Descripción del proyecto
[cite_start]Este proyecto consiste en un sistema de monitoreo IoT diseñado para supervisar las variables ambientales de una planta en tiempo real[cite: 53]. [cite_start]Utiliza un microcontrolador ESP32 para recopilar datos de temperatura y humedad del aire a través de un sensor DHT11, así como el nivel de humedad en la tierra mediante un sensor de humedad de suelo[cite: 56]. [cite_start]El ESP32 procesa esta información y la transmite mediante el protocolo MQTT hacia un broker que alimenta una página web, la cual despliega un dashboard interactivo con los datos medidos y sus derivados[cite: 56].

## Problema identificado
[cite_start]En el cuidado de plantas domésticas o cultivos a pequeña escala, el riego y la supervisión suelen hacerse de forma manual y sin conocer los niveles reales de humedad del suelo ni el microclima del entorno[cite: 66]. [cite_start]Esto puede generar exceso o falta de agua, afectando el crecimiento de la planta y desperdiciando recursos[cite: 67]. [cite_start]Automatizar este monitoreo mediante una interfaz remota basada en IoT permite prevenir estos descuidos y tomar decisiones basadas en datos reales[cite: 63].

## Objetivo general
[cite_start]Diseñar e implementar un sistema de monitoreo IoT utilizando un ESP32 y sensores ambientales para medir, procesar y visualizar el estado de una planta a través de un dashboard web mediante el protocolo MQTT[cite: 70, 71].

## Objetivos específicos
- [cite_start]Medir la humedad y la temperatura del aire mediante el sensor DHT11 conectado al microcontrolador[cite: 76].
- [cite_start]Determinar el nivel de humedad en la tierra a través de un sensor de humedad de suelo[cite: 76].
- [cite_start]Configurar la conectividad Wi-Fi y el cliente MQTT en el ESP32 para establecer la publicación de los datos[cite: 77].
- [cite_start]Desplegar una interfaz gráfica (dashboard web) para visualizar las variables suscritas en tiempo real[cite: 79].
- [cite_start]Validar el funcionamiento del prototipo mediante pruebas de transmisión de mensajes MQTT[cite: 80].

## Componentes utilizados
| Componente | Cantidad | Función |
|---|---|---|
| ESP32 | 1 | [cite_start]Controlador principal y gestión de la conexión Wi-Fi / MQTT [cite: 86] |
| Sensor DHT11 | 1 | Medición de temperatura y humedad del aire |
| Sensor de humedad de suelo | 1 | [cite_start]Medición de la humedad en la tierra [cite: 87] |
| Cables y protoboard | Varios | [cite_start]Conexión del circuito electrónico [cite: 91] |

## Arquitectura del sistema
[cite_start]Sensor DHT11 / Sensor de Suelo → ESP32 (Cliente MQTT) → Broker MQTT → Dashboard Web [cite: 96]

## Funcionamiento
1. [cite_start]Los sensores miden las variables ambientales de la planta[cite: 104].
2. [cite_start]El ESP32 recibe y procesa las señales de los sensores[cite: 105].
3. El programa conecta el dispositivo a la red Wi-Fi local y se enlaza al broker MQTT.
4. El ESP32 publica los datos de los sensores en los tópicos correspondientes.
5. [cite_start]La página web se suscribe a los tópicos MQTT y actualiza los indicadores del dashboard en tiempo real[cite: 109].

## Evidencias del proyecto
[cite_start]*(Nota para la entrega: Recuerda guardar tus capturas y grabaciones reales dentro de la carpeta `docs/` para cumplir con las reglas de evidencias [cite: 113, 130, 193])*

### Fotos
[cite_start]A continuación se anexan las imágenes reales del montaje físico y de la interfaz web dentro del repositorio[cite: 111]:

- **Montaje del circuito:** ![Montaje del circuito](docs/imagenes/tu_foto_del_circuito.jpg)
- **Dashboard Web:** ![Dashboard Web](docs/imagenes/tu_captura_del_dashboard.png)

### Videos
[cite_start]Para observar el funcionamiento del sistema en tiempo real y la publicación de los datos por MQTT, se adjunta el siguiente video[cite: 127]:

- [cite_start][Ver video de prueba del prototipo](docs/videos/tu_video_de_prueba.mp4) [cite: 133]

## Código fuente
[cite_start]El código principal encargado de la lectura y la publicación por MQTT se encuentra en la carpeta obligatoria del repositorio[cite: 138, 144]:
- [cite_start][Ver código principal](codigo/programa_principal/) [cite: 22] *(Modifica esta ruta si tu archivo tiene otro nombre)*

## Esquema de conexiones
[cite_start]El diagrama técnico que muestra cómo se conectaron los sensores al ESP32 se encuentra guardado en la carpeta de esquemas[cite: 23, 149]:
- [cite_start]![Esquema de conexión](esquemas/diagrama_conexion.png) [cite: 153]

## Pruebas realizadas
| Prueba | Descripción | Resultado |
|---|---|---|
| Lectura de sensores | [cite_start]Verificación de datos del DHT11 y suelo en diferentes estados [cite: 164, 166] | [cite_start]Los sensores respondieron correctamente con valores coherentes [cite: 166] |
| Conectividad MQTT | Publicación de mensajes de prueba desde el ESP32 hacia el Broker | El Broker recibió los paquetes de datos de manera íntegra |
| Despliegue en Dashboard | Suscripción de la página web a los tópicos del ESP32 | El dashboard web se actualizó en tiempo real al cambiar las lecturas |

## Estado actual del proyecto
[cite_start]El proyecto se encuentra en fase de pruebas[cite: 173]. [cite_start]El sistema ya mide las variables y las publica con éxito por MQTT, actualmente se están ajustando los valores de calibración de las lecturas analógicas[cite: 174].

## Dificultades encontradas
- [cite_start]**Variación en las lecturas analógicas:** El sensor de suelo presentaba fluctuaciones[cite: 178]. [cite_start]Se solucionó programando un promedio de varias mediciones en el ESP32 antes de publicar el mensaje MQTT[cite: 179].
- **Reconexiones del cliente MQTT:** Al perder la señal Wi-Fi momentáneamente, el cliente MQTT se desconectaba permanentemente. Se implementó un bucle de reconexión automática en el código para asegurar la continuidad del envío.

## Mejoras futuras
- [cite_start]Implementar un sistema de alertas automáticas (mensajes por tópicos de alarma o correos) cuando los niveles sean críticos[cite: 186].
- [cite_start]Registrar un histórico de datos para analizar la evolución de la planta a lo largo del tiempo[cite: 185].

## Conclusiones
[cite_start]El proyecto permitió validar la integración de sensores analógicos y digitales con el ESP32 utilizando el protocolo de mensajería liviana MQTT[cite: 190]. [cite_start]Se comprobó que es viable centralizar parámetros ambientales en una interfaz web funcional para facilitar el monitoreo remoto con baja latencia[cite: 191].
