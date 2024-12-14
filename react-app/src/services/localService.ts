interface LocalService {
    selectFolder(): Promise<string>;
    detectGame(path: string): Promise<string>;
    getUserPath(): Promise<string>;
}

const localService: LocalService = {

    async selectFolder(): Promise<string> {
        let gameDirPath = "";

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('open-folder', []);
            window.electron.ipcRenderer.once('open-folder', (arg: any) => {
                gameDirPath = arg;
                resolve(gameDirPath);
            });
        });
    },

    async detectGame(path: string): Promise<string> {
        let detectedGame = "";

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('detect-game', [path]);
            window.electron.ipcRenderer.once('detect-game', (arg: any) => {
                detectedGame = arg;
                resolve(detectedGame);
            });
        });
    },

    async getUserPath(): Promise<string> {
        let userPath = "";

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('get-userpath');
            window.electron.ipcRenderer.once('get-userpath', (arg: any) => {
                userPath = arg;
                resolve(userPath);
            });
        });
    }
};

export default localService;