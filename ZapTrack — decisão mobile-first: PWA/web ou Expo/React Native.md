# ZapTrack — decisão mobile-first: PWA/web ou Expo/React Native

## 1. Princípio

Mobile first não significa necessariamente “publicar imediatamente em duas lojas”. Significa que a experiência principal, a densidade de informação, os gestos, a navegação e o primeiro valor devem ser desenhados primeiro para uma tela de telefone.

## 2. Comparação

| Critério | PWA/web mobile com Next.js/React | Expo/React Native |
|---|---|---|
| Primeiro acesso por link | Excelente | Requer app ou Expo Go/deep link |
| Custo de prototipagem | Muito baixo | Muito baixo com Expo Go |
| Publicação sem loja | Excelente | Possível apenas em web; app nativo exige contas/build |
| UX nativa | Boa, mas limitada ao browser | Melhor para gestos, teclado, arquivos, notificações e navegação |
| Push/deep link/secure storage | Mais dependente do browser | Mais natural no mobile |
| Desktop/visão administrativa | Excelente | Possível com RN Web, mas menos natural |
| Timeline com listas longas | Virtualização web madura | FlatList e otimização mobile necessárias |
| Opencode e debugging inicial | Mais simples | Requer lidar com Metro, simuladores e diferenças nativas |
| Reuso futuro em Android/iOS | Indireto | Forte |
| Adequação a “produto mobile-first” | Alta | Muito alta |

## 3. Decisão recomendada

Como o usuário determinou que o ZapTrack deve ser mobile first, a escolha principal deve ser **Expo + React Native + Expo Router + NativeWind**, com suporte à web por React Native Web. A aplicação externa continua existindo, mas nasce como a mesma base de interface, com layout adaptativo para telas maiores.

Não escolher Next.js como frontend primário neste momento. Escolher Next.js/PWA somente se a prioridade mudar para validar o conceito por link em poucos dias sem qualquer preocupação com experiência nativa, notificações ou publicação futura em lojas.

## 4. Forma mais simples de construir

```text
Expo/React Native + Expo Router
  → React Native Web para browser
  → Supabase Auth
  → Supabase Postgres
  → Supabase Storage
  → Supabase Edge Functions
  → UAZAPI adapter
  → LLM adapter
```

O aplicativo mobile não chama UAZAPI nem LLM diretamente. O app fala com Supabase/Edge Functions; as funções server-side falam com o provedor WhatsApp e o LLM.

## 5. Custo zero de início — definição honesta

O caminho de protótipo pode começar sem custo de infraestrutura com:

```text
Expo Go/local development
Supabase Free
Edge Functions dentro da franquia gratuita
UAZAPI/free endpoint ou trial, se disponível
fixtures sintéticas
processamento sob demanda
modelo local ou créditos/trial de LLM
```

Isso não garante custo zero em produção. Provedor WhatsApp, LLM, volume de mídia, hospedagem persistente, domínio e publicação em lojas podem gerar custos. O produto deve ter limites de consumo desde o primeiro dia.

## 6. Decisão de autenticação

Não misturar dois sistemas de autenticação no MVP. Para a arquitetura Lego proposta, usar **Supabase Auth** como identidade principal, com adapter para o cliente Expo:

```text
native: SecureStore para sessão
web: storage seguro/cookie conforme integração
backend: JWT verificado server-side
```

Se o desenvolvimento for feito dentro de um scaffold que já impõe Manus OAuth e banco próprio, escolher conscientemente entre:

```text
Rota rápida no ambiente: usar auth/banco do scaffold e deixar Supabase para evolução;
Rota Lego independente: usar Expo + Supabase Auth/Postgres/Storage desde o primeiro commit.
```

Não manter usuários duplicados nos dois sistemas sem uma estratégia explícita de identidade.

## 7. Consequência para o produto

O MVP mobile deve privilegiar:

```text
Agora
Conversas
Grupos
Timeline
Objeto de gestão
Buscar
Mais/Configurações
```

O calendário, Kanban, análise e configuração avançada entram como telas secundárias ou evolução. A tela de timeline usa lista virtualizada; a conversa original e a timeline estruturada alternam por tabs ou split adaptativo.

## 8. Estratégia de validação

Construir primeiro com Expo Go e web preview. Não iniciar pelo processo de loja. O primeiro gate é o fluxo funcional em um telefone real:

```text
login → conectar fonte → selecionar conversa → organizar → timeline → evidência
```

Somente depois de validar retenção e utilidade decidir se o app nativo será distribuído por build/test channel e lojas.
