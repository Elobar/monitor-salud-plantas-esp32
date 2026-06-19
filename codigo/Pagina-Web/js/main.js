/* ============================================================
   Monitor de Plantas — main.js
   ESP32 + DHT11 + Sensor HW-080 via MQTT
   Autor: Proyecto IoT
   ============================================================ */

'use strict';

/* ── Configuración MQTT ─────────────────────────────────────── */
// Aquí defines el broker MQTT y los topics que el ESP32 va a publicar
const MQTT_CONFIG = {
  brokerUrl: 'wss://broker.hivemq.com:8884/mqtt',  // Broker público gratuito
  clientId:  'monitor-plantas-' + Math.random().toString(16).substr(2, 8), // ID único por sesión
  topics: {
    datos: 'planta/datos'  // Topic principal donde ESP32 publica el JSON
  },
  reconnectPeriod: 5000,   // Reintentar conexión cada 5 segundos
  connectTimeout:  12000   // Timeout de conexión: 12 segundos
};

// Máximo de puntos en la gráfica histórica
const MAX_PUNTOS_GRAFICA = 25;

/* ── Estado global de la aplicación ────────────────────────── */
// Aquí se guardan todos los valores actuales y anteriores
const estado = {
  temperatura: null,
  humedad:     null,
  suelo:       null,
  clienteMQTT: null,
  // Valores anteriores para calcular tendencias (subió/bajó)
  tempAnterior:  null,
  humAnterior:   null,
  sueloAnterior: null,
  // Datos para la gráfica
  grafica:       null,
  graficaHoras:  [],
  graficaTemp:   [],
  graficaHum:    [],
  graficaSuelo:  [],
  // ── Tiempo con suelo seco ────────────────────────────────────
  // minutosSecoAcumulados: total de minutos que el suelo lleva por debajo del umbral crítico
  // sueloSecoDesde: timestamp (Date) de cuando empezó el período seco actual, o null si no está seco
  minutosSecoAcumulados: 0,
  sueloSecoDesde:        null,
  // ── Contador de riegos ───────────────────────────────────────
  // contadorRiegos: número de riegos detectados en la sesión
  // ultimoRiegoHora: hora formateada del último riego detectado
  contadorRiegos:   0,
  ultimoRiegoHora:  null,
  // ── Mínimos y máximos del día ────────────────────────────────
  // Cada campo guarda { valor, hora } o null si no hay dato aún
  // Se reinician automáticamente a medianoche
  minmax: {
    tempMin:  null,
    tempMax:  null,
    humMin:   null,
    humMax:   null,
    diaActual: new Date().toDateString(), // para detectar cambio de día
  },
};

/* ── Referencias al DOM (elementos HTML) ────────────────────── */
// Atajo para obtener elementos por ID
const $ = id => document.getElementById(id);

