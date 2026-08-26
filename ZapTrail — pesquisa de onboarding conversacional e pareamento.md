# ZapTrail — pesquisa de onboarding conversacional e pareamento

## Evolution API

Fonte pública: https://mintlify.wiki/EvolutionAPI/evolution-api/api/instance/connect (acesso em 26/08/2026).

A documentação apresenta `GET /instance/connect/:instanceName` para conectar ou reconectar uma instância e obter QR Code. Para integração baseada em Baileys, o endpoint pode devolver `code`, `base64` e `pairingCode`; há um exemplo de resposta com código de pareamento no formato `ABCD-EFGH`. A documentação também mostra um modo de conexão com número de telefone.

Implicação: o agente pode orientar o usuário em conversa, enviar instruções ou imagem/artefato de pareamento e acompanhar o status, mas o usuário ainda precisa executar a ação de vincular o dispositivo no WhatsApp.

## WAHA

Fonte pública: https://waha.devlike.pro/docs/how-to/sessions/ (acesso em 26/08/2026).

A documentação descreve uma sessão como uma conta/número WhatsApp conectado à WAHA. Antes de enviar ou receber mensagens, a sessão deve ser criada, iniciada e autenticada por QR Code ou pairing code. A API expõe `Get QR`, `Get pairing code`, estados de sessão e eventos `session.status`. Estados relevantes incluem `SCAN_QR_CODE`, `PASSKEY_REQUIRED`, `PASSKEY_CONFIRMATION_REQUIRED`, `WORKING` e `FAILED`.

Implicação: é viável construir um onboarding guiado por conversa e status, mas o pareamento não é uma operação puramente textual; depende de ação no telefone e pode exigir QR, código, passkey ou confirmação.

## Decisão funcional

O ZapTrail pode ser 100% conversacional em:

```text
boas-vindas
identificação básica
consentimento
explicação de escopo
criação de workspace
escolha de modo
acompanhamento de conexão
seleção de conversa quando o provider devolver lista
organização da conversa
visualização resumida da timeline
primeira pergunta ao agente
```

O ZapTrail não deve prometer que a vinculação da fonte WhatsApp será 100% textual. A etapa técnica precisa ser uma ação guiada no dispositivo ou um fallback dentro da aplicação.

## UAZAPI

Fonte pública: https://docs.uazapi.com/ (acesso em 26/08/2026).

A documentação uazapiGO V2 recomenda o uso de contas WhatsApp Business e alerta que contas WhatsApp normais podem apresentar inconsistências, desconexões, limitações e instabilidade durante o uso com a API. Ela apresenta endpoints de ciclo de vida de instância para conectar, desconectar, reiniciar e verificar status. Os estados descritos são `disconnected`, `connecting`, `connected` e `hibernated`; também há limites máximos de instâncias e possibilidade de erro 429.

A página pública de referência confirma que o provider deve ser tratado como uma dependência técnica com estados e falhas, não como uma etapa invisível do onboarding. O contrato do adapter do ZapTrail deve normalizar, no mínimo, `provisioning`, `awaiting_user_pairing`, `connecting`, `connected`, `reconnecting`, `failed`, `disconnected` e `expired`, mesmo que cada provider use nomes diferentes.

## Conclusão da validação

Há base técnica para o seguinte desenho: o usuário inicia enviando uma mensagem ao agente; o agente cria ou localiza a sessão do workspace; o backend solicita ao provider um QR, pairing code ou instrução de vínculo; o agente envia ao usuário o material/instrução; o backend acompanha eventos/status; e o agente confirma a conexão quando a sessão estiver autenticada.

A promessa correta é **“onboarding iniciado e guiado 100% pelo WhatsApp”**. A promessa incorreta seria **“vinculação 100% sem sair da conversa”**, porque a autenticação do dispositivo ocorre no WhatsApp do usuário e pode exigir escaneamento, inserção de código ou confirmação adicional.
