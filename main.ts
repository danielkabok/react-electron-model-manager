import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs/promises';
import DataStore from 'nedb';
import { ModelModel } from './react-app/src/models/modelModel';

function createMainWindow() {
	const mainWindow = new BrowserWindow({
		title: 'RenderWare Model Manager',
		width: 1000,
		height: 600,
		webPreferences: {
			webSecurity: false, // Disable web security (to loading local files)
			contextIsolation: true,
			nodeIntegration: true,
			preload: path.join(__dirname, 'preload.js')
		}
	});

	// mainWindow.webContents.openDevTools();

	const startUrlDev = 'http://localhost:3000/';

	const startUrlProd = url.format({
		pathname: path.join(__dirname, './my-app/build/index.html'),
		protocol: 'file',
	});

	// mainWindow.loadURL(startUrlProd);
	mainWindow.loadURL(startUrlDev);

	// Functions to handle IPC events

	ipcMain.on('open-folder', async (event, path) => {
		dialog.showOpenDialog(mainWindow, {
			properties: ['openDirectory']
		}).then(result => {
			const msgTemplate = (folderPath: string) => `${folderPath}`;
			console.log(msgTemplate(result.filePaths[0]));
			event.reply('open-folder', msgTemplate(result.filePaths[0]));
		});
	});

	const checkForGame = async (path: string, exe: string): Promise<boolean> => {
		console.log("CHECKING: " + exe);
		let result = false;

		try {
			await fs.access(path + exe).then(() => {
				console.log(exe + ' detected!');
				result = true;
			});
		} catch (e) {
			// Game was not found
		}
		return result;
	}

	ipcMain.on('detect-game', async (event, path) => {
		let is3 = await checkForGame(path, "\\gta3.exe");
		let isVc = await checkForGame(path, "\\gta-vc.exe");
		let isSa = await checkForGame(path, "\\gta_sa.exe");
		if (!isSa) {
			isSa = await checkForGame(path, "\\gta-sa.exe"); // Steam version exe
		}

		const msgTemplate = (gameName: string) => `${gameName}`;

		if (is3 && !isVc && !isSa) {
			console.log("3");
			event.reply('detect-game', msgTemplate("3"));
		} else if (!is3 && isVc && !isSa) {
			console.log("VC");
			event.reply('detect-game', msgTemplate("VC"));
		} else if (!is3 && !isVc && isSa) {
			console.log("SA");
			event.reply('detect-game', msgTemplate("SA"));
		} else {
			console.log("CUSTOM");
			event.reply('detect-game', msgTemplate("CUSTOM"));
		}
	});

	// Managing local database

	const dbCreate = async (db: string, data: any): Promise<boolean> => {
		return new Promise((res, rej) => {
			let dataBase = new DataStore({ filename: `./db/${db}`, autoload: true });
			dataBase.insert(data, function (err, newDocs) {
				if (err) {
					rej(err);
				} else {
					res(true);
				}
			});
		});
	};

	const dbCreateMass = async (db: string, data: ModelModel[]) => {
		console.log("MASS SAVING!");
		return new Promise((res, rej) => {
			let dataBase = new DataStore({ filename: `./db/${db}`, autoload: true });
			dataBase.insert(data, function (err, newDocs) {
				if (err) {
					rej(err);
				}
				else {
					res(true);
				}
			});
		});
	};

	ipcMain.on('save-directory', async (event, db: string, data: any) => {
		console.log(db);
		console.log(data);

		const msgTemplate = (db: string, data: string) => `${data} saved in: ${db}`;
		console.log(msgTemplate(db, data));

		try {
			// Check if the data already exists in the database
			const existingData = await dbGetById(db, data.id);
			if (existingData.length > 0) {
				// Data already exists, set isSucc to false
				console.log('Data already exists in the database:', existingData);
				event.reply('save-directory', "ERROR");
				return;
			}

			// Data doesn't exist, proceed to save it
			let isSucc = await dbCreate(db, data);
			if (isSucc) {
				event.reply('save-directory', msgTemplate(db, data));
			} else {
				event.reply('save-directory', "ERROR");
			}
		} catch (error) {
			console.error('Error saving data:', error);
			event.reply('save-directory', "ERROR");
		}
	});

	ipcMain.on('save-model', async (event, db: string, data: any) => {
		console.log(db);
		console.log(data);

		const msgTemplate = (db: string, data: string) => `${data} saved in: ${db}`;
		console.log(msgTemplate(db, data));

		try {
			// Check if the data already exists in the database
			const existingData = await dbGetById(db, data.id);
			if (existingData.length > 0) {
				// Data already exists, set isSucc to false
				console.log('Data already exists in the database:', existingData);
				event.reply('save-model', "ERROR");
				return;
			}

			// Data doesn't exist, proceed to save it
			let isSucc = await dbCreate(db, data);
			if (isSucc) {
				event.reply('save-model', msgTemplate(db, data));
			} else {
				event.reply('save-model', "ERROR");
			}
		} catch (error) {
			console.error('Error saving data:', error);
			event.reply('save-model', "ERROR");
		}
	});

	ipcMain.on('save-tag', async (event, db: string, data: any) => {
		console.log(db);
		console.log(data);

		const msgTemplate = (db: string, data: string) => `${data} saved in: ${db}`;
		console.log(msgTemplate(db, data));

		try {
			// Check if the data already exists in the database
			const existingData = await dbGetById(db, data.id);
			if (existingData.length > 0) {
				// Data already exists, set isSucc to false
				console.log('Data already exists in the database:', existingData);
				event.reply('save-tag', "ERROR");
				return;
			}

			// Data doesn't exist, proceed to save it
			let isSucc = await dbCreate(db, data);
			if (isSucc) {
				event.reply('save-tag', msgTemplate(db, data));
			} else {
				event.reply('save-tag', "ERROR");
			}
		} catch (error) {
			console.error('Error saving data:', error);
			event.reply('save-tag', "ERROR");
		}
	});

	ipcMain.on('save-model-more', async (event, db: string, models: ModelModel[]) => {
		console.log(`Saving ${models.length} models to ${db}`);
		try {
			await dbCreateMass(db, models);
			console.log("All models saved successfully.");
			event.sender.send('save-model-more', 'SUCCESS');
		} catch (error) {
			console.error('Error saving data:', error);
			event.sender.send('save-model-more', 'ERROR');
		}
	});

	const dbGetAll = async (db: string): Promise<any[]> => {
		return new Promise((res, rej) => {
			let dataBase = new DataStore({ filename: `./db/${db}`, autoload: true });
			dataBase.find({}, function (err: any, docs: any) {
				if (err) {
					rej(err);
				} else {
					res(docs);
				}
			});
		});
	};

	ipcMain.on('get-all-directories', async (event, db: string) => {
		try {
			console.log("About to get all data: " + db);
			let result = await dbGetAll(db);
			console.log(result);
			event.reply('get-all-directories', result);
		} catch (error) {
			console.error("Error getting all data:", error);
			event.reply('get-all-directories', "The data couldn't be read!");
		}
	});

	ipcMain.on('get-all-models', async (event, db: string) => {
		try {
			console.log("About to get all data: " + db);
			let result = await dbGetAll(db);
			console.log(result);
			event.reply('get-all-models', result);
		} catch (error) {
			console.error("Error getting all data:", error);
			event.reply('get-all-models', "The data couldn't be read!");
		}
	});

	ipcMain.on('get-all-tags', async (event, db: string) => {
		try {
			console.log("About to get all data: " + db);
			let result = await dbGetAll(db);
			console.log(result);
			event.reply('get-all-tags', result);
		} catch (error) {
			console.error("Error getting all data:", error);
			event.reply('get-all-tags', "The data couldn't be read!");
		}
	});

	const dbGetById = async (db: string, id: number): Promise<any[]> => {
		return new Promise((res, rej) => {
			let dataBase = new DataStore({ filename: `./db/${db}`, autoload: true });
			dataBase.find({ id: id }, function (err: any, docs: any) {
				if (err) {
					rej(err);
				} else {
					res(docs);
				}
			});
		});
	};

	ipcMain.on('get-directory-by-id', async (event, db: string, id: number) => {
		console.log(db);
		console.log(id);

		try {
			console.log("About to get data by id: " + id);
			let result = await dbGetById(db, Number(id));
			console.log(result);
			event.reply('get-directory-by-id', result);
		} catch (error) {
			console.error("Error getting data by id:", error);
			event.reply('get-directory-by-id', "The data couldn't be read!");
		}
	});

	ipcMain.on('get-model-by-id', async (event, db: string, id: number) => {
		console.log(db);
		console.log(id);

		try {
			console.log("About to get data by id: " + id);
			let result = await dbGetById(db, Number(id));
			console.log(result);
			event.reply('get-model-by-id', result);
		} catch (error) {
			console.error("Error getting data by id:", error);
			event.reply('get-model-by-id', "The data couldn't be read!");
		}
	});

	ipcMain.on('get-tag-by-id', async (event, db: string, id: number) => {
		console.log(db);
		console.log(id);

		try {
			console.log("About to get data by id: " + id);
			let result = await dbGetById(db, Number(id));
			console.log(result);
			event.reply('get-tag-by-id', result);
		} catch (error) {
			console.error("Error getting data by id:", error);
			event.reply('get-tag-by-id', "The data couldn't be read!");
		}
	});

	const dbDelete = async (db: string, id: number): Promise<boolean> => {
		return new Promise((res, rej) => {
			let dataBase = new DataStore({ filename: `./db/${db}`, autoload: true });
			dataBase.remove({ id: id }, function (err: any, delNums: any) {
				if (err) {
					rej(err);
				} else {
					res(delNums);
				}
			});
		});
	}

	const dbDeleteMass = async (db: string): Promise<boolean> => {
		return new Promise((res, rej) => {
			let dataBase = new DataStore({ filename: `./db/${db}`, autoload: true });
			dataBase.remove({}, { multi: true }, function (err: any, delNums: any) {
				if (err) {
					rej(err);
				} else {
					res(delNums);
				}
			});
		});
	}

	ipcMain.on('delete-directory', async (event, db: string, id: number) => {
		console.log(db);
		console.log(id);

		try {
			console.log("About to delete: " + id);
			let result = await dbDelete(db, id);
			console.log(result);
			event.reply('delete-directory', result);
		} catch (error) {
			console.error("Error deleting data:", error);
			event.reply('delete-directory', "The data couldn't be deleted!");
		}
	});

	ipcMain.on('delete-model', async (event, db: string, id: number) => {
		console.log(db);
		console.log(id);

		try {
			console.log("About to delete: " + id);
			let result = await dbDelete(db, id);
			console.log(result);
			event.reply('delete-model', result);
		} catch (error) {
			console.error("Error deleting data:", error);
			event.reply('delete-model', "The data couldn't be deleted!");
		}
	});

	ipcMain.on('delete-tag', async (event, db: string, id: number) => {
		console.log(db);
		console.log(id);

		try {
			console.log("About to delete: " + id);
			let result = await dbDelete(db, id);
			console.log(result);
			event.reply('delete-tag', result);
		} catch (error) {
			console.error("Error deleting data:", error);
			event.reply('delete-tag', "The data couldn't be deleted!");
		}
	});


	ipcMain.on('delete-model-more', async (event, db: string) => {
		console.log(db);

		try {
			console.log("About to delete: " + db);
			let result = await dbDeleteMass(db);
			console.log(result);
			event.reply('delete-model-more', result);
		} catch (error) {
			console.error("Error deleting data:", error);
			event.reply('delete-model-more', "The data couldn't be deleted!");
		}
	});

	ipcMain.on('update-directory', async (event, db: string, id: number, data: any) => {
		try {
			console.log("About to update: " + data);
			let resultD = await dbDelete(db, id);
			console.log(resultD);
			let resultC = await dbCreate(db, data);
			console.log(resultC);
			event.reply('update-directory', resultC);
		} catch (error) {
			console.error("Error updating data:", error);
			event.reply('update-directory', "The data couldn't be updated!");
		}
	});

	ipcMain.on('update-model', async (event, db: string, id: number, data: any) => {
		try {
			console.log("About to update: " + data);
			let resultD = await dbDelete(db, id);
			console.log(resultD);
			let resultC = await dbCreate(db, data);
			console.log(resultC);
			event.reply('update-model', resultC);
		} catch (error) {
			console.error("Error updating data:", error);
			event.reply('update-model', "The data couldn't be updated!");
		}
	});

	ipcMain.on('update-tag', async (event, db: string, id: number, data: any) => {
		try {
			console.log("About to update: " + data);
			let resultD = await dbDelete(db, id);
			console.log(resultD);
			let resultC = await dbCreate(db, data);
			console.log(resultC);
			event.reply('update-tag', resultC);
		} catch (error) {
			console.error("Error updating data:", error);
			event.reply('update-tag', "The data couldn't be updated!");
		}
	});

	ipcMain.on('list-files', async (event, folderPath: string) => {
		console.log('Listing files in folder:', folderPath);
		try {
			const files = await getAllFiles(folderPath);
			event.reply('list-files', files);
		} catch (error) {
			console.error('Error listing files:', error);
			event.reply('list-files', []);
		}
	});

	async function getAllFiles(folderPath: string) {
		const files: string[] = [];

		const traverseFolder = async (currentPath: string) => {
			const items = await fs.readdir(currentPath, { withFileTypes: true });
			for (const item of items) {
				const itemPath = path.join(currentPath, item.name);
				if (item.isDirectory()) {
					await traverseFolder(itemPath); // Recursively traverse subfolders
				} else {
					files.push(itemPath); // Add file path to the list
				}
			}
		};

		await traverseFolder(folderPath);

		return files;
	}

	ipcMain.on('get-file-content', async (event, filePath: string) => {
		console.log('Getting content:', filePath);
		try {
			const content = await getFileContent(filePath);
			event.reply('get-file-content', content);
		} catch (error) {
			console.error('Error reading file content:', error);
			event.reply('get-file-content', null);
		}
	});

	async function getFileContent(filePath: string): Promise<string | null> {
		try {
			const content = await fs.readFile(filePath, 'utf-8');
			return content;
		} catch (error) {
			console.error('Error reading file:', error);
			return null;
		}
	}

	ipcMain.on('save-screenshot', async (event, dirId: number, modelName: string, screenshotDataURL: string) => {
		// Remove data header
		const base64Data = screenshotDataURL.replace(/^data:image\/png;base64,/, '');

		app.getPath('userData');

		const screenshotFolderPath = app.getPath('userData') + "/" + String(dirId) + "/";
		// const screenshotFolderPath = "./react-app/public/thumbnails/" + String(dirId) + "/";
		const filePath = path.join(screenshotFolderPath, modelName + ".png");

		// Convert base64 string to buffer
		const buffer = Buffer.from(base64Data, 'base64');

		fs.mkdir(screenshotFolderPath, { recursive: true }).then(() => {
			// Write data into the file
			fs.writeFile(filePath, buffer).then(() =>
				console.log('Thumbnail saved successfully:', filePath)
			).catch((err: string) => {
				console.error('Error saving thumbnail:', err)
			});
		}).catch((err: string) => {
			console.log("Couldn't save thumbnail: ")
		})
	});

	ipcMain.on('get-userpath', async (event) => {
		try {
			const userPath = app.getPath("userData");
			event.reply('get-userpath', userPath);
		} catch (error) {
			console.error('Error getting userpath:', error);
			event.reply('get-userpath', null);
		}
	});

}

app.whenReady().then(createMainWindow);