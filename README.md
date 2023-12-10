# spotify-api-workshop

## Documentação do Aplicativo de Integração com a API do Spotify

Este documento fornece uma visão geral e explicação das funcionalidades do aplicativo implementado no arquivo `server.js`. O aplicativo utiliza a biblioteca Express.js para criar um servidor web que se integra à API do Spotify para autenticação do usuário e recuperação de informações sobre músicas e recomendações.

## Configuração Inicial

O aplicativo requer uma configuração inicial, que inclui o arquivo `config.js` contendo as chaves de API do Spotify (`client_id` e `client_secret`). Essas chaves são essenciais para autenticar o aplicativo com a API do Spotify.

## Funcionalidades Principais

### 1. Autenticação do Usuário

O aplicativo permite que os usuários autentiquem sua conta do Spotify. Isso é feito em duas etapas:

- **Rota `/authorize`:** Quando um usuário acessa esta rota, é redirecionado para a página de autorização do Spotify, onde concede permissões ao aplicativo para acessar seus dados.

- **Rota `/callback`:** Após a autorização bem-sucedida, o usuário é redirecionado de volta ao aplicativo com um código de autorização. O aplicativo troca esse código por um token de acesso, que é então armazenado globalmente para futuras solicitações à API.

### 2. Recuperação de Dados do Spotify

O aplicativo faz solicitações à API do Spotify para recuperar informações sobre o usuário e suas músicas favoritas.

- **Rota `/dashboard`:** Exibe informações sobre o usuário autenticado, como nome de usuário e outras informações disponíveis na rota `/me`. Além disso, exibe as últimas 10 faixas adicionadas à biblioteca do usuário.

- **Rota `/recommendations`:** Gera recomendações de faixas com base em um artista e uma faixa fornecidos como parâmetros de consulta. As recomendações são obtidas através da rota `/recommendations` da API do Spotify.

### 3. Função Auxiliar `getData`

A função `getData` é usada para fazer solicitações genéricas à API do Spotify. Ela adiciona automaticamente o token de acesso aos cabeçalhos das solicitações, simplificando o processo de recuperação de dados.

## Executando o Aplicativo

O aplicativo está configurado para ouvir na porta 3000. Após a execução bem-sucedida, você pode acessar o aplicativo em `http://localhost:3000`.

```bash
npm run start
