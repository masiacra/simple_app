/*
 * Primari file for the API
 * 
 * 
 */
 
 
//Зависимости
const server = require('./lib/server');
//const workers = require('./lib/workers');

//Объявляем приложение
const app = {};

//Инициирующая функция
app.init = () => {
	//Запускаем сервер
	server.init();
	
	//Запускаем worker-ы
	//workers.init();
};

//Выполняем инициирующую функцию
app.init(); 
