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
1. Los sensores miden las variables ambientales de la planta de forma constante.
2. El ESP32 recibe y procesa las señales de los sensores.
3. El dispositivo se conecta a la red Wi-Fi local y establece enlace con el broker MQTT.
4. El ESP32 publica los datos de los sensores en los tópicos correspondientes con baja latencia.
5. La página web, suscrita a dichos tópicos, recibe las lecturas y actualiza los indicadores del dashboard de manera inmediata.

## Evidencias del proyecto
*(Nota: Las fotos del montaje físico, las capturas de pantalla de la interfaz web del dashboard y el video demostrativo del funcionamiento se encuentran guardados directamente dentro de las carpetas correspondientes en la raíz del repositorio, tal como lo exige la estructura del curso).*

## Pruebas realizadas
| Prueba | Descripción | Resultado |
|---|---|---|
| Lectura de sensores | Verificación de datos del DHT11 y suelo en diferentes estados (seco y húmedo) | Los sensores respondieron correctamente con valores coherentes y estables |
| Conectividad MQTT | Publicación de mensajes de prueba desde el ESP32 hacia el Broker | El Broker recibió los paquetes de datos de manera íntegra sin pérdidas |
| Despliegue en Dashboard | Suscripción de la página web a los tópicos del ESP32 | El dashboard web se actualizó en tiempo real al cambiar las lecturas en el entorno físico |

## Estado actual del proyecto
El proyecto se encuentra completamente terminado y funcional. El hardware ejecuta la adquisición de datos de manera continua y la interfaz web despliega el dashboard interactivo con éxito utilizando comunicación por MQTT.

## Dificultades encontradas y soluciones
- **Variación en las lecturas analógicas:** El sensor de suelo presentaba fluctuaciones eléctricas en el entorno inicial. Se solucionó programando un filtro por promedio de varias mediciones consecutivas en el ESP32 antes de publicar el mensaje MQTT.
- **Reconexiones del cliente MQTT:** Al experimentar pérdidas intermitentes de la señal Wi-Fi, el cliente MQTT perdía la conexión de forma permanente. Se implementó un bucle de reconexión automática en la lógica principal del código para asegurar la continuidad del envío.

## Mejoras futuras
- Implementar un sistema de alertas automáticas (mensajes por tópicos de alarma, notificaciones móviles o correos) cuando los niveles de las variables sean críticos para la planta.
- Registrar un histórico de datos en una base de datos para analizar la evolución de la planta a lo largo del tiempo.

## Conclusiones
El desarrollo de este proyecto permitió validar la integración exitosa de sensores analógicos y digitales con el microcontrolador ESP32 utilizando el protocolo de mensajería liviana MQTT. Se comprobó la viabilidad de centralizar parámetros ambientales en una interfaz web funcional, facilitando un monitoreo remoto eficiente, seguro y de baja latencia para aplicaciones de IoT agrícola o doméstico.
