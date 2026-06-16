// Script para copiar arquivos necessários para a pasta dist após build
const fs = require('fs');
const path = require('path');

const filesToCopy = [
  'open-firewall.bat',
  'open-firewall.ps1',
  'FIREWALL.md',
  'README.md'
];

const distDir = path.join(__dirname, 'dist');

// Cria pasta dist se não existir
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copiado: ${file}`);
  } else {
    console.log(`⚠️  Não encontrado: ${file}`);
  }
});

console.log('\n✅ Arquivos copiados com sucesso!');

