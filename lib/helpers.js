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


module.exports = helpers;
