# ZapTrack — pesquisa sobre agente no WhatsApp

## Coexistência com WhatsApp Business App

Fonte: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

A documentação oficial descreve o onboarding de usuários do WhatsApp Business App por meio de Embedded Signup/Coexistence. O cliente pode escolher compartilhar dados, incluindo histórico de mensagens; o parceiro deve assinar os campos `history`, `smb_app_state_sync` e `smb_message_echoes`. A sincronização deve ser iniciada logo após o onboarding e a documentação indica uma janela de 24 horas para sincronizar contatos e histórico. O histórico compartilhado pode abranger até 180 dias anteriores ao onboarding. A documentação também informa que mensagens de grupos não são incluídas no histórico.

## Histórico

Fonte: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/history

O webhook `history` sincroniza o histórico do WhatsApp Business App quando o cliente concorda. O payload pode conter milhares de mensagens; deve ser capturado primeiro e processado de forma assíncrona. As mensagens de grupo não são incluídas. Mídias históricas podem ter limitações específicas: os IDs de mídia são enviados separadamente e a documentação informa uma janela menor de disponibilidade para mídias históricas.

## Groups API

Fonte: https://developers.facebook.com/documentation/business-messaging/whatsapp/groups

A Groups API é outra coisa: permite criar grupos programaticamente para mensagens e colaboração, com convite por link. A documentação informa elegibilidade para contas com Official Business Account, limite de até 8 participantes e que grupos não estão disponíveis para números do WhatsApp Business App nem para números em Multi-solution Conversations. Portanto, não deve ser usada como argumento de que o ZapTrack conseguirá ler grupos comuns do WhatsApp pessoal ou grupos existentes do WhatsApp Business App.

## Implicação estratégica

A promessa “consultar tudo do próprio WhatsApp, inclusive grupos” não é tecnicamente segura no caminho oficial. O produto deve declarar duas modalidades:

1. **Fonte oficial empresarial:** mensagens 1:1 e dados do WhatsApp Business App/Cloud API dentro do escopo permitido, com consentimento e limitações documentadas.
2. **Conteúdo adicional enviado pelo usuário:** mensagens, arquivos, áudios ou exportações que o próprio usuário encaminhar ao número do agente ou importar na aplicação.

Grupos comuns existentes só devem ser suportados se houver uma integração oficial explicitamente elegível e comprovada para aquele caso. Caso contrário, o roadmap deve oferecer captura por encaminhamento, importação ou conector separado, sem prometer leitura invisível de chats privados.
