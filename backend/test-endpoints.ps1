#!/usr/bin/env pwsh

# Colors
$green = [System.ConsoleColor]::Green
$red = [System.ConsoleColor]::Red
$yellow = [System.ConsoleColor]::Yellow

Write-Host "=== Task Manager CRUD Test ===" -ForegroundColor Cyan

# Test 1: Register
Write-Host "`n[TEST 1] Register User" -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    password = "Test123!@#"
    name = "Test User"
} | ConvertTo-Json

try {
    $registerResp = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
        -Method POST -UseBasicParsing `
        -Headers @{'Content-Type'='application/json'} `
        -Body $registerBody -ErrorAction SilentlyContinue
    
    $registerData = $registerResp.Content | ConvertFrom-Json
    $token = $registerData.token
    Write-Host "✅ Success: $($registerResp.StatusCode)" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Create Project
Write-Host "`n[TEST 2] Create Project" -ForegroundColor Yellow
$projectBody = @{
    name = "Project Alpha"
    description = "Test project"
    color = "#3498db"
} | ConvertTo-Json

try {
    $projectResp = Invoke-WebRequest -Uri "http://localhost:3000/api/projects" `
        -Method POST -UseBasicParsing `
        -Headers @{
            'Content-Type' = 'application/json'
            'Authorization' = "Bearer $token"
        } `
        -Body $projectBody -ErrorAction SilentlyContinue
    
    $projectData = $projectResp.Content | ConvertFrom-Json
    $projectId = $projectData.data.id
    Write-Host "✅ Success: $($projectResp.StatusCode)" -ForegroundColor Green
    Write-Host "Project ID: $projectId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 3: Create Task
Write-Host "`n[TEST 3] Create Task" -ForegroundColor Yellow
$taskBody = @{
    title = "Buy groceries"
    description = "Milk, eggs, bread"
    priority = "high"
    projectId = $projectId
    dueDate = "2026-04-15T10:00:00Z"
} | ConvertTo-Json

try {
    $taskResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" `
        -Method POST -UseBasicParsing `
        -Headers @{
            'Content-Type' = 'application/json'
            'Authorization' = "Bearer $token"
        } `
        -Body $taskBody -ErrorAction SilentlyContinue
    
    $taskData = $taskResp.Content | ConvertFrom-Json
    $taskId = $taskData.data.id
    Write-Host "✅ Success: $($taskResp.StatusCode)" -ForegroundColor Green
    Write-Host "Task ID: $taskId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 4: Get Tasks List
Write-Host "`n[TEST 4] Get Tasks List" -ForegroundColor Yellow
try {
    $listResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" `
        -Method GET -UseBasicParsing `
        -Headers @{'Authorization' = "Bearer $token"} -ErrorAction SilentlyContinue
    
    $listData = $listResp.Content | ConvertFrom-Json
    Write-Host "✅ Success: $($listResp.StatusCode)" -ForegroundColor Green
    Write-Host "Tasks Count: $($listData.count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 5: Get Task by ID
Write-Host "`n[TEST 5] Get Task Detail" -ForegroundColor Yellow
try {
    $detailResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks/$taskId" `
        -Method GET -UseBasicParsing `
        -Headers @{'Authorization' = "Bearer $token"} -ErrorAction SilentlyContinue
    
    $detailData = $detailResp.Content | ConvertFrom-Json
    Write-Host "✅ Success: $($detailResp.StatusCode)" -ForegroundColor Green
    Write-Host "Task Title: $($detailData.data.title)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 6: Update Task
Write-Host "`n[TEST 6] Update Task" -ForegroundColor Yellow
$updateBody = @{
    title = "Buy groceries and cook"
    priority = "medium"
} | ConvertTo-Json

try {
    $updateResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks/$taskId" `
        -Method PUT -UseBasicParsing `
        -Headers @{
            'Content-Type' = 'application/json'
            'Authorization' = "Bearer $token"
        } `
        -Body $updateBody -ErrorAction SilentlyContinue
    
    $updateData = $updateResp.Content | ConvertFrom-Json
    Write-Host "✅ Success: $($updateResp.StatusCode)" -ForegroundColor Green
    Write-Host "Updated Title: $($updateData.data.title)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 7: Update Task Status
Write-Host "`n[TEST 7] Update Task Status" -ForegroundColor Yellow
$statusBody = @{
    status = "done"
} | ConvertTo-Json

try {
    $statusResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks/$taskId/status" `
        -Method PATCH -UseBasicParsing `
        -Headers @{
            'Content-Type' = 'application/json'
            'Authorization' = "Bearer $token"
        } `
        -Body $statusBody -ErrorAction SilentlyContinue
    
    $statusData = $statusResp.Content | ConvertFrom-Json
    Write-Host "✅ Success: $($statusResp.StatusCode)" -ForegroundColor Green
    Write-Host "New Status: $($statusData.data.status)" -ForegroundColor Green
    Write-Host "CompletedAt: $($statusData.data.completedAt)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 8: Get Projects
Write-Host "`n[TEST 8] Get Projects List" -ForegroundColor Yellow
try {
    $projListResp = Invoke-WebRequest -Uri "http://localhost:3000/api/projects" `
        -Method GET -UseBasicParsing `
        -Headers @{'Authorization' = "Bearer $token"} -ErrorAction SilentlyContinue
    
    $projListData = $projListResp.Content | ConvertFrom-Json
    Write-Host "✅ Success: $($projListResp.StatusCode)" -ForegroundColor Green
    Write-Host "Projects Count: $($projListData.count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 9: Delete Task (soft delete)
Write-Host "`n[TEST 9] Delete Task" -ForegroundColor Yellow
try {
    $deleteResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks/$taskId" `
        -Method DELETE -UseBasicParsing `
        -Headers @{'Authorization' = "Bearer $token"} -ErrorAction SilentlyContinue
    
    Write-Host "✅ Success: $($deleteResp.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host "`n=== All Tests Complete ===" -ForegroundColor Cyan
