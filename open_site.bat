@echo off
chcp 65001 > nul
cd /d "c:\Users\37061\Downloads\remont"

:: Всегда обновляем реальные фотографии в папке проекта
copy /Y "C:\Users\37061\.gemini\antigravity-ide\brain\1c7d5acd-e32c-4c0f-bf32-141e6715473b\hero_architect_photo_1786354626613.png" "hero_engineer.png" > nul 2>&1
copy /Y "C:\Users\37061\.gemini\antigravity-ide\brain\1c7d5acd-e32c-4c0f-bf32-141e6715473b\laser_leveling_precision_1786352431809.png" "laser_precision.png" > nul 2>&1
copy /Y "C:\Users\37061\.gemini\antigravity-ide\brain\1c7d5acd-e32c-4c0f-bf32-141e6715473b\portfolio_penthouse_luxury_1786352458126.png" "portfolio_penthouse.png" > nul 2>&1
copy /Y "C:\Users\37061\.gemini\antigravity-ide\brain\1c7d5acd-e32c-4c0f-bf32-141e6715473b\portfolio_office_corporate_1786352485231.png" "portfolio_office.png" > nul 2>&1
copy /Y "C:\Users\37061\.gemini\antigravity-ide\brain\1c7d5acd-e32c-4c0f-bf32-141e6715473b\video_review_office_1786270676228.png" "video_office.png" > nul 2>&1
copy /Y "C:\Users\37061\.gemini\antigravity-ide\brain\1c7d5acd-e32c-4c0f-bf32-141e6715473b\video_review_apartment_1786270695152.png" "video_apartment.png" > nul 2>&1

:: Открытие сайта в браузере
start "" "c:\Users\37061\Downloads\remont\index.html"
