import { ModelModel } from "../models/modelModel";

export async function processIde(directoryPath: string, game: string) {
    // Getting all files in the directory
    window.electron.ipcRenderer.sendMessage('list-files', directoryPath);

    return new Promise((resolve, reject) => {
        window.electron.ipcRenderer.once('list-files', async (arg: any) => {
            try {
                // console.log(arg); // List of files found in the given path

                // Filter files to include only those with a ".ide" extension
                const ideFiles = arg.filter((file: string) => file.toLowerCase().endsWith('.ide'));

                if (ideFiles.length < 1) {
                    reject("No IDE file was found!");
                }

                // const ideFilesToCheck = ideFiles ? [ideFiles[0]] : []; // Limit the number of ide files processed
                const ideFilesToCheck = ideFiles;

                const newModels: ModelModel[] = [];

                for (let ideFile of ideFilesToCheck) {
                    if (ideFile.includes("gta3.IDE")) { // Skip gta3.IDE since every model listed there is redundant
                        continue;
                    }
                    const content = await getFileContent(ideFile);
                    const models = processIdeContent(content, ideFile, game, arg);
                    newModels.push(...models);
                }

                resolve(newModels);
            } catch (error) {
                reject(error);
            }
        });
    });
}

async function getFileContent(ideFile: string): Promise<string> {
    return new Promise((resolve, reject) => {
        window.electron.ipcRenderer.sendMessage('get-file-content', ideFile);
        window.electron.ipcRenderer.once('get-file-content', (arg: any) => {
            resolve(arg);
        });
    });
}

function processIdeContent(FileContent: string, IdeFileName: string, game: string, FileList: string[]): ModelModel[] {
    const lines = FileContent.split('\n');

    let currentSection = '';

    let thisModels: ModelModel[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Ignore comments, empty lines, section endings, 2dfx couse it starts with number
        if (trimmedLine.startsWith('#') ||
            trimmedLine === '' ||
            trimmedLine.startsWith('end') ||
            trimmedLine.startsWith('2dfx')) {
            continue;
        }

        // Check if the line starts with a number (id)
        if (/^\d/.test(trimmedLine)) {
            let properties = trimmedLine.split(/\s*,\s*/); // Split by commas and trim spaces
            let categoryId = sectionToCategoryMap.get(currentSection);

            // Object
            if (categoryId == 0) {
                let id = properties[0].trim().replace(/,+$/, '');

                let dffName = properties[1].trim().replace(/,+$/, '') + ".dff";
                let dff = findFileByName(FileList, dffName);

                let txdName = properties[2].trim().replace(/,+$/, '') + ".txd";
                let txd = findFileByName(FileList, txdName);

                let drawDist;
                let objCount;

                if (game == "SA") {
                    drawDist = properties[3].trim().replace(/,+$/, '');
                    objCount = null;
                }
                else {
                    drawDist = properties[4].trim().replace(/,+$/, '');
                    objCount = properties[3].trim().replace(/,+$/, '');
                }

                let timeOn;
                let timeOff;

                if (!dff) {
                    console.error('NO DFF: ' + dffName);
                    continue;
                }

                if (!txd) {
                    console.error('NO TXD: ' + txdName);
                    continue;
                }

                if (dff && txd) {
                    // Filter out level of detail models (LOD)
                    if (!dffName.toLowerCase().startsWith("lod") || (Number(drawDist) < 100 && !dffName.toLowerCase().includes("lod"))) {
                        // console.log(`${categoryId}: id(${id}) dff(${dff}) txd(${txd}) objCount(${objCount}) drawDist(${drawDist})\n`);

                        thisModels.push(new ModelModel(Number(id), dffName.split(".")[0], dff, txd, IdeFileName, Number(categoryId), [], Number(drawDist)));
                    }
                } else {
                    console.error("DFF or TXD couldnt be found! " + dffName + " " + txdName);
                }
            }

            // Vehicle or NPC
            if (categoryId == 1 || categoryId == 2) {
                let id = properties[0].trim().replace(/,+$/, '');

                let dffName = properties[1].trim().replace(/,+$/, '') + ".dff";
                let dff = findFileByName(FileList, dffName);

                let txdName = properties[2].trim().replace(/,+$/, '') + ".txd";
                let txd = findFileByName(FileList, txdName);

                if (!dff) {
                    console.error('NO DFF: ' + dffName);
                    continue;
                }

                if (!txd) {
                    console.error('NO TXD: ' + txdName);
                    continue;
                }

                if (dff && txd) {
                    // console.log(`${categoryId}: id(${id}) dff(${dff}) txd(${txd})\n`);

                    thisModels.push(new ModelModel(Number(id), dffName.split(".")[0], dff, txd, IdeFileName, Number(categoryId), [], 0))
                } else {
                    console.error("DFF or TXD couldnt be found! " + dffName + " " + txdName);
                }
            }

            // Weapon
            if (categoryId == 3) {
                let id = properties[0].trim().replace(/,+$/, '');

                let dffName = properties[1].trim().replace(/,+$/, '') + ".dff";
                let dff = findFileByName(FileList, dffName);

                let txdName = properties[2].trim().replace(/,+$/, '') + ".txd";
                let txd = findFileByName(FileList, txdName);

                // let objCount = properties[4].trim().replace(/,+$/, '');
                let drawDist = properties[5].trim().replace(/,+$/, '');

                if (!dff) {
                    console.error('NO DFF: ' + dffName);
                    continue;
                }

                if (!txd) {
                    console.error('NO TXD: ' + txdName);
                    continue;
                }

                if (dff && txd) {
                    // console.log(`${categoryId}: id(${id}) dff(${dff}) txd(${txd}) drawDist(${drawDist})\n`);

                    thisModels.push(new ModelModel(Number(id), dffName.split(".")[0], dff, txd, IdeFileName, Number(categoryId), [], Number(drawDist)))
                } else {
                    console.error("DFF or TXD couldnt be found! " + dffName + " " + txdName);
                }
            }

            // let id = properties[0].trim().replace(/,+$/, '');
            // let dff = properties[1].trim().replace(/,+$/, '');
            // let txd = properties[2].trim().replace(/,+$/, '');
            // let objCount = properties[3].trim().replace(/,+$/, '');
            // let drawDist = properties[4].trim().replace(/,+$/, '');

            // if (sectionToCategoryMap.get(currentSection) != null) {
            //     console.log(`${sectionToCategoryMap.get(currentSection)}: id(${id}) dff(${dff}) txd(${txd}) objCount(${objCount}) drawDist(${drawDist})\n`);
            // }

        } else {
            currentSection = trimmedLine;
        }
    }

    return thisModels;
}

function findFileByName(fileList: string[], fileName: string): string | undefined {
    const lowerFileName = fileName.toLowerCase();

    return fileList.find(file => {
        const pathComponents = file.split('\\');
        const lastSegment = pathComponents[pathComponents.length - 1];

        return lastSegment.toLowerCase() === lowerFileName;
    });
}

const sectionToCategoryMap = new Map([
    ["objs", 0],
    ["tobj", 0],
    ["peds", 2],
    ["weap", 3],
    ["cars", 1]
]);
