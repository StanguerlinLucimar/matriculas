import { useEffect, useMemo, useState } from "react";
import { Card, Table, Badge, Button, Modal, Alert } from "react-bootstrap";
import { api } from "../../api";
import { useAuth } from "../../auth";
import { Carregando, Erro, Vazio } from "../../components/Feedback";
import { DIAS_CURTO, TURNOS } from "../../lib/constantes";

const DIAS_ORDENADOS = [2, 3, 4, 5, 6, 7];
const TURNOS_ORDENADOS = [1, 2, 3];

export default function MinhasMatriculas() {
  const { usuario } = useAuth();
  const aluno = usuario.user;

  const [minhas, setMinhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [cancelarAlvo, setCancelarAlvo] = useState(null);
  const [erroCancelar, setErroCancelar] = useState("");
  const [cancelando, setCancelando] = useState(false);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      setMinhas(await api.matriculas.listar(aluno.id));
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

  const ativas = useMemo(() => minhas.filter((m) => m.status === "ativa"), [minhas]);
  const canceladas = useMemo(() => minhas.filter((m) => m.status === "cancelada"), [minhas]);

  // grade semanal: células por dia (coluna) e turno (linha)
  const grade = useMemo(() => {
    const mapa = {};
    ativas.forEach((m) => {
      if (!m.turma) return;
      const chave = `${m.turma.dia}-${m.turma.turno}`;
      mapa[chave] = m;
    });
    return mapa;
  }, [ativas]);

  async function confirmarCancelamento() {
    setErroCancelar("");
    setCancelando(true);
    try {
      await api.matriculas.cancelar(cancelarAlvo.id);
      setCancelarAlvo(null);
      await carregar();
    } catch (err) {
      setErroCancelar(err.message);
    } finally {
      setCancelando(false);
    }
  }

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} onTentarNovamente={carregar} />;

  return (
    <>
      <h1 className="h4 mb-1">Minhas matrículas</h1>
      <p className="text-muted mb-4">Disciplinas em que você está matriculado e sua grade semanal.</p>

      {ativas.length === 0 ? (
        <Vazio mensagem="Você ainda não possui matrículas ativas. Acesse a grade de ofertas para se matricular." />
      ) : (
        <Card className="mb-4">
          <Card.Header className="fw-semibold">Matrículas ativas ({ativas.length})</Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>Professor</th>
                  <th>Dia / Turno</th>
                  <th>Sala</th>
                  <th className="tabela-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ativas.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="fw-semibold">{m.turma.disciplinaNome}</div>
                      <div className="text-muted small">{m.turma.disciplinaCodigo}</div>
                    </td>
                    <td>{m.turma.professorNome}</td>
                    <td>
                      {DIAS_CURTO[m.turma.dia]} · {TURNOS[m.turma.turno]}
                    </td>
                    <td>{m.turma.sala || "—"}</td>
                    <td className="tabela-acoes">
                      <Button variant="outline-danger" size="sm" onClick={() => setCancelarAlvo(m)}>
                        Cancelar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Card className="mb-4">
        <Card.Header className="fw-semibold">Horário semanal</Card.Header>
        <Card.Body>
          <div className="schedule-grid">
            <div className="schedule-label">Turno</div>
            {DIAS_ORDENADOS.map((d) => (
              <div className="schedule-head" key={d}>
                {DIAS_CURTO[d]}
              </div>
            ))}

            {TURNOS_ORDENADOS.map((t) => (
              <div className="schedule-row" key={t}>
                <div className="schedule-label">{TURNOS[t]}</div>
                {DIAS_ORDENADOS.map((d) => {
                  const m = grade[`${d}-${t}`];
                  return (
                    <div key={d} className={`schedule-cell ${m ? "has-turma" : ""}`}>
                      {m ? (
                        <>
                          <div className="codigo">{m.turma.disciplinaCodigo}</div>
                          <div className="text-truncate">{m.turma.disciplinaNome}</div>
                          <div className="text-muted">{m.turma.sala}</div>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {canceladas.length > 0 && (
        <Card>
          <Card.Header className="fw-semibold">Matrículas canceladas</Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>Professor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {canceladas.map((m) => (
                  <tr key={m.id}>
                    <td>{m.turma?.disciplinaNome}</td>
                    <td>{m.turma?.professorNome}</td>
                    <td>
                      <Badge bg="secondary">Cancelada</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal de cancelamento */}
      <Modal show={!!cancelarAlvo} onHide={() => setCancelarAlvo(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar matrícula</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erroCancelar && <Alert variant="danger">{erroCancelar}</Alert>}
          Deseja cancelar sua matrícula em{" "}
          <strong>{cancelarAlvo?.turma?.disciplinaNome}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setCancelarAlvo(null); setErroCancelar(""); }}>
            Voltar
          </Button>
          <Button variant="danger" onClick={confirmarCancelamento} disabled={cancelando}>
            {cancelando ? "Cancelando…" : "Cancelar matrícula"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
