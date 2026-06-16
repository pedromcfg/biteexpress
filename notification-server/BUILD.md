# Como Criar Executável Standalone

Este guia explica como criar um executável do servidor que roda sem precisar instalar Node.js.

## Instalação das Ferramentas

```bash
npm install --save-dev pkg
```

## Criar Executável

### Windows (recomendado para Windows)
```bash
npm run build:win
```

Isso cria: `dist/notification-server.exe`

### Todas as plataformas
```bash
npm run build:all
```

Isso cria executáveis para Windows, Linux e Mac.

## Como Usar o Executável

1. **Copie o executável** (`notification-server.exe` para Windows) para qualquer PC
2. **Execute diretamente** - não precisa instalar nada!
3. O servidor vai iniciar na porta 3000
4. A interface web estará disponível em `http://localhost:3000`

## Distribuir

O executável é **standalone** - inclui tudo que precisa:
- ✅ Node.js embutido
- ✅ Todas as dependências
- ✅ Interface web
- ✅ Tudo em um único arquivo

**Arquivos incluídos na pasta `dist/`:**
- `notification-server.exe` - O executável principal
- `open-firewall.bat` - Script para abrir firewall (Windows)
- `open-firewall.ps1` - Script PowerShell alternativo
- `FIREWALL.md` - Instruções detalhadas sobre firewall
- `README.md` - Documentação completa

**Para distribuir:**
1. Copie toda a pasta `dist/` para o PC de destino
2. Execute `notification-server.exe`
3. Se houver problemas de firewall, execute `open-firewall.bat` como Administrador

Pode copiar para qualquer PC Windows e executar diretamente!

## Notas

- O executável é maior (~50-70MB) porque inclui Node.js
- Funciona offline (não precisa de internet)
- Só precisa estar na mesma rede Wi-Fi que a app Android

