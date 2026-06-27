$path = "c:\Users\USCHIP\Documents\PRACTICE\WEATHER APP\weather-app\src\components\Header.jsx"
$content = Get-Content $path -Raw
$content = $content -replace "  const \{current\} = data;\r?\n", "  "
$content = $content -replace "  console\.log\(current\)\r?\n", "  "
Set-Content $path -Value $content -NoNewline