$ErrorActionPreference = "Continue"
$base = "https://academy-management-alpha.vercel.app/api/v1"

function Test-Api {
    param($name, $method, $url, $body, $token)
    $headers = @{ "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    try {
        if ($body) {
            $json = $body | ConvertTo-Json -Depth 10
            $resp = Invoke-WebRequest -Uri $url -Method $method -Body $json -Headers $headers -UseBasicParsing
        } else {
            $resp = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -UseBasicParsing
        }
        Write-Host "[PASS] $name -> $($resp.StatusCode)" -ForegroundColor Green
        return $resp.Content | ConvertFrom-Json
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $msg = $_.ErrorDetails.Message
        Write-Host "[FAIL] $name -> $status : $msg" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n=== HEALTH ===" -ForegroundColor Cyan
Test-Api "Health Check" "GET" "$base/health" | Out-Null

Write-Host "`n=== AUTH ===" -ForegroundColor Cyan
$login = Test-Api "Login (admin)" "POST" "$base/auth/login" @{ mobile="9999999999"; password="admin123" }
if (-not $login) { Write-Host "Login failed - aborting" -ForegroundColor Red; exit 1 }
$token = $login.data.tokens.accessToken
if (-not $token) { Write-Host "Could not extract token" -ForegroundColor Red; exit 1 }
Write-Host "Token: $($token.Substring(0,30))..." -ForegroundColor Yellow

Test-Api "Get Profile" "GET" "$base/auth/profile" $null $token | Out-Null

Write-Host "`n=== USERS ===" -ForegroundColor Cyan
Test-Api "List Users" "GET" "$base/users" $null $token | Out-Null
Test-Api "List Coaches" "GET" "$base/users?role=coach" $null $token | Out-Null

Write-Host "`n=== STUDENTS ===" -ForegroundColor Cyan
Test-Api "List Students" "GET" "$base/students" $null $token | Out-Null

Write-Host "`n=== CLASSES ===" -ForegroundColor Cyan
Test-Api "List Classes" "GET" "$base/classes" $null $token | Out-Null

Write-Host "`n=== ATTENDANCE ===" -ForegroundColor Cyan
Test-Api "List Attendance" "GET" "$base/attendance" $null $token | Out-Null

Write-Host "`n=== PAYMENTS ===" -ForegroundColor Cyan
Test-Api "List Payments" "GET" "$base/payments" $null $token | Out-Null

Write-Host "`n=== REPORTS ===" -ForegroundColor Cyan
Test-Api "Dashboard Report" "GET" "$base/reports/dashboard" $null $token | Out-Null
Test-Api "Enrollment Report" "GET" "$base/reports/enrollment" $null $token | Out-Null
Test-Api "Attendance Report" "GET" "$base/reports/attendance" $null $token | Out-Null
Test-Api "Payments Report" "GET" "$base/reports/payments" $null $token | Out-Null

Write-Host "`n=== DONE ===" -ForegroundColor Cyan
