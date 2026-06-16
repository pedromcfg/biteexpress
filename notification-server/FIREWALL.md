# Como Resolver Problemas de Firewall

Se a app Android não receber notificações, o Firewall do Windows pode estar a bloquear a porta 3000.

## Solução Automática (Recomendado)

### Opção 1: Script .bat (Mais fácil)

1. **Botão direito** no arquivo `open-firewall.bat`
2. Selecione **"Executar como administrador"**
3. Siga as instruções na tela

### Opção 2: Script PowerShell

1. **Botão direito** no arquivo `open-firewall.ps1`
2. Selecione **"Executar com PowerShell"** (como Administrador)
3. Se aparecer erro de política, execute no PowerShell como Admin:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\open-firewall.ps1
   ```

## Solução Manual

### Windows Firewall

1. Abra **"Firewall do Windows Defender"**
2. Clique em **"Configurações avançadas"**
3. Clique em **"Regras de Entrada"** > **"Nova Regra"**
4. Selecione **"Porta"** > **"Próximo"**
5. Selecione **"TCP"** e porta específica: **3000**
6. Selecione **"Permitir a conexão"**
7. Marque todos os perfis (Domínio, Privado, Público)
8. Nome: **"Notification Server"**
9. Clique em **"Concluir"**

### Firewall de Terceiros

Se usar outro firewall (Norton, McAfee, etc.):
- Adicione uma exceção para a porta **3000 TCP**
- Ou permita o executável `notification-server.exe`

## Verificar se Funciona

Após configurar o firewall:

1. Execute o servidor
2. No telemóvel (mesma Wi-Fi), abra o navegador
3. Acesse: `http://IP_DO_SERVIDOR:3000/discover`
4. Deve retornar JSON com o IP

Se funcionar no navegador, a app também vai funcionar!

## Nota Importante

- O script precisa ser executado **como Administrador**
- Apenas precisa fazer isto **uma vez por PC**
- A regra fica guardada permanentemente

