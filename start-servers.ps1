Start-Process "powershell" -ArgumentList "-NoExit","-Command","cd 'C:\\Users\\hp\\Desktop\\Gestion-services\\backend'; php artisan serve"
Start-Process "powershell" -ArgumentList "-NoExit","-Command","cd 'C:\\Users\\hp\\Desktop\\Gestion-services\\frontend'; npm run dev"
