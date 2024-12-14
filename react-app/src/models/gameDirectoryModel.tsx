export class GameDirectoryModel {
    id: number;
    name: string;
    directoryPath: string;
    game: string;
    coverImage: string;

    constructor(id: number, name: string, directoryPath: string, game: string, coverImage: string="default.png") {
        this.id = id;
        this.name = name;
        this.directoryPath = directoryPath;
        this.game = game;
        this.coverImage = coverImage;
    }
}