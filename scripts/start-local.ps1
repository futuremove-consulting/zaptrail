<#
.SYNOPSIS
    ZapTrail — Inicializador Local (Porta 3001)
.DESCRIPTION
    Inicia o servidor HTTP standalone do ZapTrail na porta 3001 (/health e /api/v1/ingest/whatsapp)
    para integração com o PilotCRM (porta 3000).
#>
param (
    [int]$Port = 3001,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path "$ScriptDir\..").Path

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "⚡ ZAPTRAIL — MOTOR DE INTELIGÊNCIA CONVERSACIONAL (PORTA $Port)" -ForegroundColor Green
Write-Host "Diretório: $RepoRoot" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan

function Test-PortListening {
    param([int]$PortNumber)
    $conn = Get-NetTCPConnection -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue
    return [bool]$conn
}

if (Test-PortListening $Port) {
    Write-Host "✅ [ZapTrail Server] Já está em execução na porta $Port." -ForegroundColor Green
    if (-not $NoBrowser) {
        Start-Process "http://localhost:$Port/health"
    }
} else {
    Write-Host "⏳ [ZapTrail Server] Inicializando servidor HTTP na porta $Port..." -ForegroundColor Yellow
    Set-Location $RepoRoot
    $env:ZAPTRAIL_PORT = "$Port"
    if (-not $NoBrowser) {
        Start-Job -ScriptBlock {
            param($p)
            Start-Sleep -Seconds 2
            Start-Process "http://localhost:$p/health"
        } -ArgumentList $Port | Out-Null
    }
    & npx.cmd tsx src/server.ts
}
