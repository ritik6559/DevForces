import fs from "fs/promises";
import path from "path";
import { injectable } from "tsyringe";

interface File {
  type: "file" | "dir";
  name: string;
  path: string;
}

export class FileService {

  async fetchDir(dir: string, baseDir: string): Promise<File[]> {
    const files = await fs.readdir(dir, { withFileTypes: true });

    return files.map((file) => ({
      type: file.isDirectory() ? ("dir" as const) : ("file" as const),
      name: file.name,
      path: `${baseDir}/${file.name}`,
    }));
  }

  async fetchFileContent(filePath: string): Promise<string> {
    return fs.readFile(filePath, "utf8");
  }

  async saveFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, "utf8");
  }

  async createFolder(dirName: string): Promise<void> {
    await fs.mkdir(dirName, { recursive: true });
  }

  async writeFile(filePath: string, fileData: Buffer): Promise<void> {
    await this.createFolder(path.dirname(filePath));
    await fs.writeFile(filePath, fileData);
  }

}