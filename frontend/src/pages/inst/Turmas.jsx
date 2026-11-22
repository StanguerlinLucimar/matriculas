import { useEffect, useMemo, useState } from "react";
import { Button, Card, Table, Modal, Form, Badge, Alert } from "react-bootstrap";
import { api } from "../../api";
import { Carregando, Erro, Vazio } from "../../components/Feedback";
import { DIAS, DIAS_CURTO, TURNOS } from "../../lib/constantes";

const formularioVazio = {
  id: null,
  disciplinaId: "",
  professorId: "",
  dia: 2,
  turno: 1,
  vagas: 30,
  sala: ""
};

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [form, setForm] = useState(formularioVazio);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [excluir, setExcluir] = useState(null);
  const [erroExcluir, setErroExcluir] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [t, d, p] = await Promise.all([
        api.turmas.listar(),
        api.disciplinas.listar(),
        api.professores.listar()
      ]);
      setTurmas(t);
      setDisciplinas(d);
      setProfessores(p);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  // aviso de choque de horário do professor, calculado no próprio formulário
  const avisoChoque = useMemo(() => {
    if (!form.professorId) return "";
    const conflito = turmas.find(
      (t) =>
        t.id !== form.id &&
        t.professorId === form.professorId &&
        t.dia === Number(form.dia) &&
        t.turno === Number(form.turno)
    );
    return conflito
      ? `O professor já ministra "${conflito.disciplinaNome}" em ${DIAS[form.dia]} (${TURNOS[form.turno]}).`
      : "";
  }, [form, turmas]);

  const professorSelecionado = professores.find((p) => p.id === form.professorId);

  function abrirNova() {
    setForm(formularioVazio);
    setErroForm("");
    setMostrarModal(true);
  }

  function abrirEdicao(t) {
    setForm({ ...t });
    setErroForm("");
    setMostrarModal(true);
  }

  function mudar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function salvar(e) {
    e.preventDefault();
    setErroForm("");
    setSalvando(true);
    try {
      const corpo = {
        disciplinaId: form.disciplinaId,
        professorId: form.professorId,
        dia: Number(form.dia),
        turno: Number(form.turno),
        vagas: Number(form.vagas),
        sala: form.sala
      };
      if (form.id) {
        await api.turmas.atualizar(form.id, corpo);
      } else {
        await api.turmas.criar(corpo);
      }
      setMostrarModal(false);
      await carregar();
    } catch (err) {
      setErroForm(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    setErroExcluir("");
    try {
      await api.turmas.excluir(excluir.id);
      setExcluir(null);
      await carregar();
    } catch (err) {
      setErroExcluir(err.message);
    }
  }

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} onTentarNovamente={carregar} />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h4 mb-0">Turmas (ofertas)</h1>
          <p className="text-muted mb-0">
            Montagem das turmas: disciplina + professor + dia/turno + vagas.
          </p>
        </div>
        <Button variant="primary" onClick={abrirNova}>
          + Nova turma
        </Button>
      </div>

      <Card>
        <Card.Body className="p-0">
          {turmas.length === 0 ? (
            <Vazio mensagem="Nenhuma turma ofertada." />
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>Professor</th>
                  <th>Dia / Turno</th>
                  <th className="text-center">Código</th>
                  <th>Sala</th>
                  <th className="text-center">Vagas</th>
                  <th className="tabela-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {turmas.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="fw-semibold">{t.disciplinaNome}</div>
                      <div className="text-muted small">{t.disciplinaCodigo}</div>
                    </td>
                    <td>{t.professorNome}</td>
                    <td>
                      {DIAS_CURTO[t.dia]} · {TURNOS[t.turno]}
                    </td>
                    <td className="text-center">
                      <Badge bg="light" text="dark">
                        {t.horario}
                      </Badge>
                    </td>
                    <td>{t.sala || "—"}</td>
                    <td className="text-center">
                      {t.vagasOcupadas}/{t.vagas}
                      {t.lotada && <div><Badge bg="danger">Lotada</Badge></div>}
                    </td>
                    <td className="tabela-acoes">
                      <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => abrirEdicao(t)}>
                        Editar
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => setExcluir(t)}>
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal criar/editar */}
      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton>
            <Modal.Title>{form.id ? "Editar turma" : "Nova turma"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erroForm && <Alert variant="danger">{erroForm}</Alert>}
            {avisoChoque && <Alert variant="warning">{avisoChoque}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Disciplina</Form.Label>
              <Form.Select
                value={form.disciplinaId}
                onChange={(e) => mudar("disciplinaId", e.target.value)}
                required
              >
                <option value="">Selecione…</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.codigo} - {d.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Professor</Form.Label>
              <Form.Select
                value={form.professorId}
                onChange={(e) => mudar("professorId", e.target.value)}
                required
              >
                <option value="">Selecione…</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.cargaHoraria}h alocadas)
                  </option>
                ))}
              </Form.Select>
              {professorSelecionado && (
                <Form.Text muted>
                  {professorSelecionado.nome} já possui {professorSelecionado.cargaHoraria}h alocadas
                  em {professorSelecionado.qtdTurmas} turma(s).
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dia da semana</Form.Label>
              <Form.Select value={form.dia} onChange={(e) => mudar("dia", Number(e.target.value))}>
                {Object.entries(DIAS).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo} ({valor})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Turno</Form.Label>
              <Form.Select value={form.turno} onChange={(e) => mudar("turno", Number(e.target.value))}>
                {Object.entries(TURNOS).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo} ({valor})
                  </option>
                ))}
              </Form.Select>
              <Form.Text muted>
                O horário será registrado como código {form.dia}{form.turno}.
              </Form.Text>
            </Form.Group>

            <div className="row">
              <Form.Group className="col-6 mb-3">
                <Form.Label>Vagas</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={form.vagas}
                  onChange={(e) => mudar("vagas", Number(e.target.value))}
                  required
                />
              </Form.Group>
              <Form.Group className="col-6 mb-3">
                <Form.Label>Sala (opcional)</Form.Label>
                <Form.Control
                  value={form.sala}
                  onChange={(e) => mudar("sala", e.target.value)}
                  placeholder="Ex.: B-101"
                />
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={salvando || !!avisoChoque}>
              {salvando ? "Salvando…" : "Salvar"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal excluir */}
      <Modal show={!!excluir} onHide={() => { setExcluir(null); setErroExcluir(""); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir turma</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erroExcluir && <Alert variant="danger">{erroExcluir}</Alert>}
          Tem certeza que deseja excluir a turma de <strong>{excluir?.disciplinaNome}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setExcluir(null); setErroExcluir(""); }}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarExclusao}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
