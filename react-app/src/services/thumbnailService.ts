import { ModelModel } from '../models/modelModel';
import { GameDirectoryModel } from '../models/gameDirectoryModel'

import { generateThumbnail } from '../utils/thumbnailGenerator';

interface ThumbnailService {
    generateThumbnail(dir: GameDirectoryModel, model: ModelModel): Promise<string>;
    generateAllThumbnails(dir: GameDirectoryModel, models: ModelModel[], delayMilliseconds: number, progressCallback?: (progressText: string) => void): Promise<string>;
}

const thumbnailService: ThumbnailService = {

    async generateThumbnail(dir: GameDirectoryModel, model: ModelModel): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                await generateThumbnail(model.dff, model.txd, dir.game, model.categoryId, dir.id, model.name);
                console.log(`Thumbnail generated successfully for model ${model.name}`);
                resolve(`Thumbnail generated successfully for model ${model.name}`);
            } catch (error) {
                console.error(`Error generating thumbnail for model ${model.name}:`, error);
                reject(error);
            }
        });
    },

    async generateAllThumbnails(dir: GameDirectoryModel, models: ModelModel[], delayMilliseconds: number, progressCallback?: (progressText: string) => void): Promise<string> {
        return new Promise(async (resolve, reject) => {
            for (const model of models) {
                try {
                    await this.generateThumbnail(dir, model);
                    console.log(`Generated thumbnail ${models.indexOf(model) + 1}/${models.length}`);
                    progressCallback?.(`${models.indexOf(model) + 1}/${models.length}`);
                }
                catch (error) {
                    console.error(`Error generating thumbnail ${models.indexOf(model) + 1}/${models.length}:`, error);
                    progressCallback?.(`Error: ${models.indexOf(model) + 1}/${models.length}`);
                }
            }
            console.log(`All thumbnails generated successfully`);
            resolve(`All thumbnails generated successfully`);
        });
    }
};

export default thumbnailService;