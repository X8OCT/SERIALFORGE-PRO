using System;
using System.Windows;

namespace SerialForgeWpf
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            this.DispatcherUnhandledException += (sender, args) =>
            {
                MessageBox.Show($"Произошла ошибка:\n{args.Exception.Message}\n\nСтек:\n{args.Exception.StackTrace}", "Ошибка SerialForge", MessageBoxButton.OK, MessageBoxImage.Error);
                args.Handled = true;
            };

            AppDomain.CurrentDomain.UnhandledException += (sender, args) =>
            {
                if (args.ExceptionObject is Exception ex)
                {
                    MessageBox.Show($"Критическая ошибка:\n{ex.Message}\n\nСтек:\n{ex.StackTrace}", "Критическая ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            };
        }
    }
}
