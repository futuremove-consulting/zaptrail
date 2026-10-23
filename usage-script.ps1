$ErrorActionPreference = 'Continue'
$all = @()
1..4 | ForEach-Object {
  try { $all += (Invoke-RestMethod -Uri ("https://api.github.com/repos/futuremove-consulting/pilotcrm/actions/runs?per_page=100&page=" + $_) -Headers @{Authorization = "token $env:GH_TOKEN"; 'User-Agent' = 'gh'}).workflow_runs } catch {}
}
$rows = @()
foreach ($r in $all) {
  $mins = 0
  if ($r.conclusion -eq 'success' -or ($r.conclusion -eq 'failure' -and $r.run_started_at)) {
    try {
      $jobs = (Invoke-RestMethod -Uri ("https://api.github.com/repos/futuremove-consulting/pilotcrm/actions/runs/" + $r.id + "/jobs?per_page=100") -Headers @{Authorization = "token $env:GH_TOKEN"; 'User-Agent' = 'gh'}).jobs
      foreach ($j in $jobs) { if ($j.started_at -and $j.completed_at) { $mins += (([datetime]$j.completed_at) - ([datetime]$j.started_at)).TotalMinutes } }
    } catch {}
  }
  $rows += [pscustomobject]@{ date = $r.created_at.Substring(0,10); conclusion = $r.conclusion; mins = [math]::Round($mins,1); name = $r.name }
}
$rows | Export-Csv -Path 'C:\Users\Gustavo\.cline\data\workspaces\chat\actions-usage.csv' -NoTypeInformation
($rows | Group-Object date | ForEach-Object { $_.Name + ': runs=' + $_.Count + ' min=' + [math]::Round(($_.Group | Measure-Object mins -Sum).Sum,1) }) | Set-Content 'C:\Users\Gustavo\.cline\data\workspaces\chat\actions-usage-summary.txt'
'SUM=' + [math]::Round(($rows | Measure-Object mins -Sum).Sum,0) | Add-Content 'C:\Users\Gustavo\.cline\data\workspaces\chat\actions-usage-summary.txt'
