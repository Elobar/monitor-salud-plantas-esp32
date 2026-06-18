# Sistema de Monitoreo IoT para el Cuidado de Plantas con ESP32

## Integrantes
- Edinso Barros Lopez

## Descripción del proyecto
Este proyecto consiste en un sistema de monitoreo IoT diseñado para supervisar las variables ambientales de una planta en tiempo real. Utiliza un microcontrolador ESP32 para recopilar datos de temperatura y humedad del aire a través de un sensor DHT11, así como el nivel de humedad en la tierra mediante un sensor de humedad de suelo. El ESP32 procesa esta información y la transmite mediante el protocolo MQTT hacia un broker que alimenta una página web, la cual despliega un dashboard interactivo con los datos medidos y sus derivados.

## Problema identificado
En el cuidado de plantas domésticas o cultivos a pequeña escala, el riego y la supervisión suelen hacerse de forma manual y sin conocer los niveles reales de humedad del suelo ni el microclima del entorno. Esto puede generar exceso o falta de agua, afectando el crecimiento de la planta y desperdiciando recursos. Automatizar este monitoreo mediante una interfaz remota basada en IoT permite prevenir estos descuidos y tomar decisiones basadas en datos reales.

## Objetivo general
Diseñar e implementar un sistema de monitoreo IoT utilizando un ESP32 y sensores ambientales para medir, procesar y visualizar el estado de una planta a través de un dashboard web mediante el protocolo MQTT.

## Objetivos específicos
- Medir la humedad y la temperatura del aire mediante el sensor DHT11 conectado al microcontrolador.
- Determinar el nivel de humedad en la tierra a través de un sensor de humedad de suelo.
- Configurar la conectividad Wi-Fi y el cliente MQTT en el ESP32 para establecer la publicación de los datos.
- Desplegar una interfaz gráfica (dashboard web) para visualizar las variables suscritas en tiempo real.
- Validar el funcionamiento del prototipo mediante pruebas de transmisión de mensajes MQTT.

## Componentes utilizados
| Componente | Cantidad | Función |
|---|---|---|
| ESP32 | 1 | Controlador principal y gestión de la conexión Wi-Fi / MQTT |
| Sensor DHT11 | 1 | Medición de temperatura y humedad del aire |
| Sensor de humedad de suelo | 1 | Medición de la humedad en la tierra |
| Cables y protoboard | Varios | Conexión del circuito electrónico |

## Arquitectura del sistema
Sensor DHT11 / Sensor de Suelo → ESP32 (Cliente MQTT) → Broker MQTT → Dashboard Web

## Funcionamiento
1. Los sensores miden las variables ambientales de la planta.
2. El ESP32 recibe y procesa las señales de los sensores.
3. El programa conecta el dispositivo a la red Wi-Fi local y se enlaza al broker MQTT.
4. El ESP32 publica los datos de los sensores en los tópicos correspondientes.
5. La página web se suscribe a los tópicos MQTT y actualiza los indicadores del dashboard en tiempo real.

## Evidencias del proyecto
### Fotos
- **Montaje del circuito:** ![Montaje del circuito](docs/imagenes/tu_foto_del_circuito.jpg)
- **Dashboard Web:** ![Dashboard Web](docs/imagenes/tu_captura_del_dashboard.png)

### Videos
- [Ver video de prueba del prototipo](docs/videos/tu_video_de_prueba.mp4)

## Código fuente
El código principal encargado de la lectura y la publicación por MQTT se encuentra en la carpeta obligatoria del repositorio:
- [Ver código principal](codigo/programa_principal/)

## Esquema de conexiones
El diagrama técnico que muestra cómo se conectaron los sensores al ESP32 se encuentra guardado en la carpeta de esquemas:
- ![Esquema de conexión](esquemas/diagrama_conexion.png)

## Pruebas realizadas
| Prueba | Descripción | Resultado |
|---|---|---|
| Lectura de sensores | Verificación de datos del DHT11 y suelo en diferentes estados | Los sensores respondieron correctamente con valores coherentes |
| Conectividad MQTT | Publicación de mensajes de prueba desde el ESP32 hacia el Broker | El Broker recibió los paquetes de datos de manera íntegra |
| Despliegue en Dashboard | Suscripción de la página web a los tópicos del ESP32 | El dashboard web se actualizó en tiempo real al cambiar las lecturas |

## Estado actual del proyecto
El proyecto se encuentra en fase de pruebas. El sistema ya mide las variables y las publica con éxito por MQTT, actualmente se están ajustando los valores de calibración de las lecturas analógicas.

## Dificultades encontradas
- **Variación en las lecturas analógicas:** El sensor de suelo presentaba fluctuaciones. Se solucionó programando un promedio de varias mediciones en el ESP32 antes de publicar el mensaje MQTT.
- **Reconexiones del cliente MQTT:** Al perder la señal Wi-Fi momentáneamente, el cliente MQTT se desconectaba. Se implementó un bucle de reconexión automática en el código para asegurar la continuidad del envío.

## Mejoras futuras
- Implementar un sistema de alertas automáticas cuando los niveles sean críticos.
- Registrar un histórico de datos para analizar la evolución de la planta a lo largo del tiempo.

## Conclusiones
El proyecto permitió validar la integración de sensores analógicos y digitales con el ESP32 utilizando el protocolo de mensería liviana MQTT. Se comprobó que es viable centralizar parámetros ambientales en una interfaz web funcional para facilitar el monitoreo remoto con baja latencia.
