import { ModelModel } from '../models/modelModel';

interface ModelService {
    getModels(dirId: number): Promise<ModelModel[]>;
    getModelById(dirId: number, modelId: number): Promise<ModelModel>;
    createModel(dirId: number, id: number, name: string, dff: string, txd: string, ide: string, categoryId: number, tagIds: number[],
		drawDist: number, hasCol?: boolean, isBrk?: boolean, hasAnim?: boolean, timeOn?: number, timeOff?: number): ModelModel;
    saveMultipleModels(dirId: number, models: ModelModel[]): void;
    removeModels(dirId: number): void;
    updateModel(dirId: number, models: ModelModel[], model: ModelModel): ModelModel[];
    deleteModel(dirId: number, models: ModelModel[], modelId: number): ModelModel[];
}

const modelService: ModelService = {

    async getModels(dirId: number): Promise<ModelModel[]> {
        let models: any[] = [];

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('get-all-models', `${dirId}Models.db`);
            window.electron.ipcRenderer.once('get-all-models', (arg: any) => {
                console.log(arg);
                models = arg;
                resolve(models);
            });
        });
    },


    async getModelById(dirId: number, modelId: number): Promise<ModelModel> {
        let model = new ModelModel(0, "", "", "", "", 0, [], 0, false, false, false, 0, 0);

        return new Promise((resolve, reject) => {
			window.electron.ipcRenderer.sendMessage('get-model-by-id', `${dirId}Models.db`, modelId);
			// calling IPC exposed from the preload script
			window.electron.ipcRenderer.once('get-model-by-id', (arg: any) => {
                console.log(arg[0]);
                model = arg[0];
                resolve(model)
            });
        });
    },

    createModel(dirId: number, id: number, name: string, dff: string, txd: string, ide: string, categoryId: number, tagIds: number[],
		drawDist: number, hasCol?: boolean, isBrk?: boolean, hasAnim?: boolean, timeOn?: number, timeOff?: number): ModelModel {
        let modelToAdd = new ModelModel(id, name, dff, txd, ide, categoryId, tagIds, drawDist, hasCol, isBrk, hasAnim, timeOn, timeOff);

		window.electron.ipcRenderer.sendMessage('save-model', `${dirId}Models.db`, modelToAdd);
        window.electron.ipcRenderer.once('save-model', (arg: any) => {
            console.log(arg);
        });

        return modelToAdd;
    },

    saveMultipleModels(dirId: number, models: ModelModel[]): void {
        window.electron.ipcRenderer.sendMessage('save-model-more', `${dirId}Models.db`, models);
        window.electron.ipcRenderer.once('save-model-more', (arg: any) => {
            console.log(arg);
        });
    },

    removeModels(dirId: number): void {
        window.electron.ipcRenderer.sendMessage('delete-model-more', `${dirId}Models.db`);
		window.electron.ipcRenderer.once('delete-model-more', (event, arg: any) => {
			console.log(arg);
		});
    },

    updateModel(dirId: number, models: ModelModel[], model: ModelModel): ModelModel[] {
        let updatedModels = models.map(m => {
            if (m.id == model.id) {
                return model;
            } else {
                return m;
            }
        });

		window.electron.ipcRenderer.sendMessage('update-model', `${dirId}Models.db`, model.id, model);
		window.electron.ipcRenderer.once('update-model', (arg: any) => {
            console.log(arg);
        });

        return updatedModels;
    },

    deleteModel(dirId: number, models: ModelModel[], modelId: number): ModelModel[] {
        let updatedModels = models.filter(m => m.id !== modelId);

		window.electron.ipcRenderer.sendMessage('delete-model', `${dirId}Models.db`, modelId);
		window.electron.ipcRenderer.once('delete-model', (arg: any) => {
			console.log(arg);
		});

        return updatedModels;
    }
};

export default modelService;