const dom = {
  // Barra de navegación
  puntoCon:    $('conn-dot'),
  textoCon:    $('conn-text'),
  ultimaLect:  $('last-update'),
  badgePlanta: $('plant-badge'),

  // Tarjetas de valores principales
  valTemp:   $('val-temp'),
  valHum:    $('val-hum'),
  valSuelo:  $('val-soil'),
  valCalor:  $('val-heat'),
  valRocio:  $('val-dew'),
  valHora:   $('val-time'),
  valFecha:  $('val-date'),

  // Subtítulos descriptivos de cada tarjeta
  subTemp:   $('sub-temp'),
  subHum:    $('sub-hum'),
  subSuelo:  $('sub-soil'),

  // Flechas de tendencia (sube/baja/estable)
  tendTemp:  $('trend-temp'),
  tendHum:   $('trend-hum'),
  tendSuelo: $('trend-soil'),

  // Medidores semicirculares (gauges)
  gaugeTemp:     $('gauge-track-temp'),
  gaugeHum:      $('gauge-track-hum'),
  gaugeSuelo:    $('gauge-track-soil'),
  gaugeValTemp:  $('gauge-val-temp'),
  gaugeValHum:   $('gauge-val-hum'),
  gaugeValSuelo: $('gauge-val-soil'),

  // Textos de alertas
  alertRiego:  $('alert-riego-text'),
  alertEstres: $('alert-estres-text'),
  alertHongos: $('alert-hongos-text'),

  // Estadísticas de seguimiento
  statMinSeco:      $('stat-min-seco'),
  statSecoEstado:   $('stat-seco-estado'),
  statRiegos:       $('stat-riegos'),
  statUltimoRiego:  $('stat-ultimo-riego'),
  statTempMin:      $('stat-temp-min'),
  statTempMax:      $('stat-temp-max'),
  statTempMinHora:  $('stat-temp-min-hora'),
  statTempMaxHora:  $('stat-temp-max-hora'),
  statHumMin:       $('stat-hum-min'),
  statHumMax:       $('stat-hum-max'),
  statHumMinHora:   $('stat-hum-min-hora'),
  statHumMaxHora:   $('stat-hum-max-hora'),
  statMinMaxReset:  $('stat-minmax-reset'),

  // Panel MQTT
  mqttBroker: $('mqtt-broker'),
  mqttClient: $('mqtt-client'),
  mqttLog:    $('mqtt-log'),
};

/* ── Funciones de utilidad ──────────────────────────────────── */

