/*
 * 
 * Обработчик запросов
 * 
 * 
*/

//Зависимости
const helpers = require('./helpers');
const _data = require('./data');


//Контейнер для обработчиков
const handlers = {};

//Обработчик пинг
handlers.ping = (data, callback) => {
	callback(200);
};

//Обработчик страница не найдена
handlers.notFound = (data, callback) => {
	callback(404);
};

//Обработчик Users
handlers.users = (data, cb) => {
	const acceptableMethods = ['get', 'post', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, cb);
	} else {
		cb(405);
	}
};

//Контейнер для подметодов users
handlers._users = {};

//Users метод POST
//Требуемые данные: firstName, lastName, phone, password, tosAgree
handlers._users.post = (data, cb) => {
	//Проверяем, что все требуемые поля заполнены
	const firstName = typeof(data.payload.firstName) == 'string' &&
		data.payload.firstName.trim().length > 0 ?
			data.payload.firstName.trim() : false;
	const lastName = typeof(data.payload.lastName) == 'string' &&
		data.payload.lastName.trim().length > 0 ?
			data.payload.lastName.trim() : false;
	const phone = typeof(data.payload.phone) == 'string' &&
		data.payload.phone.trim().length === 10 ?
			data.payload.phone.trim() : false;
	const password = typeof(data.payload.password) == 'string' &&
		data.payload.password.trim().length > 0 ?
			data.payload.password.trim() : false;
	const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' &&
		data.payload.tosAgreement === true ?
			true : false;

	
	if (firstName && lastName && phone && tosAgreement && password) {
		//Убедимся, что пользователя не существует
		_data.read('users', phone, (err, data) => {
			if (err) {
				//Хешируем пароль
				const hashedPassword = helpers.hash(password);
				if (hashedPassword) {
					//Создаем объект пользователя
					const userObject = {
						firstName,
						lastName,
						phone,
						hashedPassword,
						tosAgreement
					};
					//Сохраняем пользователя
					_data.create('users', phone, userObject, err => {
						if (!err) {
							cb(200);
						} else {
							console.log(err);
							cb(500, {'Error': 'A user with that phone number' +
									' already exists'});
						}
					});
				} else {
					cb(500, {'Error': "Could not hash the user's password"});
				}
			} else {
				//Пользователь уже существует
				cb(400, {'Error': 'A user whit that phone number already' +
						' exists'});
			}
		});
	} else {
		cb(400, {'Error': 'Missing required fields'});
	}
	
};


//Users метод для GET
//Необходимый параметр - phone
handlers._users.get = (data, cb) => {
	//Проводим валидацию телефона
	const phone = typeof(data.queryStringObject.phone) === 'string' &&
		data.queryStringObject.phone.trim().length === 10 ? 
			data.queryStringObject.phone.trim() : false;
	
	if (phone) {
		_data.read('users', phone, (err, data) => {
			if (!err && data) {
				//Удаляем хеш из объекта до передачи его пользователю
				delete data.hashedPassword;
				cb(200, data);
			} else {
				cb(404);
			}
		});
	} else {
		cb(400, {'Error': 'Missing required field'});
	}
	
};

