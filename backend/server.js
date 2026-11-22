const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");

const SEED = require("./seed");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// ---------- persistência (arquivo JSON simples) ----------
function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(SEED, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ---------- constantes de domínio ----------
const DIAS = {
  2: "Segunda-feira",
  3: "Terça-feira",
  4: "Quarta-feira",
  5: "Quinta-feira",
  6: "Sexta-feira",
  7: "Sábado"
};

const TURNOS = {
  1: "Manhã",
  2: "Tarde",
  3: "Noite"
};

// ---------- helpers ----------
function vagasOcupadas(db, turmaId) {
  return db.matriculas.filter((m) => m.turmaId === turmaId && m.status === "ativa").length;
}

function enriquecerTurma(db, turma) {
  const disciplina = db.disciplinas.find((d) => d.id === turma.disciplinaId);
  const professor = db.professores.find((p) => p.id === turma.professorId);
  const ocupadas = vagasOcupadas(db, turma.id);
  return {
    ...turma,
    horario: `${turma.dia}${turma.turno}`,
    diaLabel: DIAS[turma.dia] || turma.dia,
    turnoLabel: TURNOS[turma.turno] || turma.turno,
    disciplinaNome: disciplina ? disciplina.nome : "",
    disciplinaCodigo: disciplina ? disciplina.codigo : "",
    professorNome: professor ? professor.nome : "",
    vagasOcupadas: ocupadas,
    vagasDisponiveis: turma.vagas - ocupadas,
    lotada: turma.vagas - ocupadas <= 0
  };
}

function cargaProfessor(db, professorId) {
  const turmas = db.turmas.filter((t) => t.professorId === professorId);
  const totalCarga = turmas.reduce((acc, t) => {
    const d = db.disciplinas.find((x) => x.id === t.disciplinaId);
    return acc + (d ? d.cargaHoraria : 0);
  }, 0);
  return { qtdTurmas: turmas.length, cargaHoraria: totalCarga };
}

function enriquecerProfessor(db, p) {
  return { ...p, ...cargaProfessor(db, p.id) };
}

function preRequisitosNomes(db, disciplina) {
  return (disciplina.preRequisitos || []).map((id) => {
    const d = db.disciplinas.find((x) => x.id === id);
    return d ? `${d.codigo} - ${d.nome}` : id;
  });
}

function enriquecerDisciplina(db, d) {
  return { ...d, preRequisitosNomes: preRequisitosNomes(db, d) };
}

// ---------- login ----------
app.post("/api/login", (req, res) => {
  const { email, senha, perfil } = req.body || {};
  const db = loadDb();

  if (perfil === "instituicao") {
    if (email === db.instituicao.email && senha === db.instituicao.senha) {
      return res.json({ perfil: "instituicao", user: { nome: db.instituicao.nome, email } });
    }
    return res.status(401).json({ erro: "Credenciais inválidas para a instituição." });
  }

  const aluno = db.alunos.find((a) => a.email === email && a.senha === senha);
  if (!aluno) {
    return res.status(401).json({ erro: "E-mail ou senha inválidos." });
  }
  const { senha: _omitida, ...seguro } = aluno;
  return res.json({ perfil: "aluno", user: seguro });
});

// ---------- alunos ----------
app.get("/api/alunos", (req, res) => {
  const db = loadDb();
  const seguros = db.alunos.map(({ senha, ...resto }) => resto);
  res.json(seguros);
});

// ---------- disciplinas (CRUD) ----------
app.get("/api/disciplinas", (req, res) => {
  const db = loadDb();
  res.json(db.disciplinas.map((d) => enriquecerDisciplina(db, d)));
});

app.post("/api/disciplinas", (req, res) => {
  const db = loadDb();
  const { codigo, nome, cargaHoraria, preRequisitos } = req.body || {};

  if (!codigo || !nome || !cargaHoraria) {
    return res.status(400).json({ erro: "Preencha código, nome e carga horária." });
  }
  if (db.disciplinas.some((d) => d.codigo.toUpperCase() === codigo.toUpperCase())) {
    return res.status(400).json({ erro: `Já existe uma disciplina com o código ${codigo}.` });
  }

  const nova = {
    id: crypto.randomUUID(),
    codigo: codigo.toUpperCase(),
    nome,
    cargaHoraria: Number(cargaHoraria),
    preRequisitos: preRequisitos || []
  };
  db.disciplinas.push(nova);
  saveDb(db);
  res.status(201).json(enriquecerDisciplina(db, nova));
});

app.put("/api/disciplinas/:id", (req, res) => {
  const db = loadDb();
  const d = db.disciplinas.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ erro: "Disciplina não encontrada." });

  const { codigo, nome, cargaHoraria, preRequisitos } = req.body || {};
  if (codigo && db.disciplinas.some((x) => x.id !== d.id && x.codigo.toUpperCase() === codigo.toUpperCase())) {
    return res.status(400).json({ erro: `Já existe uma disciplina com o código ${codigo}.` });
  }
  // não permite que uma disciplina seja pré-requisito de si mesma
  if (preRequisitos && preRequisitos.includes(d.id)) {
    return res.status(400).json({ erro: "Uma disciplina não pode ser pré-requisito de si mesma." });
  }

  if (codigo) d.codigo = codigo.toUpperCase();
  if (nome) d.nome = nome;
  if (cargaHoraria) d.cargaHoraria = Number(cargaHoraria);
  if (preRequisitos) d.preRequisitos = preRequisitos;

  saveDb(db);
  res.json(enriquecerDisciplina(db, d));
});