// Retorna la hora actual formateada (ej: 10:35:22)
function horaActual() {
  return new Date().toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

// Retorna la fecha actual formateada (ej: jueves, 12 de junio de 2026)
function fechaActual() {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// Formatea un número con decimales, o retorna '--' si no hay valor
function fmt(val, dec = 1) {
  return val !== null && !isNaN(val) ? parseFloat(val.toFixed(dec)) : '--';
}

/* ── Cálculos derivados ─────────────────────────────────────── */

// Índice de calor: sensación térmica real combinando temperatura y humedad
// Fórmula estándar de la NOAA (solo aplica para T >= 27°C)
function calcularIndiceCalor(T, H) {
  if (T < 27) return T;
  const c = [-8.78469475556, 1.61139411, 2.33854883889,
             -0.14611605, -0.012308094, -0.0164248277778,
              0.002211732, 0.00072546, -0.000003582];
  return c[0] + c[1]*T + c[2]*H + c[3]*T*H + c[4]*T*T +
         c[5]*H*H + c[6]*T*T*H + c[7]*T*H*H + c[8]*T*T*H*H;
}

// Punto de rocío: temperatura a la que el aire se satura y aparece condensación
function calcularPuntoRocio(T, H) {
  const a = 17.27, b = 237.7;
  const gamma = (a * T) / (b + T) + Math.log(H / 100);
  return (b * gamma) / (a - gamma);
}

/* ── Medidores (gauges) ─────────────────────────────────────── */

// Longitud del arco del gauge (semicírculo de 220°)
const ARCO_GAUGE = 188;

// Actualiza el arco de un gauge según el valor actual dentro del rango min-max
function actualizarGauge(elementoArco, elementoValor, valor, min, max) {
  const porcentaje = Math.min(Math.max((valor - min) / (max - min), 0), 1);
  const relleno = porcentaje * ARCO_GAUGE;
  elementoArco.setAttribute('stroke-dasharray', `${relleno} ${ARCO_GAUGE}`);
  elementoValor.textContent = fmt(valor);
}

/* ── Indicadores de tendencia ───────────────────────────────── */

// Muestra si el valor subió (▲), bajó (▼) o se mantuvo estable (—)
function actualizarTendencia(elemento, actual, anterior) {
  if (anterior === null) {
    elemento.className = 'metric-trend flat';
    elemento.textContent = '— sin datos';
    return;
  }
  const diferencia = actual - anterior;
  if (Math.abs(diferencia) < 0.3) {
    elemento.className = 'metric-trend flat';
    elemento.textContent = '— estable';
  } else if (diferencia > 0) {
    elemento.className = 'metric-trend up';
    elemento.textContent = `▲ +${diferencia.toFixed(1)}`;
  } else {
    elemento.className = 'metric-trend down';
    elemento.textContent = `▼ ${diferencia.toFixed(1)}`;
  }
}

/* ── Lógica de alertas ──────────────────────────────────────── */

// Evalúa los tres valores y actualiza los textos de alerta y el badge de estado
function actualizarAlertas(T, H, S) {

  // Alerta de riego según humedad del suelo
  if (S < 25)
    dom.alertRiego.textContent = `¡Regar ahora! Suelo muy seco (${fmt(S,0)}%)`;
  else if (S < 45)
    dom.alertRiego.textContent = `Riego recomendado pronto (${fmt(S,0)}%)`;
  else if (S > 85)
    dom.alertRiego.textContent = `Suelo saturado — pausa de riego (${fmt(S,0)}%)`;
  else
    dom.alertRiego.textContent = `Humedad óptima (${fmt(S,0)}%)`;

  // Alerta de estrés hídrico (combinación de suelo seco + calor + aire seco)
  if (S < 25 && T > 32 && H < 35)
    dom.alertEstres.textContent = 'Alto — suelo seco + calor + aire seco';
  else if (S < 35 || T > 38)
    dom.alertEstres.textContent = 'Moderado — revisar condiciones';
  else
    dom.alertEstres.textContent = 'Bajo — condiciones estables';

  // Alerta de hongos (suelo saturado + aire muy húmedo = condición ideal para hongos)
  if (S > 80 && H > 75)
    dom.alertHongos.textContent = 'Alto — suelo saturado + aire húmedo';
  else if (H > 80)
    dom.alertHongos.textContent = 'Moderado — humedad ambiental elevada';
  else
    dom.alertHongos.textContent = 'Bajo — condiciones normales';

  // Badge de estado general de la planta (verde/amarillo/rojo)
  if (S < 25 && T > 32) {
    dom.badgePlanta.className = 'plant-status-pill danger';
    dom.badgePlanta.innerHTML = '<span>⚠</span> En riesgo';
  } else if (S < 40 || T > 35 || S > 85) {
    dom.badgePlanta.className = 'plant-status-pill warning';
    dom.badgePlanta.innerHTML = '<span>◉</span> Atención';
  } else {
    dom.badgePlanta.className = 'plant-status-pill optimal';
    dom.badgePlanta.innerHTML = '<span>✓</span> Óptimo';
  }
}

/* ── Textos descriptivos de cada métrica ───────────────────── */

// Describe el estado de la temperatura en palabras
function descripcionTemp(T) {
  if (T < 10) return '❄ Frío extremo';
  if (T < 18) return '🌿 Fresco';
  if (T < 26) return '✓ Temperatura ideal';
  if (T < 33) return '☀ Cálido';
  return '🔥 Muy caliente';
}

// Describe el estado de la humedad del aire
function descripcionHumedad(H) {
  if (H < 25) return '⚠ Aire muy seco';
  if (H < 45) return '🌬 Aire seco';
  if (H < 65) return '✓ Confort normal';
  return '💧 Aire húmedo';
}

// Describe el estado de la humedad del suelo
function descripcionSuelo(S) {
  if (S < 25) return '⚠ Suelo muy seco';
  if (S < 45) return '🌱 Suelo seco';
  if (S < 70) return '✓ Óptimo';
  return '💦 Suelo saturado';
}

/* ── Gráfica histórica ──────────────────────────────────────── */

// Inicializa la gráfica de líneas con Chart.js
function inicializarGrafica() {
  const ctx = document.getElementById('hist-chart').getContext('2d');
  estado.grafica = new Chart(ctx, {
    type: 'line',
    data: {
      labels: estado.graficaHoras,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: estado.graficaTemp,
          borderColor: '#d94040',
          backgroundColor: 'rgba(217,64,64,0.07)',
          tension: 0.45,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: true,
        },
        {
          label: 'Humedad aire (%)',
          data: estado.graficaHum,
          borderColor: '#1a85c8',
          backgroundColor: 'rgba(26,133,200,0.07)',
          tension: 0.45,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: true,
        },
        {
          label: 'Humedad suelo (%)',
          data: estado.graficaSuelo,
          borderColor: '#b06a2e',
          backgroundColor: 'rgba(176,106,46,0.07)',
          tension: 0.45,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: true,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#122019',
          borderColor: 'rgba(45,145,73,0.3)',
          borderWidth: 1,
          titleColor: '#8baf96',
          bodyColor: '#e8f5ec',
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#5a7a63',
            font: { size: 10, family: "'Space Mono', monospace" },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8
          },
          grid: { color: 'rgba(45,145,73,0.08)' },
          border: { color: 'rgba(45,145,73,0.15)' }
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: '#5a7a63',
            font: { size: 10, family: "'Space Mono', monospace" },
            callback: v => v + '%'
          },
          grid: { color: 'rgba(45,145,73,0.08)' },
          border: { color: 'rgba(45,145,73,0.15)' }
        }
      }
    }
  });
}

