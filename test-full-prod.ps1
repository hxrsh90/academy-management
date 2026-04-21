$ErrorActionPreference = "Continue"
$base = "https://academy-management-alpha.vercel.app/api/v1"
$ts = [int](Get-Date -UFormat %s)

function Test-Api {
    param($name, $method, $url, $body, $token)
    $headers = @{ "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    try {
        if ($body) {
            $json = $body | ConvertTo-Json -Depth 10 -Compress
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

Write-Host "`n=== AUTH ===" -ForegroundColor Cyan
Test-Api "Health" "GET" "$base/health" | Out-Null
$login = Test-Api "Login (super admin)" "POST" "$base/auth/login" @{ mobile="9999999999"; password="admin123" }
if (-not $login) { Write-Host "Login failed - aborting" -ForegroundColor Red; exit 1 }
$token = $login.data.tokens.accessToken
Test-Api "Profile" "GET" "$base/auth/profile" $null $token | Out-Null

Write-Host "`n=== CREATE COACH (admin-only) ===" -ForegroundColor Cyan
$coachMobile = "9" + ($ts.ToString().Substring($ts.ToString().Length - 9))
$newCoach = Test-Api "Create Coach" "POST" "$base/users" @{
    mobile = $coachMobile
    email = "coach_$ts@test.com"
    password = "coach1234"
    role = "coach"
} $token
$coachId = $newCoach.data.id
Write-Host "  Coach created: id=$coachId, mobile=$coachMobile"

Write-Host "`n=== CREATE STUDENT ===" -ForegroundColor Cyan
$studentMobile = "8" + ($ts.ToString().Substring($ts.ToString().Length - 9))
$newStudent = Test-Api "Create Student" "POST" "$base/students" @{
    firstName = "Test"
    lastName = "Student$ts"
    mobile = $studentMobile
    email = "student_$ts@test.com"
    password = "student1234"
    dateOfBirth = "2010-01-15"
    gender = "male"
    skillLevel = "beginner"
} $token
$studentId = $newStudent.data.id
Write-Host "  Student created: id=$studentId, mobile=$studentMobile"

Write-Host "`n=== CREATE BATCH ===" -ForegroundColor Cyan
$newBatch = Test-Api "Create Batch" "POST" "$base/batches" @{
    name = "Test Batch $ts"
    description = "Automated test batch"
    sportType = "football"
    skillLevel = "beginner"
    coachId = $coachId
    capacity = 20
} $token
$batchId = $newBatch.data.id
Write-Host "  Batch created: id=$batchId"

Write-Host "`n=== CREATE CLASS (linked to batch) ===" -ForegroundColor Cyan
$newClass = Test-Api "Create Class" "POST" "$base/classes" @{
    name = "Test Class $ts"
    sportType = "football"
    dayOfWeek = "monday"
    startTime = "16:00"
    endTime = "17:00"
    capacity = 20
    venue = "Ground A"
    coachId = $coachId
} $token
$classId = $newClass.data.id
Write-Host "  Class created: id=$classId"

Write-Host "`n=== BATCH OPERATIONS ===" -ForegroundColor Cyan
Test-Api "List Batches" "GET" "$base/batches" $null $token | Out-Null
Test-Api "Get Batch" "GET" "$base/batches/$batchId" $null $token | Out-Null
if ($studentId -and $batchId) {
    Test-Api "Add Student to Batch" "POST" "$base/batches/$batchId/students" @{ studentId = $studentId } $token | Out-Null
    Test-Api "Get Batch Students" "GET" "$base/batches/$batchId/students" $null $token | Out-Null
    Test-Api "Get Batch Classes" "GET" "$base/batches/$batchId/classes" $null $token | Out-Null
}

Write-Host "`n=== CLASS OPERATIONS ===" -ForegroundColor Cyan
if ($studentId -and $classId) {
    Test-Api "Add Student to Class" "POST" "$base/classes/$classId/students" @{ studentId = $studentId } $token | Out-Null
    Test-Api "Get Class Students" "GET" "$base/classes/$classId/students" $null $token | Out-Null
}

Write-Host "`n=== ATTENDANCE ===" -ForegroundColor Cyan
if ($classId -and $studentId) {
    Test-Api "Mark Attendance" "POST" "$base/attendance" @{
        classId = $classId
        studentId = $studentId
        date = (Get-Date -Format "yyyy-MM-dd")
        status = "present"
    } $token | Out-Null
}
Test-Api "List Attendance" "GET" "$base/attendance" $null $token | Out-Null

Write-Host "`n=== PAYMENTS ===" -ForegroundColor Cyan
if ($studentId) {
    Test-Api "Record Payment" "POST" "$base/payments" @{
        studentId = $studentId
        amount = 1500
        paymentDate = (Get-Date -Format "yyyy-MM-dd")
        paymentMode = "cash"
        feeType = "monthly"
    } $token | Out-Null
}
Test-Api "List Payments" "GET" "$base/payments" $null $token | Out-Null

Write-Host "`n=== REPORTS ===" -ForegroundColor Cyan
Test-Api "Dashboard" "GET" "$base/reports/dashboard" $null $token | Out-Null
Test-Api "Enrollment Report" "GET" "$base/reports/enrollment" $null $token | Out-Null
Test-Api "Attendance Report" "GET" "$base/reports/attendance" $null $token | Out-Null
Test-Api "Payments Report" "GET" "$base/reports/payments" $null $token | Out-Null

Write-Host "`n=== COACH LOGIN ===" -ForegroundColor Cyan
$coachLogin = Test-Api "Coach Login" "POST" "$base/auth/login" @{ mobile=$coachMobile; password="coach1234" }
if ($coachLogin) {
    $coachToken = $coachLogin.data.tokens.accessToken
    Test-Api "Coach sees Batches" "GET" "$base/batches" $null $coachToken | Out-Null
    Test-Api "Coach sees Classes" "GET" "$base/classes" $null $coachToken | Out-Null
}

Write-Host "`n=== CHANGE PASSWORD ===" -ForegroundColor Cyan
# Change admin password then change it back
$cp1 = Test-Api "Change Password" "POST" "$base/auth/change-password" @{
    currentPassword = "admin123"
    newPassword = "admin12345"
} $token
if ($cp1) {
    Test-Api "Revert Password" "POST" "$base/auth/change-password" @{
        currentPassword = "admin12345"
        newPassword = "admin123"
    } $token | Out-Null
}

Write-Host "`n=== CLEANUP ===" -ForegroundColor Cyan
if ($batchId) { Test-Api "Delete Batch" "DELETE" "$base/batches/$batchId" $null $token | Out-Null }
if ($classId) { Test-Api "Delete Class" "DELETE" "$base/classes/$classId" $null $token | Out-Null }
if ($studentId) { Test-Api "Delete Student" "DELETE" "$base/students/$studentId" $null $token | Out-Null }

Write-Host "`n=== DONE ===" -ForegroundColor Cyan
