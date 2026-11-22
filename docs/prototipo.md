# Protótipo e planejamento

Documento de planejamento do front-end do **UniMatrícula** (sistema de atendimento e matrículas).

---

## 1. Personas

| Persona | Perfil | Objetivo principal |
| ------- | ------ | ------------------ |
| **Marina (coordenação)** | Instituição | Montar as turmas do semestre, distribuir professores sem sobrecarregá-los e acompanhar as vagas. |
| **Pedro (aluno)** | Aluno | Encontrar disciplinas disponíveis, se matricular sem conflito de horário e acompanhar sua grade. |

## 2. Fluxo de navegação (mapa de telas)

```
                 ┌────────────────────────────┐
                 │  Login + seleção de perfil │
                 └──────────────┬─────────────┘
              ┌─────────────────┴─────────────────┐
        [aluno]                            [instituição]
              │                                   │
     ┌────────┴─────────┐              ┌──────────┴──────────┐
     │ Grade de ofertas │              │ Painel institucional │
     └────────┬─────────┘              └──────┬─────┬─────┬──┘
     ┌────────┴─────────┐          ┌──────────┘     │     └──────────────┐
     │ Minhas matrículas│          │ Disciplinas     │ Professores       │ Turmas
     │ + horário semanal│          │ (CRUD)          │ (CRUD)            │ (CRUD)
     └──────────────────┘          └─────────────────┴───────────────────┘
```

## 3. Wireframes (resumo)

**Login**
```
┌──────────────────────────────┐
│  🎓 UniMatrícula             │
│  [Sou aluno] [Sou a inst.]   │
│  E-mail  [______________]    │
│  Senha   [______________]    │
│        [ Entrar ]            │
└──────────────────────────────┘
```

**Grade de ofertas (aluno)**
```
┌───────────────────────────────────────────────┐
│ Navbar: UniMatrícula | Grade | Minhas matríc. │
├───────────────────────────────────────────────┤
│ [Buscar...] [Dia ▾] [Turno ▾] [Limpar]        │
│                                               │
│ ┌ MAT101 Cálculo I      [21] ┐  ┌ ... ┐       │
│ │ Prof. Ana · Seg/Manhã      │  │     │       │
│ │ [38 vagas] [Matricular-se] │  │     │       │
│ └────────────────────────────┘  └─────┘       │
└───────────────────────────────────────────────┘
```

**Minhas matrículas + horário semanal (aluno)**
```
┌──────────────────────────────────────────────┐
│ Horário semanal                              │
│         Seg  Ter  Qua  Qui  Sex  Sáb          │
│ Manhã  ┌────┬────┬────┬────┬────┬────┐       │
│        │MAT │    │FIS │    │    │    │       │
│        └────┴────┴────┴────┴────┴────┘       │
│ Tarde  ┌────┬────┬────┬────┬────┬────┐       │
│        │    │    │    │    │    │    │       │
│        └────┴────┴────┴────┴────┴────┘       │
│ Noite  ┌────┬────┬────┬────┬────┬────┐       │
│        │PRG │    │    │    │ENG │    │       │
│        └────┴────┴────┴────┴────┴────┘       │
└──────────────────────────────────────────────┘
```

**Turmas (instituição)**
```
┌────────────────────────────────────────────────────┐
│ Nova turma                                         │
│ Disciplina [MAT101 - Cálculo I ▾]                  │
│ Professor  [Dra. Ana Souza (120h alocadas) ▾]      │
│ Dia        [Segunda-feira (2) ▾]                   │
│ Turno      [Manhã (1) ▾]                           │
│ Vagas [40]    Sala [B-101]                         │
│ ⚠️ O professor já ministra outra turma nesse dia.  │
│        [Cancelar]  [Salvar]                        │
└────────────────────────────────────────────────────┘
```

## 4. Identidade visual

- **Paleta:** azul institucional (`#1e40af`) + tons neutros (`#f4f6fb` de fundo).
- **Tipografia:** fonte de sistema (Segoe UI/Roboto/Helvetica), com pesos para hierarquia.
- **Componentes:** Navbar, cards, tabelas, modais, badges e alertas do Bootstrap 5.
- **Responsividade:** grid do Bootstrap (xs/md/lg), menu colapsável no mobile, grade semanal com
  rolagem horizontal em telas pequenas.

## 5. Acessibilidade básica

- `label` associado a todos os campos de formulário.
- Contraste adequado (texto escuro sobre fundo claro; navbar escura com texto branco).
- Foco visível dos elementos interativos (padrão do Bootstrap).
