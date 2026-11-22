# Entidades e API

## Modelo de dados (diagrama de entidades)

```
ALUNO ───────────┐
  id, nome, email,│          MATRICULA
  senha, ra, curso│          ├─ id
  concluidas[]    │          ├─ alunoId ────> ALUNO
                  ├──────────┤─ turmaId ────> TURMA
                  │          ├─ data
                  │          └─ status (ativa | cancelada)

DISCIPLINA ───────┐
  id, codigo, nome│          TURMA
  cargaHoraria    │          ├─ id
  preRequisitos[] │          ├─ disciplinaId -> DISCIPLINA
        │         │          ├─ professorId   -> PROFESSOR
        └─────────┼──────────┤─ dia (2..7)
  (autorelação    │          ├─ turno (1..3)
   pré-requisito) │          ├─ vagas
                  │          ├─ sala
PROFESSOR ────────┘          └─ semestre
  id, nome, email, titulacao
```

**Relacionamentos:**

- `DISCIPLINA 1 ── N TURMA` — uma disciplina pode ser ofertada em várias turmas.
- `PROFESSOR 1 ── N TURMA` — um professor leciona em várias turmas.
- `ALUNO N ── N TURMA` (via `MATRICULA`) — um aluno se matricula em várias turmas.
- `DISCIPLINA N ── N DISCIPLINA` (pré-requisitos) — autorrelação.

## Regras de negócio (resumo)

| Regra                    | Regra aplicada                                                        |
| ------------------------ | --------------------------------------------------------------------- |
| Código de horário        | `dia` + `turno` (ex.: `21` = segunda/manhã, `33` = terça/noite)        |
| Pré-requisito            | bloqueia matrícula se há pré-requisito não concluído                    |
| Choque de horário (aluno)| bloqueia matrícula em turma com mesmo dia/turno de outra matrícula     |
| Choque de horário (prof.)| bloqueia turma se o professor já leciona no mesmo dia/turno            |
| Vagas                    | bloqueia matrícula quando `vagasOcupadas >= vagas`                      |
| Carga equilibrada        | exibe/avisa quando a carga do professor passa de 100h                   |

## Endpoints da API

| Método | Rota                        | Descrição                                     |
| ------ | --------------------------- | --------------------------------------------- |
| POST   | `/api/login`                | Autentica aluno ou instituição                 |
| GET    | `/api/alunos`               | Lista alunos (sem senha)                       |
| GET    | `/api/disciplinas`          | Lista disciplinas (com pré-requisitos)         |
| POST   | `/api/disciplinas`          | Cria disciplina                                |
| PUT    | `/api/disciplinas/:id`      | Atualiza disciplina                            |
| DELETE | `/api/disciplinas/:id`      | Exclui disciplina (com validações)             |
| GET    | `/api/professores`          | Lista professores (com carga horária)          |
| POST   | `/api/professores`          | Cria professor                                 |
| PUT    | `/api/professores/:id`      | Atualiza professor                             |
| DELETE | `/api/professores/:id`      | Exclui professor (com validações)              |
| GET    | `/api/turmas`               | Lista turmas (enriquecidas)                    |
| GET    | `/api/turmas/:id`           | Detalha uma turma                              |
| POST   | `/api/turmas`               | Cria turma (valida choque do professor)        |
| PUT    | `/api/turmas/:id`           | Atualiza turma                                 |
| DELETE | `/api/turmas/:id`           | Exclui turma (com validações)                  |
| GET    | `/api/alunos/:id/matriculas`| Lista matrículas do aluno (com turma)          |
| POST   | `/api/matriculas`           | Cria matrícula (pré-requisito/choque/vagas)    |
| DELETE | `/api/matriculas/:id`       | Cancela matrícula (status `cancelada`)         |

## Formato de resposta de turma (exemplo)

```json
{
  "id": "t1",
  "disciplinaId": "d1",
  "professorId": "p1",
  "dia": 2,
  "turno": 1,
  "vagas": 40,
  "sala": "B-101",
  "semestre": "2026.2",
  "horario": "21",
  "diaLabel": "Segunda-feira",
  "turnoLabel": "Manhã",
  "disciplinaNome": "Cálculo I",
  "disciplinaCodigo": "MAT101",
  "professorNome": "Dra. Ana Souza",
  "vagasOcupadas": 2,
  "vagasDisponiveis": 38,
  "lotada": false
}
```
