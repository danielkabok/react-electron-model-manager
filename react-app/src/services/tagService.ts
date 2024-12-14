import { TagModel } from '../models/tagModel';

interface TagService {
    getTags(dirId: number): Promise<TagModel[]>;
    getTagById(dirId: number, tagId: number): Promise<TagModel>;
    createTag(dirId: number, id: number, name: string): TagModel;
    updateTag(dirId: number, tags: TagModel[], tag: TagModel): TagModel[];
    deleteTag(dirId: number, tags: TagModel[], tagId: number): TagModel[];
}

const tagService: TagService = {

    async getTags(dirId: number): Promise<TagModel[]> {
        let tags: any[] = [];

        return new Promise((resolve, reject) => {
            window.electron.ipcRenderer.sendMessage('get-all-tags', `${dirId}Tags.db`);
            window.electron.ipcRenderer.once('get-all-tags', (arg: any) => {
                console.log(arg);
                tags = arg;
                resolve(tags);
            });
        });
    },

    async getTagById(dirId: number, tagId: number): Promise<TagModel> {
        let tag = new TagModel(0, "");

        return new Promise((resolve, reject) => {
			window.electron.ipcRenderer.sendMessage('get-tag-by-id', `${dirId}Tags.db`, tagId);
			window.electron.ipcRenderer.once('get-tag-by-id', (arg: any) => {
                console.log(arg[0]);
                tag = arg[0];
                resolve(tag)
            });
        });
    },

    createTag(dirId: number, id: number, name: string): TagModel {
        let tagToAdd = new TagModel(id, name);

		window.electron.ipcRenderer.sendMessage('save-tag', `${dirId}Tags.db`, tagToAdd);
        window.electron.ipcRenderer.once('save-tag', (arg: any) => {
            console.log(arg);
        });

        return tagToAdd;
    },

    updateTag(dirId: number, tags: TagModel[], tag: TagModel): TagModel[] {
        let updatedTags = tags.map(t => {
            if (t.id == tag.id) {
                return tag;
            } else {
                return t;
            }
        });

		window.electron.ipcRenderer.sendMessage('update-tag', `${dirId}Tags.db`, tag.id, tag);
		window.electron.ipcRenderer.once('update-tag', (arg: any) => {
            console.log(arg);
        });

        return updatedTags;
    },

    deleteTag(dirId: number, tags: TagModel[], tagId: number): TagModel[] {
        let updatedTags = tags.filter(t => t.id !== tagId);

		window.electron.ipcRenderer.sendMessage('delete-tag', `${dirId}Tags.db`, tagId);
		window.electron.ipcRenderer.once('delete-tag', (arg: any) => {
			console.log(arg);
		});

        return updatedTags;
    }
};

export default tagService;