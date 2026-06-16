@echo off
echo ========================================
echo   Abrir Firewall para Notification Server
echo ========================================
echo.
echo Este script vai permitir a porta 3000 no Firewall do Windows
echo para que a app Android possa acessar o servidor.
echo.
pause

echo.
echo A adicionar regra ao Firewall...
netsh advfirewall firewall add rule name="Notification Server" dir=in action=allow protocol=TCP localport=3000

if %errorlevel% == 0 (
    echo.
    echo ✅ Firewall configurado com sucesso!
    echo A porta 3000 está agora aberta.
) else (
    echo.
    echo ❌ Erro ao configurar firewall.
    echo Tente executar como Administrador (botão direito > Executar como administrador)
)

echo.
pause

