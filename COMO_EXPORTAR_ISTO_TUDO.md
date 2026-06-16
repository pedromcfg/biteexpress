# COMO EXPORTAR ISTO TUDO (OPCAO A)

Este guia explica como levar o projeto para outro PC e correr tudo no set sem instalar Node.js no computador de producao.

## Objetivo

- App em APK no telemovel.
- `notification-server` a correr como `.exe` no portatil/PC.
- Tudo na mesma rede Wi-Fi para funcionar em tempo real.

## 1) Build do servidor para Windows

No teu PC de desenvolvimento:

```powershell
cd "C:\Users\Pedro\OneDrive - Escola Profissional Profitecla\Documentos\Sites e Projectos\Bite Express New Silvana\notification-server"
npm install
npm run build:win
```

Isto gera ficheiros em:

- `notification-server/dist/`

## 2) O que copiar para o PC de rodagem

Copiar a pasta:

- `notification-server/dist/`

Opcionalmente, renomear para algo simples, ex.: `notification-server-film/`.

## 3) Arranque no PC de rodagem

1. Abrir a pasta `dist`.
2. Executar o `.exe` gerado.
3. Confirmar no terminal a mensagem com o IP da rede, por exemplo:
   - `http://192.168.1.45:3000`
4. Abrir no browser do PC:
   - `http://localhost:3000`

## 4) Configurar a app (APK) no telemovel

Na app, no perfil:

- abrir configuracao de servidor
- inserir a URL do PC da rodagem:
  - `http://IP_DO_PC:3000`
  - exemplo: `http://192.168.1.45:3000`

## 5) Requisitos para funcionar

- Telemovel e PC na mesma rede Wi-Fi.
- Firewall do Windows a permitir porta `3000`.
- Servidor em execucao durante toda a rodagem.

## 6) Checklist rapido pre-take

1. Servidor `.exe` aberto.
2. Browser no painel de cues (`http://localhost:3000`).
3. App com URL correta (`http://IP:3000`).
4. Botao `Reset Cues (novo take)` antes de cada take.
5. Disparar cues pela ordem definida para a cena.

## 7) Troubleshooting

### A app nao recebe cues

- Confirmar URL do servidor na app.
- Confirmar que o IP nao mudou (nova rede -> novo IP).
- Confirmar firewall (porta 3000).
- Fechar e abrir app.

### Painel abre mas botao de cue da erro

- Reiniciar o `.exe`.
- Fazer `Ctrl+F5` no browser para limpar cache.

### Mudou de local/rede e deixou de funcionar

- Obter novo IP mostrado no terminal do servidor.
- Atualizar URL no perfil da app.

## 8) Gerar APK da app

No teu PC de desenvolvimento:

```powershell
cd "C:\Users\Pedro\OneDrive - Escola Profissional Profitecla\Documentos\Sites e Projectos\Bite Express New Silvana\biteexpress-driver-clean"
npm install
npx eas build -p android --profile preview
```

Notas:

- Tens de estar autenticado no Expo (`npx eas login`).
- No fim do build, o EAS devolve um link para descarregar o APK.
- Instala esse APK no telemovel que vais usar na rodagem.
