$path = "c:\Users\USCHIP\Documents\PRACTICE\WEATHER APP\weather-app\src\components\Header.jsx"
$lines = Get-Content $path
$newLines = @()
$skip = $false
foreach ($line in $lines) {
    if ($line -match 'if \(data\?') {
        $skip = $true
    }
    if (-not $skip) {
        $newLines += $line
    } else {
        if ($line -match '}, \[data\]\)') {
            $skip = $false
        }
    }
}
$newLines | Set-Content $path
