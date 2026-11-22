import { useEffect, useMemo, useState } from "react";
import { Card, Form, Button, Badge, Modal, Alert, Row, Col } from "react-bootstrap";
import { api } from "../../api";
import { useAuth } from "../../auth";
import { Carregando, Erro, Vazio } from "../../components/Feedback";
import { DIAS, TURNOS } from "../../lib/constantes";

export default function Grade() {
  const { usuario } = useAuth();
  const aluno = usuario.user;

  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [minhas, setMinhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroDia, setFiltroDia] = useState("todos");
  const [filtroTurno, setFiltroTurno] = useState("todos");

  const [turmaAlvo, setTurmaAlvo] = useState(null);
  const [erroMatricula, setErroMatricula] = useState("");
  const [matriculando, setMatriculando] = useState(false);
  const [sucesso, setSucesso] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [t, d, m] = await Promise.all([
        api.turmas.listar(),
        api.disciplinas.listar(),
        api.matriculas.listar(aluno.id)
      ]);
      setTurmas(t);
      setDisciplinas(d);
      setMinhas(m);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aluno.id]);

  const disciplinasMatriculadas = useMemo(() => {
    return new Set(
      minhas.filter((m) => m.status === "ativa").map((m) => m.turma?.disciplinaId).filter(Boolean)
    );
  }, [minhas]);

  const preRequisitosPorDisciplina = useMemo(() => {
    const mapa = {};
    disciplinas.forEach((d) => {
      mapa[d.id] = d.preRequisitos || [];
    });
    return mapa;
  }, [disciplinas]);

  const turmasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return turmas.filter((t) => {
      if (filtroDia !== "todos" && String(t.dia) !== filtroDia) return false;
      if (filtroTurno !== "todos" && String(t.turno) !== filtroTurno) return false;
      if (termo) {
        const alvo = `${t.disciplinaNome} ${t.disciplinaCodigo} ${t.professorNome}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [turmas, busca, filtroDia, filtroTurno]);

  function prereqPendente(turma) {
    const pre = preRequisitosPorDisciplina[turma.disciplinaId] || [];
    const concluidas = aluno.concluidas || [];
    return pre.filter((id) => !concluidas.includes(id));
  }

  function podeMatricular(turma) {
    return !turma.lotada && !disciplinasMatriculadas.has(turma.disciplinaId);
  }

  function abrirMatricula(turma) {
    setTurmaAlvo(turma);
    setErroMatricula("");
  }

  async function confirmarMatricula() {
    setErroMatricula("");
    setMatriculando(true);
    try {
      await api.matriculas.criar({ alunoId: aluno.id, turmaId: turmaAlvo.id });
      const disciplina = turmaAlvo.disciplinaNome;
      setTurmaAlvo(null);
      setSucesso(`Matrícula realizada com sucesso em ${disciplina}!`);
      await carregar();
      window.setTimeout(() => setSucesso(""), 4000);
    } catch (err) {
      setErroMatricula(err.message);
    } finally {
      setMatriculando(false);
    }
  }

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} onTentarNovamente={carregar} />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h4 mb-0">Grade de ofertas</h1>
          <p className="text-muted mb-0">Escolha as disciplinas em que deseja se matricular.</p>
        </div>
      </div>

      {sucesso && <Alert variant="success">{sucesso}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-2">
            <Col xs={12} md={5}>
              <Form.Control
                placeholder="Buscar por disciplina ou professor…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Select value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)}>
                <option value="todos">Todos os dias</option>
                {Object.entries(DIAS).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)}>
                <option value="todos">Todos os turnos</option>
                {Object.entries(TURNOS).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={1} className="text-md-end">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setBusca("");
                  setFiltroDia("todos");
                  setFiltroTurno("todos");
                }}
              >
                Limpar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {turmasFiltradas.length === 0 ? (
        <Vazio mensagem="Nenhuma turma encontrada com os filtros selecionados." />
      ) : (
        <Row className="g-3">
          {turmasFiltradas.map((t) => {
            const pendentes = prereqPendente(t);
            const matriculado = disciplinasMatriculadas.has(t.disciplinaId);
            return (
              <Col xs={12} md={6} lg={4} key={t.id}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="text-muted small">{t.disciplinaCodigo}</div>
                        <Card.Title className="h6 mb-1">{t.disciplinaNome}</Card.Title>
                      </div>
                      <Badge bg="light" text="dark">
                        {t.horario}
                      </Badge>
                    </div>

                    <div className="text-muted small mb-3">
                      👨‍🏫 {t.professorNome}
                      <br />
                      📅 {DIAS[t.dia]} · {TURNOS[t.turno]}
                      {t.sala && <> · Sala {t.sala}</>}
                    </div>

                    <div className="mb-3">
                      {t.lotada ? (
                        <Badge bg="danger">Sem vagas</Badge>
                      ) : (
                        <Badge bg="success">{t.vagasDisponiveis} vagas</Badge>
                      )}
                      {matriculado && (
                        <Badge bg="primary" className="ms-1">
                          Matriculado
                        </Badge>
                      )}
                      {!matriculado && pendentes.length > 0 && (
                        <Badge bg="warning" text="dark" className="ms-1">
                          Pré-requisito pendente
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant={matriculado ? "outline-secondary" : "primary"}
                      className="mt-auto"
                      disabled={!podeMatricular(t)}
                      onClick={() => abrirMatricula(t)}
                    >
                      {matriculado ? "Já matriculado" : t.lotada ? "Turma lotada" : "Matricular-se"}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal de confirmação da matrícula */}
      <Modal show={!!turmaAlvo} onHide={() => setTurmaAlvo(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar matrícula</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erroMatricula && <Alert variant="danger">{erroMatricula}</Alert>}
          {turmaAlvo && (
            <>
              <p className="mb-2">
                Deseja se matricular em <strong>{turmaAlvo.disciplinaNome}</strong>?
              </p>
              <ul className="mb-0 text-muted small">
                <li>Professor: {turmaAlvo.professorNome}</li>
                <li>
                  Horário: {DIAS[turmaAlvo.dia]} · {TURNOS[turmaAlvo.turno]} (código{" "}
                  {turmaAlvo.horario})
                </li>
                <li>Vagas disponíveis: {turmaAlvo.vagasDisponiveis}</li>
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setTurmaAlvo(null)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmarMatricula} disabled={matriculando}>
            {matriculando ? "Matriculando…" : "Confirmar matrícula"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
