import { exec, spawn } from "node:child_process";
import path from 'path'
import fs from 'fs'

export const compileFile = (generatorDirectory: string, newFileName: string, tscBinPath: string) => {
  
  fs.access(tscBinPath, fs.constants.X_OK, (err) => {
    if (err) {
      console.error(`Le fichier ${tscBinPath} n'est pas exécutable.`);
      return;
    }
    
    process.chdir(generatorDirectory);
    
    fs.access(newFileName, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`Le fichier ${newFileName} n'existe pas dans ${generatorDirectory}.`);
        return;
      }
      
      const tscProcess = spawn(tscBinPath, [newFileName]);
      
      // Gérer la sortie standard
      tscProcess.stdout.on('data', (data) => {
        console.log(`Sortie standard: ${data}`);
      });
      
      // Gérer les erreurs
      tscProcess.stderr.on('data', (data) => {
        console.error(`Erreur dans la sortie standard: ${data}`);
      });
      
      // Gérer la fermeture du processus
      tscProcess.on('close', (code) => {
        console.log(`Processus terminé avec le code: ${code}`);
      });
      
      // Gérer les erreurs de spawn
      tscProcess.on('error', (err) => {
        console.error(`Erreur lors de l'exécution de tsc: ${err.message}`);
      });
    });
  });
}