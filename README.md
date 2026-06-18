# Sistema de Monitoreo IoT para el Cuidado de Plantas con ESP32

## Integrantes
- Edinso Barros Lopez

## Descripción del proyecto
Este proyecto consiste en un sistema de monitoreo IoT diseñado para supervisar las variables ambientales de una planta en tiempo real. Utiliza un microcontrolador ESP32 para recopilar datos de temperatura y humedad del aire a través de un sensor DHT11, así como el nivel de humedad en la tierra mediante un sensor de humedad de suelo. El ESP32 procesa esta información y la transmite a través de Wi-Fi a una página web que despliega un dashboard interactivo con los datos analizados y derivados para el cuidado de la planta.

## Problema identificado
En el cuidado de plantas domésticas o cultivos a pequeña escala, el riego y la supervisión suelen hacerse de forma manual y empírica, sin conocer los niveles reales de humedad del suelo ni el microclima del entorno. Esto puede generar exceso o falta de agua, afectando el crecimiento de la planta y desperdiciando recursos. Automatizar este monitoreo mediante una interfaz remota permite prevenir estos descuidos y tomar decisiones basadas en datos reales.

## Objetivo general
Diseñar e implementar un sistema de monitoreo IoT utilizando un ESP32 y sensores ambientales para medir, procesar y visualizar el estado de una planta a través de un dashboard web en tiempo real.

## Objetivos específicos
- Medir la humedad y la temperatura del aire mediante el sensor DHT11 conectado al microcontrolador.
- Determinar el nivel de humedad en la tierra a través de un sensor de humedad de suelo.
- Configurar la conectividad Wi-Fi del ESP32 para establecer la transmisión de los datos recolectados.
- Desplegar una interfaz gráfica (dashboard web) para visualizar los datos en tiempo real y sus derivados.
- Validar el funcionamiento del prototipo mediante pruebas experimentales de transmisión.

## Componentes utilizados
| Componente | Cantidad | Función |
|---|---|---|
| ESP32 | 1 | Controlador principal y gestión de la conexión Wi-Fi |
| Sensor DHT11 | 1 | Medición de temperatura y humedad del aire |
| Sensor de humedad de suelo | 1 | Medición de la humedad en la tierra |
| Cables y protoboard | Varios | Conexión del circuito electrónico |

## Arquitectura del sistema
Sensor DHT11 / Sensor de Suelo → ESP32 → Conexión Wi-Fi → Servidor Web → Dashboard

## Funcionamiento
1. Los sensores miden las variables ambientales de la planta.
2. El ESP32 recibe y procesa las señales de los sensores.
3. El programa conecta el dispositivo a la red Wi-Fi local.
4. Se envían los datos mediante peticiones web al servidor.
5. La página web recibe los datos y actualiza los indicadores del dashboard en tiempo real.

## Evidencias del proyecto
### Fotos
![Montaje del circuito](docs/imagenes/conexion_sensores.jpg)
*Montaje del ESP32 con los sensores conectados.*

![Dashboard Web](docs/imagenes/captura_dashboard.png)
*Interfaz de la página web mostrando los datos en tiempo real.*

### Videos
[Ver video de prueba del prototipo](docs/videos/prueba_funcionamiento.mp4)

## Código fuente
El programa estructurado y comentado para el microcontrolador se encuentra en la carpeta de desarrollo:
- [Ver código principal](codigo/programa_principal/programa_principal.ino)

## Esquema de conexiones
El diagrama técnico con la distribución de los pines se encuentra en la carpeta de esquemas:
- ![Esquema de conexión](esquemas/diagrama_conexion.png)

## Pruebas realizadas
| Prueba | Descripción | Resultado |
|---|---|---|
| Lectura de sensores | Verificación de datos del DHT11 y suelo en suelo seco y húmedo | El sensor respondió correctamente con valores coherentes |
| Transmisión web | Envío de datos desde el ESP32 hacia la página web | Los datos se reciben de manera íntegra y actualizan el dashboard |

## Estado actual del proyecto
El proyecto se encuentra en fase de pruebas. El sistema ya mide las variables y las transmite de forma exitosa a la página web, actualmente se están ajustando los valores de calibración de las lecturas.

## Dificultades encontradas
- **Variación en las lecturas analógicas:** El sensor de suelo presentaba fluctuaciones. Se solucionó programando un promedio de varias mediciones en el ESP32 antes de enviar los datos.
- **Desconexión Wi-Fi:** El ESP32 perdía la señal ocasionalmente. Se implementó una función de reconexión automática en el código para evitar que el sistema se detuviera.

## Mejoras futuras
- Implementar alertas automáticas (notificaciones o correos) cuando los niveles sean críticos.
- Registrar un histórico de datos para analizar la evolución de la planta a lo largo del tiempo.

## Conclusiones
El proyecto permitió validar la integración de sensores analógicos y digitales con el ESP32 utilizando tecnologías IoT. Se comprobó que es viable centralizar parámetros ambientales en una interfaz web funcional para facilitar el monitoreo remoto.
