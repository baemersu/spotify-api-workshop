// server.js
import express from "express"; // Importa o framework Express para criação do servidor web.
import fetch from "node-fetch"; // Importa a biblioteca 'node-fetch' para realizar solicitações HTTP.

const app = express(); // Inicializa a aplicação Express.

app.set("views", "./views"); // Configura o diretório das views para o caminho "./views".
app.set("view engine", "pug"); // Configura o mecanismo de visualização como 'pug'.

app.use(express.static("public")); // Configura o uso de arquivos estáticos no diretório "public".

const redirect_uri = "http://localhost:3000/callback"; // Define o URI de redirecionamento após a autorização.

import config from "./config.js"; // Importa as configurações (chaves de API) do arquivo 'config.js'.
const client_id = config.client_id; // Atribui o client_id da configuração.
const client_secret = config.client_secret; // Atribui o client_secret da configuração.

global.access_token; // Variável global para armazenar o token de acesso.

app.get("/", function (req, res) {
  res.render("index"); // Rota principal que renderiza a view 'index'.
});

app.get("/authorize", (req, res) => {
  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: client_id,
    scope: "playlist-modify-public playlist-modify-private user-library-read",
    redirect_uri: redirect_uri,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize?" + auth_query_parameters.toString()
  );
  console.log("Cliente Autorizado");
});
// Rota '/authorize': Redireciona o usuário para a página de autorização do Spotify com os parâmetros apropriados.

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  console.log(code);
  var body = new URLSearchParams({
    code: code,
    redirect_uri: redirect_uri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "post",
    body: body,
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
  });

  const data = await response.json();
  global.access_token = data.access_token;

  res.redirect("/dashboard");
});
// Rota '/callback': Recebe o código de autorização, troca por um token de acesso e redireciona para a rota '/dashboard'.

async function getData(endpoint) {
  const response = await fetch("https://api.spotify.com/v1" + endpoint, {
    method: "get",
    headers: {
      Authorization: "Bearer " + global.access_token,
    },
  });

  const data = await response.json();
  return data;
}
// Função auxiliar 'getData': Faz solicitações à API do Spotify adicionando automaticamente o token de acesso aos cabeçalhos.

app.get("/dashboard", async (req, res) => {
  const userInfo = await getData("/me");
  const tracks = await getData("/me/tracks?limit=30");

  res.render("dashboard", { user: userInfo, tracks: tracks.items });
});
// Rota '/dashboard': Recupera informações do perfil do usuário e as últimas 10 faixas adicionadas à biblioteca, e renderiza a view 'dashboard'.

app.get("/recommendations", async (req, res) => {
  const artist_id = req.query.artist;
  const track_id = req.query.track;

  const params = new URLSearchParams({
    seed_artist: artist_id,
    seed_genres: "rock",
    seed_tracks: track_id,
  });

  const data = await getData("/recommendations?" + params);
  res.render("recommendation", { tracks: data.tracks });
});
// Rota '/recommendations': Gera recomendações de faixas com base em artistas e faixas fornecidos como parâmetros de consulta.

app.get("/playlists", async (req, res) => {
  const playlists = await getData("/me/playlists");
  const userInfo = await getData("/me"); 

  res.render("playlists", { playlists: playlists.items, user: userInfo });
});



app.get('/playlist/:playlistId', async (req, res) => {
  const playlistId = req.params.playlistId;

  try {
    // Faça a chamada à API do Spotify para obter os detalhes da playlist
    const playlistDetails = await getData(`/playlists/${playlistId}`);
    
    // Renderize a página com os detalhes da playlist
    res.render('tracks', { playlistDetails });
  } catch (error) {
    // Lide com erros, por exemplo, redirecionando para uma página de erro
    res.render('error', { error });
  }
});



let listener = app.listen(3000, function () {
  console.log(
    "Your app is listening on http://localhost:" + listener.address().port
  );
});
// Inicia o servidor na porta 3000 e exibe uma mensagem indicando que o aplicativo está ouvindo nesta porta.



app.post("/playlist/:playlistId/remove-track/:trackId", async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;

    // Detalhes da faixa a ser removida da playlist
    const trackToRemove = {
      tracks: [
        {
          uri: `spotify:track:${trackId}`
        }
      ]
    };

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.access_token // Certifique-se de incluir o token de acesso aqui
      },
      body: JSON.stringify(trackToRemove)
    });

    const responseData = await response.json();
    console.log(responseData); // Exibe a resposta da API no console para ajudar a identificar o problema

    if (response.ok) {
      // Redirecionamento para a página anterior do usuário
      res.redirect(`/playlist/${playlistId}`);
    } else {
      res.status(500).send("Falha ao remover a faixa da playlist");
    }
  } catch (error) {
    console.error("Erro ao remover faixa da playlist:", error);
    res.status(500).send("Erro ao remover faixa da playlist");
  }
});

