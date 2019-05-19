/*
 * 
 * Библиотека для создания и изменения данных
 * Имитация БД
 * 
*/

//Зависимости
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

//Хранилище для модуля
const lib = {};

//Базовая директория для сохранения файлов
lib.baseDir = path.join(__dirname, '../data');

lib.create = (dir, file, data, cb) => {
	//Корректно создаем путь к файлу
	const npath = path.join(lib.baseDir, dir, file + '.json');
	//Создаем новый файл для записи. Метод не срабатывает, 
	//если путь существует
	fs.open(npath, 'wx', (err, fd) => {//при флаге 'wx', если файл уже существует, то возбуждается ошибка
		console.log(err);
		if (!err && fd) {
			//Преобразуем данные в формат JSON 
			const jsonData = JSON.stringify(data);
			//Записываем файл и закрываем его
			fs.writeFile(fd, jsonData, err => {
				if (!err) {
					fs.close(fd, err => {
						if (!err) {
							cb(false);
						} else {
							cb('Error closing new file');
						}
					});
				} else {
					cb('Error writing to the new file');
				}
			});
		} else {
			cb('Невозможно создать новый файл. Он уже существует');
		}
	});
}


//Чтение из файла
lib.read = (dir, file, cb) => {
	const npath = path.join(lib.baseDir, dir, file + '.json');
	fs.readFile(npath, 'utf8', (err, data) => {
		if (!err && data) {
			const parsedData = helpers.parseJsonToObject(data);
			cb(false, parsedData);
		} else {
			cb(err, data);
		}

	});
};

//Изменение файла
lib.update = (dir, file, data, cb) => {
	const npath = path.join(lib.baseDir, dir, file + '.json');
	fs.open(npath, 'r+', (err, fd) => { //'r+' - открыть файл для чтения и для записи. Если файл не существует, то вызовется исключение
		if (!err && fd) {

			const jsonData = JSON.stringify(data);
			console.log(typeof fd);
			fs.ftruncate(fd, (err) => {
				if (!err) {
					fs.writeFile(fd, jsonData, err => {
						if (!err) {
							fs.close( fd, err => {
								if (!err) {
									cb(false);
								} else {
									cb('Error closing file');
								}
							});
						} else {
							cb('Error writing to existing file');
						}
					});
				} else {
					cb('Ошибка усечения файла');
				}
			});
		} else {
			cb('Невозможно обновить данные.' +
				'Возможно файл еще не существует');
		}
	});
};


//Удаление
lib.delete = (dir, file, cb) => {
	//Отсоединить файл
	const npath = path.join(lib.baseDir, dir, file + '.json');
	fs.unlink(npath, err => {
		if (!err) {
			cb(false);
		} else {
			cb('Error deliting file');
		}
	});
};



//Экспортируем библиотеку

module.exports = lib;
