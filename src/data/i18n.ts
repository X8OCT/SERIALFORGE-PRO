import { AppLanguage } from '../types';

export interface Translations {
  title: string;
  badge: string;
  subtitle: string;
  presetLabel: string;
  portLabel: string;
  baudLabel: string;
  connectBtn: string;
  disconnectBtn: string;
  simulatorBadge: string;
  onlineBadge: string;
  offlineBadge: string;
  hitsLabel: string;
  speedLabel: string;
  csharpBtn: string;
  simBtn: string;
  
  // Section 1
  sec1Header: string;
  textMode: string;
  hexMode: string;
  macroLabel: string;
  inspectorLabel: string;
  
  // Section 2
  sec2Header: string;
  startLabel: string;
  endLabel: string;
  stepLabel: string;
  delayLabel: string;
  
  // Section 3
  sec3Header: string;
  stopOnMatch: string;
  matchModes: {
    contains: string;
    exact_hex: string;
    regex: string;
    any: string;
  };
  triggerHint: string;
  
  // Control buttons
  startBtn: string;
  pauseBtn: string;
  resumeBtn: string;
  stopBtn: string;
  probeBtn: string;
  
  // Hit Banner
  hitBannerTitle: string;
  copyBtn: string;
  copiedBtn: string;
  
  // Terminal
  terminalHeader: string;
  scriptWarning: string;
  autoScroll: string;
  clearBtn: string;
  messagesCount: string;
  
  // Hits Table
  hitsTableHeader: string;
  hitsCount: string;
  exportCsvBtn: string;
  colTime: string;
  colValue: string;
  colKeyHex: string;
  colSent: string;
  colResponse: string;
  noHitsYet: string;
  
  // Bottom Bar
  statusReady: string;
  statusRunning: string;
  statusPaused: string;
  statusFinished: string;
  statusHit: string;
  statusPortError: string;
}

