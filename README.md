
# service-app-mobile-inflow — documentação das funções

## Visão geral

O serviço `service-app-mobile-inflow` processa eventos de usuários e dados para:
- criar perfis iniciais;
- gerar curadoria de conteúdo via IA;
- criar trilhas de aprendizagem baseadas em metas do usuário;
- descobrir e resumir notícias relevantes para usuários ativos.

O serviço usa Firestore para persistência e um cliente GenAI para geração/sumarização de conteúdo.

## Funções (descrição resumida)

- `onUserCreate` (gatilho: Auth onCreate)
	- Finalidade: criar perfil do usuário no Firestore quando um novo usuário é registrado.
	- Entrada: evento de criação no Auth.
	- Saída: documento de perfil em `usuarios` com campos iniciais (`uid`, `email`, `name`, `interesses`, `metas`).

- `onUserInterestChange` (gatilho: alteração em documento de usuário)
	- Finalidade: detectar novos interesses e gerar curadoria de conteúdo.
	- Entrada: escrita/atualização no perfil do usuário.
	- Processo: quando há novos interesses, chama o serviço de curadoria para obter itens recomendados.
	- Saída: grava recomendações em `conteudos_recomendados` associadas ao usuário.

- `onUserGoalsChange` (gatilho: atualização de metas do usuário)
	- Finalidade: sincronizar trilhas de aprendizagem com as metas do usuário.
	- Entrada: update no campo `metas` do perfil.
	- Processo: identifica metas adicionadas/removidas/alteradas; remove trilhas correspondentes a metas removidas; gera/atualiza trilhas via serviço de `learningPath`.
	- Saída: documentos em `trilhas` criados/atualizados; remoções quando aplicável.

- `scheduledNewsDiscovery` (gatilho: execução agendada)
	- Finalidade: descoberta proativa de notícias relevantes para usuários ativos.
	- Entrada: execução agendada (Cloud Scheduler/PubSub).
	- Processo: busca usuários ativos, para cada um com interesses chama `newsDiscovery` e agrega resultados.
	- Saída: documentos em `ultimas_noticias` com `userId` e `newsItems`.

## Serviços de IA (breve)

- Curadoria de Conteúdo: gera recomendações a partir de interesses.
- Learning Path: gera sequências de aprendizagem para uma meta.
- News Discovery: busca e resume notícias relevantes.

## Como rodar as funções localmente

Pré-requisitos:
- Node.js v22
- Firebase CLI autenticado (`firebase login`) e projeto definido (`service-app-mobile-inflow` em `.firebaserc`)
- Credenciais Google (ou ADC) para acesso a APIs quando necessário

Passos (rápido):

```powershell
cd functions
npm install
npm run build
npm run serve   # inicia o emulador de functions
```

- Para depuração com inspector: `npm run debug`.
- Para shell interativo de funções: `npm run shell`.

Simular eventos locais:
- criar um usuário no emulador Auth para acionar `onUserCreate`;
- escrever/atualizar documentos de usuário no emulador Firestore para acionar `onUserInterestChange` e `onUserGoalsChange`;
- deixar o agendador do emulador executar ou acionar manualmente `scheduledNewsDiscovery` no shell.

## Variáveis e credenciais

- `GOOGLE_APPLICATION_CREDENTIALS`: JSON da service account (ou configurar ADC).

## Observabilidade e logs

- Logs locais: terminal do emulador.
- Logs em produção: `firebase functions:log`.

