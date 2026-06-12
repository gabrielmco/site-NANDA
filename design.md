# Design do Site de Dia dos Namorados: Spotify Wrapped

Este documento registra o planejamento e as especificações de design para o site interativo de Dia dos Namorados.

---

## 1. Resumo do Entendimento

* **Objetivo**: Um site interativo de Dia dos Namorados no estilo "Spotify Wrapped" (retrospectiva) e player de música.
* **Público-alvo**: Namorada do usuário (acesso exclusivo por dispositivo móvel).
* **Finalidade**: Fazer um pedido interativo de namoro ("Quer namorar comigo?") de forma única e personalizada.
* **Estilo Visual**: Dark theme (tema escuro) inspirado no Spotify, mas com uma paleta de cores voltada para tons de rosa pink neon, carmim e ouro rosé.
* **Música de Fundo**: Uma melodia gerada de forma programática por JavaScript (Web Audio API) simulando uma caixinha de música suave, tocando continuamente após o primeiro toque da usuária.

---

## 2. Premissas e Requisitos Não-Funcionais

* **Mobile-First**: 100% responsivo e testado para celulares Android e iOS.
* **Sem Dependências Pesadas**: Utilização apenas de HTML5, CSS3 Vanilla e ES6 JavaScript para performance máxima e carregamento instantâneo.
* **Interatividade de Áudio**: Necessidade de um clique inicial (botão Play na capa) para iniciar o áudio devido a políticas de segurança dos navegadores móveis contra autoplay de som.
* **Facilidade de Edição**: O código deve ser estruturado de forma simples para permitir a troca fácil de imagens e textos no futuro.

---

## 3. Registro de Decisões (Decision Log)

### Decisão 1: Arquitetura do Site
* **Decidido**: Abordagem 1 - Single-Page App nativo com HTML/CSS/JS Vanilla.
* **Alternativas consideradas**: Biblioteca Swiper.js (Abordagem 2) e React + Framer Motion (Abordagem 3).
* **Motivo da escolha**: Baixa complexidade, excelente performance mobile, sem arquivos pesados para baixar e total facilidade para hospedar gratuitamente.

### Decisão 2: Música de Fundo
* **Decidido**: Melodia programática sintetizada usando a **Web Audio API** do navegador.
* **Alternativas consideradas**: Arquivo MP3 externo ou playlist do Spotify incorporada (iFrame).
* **Motivo da escolha**: O iFrame do Spotify não toca a música inteira se o usuário não estiver logado com conta Premium. O arquivo MP3 pode demorar a carregar em conexões móveis. A melodia programática gera música instantaneamente e de forma personalizada sem carregar dados adicionais.

### Decisão 3: Paleta de Cores e Estética
* **Decidido**: "Spotify Pink/Red" (Preto profundo, cinza grafite do Spotify, rosa neon brilhante, detalhes carmim e dourado rosé).
* **Alternativas consideradas**: Cores clássicas do Spotify (verde) ou tons pastéis claros.
* **Motivo da escolha**: Mantém a referência visual do Spotify, mas adiciona o clima romântico e caloroso de Dia dos Namorados com brilhos neon modernos.

---

## 4. Detalhamento Técnico das Seções (Slides)

* **Capa / Play**: Capa do álbum, botão de play grande e interativo. Dá início à música e libera as próximas seções.
* **Nossa História**: Slide com efeito de letras de música subindo suavemente (Lyrics screen).
* **Nossas Estatísticas**: Gráficos e números estilizados simulando o Spotify Wrapped (ex: "Minutos de felicidade juntos").
* **Nossas Lembranças**: Galeria de fotos simulando capas de álbuns/playlists do Spotify.
* **Música Tema / Player**: Exibição da música oficial do casal com os botões de controle de mídia clássicos (Pause/Play, Próximo, Barra de Progresso).
* **O Pedido Final**: Pergunta com botão "Não" esquivo (foge do dedo no mobile) e botão "Sim" que dispara efeitos de confete e revela uma carta de amor com design premium.
