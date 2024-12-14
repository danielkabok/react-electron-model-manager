import { ModelModel } from '../models/modelModel';

import { processIde } from '../utils/ideProcessor';

interface IdeService {
    getModelsFromIdeFiles(dirPath: string, gameDirGame: string): Promise<ModelModel[]>;
}

const ideService: IdeService = {

    async getModelsFromIdeFiles(dirPath: string, gameDirGame: string): Promise<ModelModel[]> {
        let models: any[] = [];

        return new Promise(async (resolve, reject) => {
            try {
                const result = await processIde(dirPath, gameDirGame);
                const models = result as ModelModel[];
                console.log("Read models: " + models.length);
                resolve(models);
            } catch (error) {
                console.error("Error reading IDE:", error);
                reject(new Error("Error reading IDE: " + error));
            }
        });
    },
};

export default ideService;