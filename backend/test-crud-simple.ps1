$ErrorActionPreference = "SilentlyContinue"

Write-Host "TEST 1: Register User"
$registerBody = '{"email":"testuser@example.com","password":"Test123!@#","name":"Test User"}'
$reg = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -UseBasicParsing -Headers @{'Content-Type'='application/json'} -Body $registerBody
$regData = $reg.Content | ConvertFrom-Json
$token = $regData.token
Write-Host "Status: $($reg.StatusCode)"
Write-Host "Token: $($token.Substring(0,30))..."

Write-Host "`nTEST 2: Create Project"
$projBody = '{"name":"Test Project","description":"For testing","color":"#3498db"}'
$projResp = Invoke-WebRequest -Uri "http://localhost:3000/api/projects" -Method POST -UseBasicParsing -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body $projBody
$projData = $projResp.Content | ConvertFrom-Json
$projectId = $projData.data.id
Write-Host "Status: $($projResp.StatusCode)"
Write-Host "Project ID: $projectId"

Write-Host "`nTEST 3: Create Task"
$taskBody = '{"title":"Buy milk","description":"From store","priority":"high","projectId":"' + $projectId + '","dueDate":"2026-04-15T10:00:00Z"}'
$taskResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" -Method POST -UseBasicParsing -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body $taskBody
$taskData = $taskResp.Content | ConvertFrom-Json
$taskId = $taskData.data.id
Write-Host "Status: $($taskResp.StatusCode)"
Write-Host "Task ID: $taskId"

Write-Host "`nTEST 4: Get Tasks"
$listResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" -Method GET -UseBasicParsing -Headers @{'Authorization'="Bearer $token"}
$listData = $listResp.Content | ConvertFrom-Json
Write-Host "Status: $($listResp.StatusCode)"
Write-Host "Tasks found: $($listData.count)"

Write-Host "`nTEST 5: Get Task Detail"
$detResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks/$taskId" -Method GET -UseBasicParsing -Headers @{'Authorization'="Bearer $token"}
$detData = $detResp.Content | ConvertFrom-Json
Write-Host "Status: $($detResp.StatusCode)"
Write-Host "Title: $($detData.data.title)"

Write-Host "`nTEST 6: Update Task"
$updBody = '{"title":"Buy milk and cheese"}'
$updResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks/$taskId" -Method PUT -UseBasicParsing -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body $updBody
$updData = $updResp.Content | ConvertFrom-Json
Write-Host "Status: $($updResp.StatusCode)"
Write-Host "New title: $($updData.data.title)"

Write-Host "`nTEST 7: Delete Task"
$delResp = Invoke-WebRequest -Uri "http://localhost:3000/api/tasks/$taskId" -Method DELETE -UseBasicParsing -Headers @{'Authorization'="Bearer $token"}
Write-Host "Status: $($delResp.StatusCode)"

Write-Host "`nAll tests completed!"
