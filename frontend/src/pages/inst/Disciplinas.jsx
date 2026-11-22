import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Modal,
  Form,
  Badge,
  Alert
} from "react-bootstrap";
import { api } from "../../api";
import { Carregando, Erro, Vazio } from "../../components/Feedback";

const formularioVazio = { id: null, codigo: "", nome: "", cargaHoraria: 60, preRequisitos: [] };

export default function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
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
      setDisciplinas(await api.disciplinas.listar());
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

  function abrirEdicao(d) {
    setForm({ ...d, preRequisitos: d.preRequisitos || [] });
    setErroForm("");
    setMostrarModal(true);
  }

  function mudar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function alternarPreRequisito(id) {
    setForm((f) => {
      const jaTem = f.preRequisitos.includes(id);
      return {
        ...f,
        preRequisitos: jaTem ? f.preRequisitos.filter((x) => x !== id) : [...f.preRequisitos, id]
      };
    });
  }

  async function salvar(e) {
    e.preventDefault();
    setErroForm("");
    setSalvando(true);
    try {
      if (form.id) {
        await api.disciplinas.atualizar(form.id, form);
      } else {
        await api.disciplinas.criar(form);
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
      await api.disciplinas.excluir(excluir.id);
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
          <h1 className="h4 mb-0">Disciplinas</h1>
          <p className="text-muted mb-0">Catálogo de disciplinas e seus pré-requisitos.</p>
        </div>
        <Button variant="primary" onClick={abrirNova}>
          + Nova disciplina
        </Button>
      </div>

      <Card>
        <Card.Body className="p-0">
          {disciplinas.length === 0 ? (
            <Vazio mensagem="Nenhuma disciplina cadastrada." />
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th className="text-center">Carga (h)</th>
                  <th>Pré-requisitos</th>
                  <th className="tabela-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {disciplinas.map((d) => (
                  <tr key={d.id}>
                    <td className="fw-semibold">{d.codigo}</td>
                    <td>{d.nome}</td>
                    <td className="text-center">{d.cargaHoraria}</td>
                    <td>
                      {d.preRequisitosNomes.length === 0 ? (
                        <span className="text-muted">—</span>
                      ) : (
                        d.preRequisitosNomes.map((n) => (
                          <Badge bg="light" text="dark" className="me-1" key={n}>
                            {n}
                          </Badge>
                        ))
                      )}
                    </td>
                    <td className="tabela-acoes">
                      <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => abrirEdicao(d)}>
                        Editar
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => setExcluir(d)}>
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
            <Modal.Title>{form.id ? "Editar disciplina" : "Nova disciplina"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erroForm && <Alert variant="danger">{erroForm}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Código</Form.Label>
              <Form.Control
                value={form.codigo}
                onChange={(e) => mudar("codigo", e.target.value)}
                placeholder="Ex.: MAT101"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                value={form.nome}
                onChange={(e) => mudar("nome", e.target.value)}
                placeholder="Ex.: Cálculo I"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Carga horária (horas)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={form.cargaHoraria}
                onChange={(e) => mudar("cargaHoraria", Number(e.target.value))}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Pré-requisitos</Form.Label>
              <div className="border rounded p-2" style={{ maxHeight: "180px", overflowY: "auto" }}>
                {disciplinas
                  .filter((d) => d.id !== form.id)
                  .map((d) => (
                    <Form.Check
                      key={d.id}
                      type="checkbox"
                      id={`pre-${d.id}`}
                      label={`${d.codigo} - ${d.nome}`}
                      checked={form.preRequisitos.includes(d.id)}
                      onChange={() => alternarPreRequisito(d.id)}
                    />
                  ))}
                {disciplinas.filter((d) => d.id !== form.id).length === 0 && (
                  <span className="text-muted small">Não há outras disciplinas disponíveis.</span>
                )}
              </div>
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
          <Modal.Title>Excluir disciplina</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erroExcluir && <Alert variant="danger">{erroExcluir}</Alert>}
          Tem certeza que deseja excluir <strong>{excluir?.nome}</strong>? Essa ação não pode ser
          desfeita.
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
