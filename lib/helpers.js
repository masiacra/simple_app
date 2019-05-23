/*
 * 
 * 
 * Вспомогательные функции для различных задач
 * 
 * 
*/

//Зависимости
const crypto = require('crypto');
const config = require('./config');
const querystring = require('querystring');
const https = require('https');

//Контейнер для всех вспомогательных функций
const helpers = {};


//Создаем SHA256 хеш-функцию
helpers.hash = str => {
	if (typeof(str) === 'string' && str.length > 0) {
		const hash = crypto.createHmac('sha256', config.hashingSecret)
			.update(str)
			.digest('hex');
		return hash;
	} else {
		return false;
	}
};

//Парсим строку JSON в объект
helpers.parseJsonToObject = str => {
	try {
		const obj = JSON.parse(str);
		return obj;
	} catch(e) {
		return {};
	}
};

//Вспомогательная функция для создания строки рандомных символов указанной
//длины
helpers.createRandomString = strLength => {
	strLength = typeof(strLength) === 'number' && strLength > 0 ?
		strLength : false;
	
	if (strLength) {
		//Описываем все возможные символы, которые могут войти в строку
		const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		//Обозначим конечную строку 
		let str = '';
		for (let i = 1; i <= strLength; i++) {
			const randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
			str += randomChar;
		}
		return str;
	} else {
		return false;
	}
	
};

//Посылка смс сообщений, используя twilio
helpers.sendTwilioSms = (phone, msg, cb) => {
	//Проверка переданных аргументов
	phone = typeof(phone) === 'string' && phone.trim().length === 10 ?
		phone.trim() : false;
	msg = typeof(msg) === 'string' && msg.trim().length > 0 && 
		msg.trim().length < 1600 ? msg.trim() : false;
	
	if (phone && msg) {
		//Формируем полезную нагрузку запроса
		const payload = {
			'From': config.twilio.fromPhone,
			'To': '+7' + phone,
			'Body': msg
		};
		//Преобразуем в строку объект payload
		const stringPayload = querystring.stringify(payload);
		//Формируем детали запроса
		const requestDetails = {
			protocol: 'https:',
			hostname: 'api.twilio.com',
			method: 'POST',
			path: '/2010-04-01/Accounts/' + config.twilio.accountSid +
				'/Messages.json',
			auth: config.twilio.accountSid + ':' + 
				config.twilio.authToken,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(stringPayload) 
			}
		};
		
		//Инициализируем объект запроса
		const req = https.request(requestDetails, res => {
			//Определяем статус посланного запроса
			const status = res.statusCode;
			//Колбэк успешен, если запрос успешно прошел
			if (status === 200 || status === 201) {
				cb(false);
			} else {
				cb('Status code returned was ' + status);
			}
		});
		
		//Подписываемся на событие ошибки запроса
		req.on('error', err => {
			cb(err);
		});
		
		//Добавляем полезную нагрузку
		req.write(stringPayload);
		
		//Завершаем запрос
		req.end();
		
	} else {
		cb('Given parameteres were missing of invalid');
	}
	
};

helpers.sendTwilioSms('9166482726', 'Dimas sosi jepu', err => {
	console.log('This was the error', err);
});


module.exports = helpers;
