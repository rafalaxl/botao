# 🎮 RPG Combat Clicker - Botão de Ataque Animado

Este projeto consiste no desenvolvimento de uma interface de clique rápido (Clicker) com temática de jogos, focando em feedbacks visuais de alta qualidade (animações, partículas em Canvas, números flutuantes e combos) e automação de controle de versão (Git).

---

## ✨ Funcionalidades do Projeto

1. **Interface Temática RPG**: Um dark mode premium construído usando variáveis CSS nativas, glassmorphism e tipografia premium do Google Fonts ('Orbitron' e 'Inter').
2. **Botão de Ataque Animado**:
   - **Hover**: Resposta tridimensional e brilho neon expandido.
   - **Active (Click)**: Compressão visual instantânea e tremor na tela (*Screen Shake*).
3. **Efeitos de Partículas Neon**: Canvas 2D em tempo real gerando faíscas coloridas de acordo com o tipo de impacto (Normal, Crítico ou Especial).
4. **Números Flutuantes de Dano**: Feedback instantâneo do dano causado a cada clique, com suporte a hits Críticos e dano massivo de Especial.
5. **Combos Dinâmicos**: Acelerador de multiplicador de dano que decai se o jogador parar de atacar por mais de 1,8 segundos.
6. **Ataque Especial (Git Push)**:
   - Carrega 5% a cada ataque realizado.
   - Ao atingir 100%, libera o poder **Git Push** ativado por duplo clique (Double Click) com flash de tela inteira e 2.500 de dano fixo.
7. **Terminal / Painel de Logs**: Espelha os logs do console do desenvolvedor (`F12`), simulando requisições REST de rede (`POST /api/attack` e `POST /api/push`) e eventos de controle do Git.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica do jogo.
- **CSS3 (Vanilla)**: Variáveis de CSS, Flexbox/Grid, animações de tremor (`@keyframes shake`) e efeitos de escala/transições.
- **JavaScript (Vanilla)**: Manipulação da DOM, Canvas API 2D para efeitos de faíscas/física de partículas e simulação de requisições de rede assíncronas.
- **Google Fonts**: Fontes `'Orbitron'` e `'Inter'` para visual de jogos moderno e cibernético.
- **FontAwesome**: Ícones vetoriais.

---

## 🚀 Como Executar Localmente

1. Faça o download dos arquivos do projeto em uma pasta local.
2. Dê um duplo clique sobre o arquivo `index.html` para abri-lo diretamente em qualquer navegador moderno.
3. Clique no botão de ataque e acompanhe os feedbacks visuais e os logs na tela!
4. Abra as ferramentas de desenvolvedor (`F12` -> aba Console) para visualizar os logs detalhados do motor do jogo.

---

## 🔧 Controle de Versão (Passo a Passo Git)

Para inicializar e subir este projeto no seu GitHub através do terminal:

```bash
# 1. Inicializar o repositório
git init

# 2. Adicionar os arquivos criados
git add index.html style.css app.js README.md

# 3. Commitar as alterações
git commit -m "feat: implementado botao de ataque rpg premium com canvas particles e sistema de combos"

# 4. Ajustar branch principal
git branch -M main

# 5. Adicionar o repositório remoto e subir
git remote add origin <URL-DO-SEU-REPOSITORIO>
git push -u origin main
```
