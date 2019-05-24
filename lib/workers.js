/*
 * Решение задач, предназначенных для worker-ов
 */ 
 
//Зависимости
const path = require('path');
const fs = require('fs');
const _data = require('./data');
const _http = require('http');
const helpers = require('./helpers');
const url = require('url');


//Инициализируем объект workers
const workers = {};

//Запускаем скрипт
workers.init = () => {
	//Выполняем все checks немедленно
	workers.gatherAllChecks();
	//Вызываем цикл таким образом, что все checks выполняться позже
	workers.loop();
};


//Таймер для планирования worker-процессов раз в минуту
workers.loop = () => {
	setInterval( () => {
		workers.gatherAllChecks();
	}, 1000 * 60);
};


//Просматриваем все checks, получаем их данные и передаем на валидацию
workers.gatherAllChecks = () => {
	//Получаем все checks
	_data.list('checks', (err, checks) => {
		if (!err && checks && checks.length > 0) {
			checks.forEach( (check) => {
				//Считываем данные
				_data.read('checks', check, (err, originalCheckData) => {
					if (!err && originalCheckData) {
						//Передаем данные на валидцаию
						workers.validateCheckData(originalCheckData);
					} else {
						console.log('Error reading one of the check\'s data');
					}
				});
			});
		} else {
			console.log('Error: could not find any checks to process');
		}
	});
};

//Проверка check-данных
workers.validateCheckData = (originalCheckData) => {
	originalCheckData = typeof(originalCheckData) === 'object' ?
		originalCheckData : {};
		
	originalCheckData.id = typeof(originalCheckData.id) === 'string' &&
		originalCheckData.id.trim().length  === 20 ?
		originalCheckData.id.trim() : false;
		
	originalCheckData.userPhone = typeof(originalCheckData.userPhone) === 'string' &&
		originalCheckData.userPhone.trim().length  === 10 ?
		originalCheckData.userPhone.trim() : false;
	
	originalCheckData.protocol = typeof(originalCheckData.protocol) === 'string' &&
		['http', 'https'].indexOf(originalCheckData.protocol) > -1 ?
		originalCheckData.protocol : false;
		
	originalCheckData.url = typeof(originalCheckData.protocol) === 'string' &&
		originalCheckData.url.trim().length > 0 ?
		originalCheckData.url.trim() : false;
	
	originalCheckData.method = typeof(originalCheckData.method) === 'string' &&
		['get', 'post', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ?
		originalCheckData.method : false;
		
	originalCheckData.sucessCode = typeof(originalCheckData.sucessCode) === 'object' &&
		originalCheckData.sucessCode instanceof Array  &&
		originalCheckData.sucessCode.length > 0 ?
		originalCheckData.sucessCode : false;
		
	originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) === 'number' &&
		originalCheckData.timeoutSeconds % 1 === 0  &&
		originalCheckData.timeoutSeconds >= 1 &&
		originalCheckData.timeoutSeconds <= 1 ?
		originalCheckData.timeoutSeconds : false;
		
	//Определяем ключи, которые могли быть не определены (если workers 
	//никогда не видели этот check до этого
	originalCheckData.state = typeof(originalCheckData.state) === 'string' &&
		['up', 'down'].indexOf(originalCheckData.state) > -1 ?
		originalCheckData.state : 'down';
		
	originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) === 'number' &&
		originalCheckedData.lastChecked > 0 ?
		originalCheckData.lastChecked : false;
	
	//Если все параметры проходят, то передаем их на следующий шаг процесса
	if (originalCheckData.id &&
		originalCheckData.userPhone &&
		originalCheckData.protocol &&
		originalCheckData.url && 
		originalCheckData.method && 
		originalCheckData.sucessCode &&
		originalCheckData.timeoutSeconds) {
	
		workers.perfomCheck(originalCheckData);
		 	
	} else {
		console.log('Error: one of the checks is not properly formatted');
	}
		
};