app.delete("/api/disciplinas/:id", (req, res) => {
  const db = loadDb();
  const emUso = db.turmas.some((t) => t.disciplinaId === req.params.id);
  if (emUso) {
    return res.status(400).json({ erro: "Não é possível excluir: há turmas ofertadas para esta disciplina." });
  }
  const preReq = db.disciplinas.some((d) => (d.preRequisitos || []).includes(req.params.id));
  if (preReq) {
    return res.status(400).json({ erro: "Não é possível excluir: esta disciplina é pré-requisito de outra." });
  }
  db.disciplinas = db.disciplinas.filter((d) => d.id !== req.params.id);
  saveDb(db);
  res.status(204).end();
});

// ---------- professores (CRUD) ----------
app.get("/api/professores", (req, res) => {
  const db = loadDb();
  res.json(db.professores.map((p) => enriquecerProfessor(db, p)));
});

app.post("/api/professores", (req, res) => {
  const db = loadDb();
  const { nome, email, titulacao } = req.body || {};
  if (!nome || !email) {
    return res.status(400).json({ erro: "Preencha nome e e-mail do professor." });
  }
  if (db.professores.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ erro: "Já existe um professor com este e-mail." });
  }
  const novo = { id: crypto.randomUUID(), nome, email, titulacao: titulacao || "Especialista" };
  db.professores.push(novo);
  saveDb(db);
  res.status(201).json(enriquecerProfessor(db, novo));
});

app.put("/api/professores/:id", (req, res) => {
  const db = loadDb();
  const p = db.professores.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ erro: "Professor não encontrado." });

  const { nome, email, titulacao } = req.body || {};
  if (email && db.professores.some((x) => x.id !== p.id && x.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ erro: "Já existe um professor com este e-mail." });
  }
  if (nome) p.nome = nome;
  if (email) p.email = email;
  if (titulacao) p.titulacao = titulacao;

  saveDb(db);
  res.json(enriquecerProfessor(db, p));
});

app.delete("/api/professores/:id", (req, res) => {
  const db = loadDb();
  const emUso = db.turmas.some((t) => t.professorId === req.params.id);
  if (emUso) {
    return res.status(400).json({ erro: "Não é possível excluir: este professor está alocado em turmas." });
  }
  db.professores = db.professores.filter((p) => p.id !== req.params.id);
  saveDb(db);
  res.status(204).end();
});

// ---------- turmas (montagem de ofertas) ----------
app.get("/api/turmas", (req, res) => {
  const db = loadDb();
  res.json(db.turmas.map((t) => enriquecerTurma(db, t)));
});

app.get("/api/turmas/:id", (req, res) => {
  const db = loadDb();
  const t = db.turmas.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ erro: "Turma não encontrada." });
  res.json(enriquecerTurma(db, t));
});

