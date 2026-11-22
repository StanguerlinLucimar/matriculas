# Roteiro do vídeo (3 a 5 minutos)

Grave **um take só**, com o sistema rodando (backend + frontend) e o VS Code aberto no código.
Use a gravação de tela do Windows: `Win + Alt + R` (Xbox Game Bar) grava em MP4.

**Antes de gravar:**

1. Suba os servidores (use `iniciar.bat` ou rode `npm start` no backend e `npm run dev` no frontend).
2. Abra `http://localhost:5173`.
3. Deixe o VS Code aberto em `frontend/src/pages/aluno/Grade.jsx` (ou `backend/server.js`).
4. Apague o `db.json` de `backend/data/` para começar com dados limpos, se quiser repetir os
   mesmos passos do roteiro.

---

## Roteiro

### 0:00 – 0:30 · Abertura
> "Olá, eu sou [seu nome]. Este é o **UniMatrícula**, meu projeto da disciplina Programação
> Front-end, com o tema **sistema de atendimento e matrículas**. O front é em React e o backend
> é uma API simples em Express."

Mostre a tela de login.

### 0:30 – 1:20 · Login e perfil institucional
> "O sistema tem dois perfis. Primeiro, o perfil da **instituição**, que monta as turmas."

Entre como instituição (`admin@unimatricula.edu` / `admin123`). Mostre o **Painel** com os
números e a carga dos professores.

### 1:20 – 2:30 · Disciplinas, professores e turmas
> "A instituição gerencia disciplinas e professores, e monta as turmas combinando disciplina,
> professor, dia e turno."

- Mostre **Disciplinas** (e os pré-requisitos) e **Professores** (com a carga alocada).
- Em **Turmas**, clique em **+ Nova turma**, escolha um professor que já leciona num dia/turno e
  mostre o aviso de **choque de horário do professor**.

### 2:30 – 3:40 · Visão do aluno e matrícula
> "Agora a visão do aluno: ele vê a grade de ofertas e se matricula, respeitando as regras."

- Saia e entre como aluno (`laura@aluno.edu` / `123456`).
- Na **Grade de ofertas**, filtre e mostre uma turma com **pré-requisito pendente** (botão
  desabilitado/badge) e depois faça uma matrícula válida.
- Tente uma segunda matrícula no mesmo dia/turno para mostrar o erro de **choque de horário**.

### 3:40 – 4:30 · Minhas matrículas e horário semanal
> "O aluno acompanha suas matrículas, o horário semanal e pode cancelar."

Mostre **Minhas matrículas**, a **grade semanal** e cancele uma matrícula (ela some da grade).

### 4:30 – 5:00 · Código e fechamento
> "Aqui no código: as rotas com React Router, os componentes com React-Bootstrap e as validações
> no backend Express (pré-requisito, choque de horário e vagas)."

Mostre `App.jsx` e a função de matrícula no `backend/server.js`.
> "Obrigada!"

---

## Checklist

- [ ] Duração entre 3 e 5 minutos, em **MP4**.
- [ ] Sistema em execução e **código-fonte legível** na tela.
- [ ] As **duas visões** (instituição e aluno) aparecem.
- [ ] Pelo menos uma **regra de negócio** demonstrada (choque ou pré-requisito).
- [ ] Todos os integrantes do grupo aparecem/falam (se for em grupo).
