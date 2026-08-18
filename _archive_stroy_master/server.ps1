$port = 3000
$path = "c:\Users\37061\Downloads\remont"
$brainDir = "C:\Users\37061\.gemini\antigravity-ide\brain\1c7d5acd-e32c-4c0f-bf32-141e6715473b"

# Автоматическая синхронизация всех изображений при старте сервера
if (Test-Path $brainDir) {
    Copy-Item "$brainDir\hero_chief_engineer_site_1786437032218.png" "$path\hero_engineer.png" -Force -ErrorAction SilentlyContinue
    Copy-Item "$brainDir\laser_leveling_precision_1786352431809.png" "$path\laser_precision.png" -Force -ErrorAction SilentlyContinue
    Copy-Item "$brainDir\portfolio_penthouse_luxury_1786352458126.png" "$path\portfolio_penthouse.png" -Force -ErrorAction SilentlyContinue
    Copy-Item "$brainDir\portfolio_office_corporate_1786352485231.png" "$path\portfolio_office.png" -Force -ErrorAction SilentlyContinue
    Copy-Item "$brainDir\video_review_office_1786270676228.png" "$path\video_office.png" -Force -ErrorAction SilentlyContinue
    Copy-Item "$brainDir\video_review_apartment_1786270695152.png" "$path\video_apartment.png" -Force -ErrorAction SilentlyContinue
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Host "Порт $port занят, пробуем 8080..."
    $port = 8080
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
}

Write-Host "=========================================================="
Write-Host "  Сервер Строй-Мастер запущен: http://localhost:$port/"
Write-Host "  Все изображения синхронизированы и загружены локально"
Write-Host "  Нажмите Ctrl+C в этом окне для остановки сервера"
Write-Host "=========================================================="

Start-Process "http://localhost:$port/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/" -or $localPath -eq "" -or [string]::IsNullOrWhiteSpace($localPath)) {
            $localPath = "/index.html"
        }

        $filePath = Join-Path $path $localPath.TrimStart('/')

        # Если файл не найден в рабочей папке, берем напрямую из brain хранилища
        if (-not (Test-Path $filePath -PathType Leaf) -and (Test-Path $brainDir)) {
            $fileName = [System.IO.Path]::GetFileName($localPath)
            if ($fileName -eq "hero_engineer.png" -or $fileName -eq "hero.png" -or $fileName -eq "hero_engineer.jpg") {
                $filePath = "$brainDir\hero_chief_engineer_site_1786437032218.png"
            } elseif ($fileName -eq "laser_precision.png") {
                $filePath = "$brainDir\laser_leveling_precision_1786352431809.png"
            } elseif ($fileName -eq "portfolio_penthouse.png") {
                $filePath = "$brainDir\portfolio_penthouse_luxury_1786352458126.png"
            } elseif ($fileName -eq "portfolio_office.png") {
                $filePath = "$brainDir\portfolio_office_corporate_1786352485231.png"
            } elseif ($fileName -eq "video_office.png") {
                $filePath = "$brainDir\video_review_office_1786270676228.png"
            } elseif ($fileName -eq "video_apartment.png") {
                $filePath = "$brainDir\video_review_apartment_1786270695152.png"
            }
        }

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".htm"  { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # Игнорировать закрытые клиентом соединения
    }
}
