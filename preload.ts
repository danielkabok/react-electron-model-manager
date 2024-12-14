import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
	'open-folder' |
	'detect-game' |
	'save-directory' |
	'save-model' |
	'save-tag' |
	'save-model-more' |
	'get-all-directories' |
	'get-all-models' |
	'get-all-tags' |
	'delete-directory' |
	'delete-model' |
	'delete-tag' |
	'delete-model-more' |
	'update-directory' |
	'update-model' |
	'update-tag' |
	'get-directory-by-id' |
	'get-model-by-id' |
	'get-tag-by-id' |
	'list-files' |
	'get-file-content' |
	'save-screenshot' |
	'get-userpath';

const electronHandler = {
	ipcRenderer: {
		sendMessage(channel: Channels, ...args: unknown[]) {
			ipcRenderer.send(channel, ...args);
		},
		on(channel: Channels, func: (...args: unknown[]) => void) {
			const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
				func(...args);
			ipcRenderer.on(channel, subscription);

			return () => {
				ipcRenderer.removeListener(channel, subscription);
			};
		},
		once(channel: Channels, func: (...args: unknown[]) => void) {
			ipcRenderer.once(channel, (_event, ...args) => func(...args));
		},
	},
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;