function validarTurma(db, dados, turmaAtualId) {
  const { disciplinaId, professorId, dia, turno, vagas, sala } = dados;

  if (!disciplinaId || !professorId || !dia || !turno || !vagas) {
    return "Preencha disciplina, professor, dia, turno e vagas.";
  }
  if (!db.disciplinas.some((d) => d.id === disciplinaId)) return "Disciplina inválida.";
  if (!db.professores.some((p) => p.id === professorId)) return "Professor inválido.";

  const d = Number(dia);
  const t = Number(turno);
  if (d < 2 || d > 7) return "O dia deve estar entre 2 (segunda) e 7 (sábado).";
  if (t < 1 || t > 3) return "O turno deve ser 1 (manhã), 2 (tarde) ou 3 (noite).";

  const v = Number(vagas);
  if (!Number.isInteger(v) || v < 1) return "A quantidade de vagas deve ser um número inteiro positivo.";

  // choque de horário do professor (mesmo dia e turno)
  const choque = db.turmas.find(
    (turma) =>
      turma.id !== turmaAtualId &&
      turma.professorId === professorId &&
      Number(turma.dia) === d &&
      Number(turma.turno) === t
  );
  if (choque) {
    return `O professor já ministra outra turma em ${DIAS[d]} no turno da ${TURNOS[t]}.`;
  }

  return null;
}

app.post("/api/turmas", (req, res) => {
  const db = loadDb();
  const erro = validarTurma(db, req.body, null);
  if (erro) return res.status(400).json({ erro });

  const { disciplinaId, professorId, dia, turno, vagas, sala, semestre } = req.body;
  const nova = {
    id: crypto.randomUUID(),
    disciplinaId,
    professorId,
    dia: Number(dia),
    turno: Number(turno),
    vagas: Number(vagas),
    sala: sala || "",
    semestre: semestre || "2026.2"
  };
  db.turmas.push(nova);
  saveDb(db);
  res.status(201).json(enriquecerTurma(db, nova));
});

app.put("/api/turmas/:id", (req, res) => {
  const db = loadDb();
  const turma = db.turmas.find((x) => x.id === req.params.id);
  if (!turma) return res.status(404).json({ erro: "Turma não encontrada." });

  const dados = { ...turma, ...req.body };
  const erro = validarTurma(db, dados, turma.id);
  if (erro) return res.status(400).json({ erro });

  Object.assign(turma, {
    disciplinaId: dados.disciplinaId,
    professorId: dados.professorId,
    dia: Number(dados.dia),
    turno: Number(dados.turno),
    vagas: Number(dados.vagas),
    sala: dados.sala || "",
    semestre: dados.semestre || turma.semestre
  });

  saveDb(db);
  res.json(enriquecerTurma(db, turma));
});

app.delete("/api/turmas/:id", (req, res) => {
  const db = loadDb();
  const temMatriculas = db.matriculas.some((m) => m.turmaId === req.params.id && m.status === "ativa");
  if (temMatriculas) {
    return res.status(400).json({ erro: "Não é possível excluir: há alunos matriculados nesta turma." });
  }
  db.turmas = db.turmas.filter((t) => t.id !== req.params.id);
  saveDb(db);
  res.status(204).end();
});

// ---------- matrículas ----------
app.get("/api/matriculas", (req, res) => {
  const db = loadDb();
  let lista = db.matriculas;
  if (req.query.alunoId) lista = lista.filter((m) => m.alunoId === req.query.alunoId);
  res.json(lista);
});

app.get("/api/alunos/:id/matriculas", (req, res) => {
  const db = loadDb();
  const aluno = db.alunos.find((a) => a.id === req.params.id);
  if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado." });

  const resultado = db.matriculas
    .filter((m) => m.alunoId === aluno.id)
    .map((m) => {
      const turma = db.turmas.find((t) => t.id === m.turmaId);
      return {
        ...m,
        turma: turma ? enriquecerTurma(db, turma) : null
      };
    })
    .sort((a, b) => (a.turma?.dia || 0) - (b.turma?.dia || 0) || (a.turma?.turno || 0) - (b.turma?.turno || 0));

  res.json(resultado);
});

