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
    script: string;
  };
  triggerHint: string;

  // Controls
  startBtn: string;
  pauseBtn: string;
  resumeBtn: string;
  stopBtn: string;
  probeBtn: string;

  // Hits
  hitBannerTitle: string;
  copyBtn: string;
  copiedBtn: string;

  // Terminal
  terminalHeader: string;
  scriptWarning: string;
  autoScroll: string;
  clearBtn: string;
  messagesCount: string;

  // Table
  hitsTableHeader: string;
  hitsCount: string;
  exportCsvBtn: string;
  colTime: string;
  colValue: string;
  colKeyHex: string;
  colSent: string;
  colResponse: string;
  noHitsYet: string;

  // Status
  statusReady: string;
  statusRunning: string;
  statusPaused: string;
  statusFinished: string;
  statusHit: string;
  statusPortError: string;

  // Manual Sender
  manualSendHeader: string;
  bytesLabel: string;
  sendBtn: string;
  calcCrc: string;
  appendCrc: string;
  history: string;

  // Port Config Modal
  portConfigTitle: string;
  portConfigDesc: string;
  baudRateLabel: string;
  dataBitsLabel: string;
  stopBitsLabel: string;
  parityLabel: string;
  flowControlLabel: string;
  bufferSizeLabel: string;
  disconnectPortBtn: string;
  selectPortBtn: string;
  virtualSimBtn: string;
  closeBtn: string;

  // Simulator Config Modal
  simConfigTitle: string;
  simConfigDesc: string;
  secretKeyLabel: string;
  randomizeBtn: string;
  simLatencyLabel: string;
  simProtoLabel: string;
  stopSimBtn: string;
  startSimBtn: string;

  // C# Modal
  csharpTitle: string;
  csharpDesc: string;
  setupGuideTab: string;
  oneLineRun: string;
  copyPathBtn: string;
  csharpFilesLocated: string;
  csharpGuideX1: string;
  csharpGuideX2: string;
  csharpGuideX3: string;

  // Bottom Bar
  ideation: string;
  code: string;

  // System logs
  sysSimConnected: string;
  sysUsbConnected: string;
  sysPortDisconnected: string;
  sysPresetLoaded: string;
  sysRangeDone: string;
  sysScanPaused: string;
  sysScanResumed: string;
  errNoWebSerial: string;
  errPortNotConnected: string;
  errPortNotWritable: string;
}

