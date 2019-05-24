/*
 * 
 * Задачи относящиеся к серверу
 * 
 */


//Зависимости
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const _data = require('./data');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');


//Инициализируем модуль сервера
const server = {};

//Сервер должен отвечать на все запросы строкой
server.httpServer = http.createServer(unifiedServer);



function unifiedServer(req, res) {
	//Получаем URL и парсим
	var parsedUrl = url.parse(req.url,true);
	//Получаем путь
	var npath = parsedUrl.pathname;
	//Удаляем слэши
	var trimmedPath = npath.replace(/^\/+|\/+$/g, '');

	
	//Получаем метод запроса HTTP
	var method = req.method.toLowerCase();
	
	//Получаем объект query string
	var queryStringObj = parsedUrl.query;
	
	//Получаем объект заголовков запроса
	var headers = req.headers;
	
	//Get the payload
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data', data => {
		buffer += decoder.write(data);
	});
	
	req.on('end', () => {
		buffer += decoder.end();
		//Выбираем обработчик
		const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ?
			server.router[trimmedPath] : handlers.notFound;
		
		console.log(buffer);
		
		
		//Сооружаем объект данных для передачи в обработчик
		const data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObj,
			'method': method,
			'headers': headers,
			'payload': helpers.parseJsonToObject(buffer)
		};
		
		//Направляем запрос к обработчику, указанному в роутере
		chosenHandler(data, (statusCode, payload) => {
			//исп. статус переданный обработчиком или по умолчанию
			statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
			
			//исп. нагрузку переданную обработчиком или по умолчанию
			payload = typeof(payload) === 'object' ? payload : {};
			
			//Преобразуем нагрузку в строку
			var payloadStr = JSON.stringify(payload);
			
			//Возвращаем ответ
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadStr);
			
			console.log('Returning this response', statusCode, 
				payloadStr);
			
		});
		
		
	});
	

}



server.init = () => {
	//Запускаем сервер и слушаем порт 3000
	server.httpServer.listen(config.port, () => {
		console.log('Сервер слушает порт ' + config.port  +
			` в ${config.envName} конфигурации.`);
	});
};




//Define a request router
server.router = {
	'ping': handlers.ping,
	'users': handlers.users,
	'tokens': handlers.tokens,
	'checks': handlers.checks
};

//Экспортируем сервер
module.exports = server;
