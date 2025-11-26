# service-app-mobile-inflow

Serviço de funções Cloud Functions para processamento de eventos de usuários, curadoria de conteúdo via IA, trilhas de aprendizagem e descoberta de notícias.

## Visão Geral

O serviço processa eventos do Firebase para:
- Criar perfis de usuários automaticamente
- Gerar curadoria de conteúdo baseada em interesses
- Criar trilhas de aprendizagem a partir de metas
- Descobrir e resumir notícias relevantes

**Tecnologias:** Firebase Functions, Firestore, Google GenAI, Node.js 22

## Funções Disponíveis

| Função | Gatilho | Descrição |
|--------|---------|-----------|
| `onUserCreate` | Auth onCreate | Cria perfil do usuário no Firestore ao registrar |
| `onUserInterestChange` | Firestore: update em `usuarios/{userId}` | Detecta novos interesses e gera curadoria de conteúdo |
| `onUserGoalsChange` | Firestore: update em `usuarios/{userId}` | Sincroniza trilhas de aprendizagem com metas do usuário |
| `scheduledNewsDiscovery` | PubSub (a cada 12h) | Descobre notícias relevantes para usuários ativos |

## Desenvolvimento Local

### Pré-requisitos

- Node.js v22
- Firebase CLI instalado e autenticado
- Projeto Firebase configurado (`service-app-mobile-inflow`)

### Configuração Inicial

```bash
# 1. Instalar dependências
cd functions
npm install

# 2. Autenticar no Firebase (se ainda não fez)
firebase login

# 3. Definir projeto (se necessário)
firebase use default
```

### Executar Localmente

```bash
# Compilar TypeScript e iniciar emuladores
npm run serve

# Ou apenas compilar
npm run build

# Depuração com inspector
npm run debug

# Shell interativo para testar funções
npm run shell
```

### Testar Funções Localmente

1. **`onUserCreate`**: Crie um usuário no emulador Auth via Firebase Console UI
2. **`onUserInterestChange`**: Atualize o campo `interests` de um documento em `usuarios/{userId}` no Firestore
3. **`onUserGoalsChange`**: Atualize o campo `metas` de um documento em `usuarios/{userId}`
4. **`scheduledNewsDiscovery`**: Execute manualmente via shell ou aguarde o agendamento do emulador

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta `functions` (se necessário):

```env
GOOGLE_APPLICATION_CREDENTIALS=caminho/para/service-account.json
```

Ou configure Application Default Credentials (ADC) para desenvolvimento.

##  Deploy para Firebase

### Deploy Completo

```bash
cd functions

# Compilar o projeto
npm run build

# Deploy de todas as funções
npm run deploy

# Ou usando Firebase CLI diretamente
firebase deploy --only functions
```

### Deploy de Função Específica

```bash
firebase deploy --only functions:onUserCreate
firebase deploy --only functions:onUserInterestChange
firebase deploy --only functions:onUserGoalsChange
firebase deploy --only functions:scheduledNewsDiscovery
```

### Verificar Deploy

```bash
# Listar funções implantadas
firebase functions:list

# Ver logs em tempo real
npm run logs

# Ver logs de uma função específica
firebase functions:log --only onUserCreate
```

## Observabilidade

- **Logs locais:** Terminal do emulador
- **Logs em produção:** `npm run logs` ou `firebase functions:log`
- **Monitoramento:** Firebase Console → Functions → Logs

## Testes

```bash
# Executar testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

## Estrutura do Projeto

```
functions/
├── src/
│   ├── triggers/          # Funções Cloud Functions
│   ├── ai/                # Serviços de IA
│   ├── utils/             # Utilitários
│   └── constants/         # Constantes
├── test/                  # Testes
└── lib/                   # Código compilado (gerado)
```
