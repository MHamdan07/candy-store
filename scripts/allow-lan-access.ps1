Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Configuring Windows for Mobile Wi-Fi Access..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Change Network Category to Private so local devices can communicate
try {
  Set-NetConnectionProfile -InterfaceIndex 13 -NetworkCategory Private
  Write-Host "[OK] Wi-Fi Network set to Private (devices can connect)" -ForegroundColor Green
} catch {
  Write-Host "[Notice] Could not set network profile: $_" -ForegroundColor DarkYellow
}

# 2. Allow Port 3000 in Windows Defender Firewall
try {
  Remove-NetFirewallRule -DisplayName "Candi Dev Server 3000" -ErrorAction SilentlyContinue
  New-NetFirewallRule -DisplayName "Candi Dev Server 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow | Out-Null
  Write-Host "[OK] Inbound Port 3000 allowed in Windows Firewall" -ForegroundColor Green
} catch {
  Write-Host "[Notice] Could not set firewall rule: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "SUCCESS! Your website is accessible at: http://192.168.43.59:3000" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan
Start-Sleep -Seconds 5
