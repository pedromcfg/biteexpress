# Servidor de Notificações - Bite Express

Servidor simples para disparar notificações na app Android do Bite Express.

## Instalação

```bash
npm install
```

## Como usar

### 1. Iniciar o servidor

```bash
npm start
```

O servidor irá rodar em `http://localhost:3000`

### 2. Descobrir o IP do computador

**Windows:**
```bash
ipconfig
```
Procure por "IPv4 Address" (exemplo: `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
ou
```bash
ip addr
```

### 3. Configurar o IP no app Android

No arquivo de configuração do app, defina o IP do servidor:
- Exemplo: `http://192.168.1.100:3000`

### 4. Abrir interface web

Abra no navegador:
- `http://localhost:3000` (no computador)
- Ou `http://SEU_IP:3000` (de outro dispositivo na mesma rede)

### 5. Disparar notificações

Clique em qualquer uma das 3 mensagens pré-definidas para enviar uma notificação à app Android.

## Mensagens disponíveis

1. "Tens que te apressar, o teu ritmo está muito lento!"
2. "Os teus clientes estão a passar fome!"
3. "Não serves para isto!"

## API

### GET /notifications
Retorna todas as notificações pendentes e limpa a fila.

**Resposta:**
```json
{
  "notifications": [
    {
      "id": "notif-1234567890-abc123",
      "message": "Tens que te apressar, o teu ritmo está muito lento!",
      "timestamp": 1234567890
    }
  ]
}
```

### POST /notifications
Adiciona uma nova notificação à fila.

**Body:**
```json
{
  "messageIndex": 0
}
```

ou

```json
{
  "message": "Mensagem customizada"
}
```

## Problemas de Firewall

Se a app Android não receber notificações, o Firewall do Windows pode estar a bloquear a porta 3000.

### Solução Rápida

Execute o script `open-firewall.bat` **como Administrador** (botão direito > Executar como administrador).

Para mais detalhes, consulte [FIREWALL.md](./FIREWALL.md).

## Build Standalone (Executável)

Para criar um executável que não precisa de Node.js instalado:

```bash
npm run build:win
```

O executável estará em `dist/notification-server.exe`.

**Nota:** O executável inclui os scripts de firewall (`open-firewall.bat` e `open-firewall.ps1`).

## Notas

- O servidor armazena notificações em memória (não persiste após reiniciar)
- Cada notificação é enviada apenas uma vez (fila é limpa após consulta)
- Certifique-se de que o firewall permite conexões na porta 3000 (use os scripts fornecidos)

