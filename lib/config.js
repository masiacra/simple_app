/*
 * 
 * создаем и экспортируем переменные конфигураций
 * 
*/

//Контейнер для всех окружений
const enviroments = {};

//Инсценировочное окружение(по умолчанию)
enviroments.staging = {
	port: 3000,
	envName: 'staging',
	hashingSecret: 'thisIsASecret',
	maxChecks: 5,
	twilio: {
		'accountSid': 'AC744fd413fb73c5ef493d104276f8bcd7',
		'authToken': '5755586907ee2c61b9c81226cb3e68c1',
		'fromPhone': '+18577634624'
	}
};

//Производственное окружение
enviroments.production = {
	port: 5000,
	envName: 'production',
	hashingSecret: 'thisIsAlsoSecret',
	maxChecks: 5
};

//Определяем, какое окружение передается в командной строке в качестве
//аргумента
const currentEnviroment = typeof(process.env.NODE_ENV) === 'string' ?
	process.env.NODE_ENV.toLowerCase() : '';
	
//Проверяем, что текущее окружение является одним из описанных выше, если
//нет, то устанавливаем по дефолту инсценировочное
const enviromentToExport = typeof(enviroments[currentEnviroment]) === 
	'object' ? enviroments[currentEnviroment] : enviroments.staging;


//Экспортируем модуль
module.exports = enviromentToExport;
