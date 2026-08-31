using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.IO.Ports;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace SerialForgeWpf
{
    public class HitItem
    {
        public string Time { get; set; } = "";
        public int KeyNum { get; set; }
        public string KeyHex { get; set; } = "";
        public string Sent { get; set; } = "";
        public string Response { get; set; } = "";
    }

    public enum AppLanguage
    {
        RU,
        UA,
        EN
    }

    public class AppSettings
    {
        public string Language { get; set; } = "RU";
        public string SelectedPort { get; set; } = "";
        public int SelectedBaud { get; set; } = 115200;
        public int SelectedPresetIndex { get; set; } = 0;
        public bool IsHexMode { get; set; } = false;
        public string Template { get; set; } = "PIN:{DEC:4}\\r\\n";
        public string StartNum { get; set; } = "0";
        public string EndNum { get; set; } = "9999";
        public string Step { get; set; } = "1";
        public string DelayMs { get; set; } = "25";
        public int LastSavedKeyNum { get; set; } = 0;
        public bool StopOnMatch { get; set; } = true;
        public int MatchModeIndex { get; set; } = 0;
        public string StopPattern { get; set; } = "ACCESS_GRANTED|OK|SUCCESS";
        public bool AutoScroll { get; set; } = true;
    }

    public partial class MainWindow : Window
    {
        private bool _isUiReady = false;
        private bool _isLoadingSettings = false;
        private AppLanguage _currentLang = AppLanguage.RU;

        private SerialPort? _port;
        private CancellationTokenSource? _cts;
        private bool _isRunning = false;
        private bool _isPaused = false;
        private int _currentNum = 0;
        private int _lastSentNum = 0;
        private string _lastSentPacketStr = "";
        private int _totalSentCount = 0;
        private int _speedCounter = 0;
        private System.Windows.Threading.DispatcherTimer? _hwTelemetryTimer;

        // CPU & RAM Telemetry trackers
        private Process? _currentProcess;
        private DateTime _lastCpuTime = DateTime.UtcNow;
        private TimeSpan _lastTotalProcessorTime = TimeSpan.Zero;
        private readonly int _processorCount = Math.Max(1, Environment.ProcessorCount);

        private readonly StringBuilder _terminalBuffer = new();
        private int _terminalLineCount = 0;

        public ObservableCollection<HitItem> HitsList { get; set; } = new();

        public MainWindow()
        {
            InitializeComponent();

            try
            {
                _currentProcess = Process.GetCurrentProcess();
            }
            catch { }

            try
            {
                LoadAppIconSafely();
            }
            catch { }

            this.Loaded += MainWindow_Loaded;
            this.Closing += MainWindow_Closing;

            try
            {
                if (DgHits != null)
                {
                    DgHits.ItemsSource = HitsList;
                }
            }
            catch { }

            try
            {
                InitHwTelemetryTimer();
            }
            catch { }

            try
            {
                RefreshPortsList();
            }
            catch { }

            try
            {
                LoadSavedSettings();
            }
            catch { }

            try
            {
                ApplyLanguage(_currentLang);
            }
            catch { }

            try
            {
                UpdatePreview();
            }
            catch { }

            // UI is fully initialized now, enable live auto-save on user actions
            _isUiReady = true;
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                LoadAppIconSafely();
            }
            catch { }
        }

        private void MainWindow_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
        {
            try
            {
                SaveSettings();
                if (_port != null && _port.IsOpen)
                {
                    _port.Close();
                }
            }
            catch { }
        }

        #region Multilingual Localization (RU / UA / EN)

        private void BtnLangSwitch_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Cycle: RU -> UA -> EN -> RU
                _currentLang = _currentLang switch
                {
                    AppLanguage.RU => AppLanguage.UA,
                    AppLanguage.UA => AppLanguage.EN,
                    _ => AppLanguage.RU
                };

                ApplyLanguage(_currentLang);
                SaveSettings();
            }
            catch { }
        }

        private void ApplyLanguage(AppLanguage lang)
        {
            try
            {
                if (BtnLangSwitch != null)
                {
                    BtnLangSwitch.Content = lang switch
                    {
                        AppLanguage.UA => "🌐 UA",
                        AppLanguage.EN => "🌐 EN",
                        _ => "🌐 RU"
                    };
                }

                switch (lang)
                {
                    case AppLanguage.UA:
                        if (TxtAppSubtitle != null) TxtAppSubtitle.Text = "ФРЕЙМВОРК ДЛЯ АНАЛІЗУ ПРОТОКОЛІВ ТА ПЕРЕБОРУ UART";
                        if (TxtLabelPreset != null) TxtLabelPreset.Text = "📁 ПРЕСЕТ:";
                        SetComboItemContent(CmbPresets, 0, "PIN-код (4 цифри)");
                        SetComboItemContent(CmbPresets, 1, "Регістр Modbus RTU");
                        SetComboItemContent(CmbPresets, 2, "Команда AT+AUTH");
                        SetComboItemContent(CmbPresets, 3, "Сирі 2-байти HEX");
                        SetComboItemContent(CmbPresets, 4, "Власний протокол");

                        if (TxtLabelPort != null) TxtLabelPort.Text = "ПОРТ:";
                        if (TxtLabelBaud != null) TxtLabelBaud.Text = "БОД:";
                        if (BtnConnect != null) BtnConnect.Content = (_port != null && _port.IsOpen) ? "❌ ВІДКЛЮЧИТИ" : "⚡ ПІДКЛЮЧИТИ";
                        if (TxtBadgeHitsLabel != null) TxtBadgeHitsLabel.Text = "🎯 ЗБІГИ: ";
                        if (TxtBadgeSpeedLabel != null) TxtBadgeSpeedLabel.Text = "⚡ ШВИДКІСТЬ: ";
                        if (TxtStatus != null && (_port == null || !_port.IsOpen)) TxtStatus.Text = "ОФЛАЙН";

                        if (TxtSec1Header != null) TxtSec1Header.Text = "1. ВЕКТОР АТАКИ ТА ШАБЛОН (PAYLOAD)";
                        if (TxtMacroLabel != null) TxtMacroLabel.Text = "Вставка макросів:";
                        if (TxtInspectorLabel != null) TxtInspectorLabel.Text = "ІНСПЕКТОР ПОТОЧНОГО ПАКЕТА (PREVIEW):";

                        if (TxtSec2Header != null) TxtSec2Header.Text = "2. ДІАПАЗОН ПЕРЕБОРУ ТА ТАЙМІНГ";
                        if (TxtLabelStart != null) TxtLabelStart.Text = "СТАРТ";
                        if (TxtLabelEnd != null) TxtLabelEnd.Text = "КІНЕЦЬ";
                        if (TxtLabelStep != null) TxtLabelStep.Text = "КРОК";
                        if (TxtLabelDelay != null) TxtLabelDelay.Text = "ПАУЗА (МС)";

                        if (ChkStopOnMatch != null) ChkStopOnMatch.Content = "ЗУПИНИТИ ПРИ ЗБІГУ ВІДПОВІДІ (TRIGGER)";
                        SetComboItemContent(CmbMatchMode, 0, "Містить рядок");
                        SetComboItemContent(CmbMatchMode, 1, "Точні HEX байти");
                        SetComboItemContent(CmbMatchMode, 2, "Регулярний вираз");
                        SetComboItemContent(CmbMatchMode, 3, "Будь-яка відповідь");
                        if (TxtTriggerHint != null) TxtTriggerHint.Text = "⚡ При спрацьовуванні умови сканер збереже валідний ключ у таблицю та виведе банер.";

                        if (BtnStart != null) BtnStart.Content = "▶ СТАРТ";
                        if (BtnPause != null) BtnPause.Content = _isPaused ? "▶ ПРОДОВЖИТИ" : "❚❚ ПАУЗА";
                        if (BtnStop != null) BtnStop.Content = "■ СТОП";
                        if (BtnSingleProbe != null) BtnSingleProbe.Content = "⚡ НАДІСЛАТИ ОДИН ТЕСТОВИЙ ПАКЕТ (PROBE)";

                        if (TxtHitBannerTitle != null) TxtHitBannerTitle.Text = "🎯 ЗНАЙДЕНО ЗБІГ / VALID KEY!";
                        if (BtnCopyHitBanner != null) BtnCopyHitBanner.Content = "📋 Скопіювати";

                        if (TxtTerminalHeader != null) TxtTerminalHeader.Text = "ЖУРНАЛ ОБМІНУ ТРАФІКУ (LIVE STREAM)";
                        if (TxtTerminalCount != null) TxtTerminalCount.Text = $"{_terminalLineCount} повідомлень";
                        if (ChkAutoScroll != null) ChkAutoScroll.Content = "Автопрокрутка";
                        if (BtnCopyTerminal != null) BtnCopyTerminal.Content = "Скопіювати";
                        if (BtnClearTerminal != null) BtnClearTerminal.Content = "Очистити";

                        if (TxtHitsTableHeader != null) TxtHitsTableHeader.Text = "ТАБЛИЦЯ ЗБІГІВ (CAPTURED HITS)";
                        if (TxtHitsGridCount != null) TxtHitsGridCount.Text = $"{HitsList.Count} знайдено";
                        if (BtnExportCsv != null) BtnExportCsv.Content = "💾 Експорт в CSV";

                        SetDataGridColumnHeader(0, "Час");
                        SetDataGridColumnHeader(1, "Значення");
                        SetDataGridColumnHeader(2, "HEX Ключа");
                        SetDataGridColumnHeader(3, "Надіслано (TX)");
                        SetDataGridColumnHeader(4, "Відповідь пристрою (RX)");

                        if (!_isRunning && (_port == null || !_port.IsOpen) && TxtTelemetry != null)
                        {
                            TxtTelemetry.Text = "[READY] Двигун готовий до роботи. Підключіть COM-порт та натисніть СТАРТ.";
                        }
                        break;

                    case AppLanguage.EN:
                        if (TxtAppSubtitle != null) TxtAppSubtitle.Text = "HARDWARE PROTOCOL & UART BRUTE-FORCE FRAMEWORK";
                        if (TxtLabelPreset != null) TxtLabelPreset.Text = "📁 PRESET:";
                        SetComboItemContent(CmbPresets, 0, "PIN Code (4-Dig)");
                        SetComboItemContent(CmbPresets, 1, "Modbus RTU Register");
                        SetComboItemContent(CmbPresets, 2, "AT+AUTH Command");
                        SetComboItemContent(CmbPresets, 3, "Raw 2-Byte HEX");
                        SetComboItemContent(CmbPresets, 4, "Custom Protocol");

                        if (TxtLabelPort != null) TxtLabelPort.Text = "PORT:";
                        if (TxtLabelBaud != null) TxtLabelBaud.Text = "BAUD:";
                        if (BtnConnect != null) BtnConnect.Content = (_port != null && _port.IsOpen) ? "❌ DISCONNECT" : "⚡ CONNECT";
                        if (TxtBadgeHitsLabel != null) TxtBadgeHitsLabel.Text = "🎯 HITS: ";
                        if (TxtBadgeSpeedLabel != null) TxtBadgeSpeedLabel.Text = "⚡ SPEED: ";
                        if (TxtStatus != null && (_port == null || !_port.IsOpen)) TxtStatus.Text = "OFFLINE";

                        if (TxtSec1Header != null) TxtSec1Header.Text = "1. ATTACK VECTOR & PAYLOAD TEMPLATE";
                        if (TxtMacroLabel != null) TxtMacroLabel.Text = "Insert macros:";
                        if (TxtInspectorLabel != null) TxtInspectorLabel.Text = "CURRENT PACKET INSPECTOR (PREVIEW):";

                        if (TxtSec2Header != null) TxtSec2Header.Text = "2. SWEEP RANGE & TIMING";
                        if (TxtLabelStart != null) TxtLabelStart.Text = "START";
                        if (TxtLabelEnd != null) TxtLabelEnd.Text = "END";
                        if (TxtLabelStep != null) TxtLabelStep.Text = "STEP";
                        if (TxtLabelDelay != null) TxtLabelDelay.Text = "DELAY (MS)";

                        if (ChkStopOnMatch != null) ChkStopOnMatch.Content = "STOP ON MATCHING RESPONSE (TRIGGER)";
                        SetComboItemContent(CmbMatchMode, 0, "Contains String");
                        SetComboItemContent(CmbMatchMode, 1, "Exact HEX Bytes");
                        SetComboItemContent(CmbMatchMode, 2, "Regex Pattern");
                        SetComboItemContent(CmbMatchMode, 3, "Any Response");
                        if (TxtTriggerHint != null) TxtTriggerHint.Text = "⚡ When matched, the engine stores the valid key into the table and displays a banner.";

                        if (BtnStart != null) BtnStart.Content = "▶ START";
                        if (BtnPause != null) BtnPause.Content = _isPaused ? "▶ RESUME" : "❚❚ PAUSE";
                        if (BtnStop != null) BtnStop.Content = "■ STOP";
                        if (BtnSingleProbe != null) BtnSingleProbe.Content = "⚡ SEND SINGLE TEST PACKET (PROBE)";

                        if (TxtHitBannerTitle != null) TxtHitBannerTitle.Text = "🎯 MATCH FOUND / VALID KEY!";
                        if (BtnCopyHitBanner != null) BtnCopyHitBanner.Content = "📋 Copy";

                        if (TxtTerminalHeader != null) TxtTerminalHeader.Text = "TRAFFIC EXCHANGE LOG (LIVE STREAM)";
                        if (TxtTerminalCount != null) TxtTerminalCount.Text = $"{_terminalLineCount} messages";
                        if (ChkAutoScroll != null) ChkAutoScroll.Content = "Auto-scroll";
                        if (BtnCopyTerminal != null) BtnCopyTerminal.Content = "Copy";
                        if (BtnClearTerminal != null) BtnClearTerminal.Content = "Clear";

                        if (TxtHitsTableHeader != null) TxtHitsTableHeader.Text = "CAPTURED HITS TABLE";
                        if (TxtHitsGridCount != null) TxtHitsGridCount.Text = $"{HitsList.Count} found";
                        if (BtnExportCsv != null) BtnExportCsv.Content = "💾 Export to CSV";

                        SetDataGridColumnHeader(0, "Time");
                        SetDataGridColumnHeader(1, "Value");
                        SetDataGridColumnHeader(2, "Key HEX");
                        SetDataGridColumnHeader(3, "Sent (TX)");
                        SetDataGridColumnHeader(4, "Device Response (RX)");

                        if (!_isRunning && (_port == null || !_port.IsOpen) && TxtTelemetry != null)
                        {
                            TxtTelemetry.Text = "[READY] Engine is ready. Connect a COM port and press START.";
                        }
                        break;

                    default: // RU
                        if (TxtAppSubtitle != null) TxtAppSubtitle.Text = "HARDWARE PROTOCOL & UART BRUTE-FORCE FRAMEWORK";
                        if (TxtLabelPreset != null) TxtLabelPreset.Text = "📁 ПРЕСЕТ:";
                        SetComboItemContent(CmbPresets, 0, "PIN Code (4-Dig)");
                        SetComboItemContent(CmbPresets, 1, "Modbus RTU Register");
                        SetComboItemContent(CmbPresets, 2, "AT+AUTH Command");
                        SetComboItemContent(CmbPresets, 3, "Raw 2-Byte HEX");
                        SetComboItemContent(CmbPresets, 4, "Custom Protocol");

                        if (TxtLabelPort != null) TxtLabelPort.Text = "PORT:";
                        if (TxtLabelBaud != null) TxtLabelBaud.Text = "BAUD:";
                        if (BtnConnect != null) BtnConnect.Content = (_port != null && _port.IsOpen) ? "❌ ОТКЛЮЧИТЬ" : "⚡ ПОДКЛЮЧИТЬ";
                        if (TxtBadgeHitsLabel != null) TxtBadgeHitsLabel.Text = "🎯 HITS: ";
                        if (TxtBadgeSpeedLabel != null) TxtBadgeSpeedLabel.Text = "⚡ SPEED: ";
                        if (TxtStatus != null && (_port == null || !_port.IsOpen)) TxtStatus.Text = "OFFLINE";

                        if (TxtSec1Header != null) TxtSec1Header.Text = "1. ВЕКТОР АТАКИ И ШАБЛОН (PAYLOAD)";
                        if (TxtMacroLabel != null) TxtMacroLabel.Text = "Вставка макросов:";
                        if (TxtInspectorLabel != null) TxtInspectorLabel.Text = "ИНСПЕКТОР ТЕКУЩЕГО ПАКЕТА (PREVIEW):";

                        if (TxtSec2Header != null) TxtSec2Header.Text = "2. ДИАПАЗОН ПЕРЕБОРА И ТАЙМИНГ";
                        if (TxtLabelStart != null) TxtLabelStart.Text = "СТАРТ";
                        if (TxtLabelEnd != null) TxtLabelEnd.Text = "КОНЕЦ";
                        if (TxtLabelStep != null) TxtLabelStep.Text = "ШАГ";
                        if (TxtLabelDelay != null) TxtLabelDelay.Text = "ПАУЗА (МС)";

                        if (ChkStopOnMatch != null) ChkStopOnMatch.Content = "ОСТАНОВИТЬ ПРИ СОВПАДЕНИИ ОТВЕТА (TRIGGER)";
                        SetComboItemContent(CmbMatchMode, 0, "Contains String");
                        SetComboItemContent(CmbMatchMode, 1, "Exact HEX Bytes");
                        SetComboItemContent(CmbMatchMode, 2, "Regex Pattern");
                        SetComboItemContent(CmbMatchMode, 3, "Any Response");
                        if (TxtTriggerHint != null) TxtTriggerHint.Text = "⚡ При срабатывании условия сканер сохранит валидный ключ в таблицу и выведет баннер.";

                        if (BtnStart != null) BtnStart.Content = "▶ СТАРТ";
                        if (BtnPause != null) BtnPause.Content = _isPaused ? "▶ ВОЗОБНОВИТЬ" : "❚❚ ПАУЗА";
                        if (BtnStop != null) BtnStop.Content = "■ СТОП";
                        if (BtnSingleProbe != null) BtnSingleProbe.Content = "⚡ ОТПРАВИТЬ ОДИН ТЕСТОВЫЙ ПАКЕТ (PROBE)";

                        if (TxtHitBannerTitle != null) TxtHitBannerTitle.Text = "🎯 НАЙДЕНО СОВПАДЕНИЕ / VALID KEY!";
                        if (BtnCopyHitBanner != null) BtnCopyHitBanner.Content = "📋 Скопировать";

                        if (TxtTerminalHeader != null) TxtTerminalHeader.Text = "ЖУРНАЛ ОБМЕНА ТРАФИКА (LIVE STREAM)";
                        if (TxtTerminalCount != null) TxtTerminalCount.Text = $"{_terminalLineCount} сообщений";
                        if (ChkAutoScroll != null) ChkAutoScroll.Content = "Автопрокрутка";
                        if (BtnCopyTerminal != null) BtnCopyTerminal.Content = "Скопировать";
                        if (BtnClearTerminal != null) BtnClearTerminal.Content = "Очистить";

                        if (TxtHitsTableHeader != null) TxtHitsTableHeader.Text = "ТАБЛИЦА СОВПАДЕНИЙ (CAPTURED HITS)";
                        if (TxtHitsGridCount != null) TxtHitsGridCount.Text = $"{HitsList.Count} найдено";
                        if (BtnExportCsv != null) BtnExportCsv.Content = "💾 Экспорт в CSV";

                        SetDataGridColumnHeader(0, "Время");
                        SetDataGridColumnHeader(1, "Значение");
                        SetDataGridColumnHeader(2, "HEX Ключа");
                        SetDataGridColumnHeader(3, "Отправлено (TX)");
                        SetDataGridColumnHeader(4, "Ответ устройства (RX)");

                        if (!_isRunning && (_port == null || !_port.IsOpen) && TxtTelemetry != null)
                        {
                            TxtTelemetry.Text = "[READY] Движок готов к работе. Подключите COM-порт и нажмите СТАРТ.";
                        }
                        break;
                }
            }
            catch { }
        }

        private void SetComboItemContent(ComboBox? cb, int index, string text)
        {
            if (cb != null && cb.Items != null && index >= 0 && index < cb.Items.Count)
            {
                if (cb.Items[index] is ComboBoxItem item)
                {
                    item.Content = text;
                }
            }
        }

        private void SetDataGridColumnHeader(int colIndex, string headerText)
        {
            if (DgHits != null && DgHits.Columns != null && colIndex >= 0 && colIndex < DgHits.Columns.Count)
            {
                DgHits.Columns[colIndex].Header = headerText;
            }
        }

        #endregion

        private void InitHwTelemetryTimer()
        {
            try
            {
                if (_currentProcess != null)
                {
                    _lastTotalProcessorTime = _currentProcess.TotalProcessorTime;
                }
                _lastCpuTime = DateTime.UtcNow;
            }
            catch { }

            try
            {
                _hwTelemetryTimer = new System.Windows.Threading.DispatcherTimer();
                _hwTelemetryTimer.Interval = TimeSpan.FromMilliseconds(600);
                _hwTelemetryTimer.Tick += (s, e) =>
                {
                    if (!_isUiReady) return;

                    // 1. Packet Speed
                    try
                    {
                        int currentSpeed = Interlocked.Exchange(ref _speedCounter, 0);
                        if (TxtSpeedBadge != null)
                        {
                            TxtSpeedBadge.Text = $"{currentSpeed} pkt/s";
                        }
                    }
                    catch { }

                    // 2. Hardware RAM Usage
                    try
                    {
                        if (_currentProcess != null)
                        {
                            _currentProcess.Refresh();
                            double ramMb = _currentProcess.WorkingSet64 / (1024.0 * 1024.0);
                            if (TxtRamUsage != null)
                            {
                                TxtRamUsage.Text = $"{ramMb:F1} MB";
                            }
                        }
                    }
                    catch { }

                    // 3. Hardware CPU Usage
                    try
                    {
                        if (_currentProcess != null)
                        {
                            DateTime now = DateTime.UtcNow;
                            TimeSpan currentProcTime = _currentProcess.TotalProcessorTime;
                            double elapsedCpuMs = (currentProcTime - _lastTotalProcessorTime).TotalMilliseconds;
                            double elapsedWallMs = (now - _lastCpuTime).TotalMilliseconds * _processorCount;

                            if (elapsedWallMs > 0)
                            {
                                double cpuPercent = Math.Clamp((elapsedCpuMs / elapsedWallMs) * 100.0, 0.0, 100.0);
                                if (TxtCpuUsage != null)
                                {
                                    TxtCpuUsage.Text = $"{cpuPercent:F1}%";
                                }
                            }

                            _lastCpuTime = now;
                            _lastTotalProcessorTime = currentProcTime;
                        }
                    }
                    catch { }
                };
                _hwTelemetryTimer.Start();
            }
            catch { }
        }

        private void LoadAppIconSafely()
        {
            try
            {
                if (!string.IsNullOrEmpty(IconData.SkullIconBase64))
                {
                    byte[] rawBytes = Convert.FromBase64String(IconData.SkullIconBase64);
                    using var ms = new MemoryStream(rawBytes);
                    var bmp = new System.Windows.Media.Imaging.BitmapImage();
                    bmp.BeginInit();
                    bmp.CacheOption = System.Windows.Media.Imaging.BitmapCacheOption.OnLoad;
                    bmp.StreamSource = ms;
                    bmp.EndInit();
                    bmp.Freeze();

                    this.Icon = bmp;
                    if (ImgHeaderIcon != null)
                    {
                        ImgHeaderIcon.Source = bmp;
                    }
                    if (TxtHeaderFallback != null)
                    {
                        TxtHeaderFallback.Visibility = Visibility.Collapsed;
                    }
                    return;
                }
            }
            catch { }

            try
            {
                string[] possiblePaths = new[]
                {
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app_icon.png"),
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app_icon.jpg"),
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "app_icon.png"),
                    "app_icon.png"
                };

                foreach (var path in possiblePaths)
                {
                    if (File.Exists(path))
                    {
                        byte[] fileBytes = File.ReadAllBytes(path);
                        using var ms = new MemoryStream(fileBytes);
                        var bmp = new System.Windows.Media.Imaging.BitmapImage();
                        bmp.BeginInit();
                        bmp.CacheOption = System.Windows.Media.Imaging.BitmapCacheOption.OnLoad;
                        bmp.StreamSource = ms;
                        bmp.EndInit();
                        bmp.Freeze();

                        this.Icon = bmp;
                        if (ImgHeaderIcon != null)
                        {
                            ImgHeaderIcon.Source = bmp;
                        }
                        if (TxtHeaderFallback != null)
                        {
                            TxtHeaderFallback.Visibility = Visibility.Collapsed;
                        }
                        break;
                    }
                }
            }
            catch { }
        }

        private static string GetConfigFilePath()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string primaryPath = Path.Combine(baseDir, "serialforge_config.json");
                return primaryPath;
            }
            catch
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string folder = Path.Combine(appData, "SerialForgeWpf");
                Directory.CreateDirectory(folder);
                return Path.Combine(folder, "serialforge_config.json");
            }
        }

        private void LoadSavedSettings()
        {
            string configPath = GetConfigFilePath();
            if (!File.Exists(configPath))
            {
                string altPath = Path.Combine(Directory.GetCurrentDirectory(), "serialforge_config.json");
                if (File.Exists(altPath))
                {
                    configPath = altPath;
                }
                else
                {
                    return;
                }
            }

            try
            {
                _isLoadingSettings = true;
                string json = File.ReadAllText(configPath, Encoding.UTF8);
                var settings = JsonSerializer.Deserialize<AppSettings>(json);
                if (settings == null) return;

                // 1. Language
                if (Enum.TryParse<AppLanguage>(settings.Language, true, out var savedLang))
                {
                    _currentLang = savedLang;
                }

                // 2. Preset selection (set first so custom values override if needed)
                if (CmbPresets != null && settings.SelectedPresetIndex >= 0 && settings.SelectedPresetIndex < CmbPresets.Items.Count)
                {
                    CmbPresets.SelectedIndex = settings.SelectedPresetIndex;
                }

                // 3. Port & Baud
                if (!string.IsNullOrEmpty(settings.SelectedPort) && CmbPorts != null)
                {
                    bool found = false;
                    for (int i = 0; i < CmbPorts.Items.Count; i++)
                    {
                        if (CmbPorts.Items[i]?.ToString() == settings.SelectedPort)
                        {
                            CmbPorts.SelectedIndex = i;
                            found = true;
                            break;
                        }
                    }
                    if (!found && !string.IsNullOrEmpty(settings.SelectedPort))
                    {
                        CmbPorts.Items.Add(settings.SelectedPort);
                        CmbPorts.SelectedItem = settings.SelectedPort;
                    }
                }

                if (CmbBaud != null)
                {
                    for (int i = 0; i < CmbBaud.Items.Count; i++)
                    {
                        if (CmbBaud.Items[i] is ComboBoxItem item && item.Content?.ToString() == settings.SelectedBaud.ToString())
                        {
                            CmbBaud.SelectedIndex = i;
                            break;
                        }
                    }
                }

                // 4. Mode & Template
                if (RbHexMode != null && RbTextMode != null)
                {
                    RbHexMode.IsChecked = settings.IsHexMode;
                    RbTextMode.IsChecked = !settings.IsHexMode;
                }

                if (TxtTemplate != null && !string.IsNullOrEmpty(settings.Template))
                {
                    TxtTemplate.Text = settings.Template;
                }

                // 5. Ranges
                if (TxtStartNum != null && !string.IsNullOrEmpty(settings.StartNum)) TxtStartNum.Text = settings.StartNum;
                if (TxtEndNum != null && !string.IsNullOrEmpty(settings.EndNum)) TxtEndNum.Text = settings.EndNum;
                if (TxtStep != null && !string.IsNullOrEmpty(settings.Step)) TxtStep.Text = settings.Step;
                if (TxtDelayMs != null && !string.IsNullOrEmpty(settings.DelayMs)) TxtDelayMs.Text = settings.DelayMs;

                // 6. Triggers & match
                if (ChkStopOnMatch != null) ChkStopOnMatch.IsChecked = settings.StopOnMatch;
                if (CmbMatchMode != null && settings.MatchModeIndex >= 0 && settings.MatchModeIndex < CmbMatchMode.Items.Count)
                {
                    CmbMatchMode.SelectedIndex = settings.MatchModeIndex;
                }
                if (TxtStopPattern != null && !string.IsNullOrEmpty(settings.StopPattern)) TxtStopPattern.Text = settings.StopPattern;
                if (ChkAutoScroll != null) ChkAutoScroll.IsChecked = settings.AutoScroll;

                // 7. Last saved progress
                _currentNum = settings.LastSavedKeyNum;
                if (_currentNum > 0 && int.TryParse(settings.StartNum, out int sNum) && int.TryParse(settings.EndNum, out int eNum) && eNum > sNum)
                {
                    double pct = Math.Clamp((double)(_currentNum - sNum) / (eNum - sNum) * 100.0, 0.0, 100.0);
                    if (PbSweep != null) PbSweep.Value = pct;
                    if (TxtProgressPercent != null) TxtProgressPercent.Text = $"{pct:F1}% ({_currentNum} / {eNum})";
                }

                AppendLog($"[CONFIG] Settings loaded from disk ({settings.Language}, template: \"{settings.Template}\").");
            }
            catch { }
            finally
            {
                _isLoadingSettings = false;
            }
        }

        public void SaveSettings()
        {
            if (!_isUiReady || _isLoadingSettings) return;

            try
            {
                int baud = 115200;
                if (CmbBaud?.SelectedItem is ComboBoxItem cbi && int.TryParse(cbi.Content?.ToString(), out int bVal))
                {
                    baud = bVal;
                }

                var settings = new AppSettings
                {
                    Language = _currentLang.ToString(),
                    SelectedPort = CmbPorts?.SelectedItem?.ToString() ?? "",
                    SelectedBaud = baud,
                    SelectedPresetIndex = CmbPresets?.SelectedIndex ?? 0,
                    IsHexMode = RbHexMode?.IsChecked == true,
                    Template = TxtTemplate?.Text ?? "PIN:{DEC:4}\\r\\n",
                    StartNum = TxtStartNum?.Text ?? "0",
                    EndNum = TxtEndNum?.Text ?? "9999",
                    Step = TxtStep?.Text ?? "1",
                    DelayMs = TxtDelayMs?.Text ?? "25",
                    LastSavedKeyNum = _currentNum,
                    StopOnMatch = ChkStopOnMatch?.IsChecked == true,
                    MatchModeIndex = CmbMatchMode?.SelectedIndex ?? 0,
                    StopPattern = TxtStopPattern?.Text ?? "ACCESS_GRANTED|OK|SUCCESS",
                    AutoScroll = ChkAutoScroll?.IsChecked == true
                };

                string json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
                string configPath = GetConfigFilePath();

                string? dir = Path.GetDirectoryName(configPath);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                File.WriteAllText(configPath, json, Encoding.UTF8);
            }
            catch { }
        }

        private void RefreshPortsList()
        {
            if (CmbPorts == null) return;
            try
            {
                string? prev = CmbPorts.SelectedItem?.ToString();
                CmbPorts.Items.Clear();
                string[] ports = SerialPort.GetPortNames();
                foreach (var p in ports)
                {
                    CmbPorts.Items.Add(p);
                }
                if (CmbPorts.Items.Count > 0)
                {
                    if (!string.IsNullOrEmpty(prev) && CmbPorts.Items.Contains(prev))
                    {
                        CmbPorts.SelectedItem = prev;
                    }
                    else
                    {
                        CmbPorts.SelectedIndex = 0;
                    }
                }
            }
            catch { }
        }

        private void BtnRefreshPorts_Click(object sender, RoutedEventArgs e) => RefreshPortsList();

        private void BtnConnect_Click(object sender, RoutedEventArgs e)
        {
            if (!_isUiReady) return;

            if (_port != null && _port.IsOpen)
            {
                try { _port.Close(); } catch { }
                _port = null;
                if (LedStatus != null) LedStatus.Fill = new SolidColorBrush(Color.FromRgb(239, 68, 68));
                if (TxtStatus != null) TxtStatus.Text = _currentLang switch { AppLanguage.UA => "ОФЛАЙН", AppLanguage.EN => "OFFLINE", _ => "OFFLINE" };
                if (BtnConnect != null)
                {
                    BtnConnect.Content = _currentLang switch { AppLanguage.UA => "⚡ ПІДКЛЮЧИТИ", AppLanguage.EN => "⚡ CONNECT", _ => "⚡ ПОДКЛЮЧИТЬ" };
                    BtnConnect.Background = new SolidColorBrush(Color.FromRgb(3, 105, 161));
                }
                AppendLog("[SYSTEM] COM-port closed / Порт закрыт.");
                if (TxtTelemetry != null) TxtTelemetry.Text = _currentLang switch { AppLanguage.UA => "[OFFLINE] Порт закритий.", AppLanguage.EN => "[OFFLINE] Port closed.", _ => "[OFFLINE] Порт закрыт." };
                SaveSettings();
                return;
            }

            if (CmbPorts == null || CmbPorts.SelectedItem == null)
            {
                string msg = _currentLang switch
                {
                    AppLanguage.UA => "Виберіть COM-порт зі списку!",
                    AppLanguage.EN => "Select a COM port from the list!",
                    _ => "Выберите COM-порт из списка!"
                };
                MessageBox.Show(msg, "Port", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string portName = CmbPorts.SelectedItem.ToString()!;
            int baud = 115200;
            if (CmbBaud?.SelectedItem is ComboBoxItem cbi && int.TryParse(cbi.Content?.ToString(), out int bVal))
            {
                baud = bVal;
            }

            try
            {
                _port = new SerialPort(portName, baud, Parity.None, 8, StopBits.One)
                {
                    ReadTimeout = 250,
                    WriteTimeout = 250,
                    DtrEnable = true,
                    RtsEnable = true
                };

                _port.DataReceived += Port_DataReceived;
                _port.Open();

                if (LedStatus != null) LedStatus.Fill = new SolidColorBrush(Color.FromRgb(16, 185, 129));
                if (TxtStatus != null) TxtStatus.Text = $"ONLINE ({portName})";
                if (BtnConnect != null)
                {
                    BtnConnect.Content = _currentLang switch { AppLanguage.UA => "❌ ВІДКЛЮЧИТИ", AppLanguage.EN => "❌ DISCONNECT", _ => "❌ ОТКЛЮЧИТЬ" };
                    BtnConnect.Background = new SolidColorBrush(Color.FromRgb(220, 38, 38));
                }
                AppendLog($"[SYSTEM] COM-port {portName} opened @ {baud} bps. Full RX/TX stream active.");
                if (TxtTelemetry != null) TxtTelemetry.Text = $"[ONLINE] {portName} @ {baud} bps.";
                SaveSettings();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Port Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void CmbPresets_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (!_isUiReady || _isLoadingSettings || CmbPresets == null || TxtTemplate == null || TxtStartNum == null || TxtEndNum == null || TxtStopPattern == null) return;

            int index = CmbPresets.SelectedIndex;
            switch (index)
            {
                case 0: // PIN Code (4-Dig)
                    if (RbTextMode != null) RbTextMode.IsChecked = true;
                    TxtTemplate.Text = "PIN:{DEC:4}\\r\\n";
                    TxtStartNum.Text = "0";
                    TxtEndNum.Text = "9999";
                    if (TxtStep != null) TxtStep.Text = "1";
                    if (TxtDelayMs != null) TxtDelayMs.Text = "25";
                    TxtStopPattern.Text = "ACCESS_GRANTED|OK|SUCCESS";
                    if (CmbMatchMode != null) CmbMatchMode.SelectedIndex = 0;
                    break;
                case 1: // Modbus RTU Register
                    if (RbHexMode != null) RbHexMode.IsChecked = true;
                    TxtTemplate.Text = "01 06 00 01 {HEX:2} 00 00";
                    TxtStartNum.Text = "0";
                    TxtEndNum.Text = "255";
                    if (TxtStep != null) TxtStep.Text = "1";
                    if (TxtDelayMs != null) TxtDelayMs.Text = "35";
                    TxtStopPattern.Text = "01 06";
                    if (CmbMatchMode != null) CmbMatchMode.SelectedIndex = 1;
                    break;
                case 2: // AT+AUTH Command
                    if (RbTextMode != null) RbTextMode.IsChecked = true;
                    TxtTemplate.Text = "AT+AUTH=\"{NUM}\"\\r\\n";
                    TxtStartNum.Text = "1000";
                    TxtEndNum.Text = "9999";
                    if (TxtStep != null) TxtStep.Text = "1";
                    if (TxtDelayMs != null) TxtDelayMs.Text = "30";
                    TxtStopPattern.Text = "OK";
                    if (CmbMatchMode != null) CmbMatchMode.SelectedIndex = 0;
                    break;
                case 3: // Raw 2-Byte HEX
                    if (RbHexMode != null) RbHexMode.IsChecked = true;
                    TxtTemplate.Text = "AA 55 {HEX:2} 00 FF";
                    TxtStartNum.Text = "0";
                    TxtEndNum.Text = "65535";
                    if (TxtStep != null) TxtStep.Text = "1";
                    if (TxtDelayMs != null) TxtDelayMs.Text = "15";
                    TxtStopPattern.Text = "55 AA";
                    if (CmbMatchMode != null) CmbMatchMode.SelectedIndex = 1;
                    break;
                case 4: // Custom Protocol
                    if (RbTextMode != null) RbTextMode.IsChecked = true;
                    TxtTemplate.Text = "custom_{NUM}\\r\\n";
                    TxtStartNum.Text = "0";
                    TxtEndNum.Text = "1000";
                    if (TxtStep != null) TxtStep.Text = "1";
                    if (TxtDelayMs != null) TxtDelayMs.Text = "25";
                    TxtStopPattern.Text = "OK";
                    if (CmbMatchMode != null) CmbMatchMode.SelectedIndex = 0;
                    break;
            }

            UpdatePreview();
            SaveSettings();
        }

        private void Mode_Changed(object sender, RoutedEventArgs e)
        {
            if (!_isUiReady || _isLoadingSettings) return;
            UpdatePreview();
            SaveSettings();
        }

        private void Template_Changed(object sender, TextChangedEventArgs e)
        {
            if (!_isUiReady || _isLoadingSettings) return;
            UpdatePreview();
            SaveSettings();
        }

        private void Range_Changed(object sender, TextChangedEventArgs e)
        {
            if (!_isUiReady || _isLoadingSettings) return;
            UpdatePreview();
            SaveSettings();
        }

        private void SettingControl_Changed(object sender, RoutedEventArgs e)
        {
            if (!_isUiReady || _isLoadingSettings) return;
            SaveSettings();
        }

        private void InsertMacro_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && TxtTemplate != null)
            {
                string macro = btn.Tag?.ToString() ?? btn.Content?.ToString() ?? "";
                if (!string.IsNullOrEmpty(macro))
                {
                    TxtTemplate.Text += macro;
                    TxtTemplate.CaretIndex = TxtTemplate.Text.Length;
                    UpdatePreview();
                }
            }
        }

        private void UpdatePreview()
        {
            if (!_isUiReady || TxtPreviewText == null || TxtPreviewHex == null || TxtStartNum == null || TxtTemplate == null) return;

            try
            {
                int.TryParse(TxtStartNum.Text, out int num);
                byte[] bytes = BuildPacketBytes(TxtTemplate.Text, num, RbHexMode?.IsChecked == true);

                TxtPreviewHex.Text = BitConverter.ToString(bytes).Replace("-", " ");
                TxtPreviewText.Text = FormatAsciiVisible(bytes);
            }
            catch { }
        }

        private string FormatAsciiVisible(byte[] data)
        {
            var sb = new StringBuilder();
            foreach (var b in data)
            {
                if (b >= 32 && b <= 126) sb.Append((char)b);
                else if (b == 0x0D) sb.Append("\\r");
                else if (b == 0x0A) sb.Append("\\n");
                else if (b == 0x00) sb.Append("\\0");
                else if (b == 0x09) sb.Append("\\t");
                else sb.Append($"\\x{b:X2}");
            }
            return sb.ToString();
        }

        private byte[] BuildPacketBytes(string tmpl, int num, bool isHex)
        {
            if (isHex)
            {
                string proc = tmpl
                    .Replace("{NUM}", num.ToString("X2"))
                    .Replace("{HEX:2}", num.ToString("X2"))
                    .Replace("{HEX:4}", num.ToString("X4"))
                    .Replace("{DEC:4}", num.ToString("D4"));

                string[] parts = proc.Split(new[] { ' ', ',', '-', '\\', 'x' }, StringSplitOptions.RemoveEmptyEntries);
                var bList = new List<byte>();
                for (int i = 0; i < parts.Length; i++)
                {
                    if (byte.TryParse(parts[i], System.Globalization.NumberStyles.HexNumber, null, out byte val))
                    {
                        bList.Add(val);
                    }
                }
                return bList.ToArray();
            }
            else
            {
                string proc = tmpl
                    .Replace("{NUM}", num.ToString())
                    .Replace("{DEC:4}", num.ToString("D4"))
                    .Replace("{HEX:2}", num.ToString("X2"))
                    .Replace("{HEX:4}", num.ToString("X4"))
                    .Replace("\\r", "\r")
                    .Replace("\\n", "\n")
                    .Replace("\\0", "\0")
                    .Replace("\\t", "\t");
                return Encoding.ASCII.GetBytes(proc);
            }
        }

        private void BtnSingleProbe_Click(object sender, RoutedEventArgs e)
        {
            if (_port == null || !_port.IsOpen)
            {
                string msg = _currentLang switch
                {
                    AppLanguage.UA => "Спочатку підключіть COM-порт у верхній панелі!",
                    AppLanguage.EN => "Connect a COM port first in the header panel!",
                    _ => "Сначала подключите COM-порт в шапке приложения!"
                };
                MessageBox.Show(msg, "Probe", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            int.TryParse(TxtStartNum?.Text ?? "0", out int num);
            byte[] packet = BuildPacketBytes(TxtTemplate?.Text ?? "", num, RbHexMode?.IsChecked == true);
            string hexRepr = BitConverter.ToString(packet).Replace("-", " ");
            string textRepr = FormatAsciiVisible(packet);

            try
            {
                _port.Write(packet, 0, packet.Length);
                AppendLog($"[TX-PROBE] > HEX: [{hexRepr}] | ASCII: \"{textRepr}\"");
            }
            catch (Exception ex)
            {
                AppendLog($"[ERROR] {ex.Message}");
            }
        }

        private async void BtnStart_Click(object sender, RoutedEventArgs e)
        {
            if (_port == null || !_port.IsOpen)
            {
                string msg = _currentLang switch
                {
                    AppLanguage.UA => "Підключіться до COM-порту перед запуском!",
                    AppLanguage.EN => "Connect to a COM port before starting!",
                    _ => "Сначала подключитесь к COM-порту в верхней панели!"
                };
                MessageBox.Show(msg, "Start", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (!int.TryParse(TxtStartNum?.Text ?? "0", out int start) ||
                !int.TryParse(TxtEndNum?.Text ?? "0", out int end) ||
                !int.TryParse(TxtStep?.Text ?? "1", out int step) ||
                !int.TryParse(TxtDelayMs?.Text ?? "25", out int delay))
            {
                string msg = _currentLang switch
                {
                    AppLanguage.UA => "Перевірте числові параметри діапазону!",
                    AppLanguage.EN => "Check numeric range parameters!",
                    _ => "Проверьте числовые параметры диапазона!"
                };
                MessageBox.Show(msg, "Range Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            if (step <= 0) step = 1;
            if (delay < 0) delay = 0;

            _isRunning = true;
            _isPaused = false;
            _cts = new CancellationTokenSource();
            _currentNum = start;

            if (BtnStart != null) BtnStart.IsEnabled = false;
            if (BtnPause != null)
            {
                BtnPause.IsEnabled = true;
                BtnPause.Content = _currentLang switch { AppLanguage.UA => "❚❚ ПАУЗА", AppLanguage.EN => "❚❚ PAUSE", _ => "❚❚ ПАУЗА" };
            }
            if (BtnStop != null) BtnStop.IsEnabled = true;

            AppendLog($"[ENGINE] >>> SWEEP START: {start} -> {end} (Step: {step}, Delay: {delay}ms)");

            var token = _cts.Token;
            bool isHex = RbHexMode?.IsChecked == true;
            string tmpl = TxtTemplate?.Text ?? "";
            int totalSteps = Math.Max(1, (end - start) / step);

            await Task.Run(async () =>
            {
                for (int i = start; i <= end; i += step)
                {
                    if (token.IsCancellationRequested) break;

                    while (_isPaused && !token.IsCancellationRequested)
                    {
                        await Task.Delay(100);
                    }

                    if (token.IsCancellationRequested) break;

                    _currentNum = i;
                    _lastSentNum = i;
                    byte[] packet = BuildPacketBytes(tmpl, i, isHex);
                    string hexRepr = BitConverter.ToString(packet).Replace("-", " ");
                    string textRepr = FormatAsciiVisible(packet);
                    _lastSentPacketStr = textRepr;

                    Interlocked.Increment(ref _totalSentCount);
                    Interlocked.Increment(ref _speedCounter);

                    if (_port != null && _port.IsOpen)
                    {
                        try
                        {
                            _port.Write(packet, 0, packet.Length);
                        }
                        catch { }
                    }

                    int currentStep = (i - start) / step;
                    double percent = Math.Min(100.0, (double)currentStep / totalSteps * 100.0);

                    Dispatcher.Invoke(() =>
                    {
                        AppendLog($"[TX] #{i} > [{hexRepr}] \"{textRepr}\"");

                        if (PbSweep != null) PbSweep.Value = percent;
                        if (TxtProgressPercent != null) TxtProgressPercent.Text = $"{percent:F1}% ({i} / {end})";
                        if (TxtTelemetry != null) TxtTelemetry.Text = $"[SCAN] Sent: {_totalSentCount} | Key: #{i} (0x{i:X}) | TX: [{hexRepr}]";
                    });

                    if (delay > 0)
                    {
                        await Task.Delay(delay);
                    }
                }

                Dispatcher.Invoke(() =>
                {
                    if (BtnStart != null) BtnStart.IsEnabled = true;
                    if (BtnPause != null) BtnPause.IsEnabled = false;
                    if (BtnStop != null) BtnStop.IsEnabled = false;
                    _isRunning = false;
                    AppendLog("[ENGINE] Sweep sequence finished.");
                    if (TxtTelemetry != null)
                    {
                        TxtTelemetry.Text = _currentLang switch
                        {
                            AppLanguage.UA => $"[COMPLETED] Пройдено пакетів: {_totalSentCount}. Двигун готовий.",
                            AppLanguage.EN => $"[COMPLETED] Processed packets: {_totalSentCount}. Engine ready.",
                            _ => $"[COMPLETED] Пройдено пакетов: {_totalSentCount}. Движок готов."
                        };
                    }
                    SaveSettings();
                });
            }, token);
        }

        private void BtnPause_Click(object sender, RoutedEventArgs e)
        {
            _isPaused = !_isPaused;
            if (_isPaused)
            {
                if (BtnPause != null)
                {
                    BtnPause.Content = _currentLang switch
                    {
                        AppLanguage.UA => "▶ ПРОДОВЖИТИ",
                        AppLanguage.EN => "▶ RESUME",
                        _ => "▶ ВОЗОБНОВИТЬ"
                    };
                }
                AppendLog($"[ENGINE] Paused at key {_currentNum}.");
            }
            else
            {
                if (BtnPause != null)
                {
                    BtnPause.Content = _currentLang switch
                    {
                        AppLanguage.UA => "❚❚ ПАУЗА",
                        AppLanguage.EN => "❚❚ PAUSE",
                        _ => "❚❚ ПАУЗА"
                    };
                }
                AppendLog($"[ENGINE] Resumed from key {_currentNum}.");
            }
            SaveSettings();
        }

        private void BtnStop_Click(object sender, RoutedEventArgs e)
        {
            _cts?.Cancel();
            _isRunning = false;
            _isPaused = false;
            if (BtnStart != null) BtnStart.IsEnabled = true;
            if (BtnPause != null) BtnPause.IsEnabled = false;
            if (BtnStop != null) BtnStop.IsEnabled = false;
            AppendLog("[ENGINE] Stopped by user.");
            SaveSettings();
        }

        private void Port_DataReceived(object sender, SerialDataReceivedEventArgs e)
        {
            if (_port == null || !_port.IsOpen) return;
            try
            {
                int bytesToRead = _port.BytesToRead;
                if (bytesToRead <= 0) return;

                byte[] buffer = new byte[bytesToRead];
                int actualRead = _port.Read(buffer, 0, bytesToRead);
                if (actualRead <= 0) return;

                if (actualRead < bytesToRead)
                {
                    Array.Resize(ref buffer, actualRead);
                }

                string hexRx = BitConverter.ToString(buffer).Replace("-", " ");
                string textRx = FormatAsciiVisible(buffer);

                Dispatcher.Invoke(() =>
                {
                    ProcessIncomingStream(buffer, hexRx, textRx);
                });
            }
            catch { }
        }

        private void ProcessIncomingStream(byte[] rawBytes, string hexRx, string textRx)
        {
            AppendLog($"[RX] < [{hexRx}] \"{textRx}\"");

            string cleanStr = Encoding.ASCII.GetString(rawBytes).Trim();
            if (string.IsNullOrEmpty(cleanStr)) cleanStr = textRx;

            bool isMatch = false;
            string pattern = TxtStopPattern?.Text.Trim() ?? "OK";
            int matchMode = CmbMatchMode?.SelectedIndex ?? 0;

            switch (matchMode)
            {
                case 0: // Contains String
                    if (pattern.Contains("|"))
                    {
                        var parts = pattern.Split('|');
                        foreach (var p in parts)
                        {
                            if (!string.IsNullOrWhiteSpace(p) && (cleanStr.IndexOf(p.Trim(), StringComparison.OrdinalIgnoreCase) >= 0 || textRx.IndexOf(p.Trim(), StringComparison.OrdinalIgnoreCase) >= 0))
                            {
                                isMatch = true;
                                break;
                            }
                        }
                    }
                    else
                    {
                        isMatch = cleanStr.IndexOf(pattern, StringComparison.OrdinalIgnoreCase) >= 0 || textRx.IndexOf(pattern, StringComparison.OrdinalIgnoreCase) >= 0;
                    }
                    break;
                case 1: // Exact HEX / Bytes
                    isMatch = hexRx.Contains(pattern, StringComparison.OrdinalIgnoreCase);
                    break;
                case 2: // Regex
                    try { isMatch = Regex.IsMatch(cleanStr, pattern, RegexOptions.IgnoreCase) || Regex.IsMatch(textRx, pattern, RegexOptions.IgnoreCase); } catch { }
                    break;
                case 3: // Any response
                    isMatch = true;
                    break;
            }

            if (isMatch)
            {
                var hit = new HitItem
                {
                    Time = DateTime.Now.ToString("HH:mm:ss.fff"),
                    KeyNum = _lastSentNum,
                    KeyHex = $"0x{_lastSentNum:X}",
                    Sent = _lastSentPacketStr,
                    Response = $"HEX:[{hexRx}] ASCII:\"{textRx}\""
                };

                HitsList.Insert(0, hit);
                if (TxtHitsCountBadge != null) TxtHitsCountBadge.Text = HitsList.Count.ToString();
                if (TxtHitsGridCount != null)
                {
                    TxtHitsGridCount.Text = _currentLang switch
                    {
                        AppLanguage.UA => $"{HitsList.Count} знайдено",
                        AppLanguage.EN => $"{HitsList.Count} found",
                        _ => $"{HitsList.Count} найдено"
                    };
                }

                if (BannerLatestHit != null) BannerLatestHit.Visibility = Visibility.Visible;
                if (TxtFoundKeyInfo != null) TxtFoundKeyInfo.Text = $"Key: {_lastSentNum} (0x{_lastSentNum:X}) | RX: [{hexRx}] \"{textRx}\"";

                AppendLog($"🎯 [MATCH / HIT FOUND!] Key: {_lastSentNum} (0x{_lastSentNum:X}) -> Response: [{hexRx}] \"{textRx}\"");

                if (ChkStopOnMatch?.IsChecked == true && _isRunning)
                {
                    _cts?.Cancel();
                    _isRunning = false;
                    if (BtnStart != null) BtnStart.IsEnabled = true;
                    if (BtnPause != null) BtnPause.IsEnabled = false;
                    if (BtnStop != null) BtnStop.IsEnabled = false;
                    AppendLog("[ENGINE] Auto-stopped on match condition trigger!");
                }
            }
        }

        private void AppendLog(string message)
        {
            string timeStamp = DateTime.Now.ToString("HH:mm:ss.fff");
            string line = $"{timeStamp}  {message}\r\n";

            _terminalBuffer.Append(line);
            _terminalLineCount++;

            if (_terminalLineCount > 1500)
            {
                string curr = _terminalBuffer.ToString();
                int idx = curr.IndexOf("\r\n", 400);
                if (idx > 0)
                {
                    _terminalBuffer.Clear();
                    _terminalBuffer.Append(curr.Substring(idx + 2));
                    _terminalLineCount = 1100;
                }
            }

            if (TxtTerminalLog != null) TxtTerminalLog.Text = _terminalBuffer.ToString();
            if (TxtTerminalCount != null)
            {
                TxtTerminalCount.Text = _currentLang switch
                {
                    AppLanguage.UA => $"{_terminalLineCount} повідомлень",
                    AppLanguage.EN => $"{_terminalLineCount} messages",
                    _ => $"{_terminalLineCount} сообщений"
                };
            }

            if (ChkAutoScroll?.IsChecked == true && TxtTerminalLog != null)
            {
                TxtTerminalLog.CaretIndex = TxtTerminalLog.Text.Length;
                TxtTerminalLog.ScrollToEnd();
            }
        }

        private void BtnClearLog_Click(object sender, RoutedEventArgs e)
        {
            _terminalBuffer.Clear();
            _terminalLineCount = 0;
            if (TxtTerminalLog != null) TxtTerminalLog.Text = "";
            if (TxtTerminalCount != null)
            {
                TxtTerminalCount.Text = _currentLang switch
                {
                    AppLanguage.UA => "0 повідомлень",
                    AppLanguage.EN => "0 messages",
                    _ => "0 сообщений"
                };
            }
        }

        private void BtnCopyLog_Click(object sender, RoutedEventArgs e)
        {
            if (TxtTerminalLog == null) return;
            try
            {
                Clipboard.SetText(TxtTerminalLog.Text);
                string msg = _currentLang switch
                {
                    AppLanguage.UA => "Лог терміналу скопійовано в буфер обміну!",
                    AppLanguage.EN => "Terminal log copied to clipboard!",
                    _ => "Лог терминала скопирован в буфер обмена!"
                };
                MessageBox.Show(msg, "Copy", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch { }
        }

        private void BtnCopyHit_Click(object sender, RoutedEventArgs e)
        {
            if (HitsList.Count > 0)
            {
                Clipboard.SetText(HitsList[0].KeyNum.ToString());
                string msg = _currentLang switch
                {
                    AppLanguage.UA => $"Числове значення {HitsList[0].KeyNum} скопійовано!",
                    AppLanguage.EN => $"Numeric value {HitsList[0].KeyNum} copied!",
                    _ => $"Числовое значение {HitsList[0].KeyNum} скопировано в буфер!"
                };
                MessageBox.Show(msg, "Copy", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void BtnExportCsv_Click(object sender, RoutedEventArgs e)
        {
            if (HitsList.Count == 0)
            {
                string msg = _currentLang switch
                {
                    AppLanguage.UA => "Немає знайдених збігів для експорту.",
                    AppLanguage.EN => "No captured hits to export.",
                    _ => "Нет найденных совпадений для экспорта."
                };
                MessageBox.Show(msg, "CSV", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            try
            {
                string path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, $"hits_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
                var sb = new StringBuilder();
                sb.AppendLine("Time,KeyDec,KeyHex,SentPacket,DeviceResponse");
                foreach (var h in HitsList)
                {
                    sb.AppendLine($"\"{h.Time}\",{h.KeyNum},\"{h.KeyHex}\",\"{h.Sent}\",\"{h.Response}\"");
                }
                File.WriteAllText(path, sb.ToString(), Encoding.UTF8);
                string msg = _currentLang switch
                {
                    AppLanguage.UA => $"Файл успішно збережено:\n{path}",
                    AppLanguage.EN => $"File saved successfully:\n{path}",
                    _ => $"Файл успешно сохранён:\n{path}"
                };
                MessageBox.Show(msg, "CSV Export", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Export error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
