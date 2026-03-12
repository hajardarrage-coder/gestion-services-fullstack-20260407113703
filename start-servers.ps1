Start-Process "powershell" -ArgumentList "-NoExit","-Command","cd 'C:\\Users\\hp\\Desktop\\Gestion-services\\backend'; & 'C:\\xampp\\php\\php.exe' artisan serve"
Start-Process "powershell" -ArgumentList "-NoExit","-Command","cd 'C:\\Users\\hp\\Desktop\\Gestion-services\\frontend'; & 'C:\\Program Files\\nodejs\\npm.cmd' run dev"
