# Script PowerShell para abrir Firewall
# Execute como Administrador: botão direito > Executar como administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Abrir Firewall para Notification Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "A adicionar regra ao Firewall..." -ForegroundColor Yellow
    
    New-NetFirewallRule -DisplayName "Notification Server" `
        -Direction Inbound `
        -LocalPort 3000 `
        -Protocol TCP `
        -Action Allow `
        -ErrorAction Stop
    
    Write-Host ""
    Write-Host "✅ Firewall configurado com sucesso!" -ForegroundColor Green
    Write-Host "A porta 3000 está agora aberta." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao configurar firewall:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Certifique-se de executar como Administrador!" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Pressione Enter para sair"

