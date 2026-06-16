# Como Gerar APK - Bite Express Driver

## Método 1: EAS Build (Recomendado - Expo SDK 54)

### Passo 1: Instalar EAS CLI
```bash
npm install -g eas-cli
```

### Passo 2: Fazer login
```bash
eas login
```
(Crie uma conta Expo se não tiver)

### Passo 3: Configurar o projeto
```bash
cd biteexpress-driver-clean
eas build:configure
```

### Passo 4: Gerar APK
```bash
eas build --platform android --profile preview
```

Isso vai gerar um APK que você pode baixar e instalar diretamente no dispositivo.

---

## Método 2: Build Local (Mais rápido para testes)

### Passo 1: Instalar dependências
```bash
cd biteexpress-driver-clean
npm install
```

### Passo 2: Gerar APK localmente
```bash
npx expo prebuild
npx expo run:android --variant release
```

Isso vai gerar o APK em: `android/app/build/outputs/apk/release/app-release.apk`

---

## ⚠️ IMPORTANTE: Configurar IP antes de gerar APK

Antes de gerar o APK, certifique-se de que o IP do servidor está correto em:
`src/config/notificationServer.ts`

O IP deve ser o do seu computador na rede Wi-Fi onde vai usar a app.

---

## Notas

- O EAS Build é mais fácil mas requer conta Expo (gratuita)
- Build local é mais rápido mas requer Android Studio instalado
- Para produção/filme, use o mesmo IP que está configurado agora: `10.7.1.144`

