import { useEffect, useState } from "react";
import { Button, Card, Table, Modal, Form, Badge, Alert } from "react-bootstrap";
import { api } from "../../api";
import { Carregando, Erro, Vazio } from "../../components/Feedback";
import { TITULACOES } from "../../lib/constantes";

const formularioVazio = { id: null, nome: "", email: "", titulacao: "Especialista" };

export default function Professores() {
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
      setProfessores(await api.professores.listar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNova() {
    setForm(formularioVazio);
    setErroForm("");
    setMostrarModal(true);
  }

  function abrirEdicao(p) {
    setForm({ ...p });
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
      if (form.id) {
        await api.professores.atualizar(form.id, form);
      } else {
        await api.professores.criar(form);
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
      await api.professores.excluir(excluir.id);
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
          <h1 className="h4 mb-0">Professores</h1>
          <p className="text-muted mb-0">Equipe docente e a carga horária alocada em turmas.</p>
        </div>
        <Button variant="primary" onClick={abrirNova}>
          + Novo professor
        </Button>
      </div>

      <Card>
        <Card.Body className="p-0">
          {professores.length === 0 ? (
            <Vazio mensagem="Nenhum professor cadastrado." />
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Titulação</th>
                  <th className="text-center">Turmas</th>
                  <th className="text-center">Carga (h)</th>
                  <th className="tabela-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {professores.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.nome}</td>
                    <td>{p.email}</td>
                    <td>{p.titulacao}</td>
                    <td className="text-center">{p.qtdTurmas}</td>
                    <td className="text-center">
                      {p.cargaHoraria}{" "}
                      {p.cargaHoraria > 100 && (
                        <Badge bg="danger" pill title="Carga acima do limite equilibrado">
                          alta
                        </Badge>
                      )}
                    </td>
                    <td className="tabela-acoes">
                      <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => abrirEdicao(p)}>
                        Editar
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => setExcluir(p)}>
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
            <Modal.Title>{form.id ? "Editar professor" : "Novo professor"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erroForm && <Alert variant="danger">{erroForm}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nome completo</Form.Label>
              <Form.Control
                value={form.nome}
                onChange={(e) => mudar("nome", e.target.value)}
                placeholder="Ex.: Dra. Ana Souza"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => mudar("email", e.target.value)}
                placeholder="nome@unimatricula.edu"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Titulação</Form.Label>
              <Form.Select value={form.titulacao} onChange={(e) => mudar("titulacao", e.target.value)}>
                {TITULACOES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal excluir */}
      <Modal show={!!excluir} onHide={() => { setExcluir(null); setErroExcluir(""); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir professor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erroExcluir && <Alert variant="danger">{erroExcluir}</Alert>}
          Tem certeza que deseja excluir <strong>{excluir?.nome}</strong>?
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