// Agrega un nuevo punto a la gráfica y elimina el más antiguo si supera el límite
function agregarPuntoGrafica(T, H, S) {
  const etiqueta = new Date().toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  estado.graficaHoras.push(etiqueta);
  estado.graficaTemp.push(parseFloat(T.toFixed(1)));
  estado.graficaHum.push(parseFloat(H.toFixed(1)));
  estado.graficaSuelo.push(parseFloat(S.toFixed(0)));

  // Mantener solo los últimos MAX_PUNTOS_GRAFICA puntos
  if (estado.graficaHoras.length > MAX_PUNTOS_GRAFICA) {
    estado.graficaHoras.shift();
    estado.graficaTemp.shift();
    estado.graficaHum.shift();
    estado.graficaSuelo.shift();
  }
  estado.grafica.update('active');
}

/* ── Tiempo con suelo seco ──────────────────────────────────── */

// Umbral de suelo seco: por debajo de este valor se considera "seco"
// Ajústalo según la calibración de tu sensor resistivo
const UMBRAL_SUELO_SECO = 25;

// Se llama en cada lectura. Actualiza el cronómetro de suelo seco.
function actualizarTiempoSeco(S, ahora) {
  const estaSeco = S < UMBRAL_SUELO_SECO;

  if (estaSeco) {
    // Si acaba de entrar en estado seco, registra el inicio
    if (estado.sueloSecoDesde === null) {
      estado.sueloSecoDesde = ahora;
    }
    // Calcular minutos acumulados: los ya guardados + los del período actual
    const msPeriodoActual = ahora - estado.sueloSecoDesde;
    const minutosPeriodo  = Math.floor(msPeriodoActual / 60000);
    const totalMostrar    = estado.minutosSecoAcumulados + minutosPeriodo;

    dom.statMinSeco.textContent    = totalMostrar;
    dom.statSecoEstado.textContent = `⚠ Suelo seco desde hace ${totalMostrar} min`;
    dom.statMinSeco.style.color    = totalMostrar > 60 ? '#f08080' : 'var(--amber-400)';
  } else {
    // Suelo ya no está seco: acumula el período anterior y reinicia el cronómetro
    if (estado.sueloSecoDesde !== null) {
      const msPeriodo = ahora - estado.sueloSecoDesde;
      estado.minutosSecoAcumulados += Math.floor(msPeriodo / 60000);
      estado.sueloSecoDesde = null;
    }
    dom.statMinSeco.textContent    = estado.minutosSecoAcumulados;
    dom.statSecoEstado.textContent = estado.minutosSecoAcumulados > 0
      ? `Suelo normal ahora (acumulado: ${estado.minutosSecoAcumulados} min secos)`
      : 'Suelo en nivel normal';
    dom.statMinSeco.style.color    = 'var(--text-primary)';
  }
}

