# Casos de uso

Sistema de atendimento e matrículas (UniMatrícula). Cada caso de uso lista **ator**, **fluxo
principal** e **fluxos alternativos**.

---

## UC1 — Login e seleção de perfil

- **Ator:** aluno e instituição (secretaria/coordenação).
- **Pré-condição:** usuário possui credenciais.
- **Fluxo principal:**
  1. O usuário acessa a tela de login e escolhe o perfil (**Sou aluno** ou **Sou da instituição**).
  2. Informa e-mail e senha e clica em **Entrar**.
  3. O sistema valida as credenciais e redireciona para a área correspondente.
- **Fluxos alternativos:**
  - **Credenciais inválidas:** o sistema exibe mensagem de erro e permanece no login.
  - **Perfil incompatível:** o sistema bloqueia o acesso a rotas do outro perfil (guarda de rota).

---

## UC2 — Gerenciar disciplinas (CRUD)

- **Ator:** instituição.
- **Fluxo principal:**
  1. A instituição acessa **Disciplinas**.
  2. Clica em **+ Nova disciplina** e informa código, nome, carga horária e pré-requisitos.
  3. Confirma; a disciplina aparece na listagem.
- **Fluxos alternativos:**
  - **Código duplicado:** o sistema rejeita e avisa.
  - **Editar:** altera os campos e atualiza a listagem.
  - **Excluir com turma/uso:** o sistema bloqueia a exclusão e explica o motivo.
  - **Pré-requisito de si mesma:** bloqueado.

---

## UC3 — Gerenciar professores (CRUD)

- **Ator:** instituição.
- **Fluxo principal:**
  1. A instituição acessa **Professores** e clica em **+ Novo professor**.
  2. Informa nome, e-mail e titulação; confirma.
  3. O professor aparece na listagem com a **carga horária alocada** (turmas em que leciona).
- **Fluxos alternativos:**
  - **E-mail duplicado:** rejeitado.
  - **Excluir professor alocado:** bloqueado (está vinculado a turmas).
  - **Carga alta:** a listagem marca professores com carga acima de 100h (alocação equilibrada).

---

## UC4 — Montar turmas (ofertas)

- **Ator:** instituição.
- **Fluxo principal:**
  1. A instituição acessa **Turmas** e clica em **+ Nova turma**.
  2. Escolhe disciplina, professor, dia da semana, turno, vagas e sala.
  3. O sistema gera o código de horário (`dia`+`turno`, ex.: `21`) e cadastra a oferta.
- **Fluxos alternativos:**
  - **Choque de horário do professor:** se o professor já tem turma no mesmo dia/turno, o sistema
    avisa e impede o salvamento.
  - **Carga desequilibrada:** o formulário mostra a carga atual do professor selecionado.
  - **Excluir turma com alunos:** bloqueado.

---

## UC5 — Consultar grade de ofertas e se matricular

- **Ator:** aluno.
- **Fluxo principal:**
  1. O aluno acessa a **Grade de ofertas** e filtra por disciplina/professor, dia e turno.
  2. Clica em **Matricular-se** na turma desejada.
  3. O sistema valida as regras e confirma a matrícula.
- **Fluxos alternativos:**
  - **Pré-requisito não cumprido:** o sistema recusa e informa a(s) disciplina(s) pendente(s).
  - **Choque de horário:** recusa (já existe aula no mesmo dia/turno).
  - **Turma lotada:** o botão fica desabilitado (sem vagas).
  - **Já matriculado:** o sistema mostra "Já matriculado" e impede nova matrícula na mesma disciplina.

---

## UC6 — Minhas matrículas, horário semanal e cancelamento

- **Ator:** aluno.
- **Fluxo principal:**
  1. O aluno acessa **Minhas matrículas** e vê as matrículas ativas e a **grade semanal**
     (dia × turno).
  2. Para cancelar, clica em **Cancelar** e confirma.
  3. A matrícula passa para o estado "cancelada" e some da grade semanal.
- **Fluxos alternativos:**
  - **Nenhuma matrícula:** o sistema mostra estado vazio com chamada para ação.
  - **Histórico:** matrículas canceladas ficam listadas separadamente.