export const I18N: Record<AppLanguage, Translations> = {
  ru: {
    title: 'SERIALFORGE PRO',
    badge: 'v2.0 // PROTOCOL FORGE',
    subtitle: 'ФРЕЙМВОРК ДЛЯ АНАЛИЗА ПРОТОКОЛОВ И ПЕРЕБОРА UART',
    presetLabel: '📁 ПРЕСЕТ:',
    portLabel: 'PORT:',
    baudLabel: 'BAUD:',
    connectBtn: '⚡ ПОДКЛЮЧИТЬ',
    disconnectBtn: '❌ ОТКЛЮЧИТЬ',
    simulatorBadge: 'СИМУЛЯТОР',
    onlineBadge: 'ONLINE',
    offlineBadge: 'OFFLINE',
    hitsLabel: '🎯 СОВПАДЕНИЯ: ',
    speedLabel: '⚡ СКОРОСТЬ: ',
    csharpBtn: '💻 C# WPF Код',
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
      script: 'Custom Script',
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

    manualSendHeader: 'Ручная отправка пакета (Direct HEX Send)',
    bytesLabel: 'байт',
    sendBtn: 'ОТПРАВИТЬ',
    calcCrc: 'Вычислить CRC:',
    appendCrc: 'Прикрепить CRC в конец',
    history: 'История:',

    portConfigTitle: 'Конфигурация COM-порта',
    portConfigDesc: 'Параметры UART / RS-232 / RS-485',
    baudRateLabel: 'Скорость передачи (Baudrate)',
    dataBitsLabel: 'Биты данных',
    stopBitsLabel: 'Стоп-биты',
    parityLabel: 'Четность (Parity)',
    flowControlLabel: 'Управление потоком',
    bufferSizeLabel: 'Размер буфера (Rx/Tx bytes)',
    disconnectPortBtn: 'Отключить порт',
    selectPortBtn: 'Выбрать USB/COM',
    virtualSimBtn: 'Тест в симуляторе',
    closeBtn: 'Закрыть',

    simConfigTitle: 'Виртуальный симулятор COM-устройства',
    simConfigDesc: 'Эмуляция платы микроконтроллера для тестирования без проводов',
    secretKeyLabel: 'Секретный код / Пароль в памяти платы:',
    randomizeBtn: 'Случайный',
    simLatencyLabel: 'Задержка ответа платы (мс)',
    simProtoLabel: 'Тип имитируемого протокола',
    stopSimBtn: 'Остановить симулятор',
    startSimBtn: 'Подключить симулятор',

    csharpTitle: 'Исходный код для C# .NET 8 (WPF)',
    csharpDesc: 'Нативное приложение Windows для прямого доступа к COM-портам',
    setupGuideTab: 'Инструкция по запуску',
    oneLineRun: 'Команды для быстрой сборки одной строкой:',
    copyPathBtn: 'Скопировать путь',
    csharpFilesLocated: 'Файлы сохранены в репозитории проекта',
    csharpGuideX1: 'Файл верстки интерфейса MainWindow.xaml находится в папке /csharp_wpf/. Он содержит готовую разметку DataGrid, темную палитру, кастомные скролбари, поля ввода параметров протоколу и кнопки управления.',
    csharpGuideX2: 'Файл логики перебора MainWindow.xaml.cs реализует надежную асинхронную работу с SerialPort, подсчет контрольных сумм CRC16 Modbus / CRC8 / Sum-8 / XOR, ведение журнала передачи и авто-детектирование ответа контроллера.',
    csharpGuideX3: 'csharp_wpf/MainWindow.xaml content available in /csharp_wpf/MainWindow.xaml',

    ideation: 'Идея:',
    code: 'Код:',

    sysSimConnected: 'Виртуальный симулятор COM-порта подключен.',
    sysUsbConnected: 'Физический USB-UART порт успешно открыт.',
    sysPortDisconnected: 'Порт отключен.',
    sysPresetLoaded: 'Загружен пресет:',
    sysRangeDone: 'Перебор диапазона завершен.',
    sysScanPaused: 'Перебор приостановлен.',
    sysScanResumed: 'Перебор возобновлен.',
    errNoWebSerial: 'Web Serial API не поддерживается вашим браузером. Используйте Chrome/Edge/Opera или встроенный симулятор.',
    errPortNotConnected: 'Порт не подключен.',
    errPortNotWritable: 'Порт недоступен для записи.',
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
      script: 'Custom Script',
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

    manualSendHeader: 'Ручне відправлення пакета (Direct HEX Send)',
    bytesLabel: 'байт',
    sendBtn: 'ВІДПРАВИТИ',
    calcCrc: 'Обчислити CRC:',
    appendCrc: 'Прикріпити CRC в кінець',
    history: 'Історія:',

    portConfigTitle: 'Конфігурація COM-порту',
    portConfigDesc: 'Параметри UART / RS-232 / RS-485',
    baudRateLabel: 'Швидкість передачі (Baudrate)',
    dataBitsLabel: 'Біти даних',
    stopBitsLabel: 'Стоп-біти',
    parityLabel: 'Парність (Parity)',
    flowControlLabel: 'Керування потоком',
    bufferSizeLabel: 'Розмір буфера (Rx/Tx bytes)',
    disconnectPortBtn: 'Відключити порт',
    selectPortBtn: 'Вибрати USB/COM',
    virtualSimBtn: 'Тест у симуляторі',
    closeBtn: 'Закрити',

    simConfigTitle: 'Віртуальний симулятор COM-пристрою',
    simConfigDesc: 'Емуляція плати мікроконтролера для тестування без дротів',
    secretKeyLabel: "Секретний код / Пароль у пам'яті плати:",
    randomizeBtn: 'Випадковий',
    simLatencyLabel: 'Затримка відповіді плати (мс)',
    simProtoLabel: 'Тип протоколу симуляції',
    stopSimBtn: 'Зупинити симулятор',
    startSimBtn: 'Підключити симулятор',

    csharpTitle: 'Вихідний код для C# .NET 8 (WPF)',
    csharpDesc: 'Нативний додаток Windows для прямого доступу до COM-портів',
    setupGuideTab: 'Інструкція з запуску',
    oneLineRun: 'Команди для швидкої збірки одним рядком:',
    copyPathBtn: 'Скопіювати шлях',
    csharpFilesLocated: 'Файли збережено в репозиторії проекту',
    csharpGuideX1: 'Файл верстки інтерфейсу MainWindow.xaml знаходиться в папці /csharp_wpf/. Він містить готову розмітку DataGrid, темну палітру, кастомні скролбари, поля вводу параметрів протоколу та кнопки керування.',
    csharpGuideX2: 'Файл логіки перебору MainWindow.xaml.cs реалізує надійну асинхронну роботу з SerialPort, підрахунок контрольних сум CRC16 Modbus / CRC8 / Sum-8 / XOR, ведення журналу передачі та авто-визначення відповіді контролера.',
    csharpGuideX3: 'csharp_wpf/MainWindow.xaml content available in /csharp_wpf/MainWindow.xaml',

    ideation: 'Ідея:',
    code: 'Код:',

    sysSimConnected: 'Віртуальний симулятор COM-порту підключено.',
    sysUsbConnected: 'Фізичний USB-UART порт успішно відкрито.',
    sysPortDisconnected: 'Порт відключено.',
    sysPresetLoaded: 'Завантажено пресет:',
    sysRangeDone: 'Перебір діапазону завершено.',
    sysScanPaused: 'Перебір призупинено.',
    sysScanResumed: 'Перебір відновлено.',
    errNoWebSerial: 'Web Serial API не підтримується вашим браузером. Використовуйте Chrome/Edge/Opera або вбудований симулятор.',
    errPortNotConnected: 'Порт не підключено.',
    errPortNotWritable: 'Порт недоступний для запису.',
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
      script: 'Custom Script',
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

    manualSendHeader: 'Manual Direct Packet Transmitter',
    bytesLabel: 'bytes',
    sendBtn: 'SEND',
    calcCrc: 'Calc CRC:',
    appendCrc: 'Append CRC',
    history: 'History:',

    portConfigTitle: 'Serial Port Settings',
    portConfigDesc: 'UART / RS-232 / RS-485 physical parameters',
    baudRateLabel: 'Baud Rate (bps)',
    dataBitsLabel: 'Data Bits',
    stopBitsLabel: 'Stop Bits',
    parityLabel: 'Parity',
    flowControlLabel: 'Flow Control',
    bufferSizeLabel: 'Buffer Size (bytes)',
    disconnectPortBtn: 'Disconnect Port',
    selectPortBtn: 'Select Serial Port',
    virtualSimBtn: 'Virtual Simulator',
    closeBtn: 'Close',

    simConfigTitle: 'Virtual Hardware Simulator',
    simConfigDesc: 'Emulates target hardware controller with secret password',
    secretKeyLabel: 'Hardware Target Secret Key:',
    randomizeBtn: 'Randomize',
    simLatencyLabel: 'Target Response Latency (ms)',
    simProtoLabel: 'Simulated Response Format',
    stopSimBtn: 'Stop Simulator',
    startSimBtn: 'Start Simulator',

    csharpTitle: 'C# .NET 8 WPF Desktop Application',
    csharpDesc: 'Native Windows GUI tool for direct hardware COM/UART communication',
    setupGuideTab: 'Setup Guide',
    oneLineRun: 'Quick One-Line Run:',
    copyPathBtn: 'Copy Path',
    csharpFilesLocated: 'Files are located in /csharp_wpf/',
    csharpGuideX1: 'The complete WPF XAML UI file is available in the /csharp_wpf/ folder with full dark-mode styling, responsive DataGrid, and packet controls.',
    csharpGuideX2: 'MainWindow.xaml.cs includes multithreaded serial port engine, hardware CRC calculation, log dispatching, and response pattern matching.',
    csharpGuideX3: 'csharp_wpf/MainWindow.xaml content available in /csharp_wpf/MainWindow.xaml',

    ideation: 'Ideation:',
    code: 'Code:',

    sysSimConnected: 'Virtual COM port simulator connected.',
    sysUsbConnected: 'Physical USB-UART port opened successfully.',
    sysPortDisconnected: 'Port disconnected.',
    sysPresetLoaded: 'Preset loaded:',
    sysRangeDone: 'Range scan completed.',
    sysScanPaused: 'Scan paused.',
    sysScanResumed: 'Scan resumed.',
    errNoWebSerial: 'Web Serial API is not supported by your browser. Use Chrome/Edge/Opera or the built-in simulator.',
    errPortNotConnected: 'Port is not connected.',
    errPortNotWritable: 'Port is not writable.',
  },
};
