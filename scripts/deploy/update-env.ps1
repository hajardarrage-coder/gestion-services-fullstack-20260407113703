param(
    [Parameter(Mandatory = $true)]
    [string]$BackendUrl,

    [Parameter(Mandatory = $true)]
    [string]$FrontendUrl,

    [Parameter(Mandatory = $true)]
    [string]$DbHost,

    [Parameter(Mandatory = $true)]
    [string]$DbDatabase,

    [Parameter(Mandatory = $true)]
    [string]$DbUsername,

    [Parameter(Mandatory = $true)]
    [string]$DbPassword,

    [string]$DbPort = "3306"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Upsert-EnvValue {
    param(
        [Parameter(Mandatory = $true)]
        [ref]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Key,

        [Parameter(Mandatory = $true)]
        [string]$Value,

        [switch]$Raw
    )

    $rendered = if ($Raw.IsPresent) {
        "$Key=$Value"
    } else {
        $escaped = $Value.Replace('"', '\"')
        "$Key=`"$escaped`""
    }

    $pattern = "^\s*$([regex]::Escape($Key))="
    $index = -1

    for ($i = 0; $i -lt $Lines.Value.Count; $i++) {
        if ($Lines.Value[$i] -match $pattern) {
            $index = $i
            break
        }
    }

    if ($index -ge 0) {
        $Lines.Value[$index] = $rendered
    } else {
        $Lines.Value += $rendered
    }
}

function Ensure-EnvFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$TemplatePath
    )

    if (Test-Path -LiteralPath $Path) {
        return
    }

    if (-not (Test-Path -LiteralPath $TemplatePath)) {
        throw "Template file not found: $TemplatePath"
    }

    Copy-Item -LiteralPath $TemplatePath -Destination $Path
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$backendEnv = Join-Path $repoRoot "backend\.env"
$backendTemplate = Join-Path $repoRoot "backend\.env.example"
$frontendEnv = Join-Path $repoRoot "frontend\.env"
$frontendTemplate = Join-Path $repoRoot "frontend\.env.example"

Ensure-EnvFile -Path $backendEnv -TemplatePath $backendTemplate
Ensure-EnvFile -Path $frontendEnv -TemplatePath $frontendTemplate

$backendBase = $BackendUrl.Trim().TrimEnd("/")
$frontendBase = $FrontendUrl.Trim().TrimEnd("/")

$frontendUri = [Uri]$frontendBase
$frontendStateful = if ($frontendUri.IsDefaultPort) {
    $frontendUri.Host
} else {
    "$($frontendUri.Host):$($frontendUri.Port)"
}

$sanctumDomains = @(
    "localhost",
    "127.0.0.1",
    $frontendStateful
) | Select-Object -Unique

$backendLines = Get-Content -LiteralPath $backendEnv
if ($backendLines.Count -eq 0) {
    $backendLines = @("")
}

Upsert-EnvValue -Lines ([ref]$backendLines) -Key "APP_ENV" -Value "production" -Raw
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "APP_DEBUG" -Value "false" -Raw
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "APP_URL" -Value $backendBase
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "FRONTEND_URL" -Value $frontendBase
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "CORS_ALLOWED_ORIGINS" -Value $frontendBase
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "SANCTUM_STATEFUL_DOMAINS" -Value ($sanctumDomains -join ",")
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "DB_CONNECTION" -Value "mysql" -Raw
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "DB_HOST" -Value $DbHost
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "DB_PORT" -Value $DbPort -Raw
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "DB_DATABASE" -Value $DbDatabase
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "DB_USERNAME" -Value $DbUsername
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "DB_PASSWORD" -Value $DbPassword
Upsert-EnvValue -Lines ([ref]$backendLines) -Key "MYSQL_ATTR_SSL_CA" -Value "/etc/ssl/certs/ca-certificates.crt"

Set-Content -LiteralPath $backendEnv -Value $backendLines

$frontendLines = Get-Content -LiteralPath $frontendEnv
if ($frontendLines.Count -eq 0) {
    $frontendLines = @("")
}

$apiUrl = "$backendBase/api"
Upsert-EnvValue -Lines ([ref]$frontendLines) -Key "VITE_API_URL" -Value $apiUrl
Upsert-EnvValue -Lines ([ref]$frontendLines) -Key "VITE_SECURE_API_URL" -Value $apiUrl

Set-Content -LiteralPath $frontendEnv -Value $frontendLines

Write-Output "Updated backend/.env and frontend/.env for deployment."
Write-Output "Backend URL: $backendBase"
Write-Output "Frontend URL: $frontendBase"
