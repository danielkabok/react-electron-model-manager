import { GameDirectoryModel } from '../models/gameDirectoryModel'

interface DirectoryService {
    getDirectories(): Promise<GameDirectoryModel[]>;
    getDirectoryById(id: number): Promise<GameDirectoryModel>;
    createDirectory(id: number, name: string, path: string, game: string, image: string): Promise<GameDirectoryModel>;
    updateDirectory(dirs: GameDirectoryModel[], gameDir: GameDirectoryModel): Promise<GameDirectoryModel[]>;
    deleteDirectory(dirs: GameDirectoryModel[], gameDirID: number): Promise<GameDirectoryModel[]>;
}

const directoryService: DirectoryService = {

    async getDirectories(): Promise<GameDirectoryModel[]> {
        let dirs: any[] = [];

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('get-all-directories', "dirs.db");
            window.electron.ipcRenderer.once('get-all-directories', (arg: any) => {
                console.log(arg);
                dirs = arg;
                resolve(dirs);
            });
        });
    },


    async getDirectoryById(id: number): Promise<GameDirectoryModel> {
        let dir = new GameDirectoryModel(0, "", "", "", "");

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('get-directory-by-id', "dirs.db", id);
            window.electron.ipcRenderer.once('get-directory-by-id', (arg: any) => {
                console.log(arg[0]);
                dir = arg[0];
                resolve(dir)
            });
        });
    },

    createDirectory(id: number, name: string, path: string, game: string, image: string): Promise<GameDirectoryModel> {
        let dirToAdd = new GameDirectoryModel(id, name, path, game, image);

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('save-directory', "dirs.db", dirToAdd);
            window.electron.ipcRenderer.once('save-directory', (arg: any) => {
                console.log(arg);
                resolve(dirToAdd);
            });
        });
    },

    updateDirectory(dirs: GameDirectoryModel[], gameDir: GameDirectoryModel): Promise<GameDirectoryModel[]> {
        let updatedDirs = dirs.map(g => {
            if (g.id == gameDir.id) {
                return gameDir;
            } else {
                return g;
            }
        });

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('update-directory', "dirs.db", gameDir.id, gameDir);
            window.electron.ipcRenderer.once('update-directory', (arg: any) => {
                console.log(arg);
                resolve(updatedDirs);
            });
        });
    },

    deleteDirectory(dirs: GameDirectoryModel[], gameDirID: number): Promise<GameDirectoryModel[]> {
        let updatedDirs = dirs.filter(g => g.id !== gameDirID);

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('delete-directory', "dirs.db", gameDirID);
            window.electron.ipcRenderer.once('delete-directory', (arg: any) => {
                console.log(arg);
                resolve(updatedDirs);
            });
        });
    }
};

export default directoryService;