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


module.exports = helpers;
