// Dados de exemplo (seed) do sistema de matrículas.
// Todas as pessoas, disciplinas, turmas e matrículas são fictícias.

module.exports = {
  instituicao: {
    nome: "Universidade Unimatrícula",
    email: "admin@unimatricula.edu",
    senha: "admin123"
  },

  alunos: [
    {
      id: "a1",
      nome: "Laura de Freitas",
      email: "laura@aluno.edu",
      senha: "123456",
      ra: "20260001",
      curso: "Engenharia de Software",
      concluidas: ["d1", "d3", "d4"]
    },
    {
      id: "a2",
      nome: "João Pedro Silva",
      email: "joao@aluno.edu",
      senha: "123456",
      ra: "20260002",
      curso: "Engenharia de Software",
      concluidas: ["d1"]
    },
    {
      id: "a3",
      nome: "Maria Clara Oliveira",
      email: "maria@aluno.edu",
      senha: "123456",
      ra: "20260003",
      curso: "Ciência da Computação",
      concluidas: []
    }
  ],

  professores: [
    { id: "p1", nome: "Dra. Ana Souza", email: "ana.souza@unimatricula.edu", titulacao: "Doutora" },
    { id: "p2", nome: "Me. Bruno Lima", email: "bruno.lima@unimatricula.edu", titulacao: "Mestre" },
    { id: "p3", nome: "Dra. Carla Mendes", email: "carla.mendes@unimatricula.edu", titulacao: "Doutora" },
    { id: "p4", nome: "Esp. Diego Rocha", email: "diego.rocha@unimatricula.edu", titulacao: "Especialista" }
  ],

  disciplinas: [
    { id: "d1", codigo: "MAT101", nome: "Cálculo I", cargaHoraria: 60, preRequisitos: [] },
    { id: "d2", codigo: "MAT102", nome: "Cálculo II", cargaHoraria: 60, preRequisitos: ["d1"] },
    { id: "d3", codigo: "FIS101", nome: "Física I", cargaHoraria: 60, preRequisitos: [] },
    { id: "d4", codigo: "PRG101", nome: "Algoritmos e Programação", cargaHoraria: 60, preRequisitos: [] },
    { id: "d5", codigo: "PRG201", nome: "Estruturas de Dados", cargaHoraria: 60, preRequisitos: ["d4"] },
    { id: "d6", codigo: "BDD201", nome: "Banco de Dados", cargaHoraria: 60, preRequisitos: ["d4"] },
    { id: "d7", codigo: "ENG301", nome: "Engenharia de Software", cargaHoraria: 60, preRequisitos: ["d5"] },
    { id: "d8", codigo: "HUM101", nome: "Metodologia Científica", cargaHoraria: 30, preRequisitos: [] }
  ],

  // turma: disciplina + professor + dia (2..7) + turno (1..3) + vagas
  // horário é derivado: "dia" + "turno" (ex.: 21 = segunda de manhã, 33 = terça à noite)
  turmas: [
    { id: "t1", disciplinaId: "d1", professorId: "p1", dia: 2, turno: 1, vagas: 40, sala: "B-101", semestre: "2026.2" },
    { id: "t2", disciplinaId: "d2", professorId: "p1", dia: 3, turno: 3, vagas: 35, sala: "B-102", semestre: "2026.2" },
    { id: "t3", disciplinaId: "d4", professorId: "p2", dia: 2, turno: 3, vagas: 30, sala: "L-201", semestre: "2026.2" },
    { id: "t4", disciplinaId: "d5", professorId: "p2", dia: 4, turno: 3, vagas: 30, sala: "L-202", semestre: "2026.2" },
    { id: "t5", disciplinaId: "d6", professorId: "p3", dia: 3, turno: 1, vagas: 25, sala: "L-203", semestre: "2026.2" },
    { id: "t6", disciplinaId: "d7", professorId: "p3", dia: 5, turno: 3, vagas: 20, sala: "B-201", semestre: "2026.2" },
    { id: "t7", disciplinaId: "d3", professorId: "p4", dia: 4, turno: 1, vagas: 40, sala: "B-103", semestre: "2026.2" },
    { id: "t8", disciplinaId: "d8", professorId: "p4", dia: 6, turno: 2, vagas: 50, sala: "A-301", semestre: "2026.2" }
  ],

  matriculas: [
    { id: "m1", alunoId: "a1", turmaId: "t1", data: "2026-11-02", status: "ativa" },
    { id: "m2", alunoId: "a1", turmaId: "t3", data: "2026-11-02", status: "ativa" },
    { id: "m3", alunoId: "a2", turmaId: "t1", data: "2026-11-03", status: "ativa" }
  ]
};