/* ── Contador de riegos detectados ─────────────────────────── */

// Salto mínimo de humedad de suelo en una sola lectura para considerarlo un riego.
// Con sensor resistivo barato puede haber ruido, por eso el umbral es alto (20 puntos).
const SALTO_RIEGO = 20;

// Se llama en cada lectura. Detecta si hubo un riego comparando con la lectura anterior.
function detectarRiego(S, sueloAnterior) {
  if (sueloAnterior === null) return; // primera lectura, sin referencia
  const salto = S - sueloAnterior;
  if (salto >= SALTO_RIEGO) {
    estado.contadorRiegos++;
    estado.ultimoRiegoHora = horaActual();
    // Reiniciar el contador de tiempo seco porque se regó
    estado.minutosSecoAcumulados = 0;
    estado.sueloSecoDesde        = null;
    logMQTT(`💧 Riego detectado #${estado.contadorRiegos} — suelo subió +${salto.toFixed(0)}%`, 'ok');
  }
  dom.statRiegos.textContent      = estado.contadorRiegos;
  dom.statUltimoRiego.textContent = estado.ultimoRiegoHora
    ? `Último riego: ${estado.ultimoRiegoHora}`
    : 'Sin riegos detectados aún';
}

/* ── Mínimos y máximos del día ──────────────────────────────── */

// Revisa si cambió el día y reinicia los registros si es necesario
function verificarResetDiario() {
  const hoy = new Date().toDateString();
  if (estado.minmax.diaActual !== hoy) {
    estado.minmax = {
      tempMin:   null,
      tempMax:   null,
      humMin:    null,
      humMax:    null,
      diaActual: hoy,
    };
    logMQTT('📊 Nuevo día — mín/máx reiniciados', 'ok');
  }
}

// Actualiza los registros de mín/máx con los valores actuales
function actualizarMinMax(T, H) {
  verificarResetDiario();
  const mm  = estado.minmax;
  const hora = horaActual();

  // Temperatura mínima
  if (mm.tempMin === null || T < mm.tempMin.valor)
    mm.tempMin = { valor: T, hora };
  // Temperatura máxima
  if (mm.tempMax === null || T > mm.tempMax.valor)
    mm.tempMax = { valor: T, hora };
  // Humedad mínima
  if (mm.humMin === null || H < mm.humMin.valor)
    mm.humMin = { valor: H, hora };
  // Humedad máxima
  if (mm.humMax === null || H > mm.humMax.valor)
    mm.humMax = { valor: H, hora };

  // Actualizar DOM
  dom.statTempMin.childNodes[0].textContent = `${fmt(mm.tempMin.valor)} °C `;
  dom.statTempMinHora.textContent           = `@ ${mm.tempMin.hora}`;
  dom.statTempMax.childNodes[0].textContent = `${fmt(mm.tempMax.valor)} °C `;
  dom.statTempMaxHora.textContent           = `@ ${mm.tempMax.hora}`;
  dom.statHumMin.childNodes[0].textContent  = `${fmt(mm.humMin.valor)} % `;
  dom.statHumMinHora.textContent            = `@ ${mm.humMin.hora}`;
  dom.statHumMax.childNodes[0].textContent  = `${fmt(mm.humMax.valor)} % `;
  dom.statHumMaxHora.textContent            = `@ ${mm.humMax.hora}`;

  // Mostrar la fecha del día actual en la tarjeta
  dom.statMinMaxReset.textContent = `Datos del ${new Date().toLocaleDateString('es-CO', { day:'numeric', month:'long' })} · se reinicia a medianoche`;
}

/* ── Actualización principal del dashboard ──────────────────── */