//User метод для PUT
//Необходимый параметр - phone
//Опциональные парметры другие
handlers._users.put = (data, cb) => {
	//Преверяем валидность номера
	const phone = typeof(data.payload.phone) === 'string' &&
		data.payload.phone.trim().length === 10 ? 
			data.payload.phone.trim() : false;
			
	//Проверяем опциональные параметры
	const firstName = typeof(data.payload.firstName) == 'string' &&
		data.payload.firstName.trim().length > 0 ?
			data.payload.firstName.trim() : false;
	const lastName = typeof(data.payload.lastName) == 'string' &&
		data.payload.lastName.trim().length > 0 ?
			data.payload.lastName.trim() : false;
	const password = typeof(data.payload.password) == 'string' &&
		data.payload.password.trim().length > 0 ?
			data.payload.password.trim() : false;
	//Выдаем ошибку при невалидном телефоне
	if (phone) {
		//Ошибка, если не передано данные для изменнения
		if (firstName || lastName || password) {
			//Ищем пользователя в имитации БД
			_data.read('users', phone, (err, userData) => {
				if (!err && userData) {
					//Обновляем указанные значения
					if (firstName) {
						userData.firstName = firstName;
					}
					if (lastName) {
						userData.lasttName = lastName;
					}
					if (password) {
						userData.hashedPassword = helpers.hash(password);
					}
					_data.update('users', phone, userData, err => {
						if (!err) {
							cb(200);
						} else {
							cb(500, {'Error': 'Could not update the user'});
						}
					});
				} else {
					cb(400, {'Error': "The specified user doesn't exists"});
				}
			});
		} else {
			cb(400, {'Error': 'Missing fields to update'});
		}
	} else {
		cb(400, {'Error': 'Missing required data'});
	}
	
};

//Метод delete для Users
//Необходимый параметр - phone
handlers._users.delete = (data, cb) => {
	//Проводим валидацию телефона
	const phone = typeof(data.queryStringObject.phone) === 'string' &&
		data.queryStringObject.phone.trim().length === 10 ? 
			data.queryStringObject.phone.trim() : false;
	
	if (phone) {
		_data.read('users', phone, (err, data) => {
			if (!err && data) {
				_data.delete('users', phone, err => {
					if (!err) {
						cb(200);
					} else {
						cb(500, {'Error': 'Could not delete the specified user'});
					}
				});
			} else {
				cb(404);
			}
		});
	} else {
		cb(400, {'Error': 'Missing required field'});
	}
	
};

//Механизм аутентификации для данного приложения
//Токены
handlers.tokens = (data, cb) => {
	const acceptableMethods = ['get', 'post', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, cb);
	} else {
		cb(405);
	}
};

//Контейнер для токенов
handlers._tokens = {};


//Контейнер для обработки tokens post
//Требуемые параметры: phone, password
handlers._tokens.post = (data, cb) => {
	const phone = typeof(data.payload.phone) == 'string' &&
		data.payload.phone.trim().length === 10 ?
			data.payload.phone.trim() : false;
	const password = typeof(data.payload.password) == 'string' &&
		data.payload.password.trim().length > 0 ?
			data.payload.password.trim() : false;
	
	if (phone && password) {
		//Ищем пользователя с указанным телефоном
		_data.read('users', phone, (err, userData) => {
			if (!err && userData) {
				const hashedPassword = helpers.hash(password);
				if (hashedPassword === userData.hashedPassword) {
					//Если пароль проходит валидацию, то создаем новый
					//токен  с рандомным именем. Устанавливаем срок действия
					//токена 1 час
					const tokenId = helpers.createRandomString(20);
					const expires = Date.now() + 1000 * 60 * 60;
					const tokenObj = {
						phone, 
						id: tokenId,
						expires
					};
					_data.create('tokens', tokenId, tokenObj, err => {
						if (!err) {
							cb(200, tokenObj);
						} else {
							cb(500, {'Error': 'Could not create the new token'});
						}
					});
				} else {
					cb(400, {'Error': 'Password did not match the ' +
						'specified users stored password'});
				}
			} else {
				cb(400, {'Error': 'Could not find the specified user'});
			}
		});
	}
	
};

//Tokens метод для GET
//Необходимый параметр - id
handlers._tokens.get = (data, cb) => {
	//Проводим валидацию id
	const id = typeof(data.queryStringObject.id) === 'string' &&
		data.queryStringObject.id.trim().length === 20 ? 
			data.queryStringObject.id.trim() : false;
	
	if (id) {
		_data.read('tokens', id, (err, tokenData) => {
			if (!err && tokenData) {
				cb(200, tokenData);
			} else {
				cb(404);
			}
		});
	} else {
		cb(400, {'Error': 'Missing required field'});
	}
	
};


module.exports = handlers;