app.post("/api/matriculas", (req, res) => {
  const db = loadDb();
  const { alunoId, turmaId } = req.body || {};

  const aluno = db.alunos.find((a) => a.id === alunoId);
  if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado." });

  const turma = db.turmas.find((t) => t.id === turmaId);
  if (!turma) return res.status(404).json({ erro: "Turma não encontrada." });

  const disciplina = db.disciplinas.find((d) => d.id === turma.disciplinaId);

  // já matriculado na mesma disciplina?
  const jaMatriculado = db.matriculas.some((m) => {
    if (m.alunoId !== alunoId || m.status !== "ativa") return false;
    const t = db.turmas.find((x) => x.id === m.turmaId);
    return t && t.disciplinaId === turma.disciplinaId;
  });
  if (jaMatriculado) {
    return res.status(400).json({ erro: `Você já está matriculado em ${disciplina.nome}.` });
  }

  // pré-requisitos
  const concluidas = aluno.concluidas || [];
  const pendentes = (disciplina.preRequisitos || []).filter((id) => !concluidas.includes(id));
  if (pendentes.length > 0) {
    const nomes = pendentes
      .map((id) => db.disciplinas.find((d) => d.id === id))
      .filter(Boolean)
      .map((d) => d.nome)
      .join(", ");
    return res.status(400).json({ erro: `Pré-requisito não cumprido: ${nomes}.` });
  }

  // choque de horário (mesmo dia e turno)
  const choque = db.matriculas.some((m) => {
    if (m.alunoId !== alunoId || m.status !== "ativa") return false;
    const t = db.turmas.find((x) => x.id === m.turmaId);
    return t && t.dia === turma.dia && t.turno === turma.turno;
  });
  if (choque) {
    return res.status(400).json({
      erro: `Choque de horário: você já tem aula em ${DIAS[turma.dia]} no turno da ${TURNOS[turma.turno]}.`
    });
  }

  // vagas
  if (vagasOcupadas(db, turma.id) >= turma.vagas) {
    return res.status(400).json({ erro: "Turma sem vagas disponíveis." });
  }

  const nova = {
    id: crypto.randomUUID(),
    alunoId,
    turmaId,
    data: new Date().toISOString().slice(0, 10),
    status: "ativa"
  };
  db.matriculas.push(nova);
  saveDb(db);

  res.status(201).json({ ...nova, turma: enriquecerTurma(db, turma) });
});

app.delete("/api/matriculas/:id", (req, res) => {
  const db = loadDb();
  const m = db.matriculas.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ erro: "Matrícula não encontrada." });
  m.status = "cancelada";
  saveDb(db);
  res.json(m);
});

// ---------- saúde ----------
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---------- serve o front-end compilado (modo simples: tudo em uma porta) ----------
const DIST = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get("*", (req, res) => {
    res.sendFile(path.join(DIST, "index.html"));
  });
  console.log(`Front-end servido na mesma porta: http://localhost:${PORT}`);
}

// abre o navegador automaticamente (cross-platform)
function abrirNavegador(url) {
  let comando;
  if (process.platform === "win32") {
    comando = `start "" "${url}"`;
  } else if (process.platform === "darwin") {
    comando = `open "${url}"`;
  } else {
    comando = `xdg-open "${url}"`;
  }
  exec(comando, (erro) => {
    if (erro) {
      console.log(`Se o navegador não abrir sozinho, acesse manualmente: ${url}`);
    }
  });
}

const server = app.listen(PORT, () => {
  console.log(`Sistema de matrículas rodando em http://localhost:${PORT}`);
  if (fs.existsSync(DIST)) {
    console.log("Abrindo o navegador...");
    abrirNavegador(`http://localhost:${PORT}`);
  } else {
    console.log("Modo apenas API. Para o front-end em desenvolvimento: http://localhost:5173");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error("");
    console.error("==================================================");
    console.error(`  ERRO: a porta ${PORT} ja esta em uso.`);
    console.error("  Feche o outro programa que usa essa porta e");
    console.error("  rode o iniciar.bat novamente.");
    console.error("==================================================");
  } else {
    console.error("Erro ao iniciar o servidor:", err.message);
  }
  process.exit(1);
});
