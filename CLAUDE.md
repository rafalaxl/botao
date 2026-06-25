# 🚀 Desafio: Botão de Ataque Animado & Automação Git

## 📝 Contexto
Este projeto consiste no desenvolvimento e publicação de uma interface de clique rápido (Clicker) com temática de jogos. O objetivo principal é criar um botão de ação estilizado que simula um comando de "ataque", contendo feedbacks visuais (animações) e integração simulada com um backend. O desafio valida competências de desenvolvimento Frontend básico (HTML/CSS/JS) e controle de versão (Git).

---

## 🎯 Regras do Desafio

1. **Interface & Estilização**: O botão deve ser centralizado na tela, possuir identidade visual que remeta a jogos (cores expressivas, bordas limpas) e mudar de estado visual (hover/active) ao passar o mouse ou ser clicado.
2. **Animação de Ataque**: Ao clicar no botão, ele deve executar uma animação fluida (ex: leve tremor, redução de tamanho `scale` ou efeito de clique pressionado) antes de disparar a lógica.
3. **Funcionalidade do Script**: O clique deve disparar um alerta visual na tela e registrar a execução no console do navegador, preparando o terreno para uma futura requisição de API.
4. **Versionamento Obrigatório**: O projeto deve ser iniciado, buildado localmente e enviado para um repositório público no GitHub através da linha de comando (Terminal).

---

## 🛠️ Passo a Passo: Execução e Git Push

Siga rigorosamente os comandos abaixo no seu terminal para cumprir o desafio:

### 1. Inicializar o Repositório Local
Na mesma pasta onde estão os seus arquivos (`index.html` e `README.md`), inicialize o Git:
```bash
git init
```

### 2. Verificar e Adicionar os Arquivos
Confira se os arquivos criados estão listados e adicione-os para a área de preparação (Staging):
```bash
git status
git add index.html README.md
```

### 3. Criar o Primeiro Commit
Grave o estado atual do seu código com uma mensagem descritiva:
```bash
git commit -m "feat: estrutura do botao de ataque e regras do desafio"
```

### 4. Configurar a Branch Principal
Garanta que você está trabalhando na branch padrão correta (`main`):
```bash
git branch -M main
```

### 5. Vincular ao GitHub e Enviar (Push)
Crie um repositório vazio no seu GitHub. Copie a URL dele e substitua no comando abaixo:
```bash
git remote add origin https://github.com
git push -u origin main
```

---

## 🧪 Critérios de Aceitação (Como Testar)
* [ ] **Visual**: O arquivo `index.html` abre corretamente no navegador clicando duas vezes sobre ele.
* [ ] **Animação**: O botão responde visualmente ao clique sem quebrar o layout da página.
* [ ] **Console**: Ao abrir a ferramenta de desenvolvedor (`F12` -> aba Console), o fluxo de clique é registrado.
* [ ] **Remoto**: O código está totalmente visível no link do seu repositório GitHub.
