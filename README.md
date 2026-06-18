# monitor-salud-plantas-esp32
# Sistema de Monitoreo IoT para el Cuidado de Plantas con ESP32

## Integrantes
- Edinso Barros Lopez
- [Nombre Apellido del Integrante 2]
- [Nombre Apellido del Integrante 3]

## Descripción del proyecto
Este proyecto consiste en un sistema de monitoreo automatizado e IoT (Internet de las Cosas) diseñado para supervisar las variables ambientales de una planta en tiempo real. Utiliza un microcontrolador ESP32 para recopilar datos de temperatura y humedad del aire a través de un sensor DHT11, así como el nivel de humedad en la tierra mediante un sensor de humedad de suelo. El ESP32 procesa esta información y la transmite a través de Wi-Fi a una página web externa, la cual despliega un dashboard interactivo con los datos analizados y derivados para garantizar el cuidado óptimo de la planta.

## Problema identificado
En el cuidado de plantas domésticas o cultivos a pequeña escala, la falta de información precisa sobre las condiciones del entorno suele derivar en un riego inadecuado o en la exposición a temperaturas perjudiciales. Al realizarse la supervisión de forma manual y empírica, no se conocen los niveles reales de hidratación ni el microclima de la planta, lo que puede afectar su desarrollo o causar su muerte. Automatizar y digitalizar este monitoreo mediante una plataforma remota permite tomar decisiones informadas y prevenir el descuido del vegetal.

## Objetivo general
Diseñar e implementar un sistema de monitoreo IoT utilizando un ESP32 y sensores ambientales para medir, procesar y visualizar el estado de una planta a través de un dashboard web en tiempo real.

## Objetivos específicos
- Medir de forma constante la temperatura y humedad del aire mediante el sensor DHT11 conectado al microcontrolador.
- Determinar el nivel de humedad en la tierra a través de un sensor de humedad de suelo analógico.
- Configurar la conectividad Wi-Fi del ESP32 para establecer la comunicación y el envío de datos hacia el servidor web.
- Desarrollar o integrar una interfaz gráfica (dashboard) que muestre de forma clara los datos recolectados y sus derivados.
- Validar la estabilidad en la transmisión de datos y la precisión de las lecturas mediante pruebas experimentales.

## Componentes utilizados
| Componente | Cantidad | Función |
|---|---|---|
| ESP32 | 1 | Controlador principal con conectividad Wi-Fi y procesamiento de datos |
| Sensor DHT11 | 1 | Medición de la temperatura y humedad del aire ambiental |
| Sensor de humedad de suelo | 1 | Medición del nivel de humedad en la tierra de la planta |
| Cables y protoboard | Varios | Conexión e interconexión del circuito electrónico |
| [Fuente de alimentación / Cable USB] | 1 | Suministro de energía eléctrica para el sistema |

## Arquitectura del sistema
Sensores (DHT11 y Humedad de Suelo) → ESP32 → Conexión Wi-Fi → Servidor Web → Dashboard Interactivo

También se puede visualizar en el siguiente diagrama:
![Diagrama de bloques](docs/imagenes/diagrama_bloques.png)

## Funcionamiento
1. Los sensores DHT11 y de humedad de suelo realizan las lecturas analógicas y digitales del entorno de la planta.
2. El ESP32 recibe los datos provenientes de ambos sensores a través de sus pines configurados.
3. El programa del ESP32 estructura los datos capturados y se conecta a la red Wi-Fi local.
4. El microcontrolador realiza una petición HTTP/MQTT para enviar la información a la plataforma web.
5. La página web procesa los datos entrantes y actualiza los indicadores del dashboard en tiempo real.
6. El usuario visualiza de forma remota el estado de salud y las necesidades de la planta.

## Evidencias del proyecto
### Fotos
A continuación se muestran los registros fotográficos del desarrollo del prototipo:

![Montaje del circuito con los sensores](docs/imagenes/conexion_sensores.jpg)
*Fig 1. Conexión de los sensores DHT11 y humedad de suelo al ESP32.*

![Visualización del Dashboard Web](docs/imagenes/captura_dashboard.png)
*Fig 2. Interfaz gráfica de la página web mostrando los datos en tiempo real.*

### Videos
Para observar el funcionamiento del sistema en tiempo real y la actualización de los datos en la interfaz web, puede revisar el siguiente enlace:

[Ver video de prueba del prototipo](docs/videos/prueba_funcionamiento.mp4)

## Código fuente
El código principal encargado de realizar la lectura de los componentes, gestionar la red Wi-Fi y transmitir los parámetros medidos se encuentra organizado en la carpeta correspondiente:

[Ver código principal](codigo/programa_principal/programa_principal.ino)

*Nota: El programa está desarrollado en el entorno de Arduino IDE, se encuentra estructurado con comentarios detallados en cada función para facilitar su comprensión técnica.*

## Esquema de conexiones
El circuito electrónico y la distribución de los pines utilizados se detallan en el siguiente diagrama técnico:

![Esquema de conexión](esquemas/diagrama_conexion.png)

## Pruebas realizadas
| Prueba | Descripción | Resultado |
|---|---|---|
| Lectura de Sensores | Verificación de datos del DHT11 y del sensor de suelo en diferentes ambientes | Valores coherentes con el entorno físico |
| Conexión de Red | Envío de comandos de emparejamiento Wi-Fi desde el ESP32 | Conexión exitosa y obtención de IP estable |
| Transmisión de Datos | Envío de cadenas de datos de prueba hacia el servidor web | Los datos se reciben de manera íntegra sin pérdidas |
| Despliegue en Dashboard | Actualización visual de las gráficas al variar la humedad de los sensores | El dashboard muestra los cambios con baja latencia |

## Estado actual del proyecto
El proyecto se encuentra en **fase de pruebas y optimización**. El circuito realiza las mediciones y la transmisión web de forma exitosa, actualmente se están calibrando los umbrales de humedad del suelo para categorizar el estado de la planta adecuadamente en la web.

## Dificultades encontradas
- **Inestabilidad en la lectura analógica:** El sensor de humedad de suelo presentaba fluctuaciones debido al ruido eléctrico. Se solucionó programando un filtrado por promedio de 10 lecturas consecutivas en el ESP32 antes de enviar el dato.
- **Pérdida momentánea de conexión Wi-Fi:** En entornos alejados del router, el ESP32 perdía la conexión y el código se congelaba. Se implementó una rutina de reconexión automática en el bucle principal (`loop`) para asegurar la continuidad del sistema.

## Mejoras futuras
- Implementar un sistema de alertas mediante correo electrónico o notificaciones móviles cuando la planta requiera riego inmediato.
- Incorporar un actuador (bomba de agua pequeña) controlado por un relé para que el riego sea completamente automatizado además de monitoreado.
- Añadir un sensor de luz LDR para medir las horas de sol que recibe la planta diariamente.

## Conclusiones
El desarrollo de este prototipo permitió validar la versatilidad del ESP32 en aplicaciones IoT, logrando integrar con éxito sensores de diferentes tecnologías (digital y analógica). Se comprobó la viabilidad de centralizar parámetros agrícolas en un entorno web accesible, lo cual sienta las bases para el desarrollo de sistemas de agricultura inteligente o automatización del hogar.
