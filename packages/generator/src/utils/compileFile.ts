import { spawn } from 'node:child_process';
import fs from 'fs/promises';
import { promisify } from 'util';

export const compileFile = async (generatorDirectory: string, newFileName: string, tscBinPath: string) => {
  try {
    await fs.access(tscBinPath, fs.constants.X_OK);
    
    process.chdir(generatorDirectory);
    
    await fs.access(newFileName, fs.constants.F_OK);
    
    const tscProcess = spawn(tscBinPath, [newFileName]);
    
    const processPromise = new Promise<{ stdout: string; code: number | null }>((resolve, reject) => {
      let stdout = '';
      
      tscProcess.stdout.on('data', (data) => {
        stdout += data;
      });
      
      tscProcess.on('close', (code) => {
        resolve({ stdout, code });
      });
      
      tscProcess.on('error', (err) => {
        reject(new Error(`Erreur lors de l'exécution de tsc: ${err.message}`));
      });
    });
    
    await processPromise;
    console.log(`✅ File ${newFileName} generated`)
  } catch (err: any) {
    console.error(err.message);
  }
}