# 🎓 UniMatrícula — Sistema de atendimento e matrículas

Projeto da disciplina **Programação Front-end** (Análise e Desenvolvimento de Sistemas).
Tema proposto: **Sistema de atendimento e matrículas** de uma universidade.

> Desenvolvido seguindo o plano de estudo da disciplina: **React + Vite + React Router +
> Bootstrap**, com um **backend simples em Express (Node.js)**. Não há renderização no servidor.

---

## ⚠️ Como abrir (importante)

**Este projeto usa React e NÃO pode ser aberto com duplo clique no `index.html`** — isso mostra
tela branca, porque o navegador precisa de um servidor para "montar" a aplicação (diferente do
projeto "Acolhe", que era HTML/CSS/JS puro).

**Para abrir no Windows:** dê duplo clique em **`iniciar.bat`** (na raiz do projeto). Ele instala
as dependências, compila o frontend e sobe **tudo em uma única porta** (`4000`), abrindo o
navegador sozinho em **http://localhost:4000**. Uma janela só, sem erro de conexão.

> Veja também o arquivo **`COMO-ABRIR.txt`**.

---

## O que o sistema faz

O sistema tem **duas visões**:

- **Visão institucional** (coordenação/secretaria): gerencia disciplinas, professores e monta as
  turmas (ofertas) combinando **disciplina + professor + dia/turno + vagas**.
- **Visão do aluno**: consulta a grade de ofertas, se matricula, vê suas matrículas e o
  **horário semanal**, e pode cancelar matrículas.

### Regras de negócio implementadas

- **Pré-requisitos**: o aluno só se matricula se já concluiu as disciplinas exigidas.
- **Choque de horário**: o aluno não pode ter duas turmas no mesmo dia e turno.
- **Vagas**: não é possível matricular em turma lotada.
- **Carga equilibrada**: a instituição vê a carga horária de cada professor e é avisada quando
  passa do limite (e o professor não pode ter duas turmas no mesmo dia/turno).

O horário usa a codificação do enunciado: **dia + turno** (ex.: `21` = segunda de manhã,
`33` = terça à noite). Dias: 2=segunda … 7=sábado; turnos: 1=manhã, 2=tarde, 3=noite.

---

## Tecnologias utilizadas

| Camada      | Tecnologia                                   |
| ----------- | -------------------------------------------- |
| Front-end   | React 18, Vite, React Router, React-Bootstrap (Bootstrap 5) |
| Back-end    | Node.js + Express, CORS                      |
| Persistência| Arquivo JSON (servidor gera o `db.json` na primeira execução) |

---

## Como executar

Pré-requisito: **Node.js 18+** instalado.

### Modo simples (recomendado) — tudo em uma porta

```bash
cd frontend
npm install
npm run build      # compila o frontend para frontend/dist

cd ../backend
npm install
npm start          # sobe API + frontend em http://localhost:4000
```

Acesse **http://localhost:4000**. No Windows, o **`iniciar.bat`** faz tudo isso automaticamente.

### Modo desenvolvimento (duas portas, para editar código)

```bash
cd backend && npm start          # API em http://localhost:4000
cd frontend && npm run dev       # Vite em http://localhost:5173 (proxy /api -> 4000)
```

### Acessos de demonstração

| Perfil      | E-mail                  | Senha    |
| ----------- | ----------------------- | -------- |
| Instituição | `admin@unimatricula.edu`| `admin123` |
| Aluno       | `laura@aluno.edu`       | `123456` |
| Aluno       | `joao@aluno.edu`        | `123456` |
| Aluno       | `maria@aluno.edu`       | `123456` |

---

## Casos de uso implementados (6)

1. **Login e seleção de perfil** (aluno × instituição).
2. **Gerenciar disciplinas** (CRUD, com pré-requisitos).
3. **Gerenciar professores** (CRUD, com carga horária alocada).
4. **Montar turmas/ofertas** (disciplina + professor + dia/turno + vagas + sala).
5. **Consultar grade de ofertas e se matricular** (com validações).
6. **Minhas matrículas, horário semanal e cancelamento**.

Detalhes de ator, fluxo principal e fluxos alternativos em
[`docs/casos-de-uso.md`](docs/casos-de-uso.md).

---

## Estrutura do projeto

```
matriculas/
├── backend/
│   ├── server.js          # API Express + regras de negócio
│   ├── seed.js            # dados de exemplo (fictícios)
│   └── data/db.json       # gerado automaticamente na 1ª execução
├── frontend/
│   ├── vite.config.js     # proxy /api -> localhost:4000
│   └── src/
│       ├── App.jsx        # rotas (React Router)
│       ├── api.js         # cliente HTTP
│       ├── auth.jsx       # contexto de autenticação
│       ├── components/    # Layout, RequireAuth, Feedback
│       └── pages/         # Login + páginas inst/aluno
├── docs/                  # casos de uso, entidades/API, protótipo, roteiro de vídeo
├── iniciar.bat            # sobe backend + frontend
└── README.md
```

---

## Benchmarking (referências)

As três plataformas indicadas (Gennera, Education1, Pincel Atômico) foram analisadas pelo
**código-fonte do front-end** (equivalente, para sites, à engenharia reversa de um binário — o
Ghidra decompila executáveis, não páginas web). Delas foram extraídas as funcionalidades que
inspiraram este projeto:

- **Portal de matrícula online** (aluno escolhe curso/disciplina e turno) — Pincel Atômico/Education1.
- **Gestão de turmas, horários e grade** — Education1/Gennera.
- **Visão institucional (secretaria) × visão do aluno** — Gennera/Education1.

---

## Critérios atendidos

- ✅ Aplicação web com programação JavaScript no front-end (React).
- ✅ Apenas tecnologias do plano de estudo (sem renderização no servidor).
- ✅ Backend simples (Express) com API REST e persistência.
- ✅ 6 casos de uso (acima do mínimo de 3).
- ✅ Protótipo/planejamento em `docs/` e roteiro de vídeo em `docs/roteiro-video.md`.