// Esta función recibe los tres valores y actualiza TODA la interfaz
function actualizarDashboard(T, H, S) {
  const calor = calcularIndiceCalor(T, H);
  const rocio = calcularPuntoRocio(T, H);

  // Guardar valores anteriores para calcular tendencias
  estado.tempAnterior  = estado.temperatura;
  estado.humAnterior   = estado.humedad;
  estado.sueloAnterior = estado.suelo;

  // Actualizar estado actual
  estado.temperatura = T;
  estado.humedad     = H;
  estado.suelo       = S;

  // Actualizar tarjetas de métricas
  dom.valTemp.textContent  = fmt(T);
  dom.valHum.textContent   = fmt(H);
  dom.valSuelo.textContent = fmt(S, 0);
  dom.valCalor.textContent = fmt(calor);
  dom.valRocio.textContent = fmt(rocio);
  dom.valHora.textContent  = horaActual();
  dom.valFecha.textContent = fechaActual();

  // Actualizar subtítulos descriptivos
  dom.subTemp.textContent  = descripcionTemp(T);
  dom.subHum.textContent   = descripcionHumedad(H);
  dom.subSuelo.textContent = descripcionSuelo(S);

  // Actualizar flechas de tendencia
  actualizarTendencia(dom.tendTemp,  T, estado.tempAnterior);
  actualizarTendencia(dom.tendHum,   H, estado.humAnterior);
  actualizarTendencia(dom.tendSuelo, S, estado.sueloAnterior);

  // Actualizar gauges semicirculares
  actualizarGauge(dom.gaugeTemp,  dom.gaugeValTemp,  T, 0, 50);
  actualizarGauge(dom.gaugeHum,   dom.gaugeValHum,   H, 0, 100);
  actualizarGauge(dom.gaugeSuelo, dom.gaugeValSuelo, S, 0, 100);

  // Actualizar alertas y badge de estado
  actualizarAlertas(T, H, S);

  // Actualizar estadísticas de seguimiento
  const ahora = new Date();
  detectarRiego(S, estado.sueloAnterior);   // primero detectar riego (puede reiniciar contador seco)
  actualizarTiempoSeco(S, ahora);            // luego actualizar cronómetro
  actualizarMinMax(T, H);                    // mínimos y máximos del día

  // Agregar punto a la gráfica histórica
  agregarPuntoGrafica(T, H, S);

  // Actualizar hora de última lectura en la barra superior
  dom.ultimaLect.textContent = 'Última lectura: ' + horaActual();
}

/* ── Log de actividad MQTT ──────────────────────────────────── */

// Agrega una línea al log de actividad MQTT con la hora actual
function logMQTT(mensaje, tipo = '') {
  const entrada = document.createElement('div');
  entrada.className = 'log-entry ' + tipo;
  entrada.innerHTML = `<span class="ts">[${horaActual()}]</span>${mensaje}`;
  dom.mqttLog.appendChild(entrada);
  dom.mqttLog.scrollTop = dom.mqttLog.scrollHeight;
  // Mantener máximo 50 entradas en el log
  if (dom.mqttLog.children.length > 50)
    dom.mqttLog.removeChild(dom.mqttLog.firstChild);
}

/* ── Conexión MQTT ──────────────────────────────────────────── */