export const I18N: Record<AppLanguage, Translations> = {
  ru: {
    title: 'SERIALFORGE PRO',
    badge: 'v2.0 // PROTOCOL FORGE',
    subtitle: 'ФРЕЙМВОРК АНАЛИЗА ПРОТОКОЛОВ И ПЕРЕБОРА UART',
    presetLabel: '📁 ПРЕСЕТ:',
    portLabel: 'PORT:',
    baudLabel: 'BAUD:',
    connectBtn: '⚡ ПОДКЛЮЧИТЬ',
    disconnectBtn: '❌ ОТКЛЮЧИТЬ',
    simulatorBadge: 'СИМУЛЯТОР',
    onlineBadge: 'ONLINE',
    offlineBadge: 'OFFLINE',
    hitsLabel: '🎯 HITS: ',
    speedLabel: '⚡ SPEED: ',
    csharpBtn: '💻 C# WPF Исходники',
    simBtn: '🔌 Настройки симулятора',

    sec1Header: '1. ВЕКТОР АТАКИ И ШАБЛОН (PAYLOAD)',
    textMode: 'ASCII/TEXT',
    hexMode: 'HEX BYTES',
    macroLabel: 'Вставка макросов:',
    inspectorLabel: 'ИНСПЕКТОР ТЕКУЩЕГО ПАКЕТА (PREVIEW):',

    sec2Header: '2. ДИАПАЗОН ПЕРЕБОРА И ТАЙМИНГ',
    startLabel: 'СТАРТ',
    endLabel: 'КОНЕЦ',
    stepLabel: 'ШАГ',
    delayLabel: 'ПАУЗА (МС)',

    sec3Header: '3. КРИТЕРИЙ ОСТАНОВКИ / ТРИГГЕР',
    stopOnMatch: 'ОСТАНОВИТЬ ПРИ СОВПАДЕНИИ ОТВЕТА (TRIGGER)',
    matchModes: {
      contains: 'Contains String',
      exact_hex: 'Exact HEX Bytes',
      regex: 'Regex Pattern',
      any: 'Any Response',
    },
    triggerHint: '⚡ При срабатывании условия сканер сохранит валидный ключ в таблицу и выведет баннер.',

    startBtn: '▶ СТАРТ',
    pauseBtn: '❚❚ ПАУЗА',
    resumeBtn: '▶ ПРОДОЛЖИТЬ',
    stopBtn: '■ СТОП',
    probeBtn: '⚡ ОТПРАВИТЬ ОДИН ТЕСТОВЫЙ ПАКЕТ (PROBE)',

    hitBannerTitle: '🎯 НАЙДЕНО СОВПАДЕНИЕ / VALID KEY!',
    copyBtn: '📋 Скопировать',
    copiedBtn: '✓ Скопировано',

    terminalHeader: 'ЖУРНАЛ ОБМЕНА ТРАФИКА (LIVE STREAM)',
    scriptWarning: '⚠️ Функция должна называться строго generatePacket(num)',
    autoScroll: 'Автопрокрутка',
    clearBtn: 'Очистить',
    messagesCount: 'сообщений',

    hitsTableHeader: 'ТАБЛИЦА СОВПАДЕНИЙ (CAPTURED HITS)',
    hitsCount: 'найдено',
    exportCsvBtn: '💾 Экспорт в CSV',
    colTime: 'Время',
    colValue: 'Значение',
    colKeyHex: 'HEX Ключа',
    colSent: 'Отправлено (TX)',
    colResponse: 'Ответ устройства (RX)',
    noHitsYet: 'Совпадений пока нет. Нажмите СТАРТ для запуска перебора.',

    statusReady: '[READY] Движок готов к работе. Подключите COM-порт и нажмите СТАРТ.',
    statusRunning: '[RUNNING] Идет перебор диапазона...',
    statusPaused: '[PAUSED] Перебор приостановлен.',
    statusFinished: '[FINISHED] Перебор диапазона успешно завершен.',
    statusHit: '[MATCH] 🎯 Найдено совпадение! Валидный ключ зафиксирован.',
    statusPortError: '[ERROR] Ошибка передачи данных по порту.',
  },
  ua: {
    title: 'SERIALFORGE PRO',
    badge: 'v2.0 // PROTOCOL FORGE',
    subtitle: 'ФРЕЙМВОРК ДЛЯ АНАЛІЗУ ПРОТОКОЛІВ ТА ПЕРЕБОРУ UART',
    presetLabel: '📁 ПРЕСЕТ:',
    portLabel: 'PORT:',
    baudLabel: 'BAUD:',
    connectBtn: '⚡ ПІДКЛЮЧИТИ',
    disconnectBtn: '❌ ВІДКЛЮЧИТИ',
    simulatorBadge: 'СИМУЛЯТОР',
    onlineBadge: 'ONLINE',
    offlineBadge: 'OFFLINE',
    hitsLabel: '🎯 ЗБІГИ: ',
    speedLabel: '⚡ ШВИДКІСТЬ: ',
    csharpBtn: '💻 C# WPF Код',
    simBtn: '🔌 Налаштування симулятора',

    sec1Header: '1. ВЕКТОР АТАКИ ТА ШАБЛОН (PAYLOAD)',
    textMode: 'ASCII/TEXT',
    hexMode: 'HEX BYTES',
    macroLabel: 'Вставка макросів:',
    inspectorLabel: 'ІНСПЕКТОР ПОТОЧНОГО ПАКЕТА (PREVIEW):',

    sec2Header: '2. ДІАПАЗОН ПЕРЕБОРУ ТА ТАЙМІНГ',
    startLabel: 'СТАРТ',
    endLabel: 'КІНЕЦЬ',
    stepLabel: 'КРОК',
    delayLabel: 'ПАУЗА (МС)',

    sec3Header: '3. КРИТЕРІЙ ЗУПИНКИ / ТРИГЕР',
    stopOnMatch: 'ЗУПИНИТИ ПРИ ЗБІГУ ВІДПОВІДІ (TRIGGER)',
    matchModes: {
      contains: 'Contains String',
      exact_hex: 'Exact HEX Bytes',
      regex: 'Regex Pattern',
      any: 'Any Response',
    },
    triggerHint: '⚡ При спрацьовуванні умови сканер збереже валідний ключ у таблицю і виведе банер.',

    startBtn: '▶ СТАРТ',
    pauseBtn: '❚❚ ПАУЗА',
    resumeBtn: '▶ ПРОДОВЖИТИ',
    stopBtn: '■ СТОП',
    probeBtn: '⚡ НАДІСЛАТИ ОДИН ТЕСТОВИЙ ПАКЕТ (PROBE)',

    hitBannerTitle: '🎯 ЗНАЙДЕНО ЗБІГ / VALID KEY!',
    copyBtn: '📋 Скопіювати',
    copiedBtn: '✓ Скопійовано',

    terminalHeader: 'ЖУРНАЛ ОБМІНУ ТРАФІКОМ (LIVE STREAM)',
    scriptWarning: '⚠️ Функція повинна називатися суворо generatePacket(num)',
    autoScroll: 'Автопрокрутка',
    clearBtn: 'Очистити',
    messagesCount: 'повідомлень',

    hitsTableHeader: 'ТАБЛИЦЯ ЗБІГІВ (CAPTURED HITS)',
    hitsCount: 'знайдено',
    exportCsvBtn: '💾 Експорт в CSV',
    colTime: 'Час',
    colValue: 'Значення',
    colKeyHex: 'HEX Ключа',
    colSent: 'Надіслано (TX)',
    colResponse: 'Відповідь пристрою (RX)',
    noHitsYet: 'Збігів поки немає. Натисніть СТАРТ для запуску перебору.',

    statusReady: '[READY] Двигун готовий до роботи. Підключіть COM-порт та натисніть СТАРТ.',
    statusRunning: '[RUNNING] Йде перебір діапазону...',
    statusPaused: '[PAUSED] Перебір призупинено.',
    statusFinished: '[FINISHED] Перебір діапазону успішно завершено.',
    statusHit: '[MATCH] 🎯 Знайдено збіг! Валідний ключ зафіксовано.',
    statusPortError: '[ERROR] Помилка передачі даних по порту.',
  },
  en: {
    title: 'SERIALFORGE PRO',
    badge: 'v2.0 // PROTOCOL FORGE',
    subtitle: 'HARDWARE PROTOCOL & UART BRUTE-FORCE FRAMEWORK',
    presetLabel: '📁 PRESET:',
    portLabel: 'PORT:',
    baudLabel: 'BAUD:',
    connectBtn: '⚡ CONNECT',
    disconnectBtn: '❌ DISCONNECT',
    simulatorBadge: 'SIMULATOR',
    onlineBadge: 'ONLINE',
    offlineBadge: 'OFFLINE',
    hitsLabel: '🎯 HITS: ',
    speedLabel: '⚡ SPEED: ',
    csharpBtn: '💻 C# WPF Sources',
    simBtn: '🔌 Simulator Settings',

    sec1Header: '1. ATTACK VECTOR & TEMPLATE (PAYLOAD)',
    textMode: 'ASCII/TEXT',
    hexMode: 'HEX BYTES',
    macroLabel: 'Insert Macros:',
    inspectorLabel: 'CURRENT PACKET INSPECTOR (PREVIEW):',

    sec2Header: '2. SEQUENCE RANGE & TIMING',
    startLabel: 'START',
    endLabel: 'END',
    stepLabel: 'STEP',
    delayLabel: 'DELAY (MS)',

    sec3Header: '3. STOP CRITERIA & MATCH TRIGGER',
    stopOnMatch: 'STOP ON RESPONSE MATCH (TRIGGER)',
    matchModes: {
      contains: 'Contains String',
      exact_hex: 'Exact HEX Bytes',
      regex: 'Regex Pattern',
      any: 'Any Response',
    },
    triggerHint: '⚡ When trigger conditions are met, the scanner records the valid key and presents the match banner.',

    startBtn: '▶ START',
    pauseBtn: '❚❚ PAUSE',
    resumeBtn: '▶ RESUME',
    stopBtn: '■ STOP',
    probeBtn: '⚡ SEND SINGLE PROBE PACKET',

    hitBannerTitle: '🎯 MATCH CAPTURED / VALID KEY FOUND!',
    copyBtn: '📋 Copy Key',
    copiedBtn: '✓ Copied',

    terminalHeader: 'TRAFFIC EXCHANGE STREAM (LIVE)',
    scriptWarning: '⚠️ The function must be strictly named generatePacket(num)',
    autoScroll: 'Auto-scroll',
    clearBtn: 'Clear',
    messagesCount: 'messages',

    hitsTableHeader: 'CAPTURED HITS TABLE',
    hitsCount: 'found',
    exportCsvBtn: '💾 Export CSV',
    colTime: 'Time',
    colValue: 'Value',
    colKeyHex: 'Key HEX',
    colSent: 'Sent (TX)',
    colResponse: 'Device Response (RX)',
    noHitsYet: 'No matches captured yet. Press START to begin the attack sequence.',

    statusReady: '[READY] Engine initialized. Connect a COM port and press START.',
    statusRunning: '[RUNNING] Sequence sweep in progress...',
    statusPaused: '[PAUSED] Sequence paused.',
    statusFinished: '[FINISHED] Sequence range scan completed.',
    statusHit: '[MATCH] 🎯 Match captured! Valid key has been recorded.',
    statusPortError: '[ERROR] Port transmission failure.',
  },
};
