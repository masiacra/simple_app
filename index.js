/*
 * Primari file for the API
 * 
 * 
 */
 
 //Зависимости
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const _data = require('./lib/data');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

//Сервер должен отвечать на все запросы строкой
const server = http.createServer(unifiedServer);

//Запускаем сервер и слушаем порт 3000
server.listen(config.port, () => {
	console.log('Сервер слушает порт ' + config.port  +
		` в ${config.envName} конфигурации.`);
});

function unifiedServer(req, res) {
	//Получаем URL и парсим
	var parsedUrl = url.parse(req.url,true);
	//Получаем путь
	var path = parsedUrl.pathname;
	//Удаляем слэши
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');

	
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
		const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
			router[trimmedPath] : handlers.notFound;
		
		console.log(typeof(buffer));
		console.log(helpers.parseJsonToObject(buffer));
		
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





//Define a request router
const router = {
	'ping': handlers.ping,
	'users': handlers.users,
	'tokens': handlers.tokens
};