// Conecta al broker MQTT y suscribe al topic donde el ESP32 publica datos
function conectarMQTT() {
  dom.mqttBroker.textContent = MQTT_CONFIG.brokerUrl;
  dom.mqttClient.textContent = MQTT_CONFIG.clientId;

  logMQTT('Conectando a ' + MQTT_CONFIG.brokerUrl + '...');

  try {
    // Crear cliente MQTT usando WebSocket
    estado.clienteMQTT = mqtt.connect(MQTT_CONFIG.brokerUrl, {
      clientId:        MQTT_CONFIG.clientId,
      reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
      connectTimeout:  MQTT_CONFIG.connectTimeout,
    });
  } catch (e) {
    logMQTT('Error al inicializar MQTT: ' + e.message, 'err');
    return;
  }

  // Cuando se conecta exitosamente
  estado.clienteMQTT.on('connect', () => {
    dom.puntoCon.classList.add('online');
    dom.textoCon.textContent = 'Conectado';
    logMQTT('Conexión exitosa al broker', 'ok');

    // Suscribirse al topic donde el ESP32 publica datos
    estado.clienteMQTT.subscribe(MQTT_CONFIG.topics.datos);
    logMQTT('Suscrito → ' + MQTT_CONFIG.topics.datos, 'ok');
  });

  // Cuando ocurre un error de conexión
  estado.clienteMQTT.on('error', err => {
    dom.puntoCon.classList.remove('online');
    dom.textoCon.textContent = 'Error';
    logMQTT('Error: ' + (err.message || err), 'err');
  });

  // Cuando se pierde la conexión
  estado.clienteMQTT.on('offline', () => {
    dom.puntoCon.classList.remove('online');
    dom.textoCon.textContent = 'Reconectando...';
    logMQTT('Sin conexión — reintentando...', 'err');
  });

  // Cuando intenta reconectarse
  estado.clienteMQTT.on('reconnect', () => {
    logMQTT('Intentando reconexión...');
  });

  // Cuando llega un mensaje del ESP32
  estado.clienteMQTT.on('message', (topic, mensaje) => {
    const texto = mensaje.toString().trim();
    logMQTT(`${topic} → ${texto}`, 'ok');

    // El ESP32 publica un JSON con los tres valores
    // Formato esperado: {"temperatura":28.5,"humedad":65,"suelo":42}
    try {
      const datos = JSON.parse(texto);
      const T = parseFloat(datos.temperatura ?? datos.temp ?? datos.t);
      const H = parseFloat(datos.humedad     ?? datos.hum  ?? datos.h);
      const S = parseFloat(datos.suelo       ?? datos.soil ?? datos.s);

      if (!isNaN(T) && !isNaN(H) && !isNaN(S)) {
        actualizarDashboard(T, H, S);
      } else {
        logMQTT('JSON recibido pero valores inválidos', 'err');
      }
    } catch (e) {
      logMQTT('Error al leer JSON: ' + e.message, 'err');
    }
  });
}

/* ── Modo demo (sin ESP32 conectado) ───────────────────────── */
// MODO DEMO DESACTIVADO — el dashboard solo se actualiza con datos reales del ESP32
// Para reactivarlo, quita los comentarios de bloque (/* ... */) de abajo
// y descomenta también el setTimeout al final del archivo.

/*
function iniciarDemo() {
  logMQTT('Modo demo activo — datos simulados cada 3s', 'ok');
  let t = 27, h = 60, s = 55;
  actualizarDashboard(t, h, s);
  setInterval(() => {
    // Variación aleatoria pequeña para simular cambios reales
    t = Math.min(45, Math.max(10, t + (Math.random() - 0.48) * 1.2));
    h = Math.min(99, Math.max(10, h + (Math.random() - 0.48) * 2));
    s = Math.min(99, Math.max(5,  s + (Math.random() - 0.48) * 1.5));
    actualizarDashboard(t, h, s);
    logMQTT(`[DEMO] temp=${t.toFixed(1)} hum=${h.toFixed(1)} suelo=${s.toFixed(0)}`, 'ok');
  }, 3000);
}
*/

/* ── Inicialización ─────────────────────────────────────────── */

// Cuando el HTML termina de cargar, inicializa la gráfica y conecta MQTT
document.addEventListener('DOMContentLoaded', () => {
  inicializarGrafica();
  conectarMQTT();

  // MODO DEMO DESACTIVADO — si quieres reactivarlo, descomenta el bloque de abajo
  // y descomenta también la función iniciarDemo() más arriba.
  /*
  // Si en 3.5 segundos no llegaron datos reales, activa el modo demo
  setTimeout(() => {
    if (estado.temperatura === null) {
      iniciarDemo();
    }
  }, 3500);
  */
});
