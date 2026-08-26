# ZapTrack — pesquisa de onboarding e primeiro acesso

## Meta — Embedded Signup

Fonte: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview

A documentação oficial descreve Embedded Signup como uma interface de autenticação e autorização, compatível com desktop e mobile, que coleta dados empresariais, gera os ativos necessários e concede à aplicação acesso a esses ativos. O fluxo permite autenticar com credenciais Meta/Facebook Business, aceitar termos, selecionar ou criar portfólio empresarial e WABA, verificar número empresarial, definir nome de exibição e conceder acesso aos ativos do WhatsApp. Ao final, retorna WABA ID, phone number ID e código de token para processamento servidor a servidor.

Implicação para o ZapTrack: a conexão deve ser apresentada como um fluxo oficial de configuração de negócio, com tela anterior explicando o que será acessado e tela posterior confirmando ativos, status, escopo e próximos passos. O frontend não deve declarar conectado antes da confirmação do backend e da assinatura de webhooks.

## Meta — coexistência com WhatsApp Business App

Fonte: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

A documentação oficial informa que a coexistência pode permitir que um negócio conecte uma conta/número já utilizado no WhatsApp Business App. O provedor precisa habilitar tópicos como `history`, `smb_app_state_sync` e `smb_message_echoes`, solicitar dados e iniciar a sincronização logo após o onboarding, comunicar que a sincronização está ocorrendo e recomendar que o WhatsApp Business App permaneça aberto. A documentação indica uma janela de 24 horas para iniciar/sincronizar esses dados, e que mensagens enviadas pelo Business App após o onboarding geram echoes para manter a história no aplicativo do provedor.

Implicação para o ZapTrack: depois da conexão, mostrar uma etapa de sincronização com progresso, escopo e instrução operacional clara. O primeiro acesso não deve abrir a seleção de conversa antes de o índice mínimo estar pronto. Deve haver fallback para encaminhar/importar uma conversa se a sincronização falhar ou se a fonte não for elegível.

## Nielsen Norman Group — onboarding e ajuda contextual

Fonte: https://www.nngroup.com/articles/onboarding-tutorials/

A referência alerta que tutoriais podem interromper o usuário, ser ignorados e não melhorar necessariamente a execução da tarefa. Recomenda ajuda contextual e acionada pelo usuário (pull revelations), em vez de sobrecarregar o primeiro acesso com tours e modais longos.

Implicação para o ZapTrack: evitar tour de funcionalidades. O onboarding deve conduzir uma tarefa real: conectar, selecionar uma conversa, processar, revisar e visualizar a timeline. A ajuda aparece no ponto de decisão, em tooltips, exemplos, explicações de escopo e links de aprofundamento.

## ProductLed — onboarding orientado a valor

Fonte: https://productled.com/book/onboarding

A referência organiza práticas de onboarding em torno de critérios de sucesso, redução do tempo até o valor, simplificação do signup, primeira experiência e comunicação comportamental. Também recomenda definir marcos de sucesso e avaliar o caminho de onboarding continuamente.

Implicação para o ZapTrack: o evento de ativação deve ser operacional e mensurável: usuário conectou fonte, selecionou uma conversa real, viu a primeira timeline estruturada e conseguiu retornar à evidência original. O checklist deve ter poucas etapas, linguagem de resultado e progresso real, não apenas telas visitadas.

## Recomendações preliminares

1. Mostrar valor antes de explicar toda a plataforma.
2. Solicitar somente dados necessários para o próximo passo.
3. Usar conexão oficial e consentimento transparente.
4. Exibir progresso real de sincronização, processamento e indexação.
5. Fazer o usuário selecionar uma conversa representativa, em vez de processar tudo sem contexto.
6. Oferecer 1:1 e grupo como escolhas explícitas.
7. Mostrar preview do que será estruturado antes de confirmar.
8. Apresentar a timeline e o botão “mostrar na conversa” como primeiro momento de valor.
9. Usar ajuda contextual, não tour obrigatório.
10. Medir ativação por comportamento: conexão, seleção, timeline vista, evidência aberta, objeto confirmado e retorno ao produto.

## Appcues — onboarding guiado por ativação

Fonte: https://www.appcues.com/blog/product-led-onboarding

A referência enfatiza que product-led onboarding deve começar pelo objetivo do usuário, não por uma lista de funcionalidades. Recomenda definir o evento de ativação, trabalhar de trás para frente a partir desse evento, reduzir fricção e usar guidance contextual. Também destaca que concluir um tour não é o mesmo que alcançar valor; a ativação deve ser comportamental e ligada ao resultado principal do produto.

Implicação para o ZapTrack: o onboarding deve ser desenhado de trás para frente a partir do evento “timeline estruturada visualizada com evidência”. O fluxo deve pedir somente os passos necessários para chegar a esse resultado e não apresentar o mapa completo do produto antes de a primeira conversa ser organizada.

## Síntese de benchmark

O padrão convergente entre Meta, Nielsen Norman Group, ProductLed e Appcues é: escopo transparente, poucos passos, orientação pelo objetivo do usuário, progresso real, ajuda contextual, primeiro valor rápido, ativação comportamental e medição contínua. Para o ZapTrack, isso se traduz em conexão → seleção de conversa → processamento → revisão → timeline → evidência → próximo passo.
