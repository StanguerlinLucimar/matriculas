import { useEffect, useState } from "react";
import { Row, Col, Card, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { Carregando, Erro } from "../../components/Feedback";
import { DIAS, TURNOS } from "../../lib/constantes";

export default function Dashboard() {
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [t, p, d] = await Promise.all([
        api.turmas.listar(),
        api.professores.listar(),
        api.disciplinas.listar()
      ]);
      setTurmas(t);
      setProfessores(p);
      setDisciplinas(d);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} onTentarNovamente={carregar} />;

  const totalVagas = turmas.reduce((acc, t) => acc + t.vagas, 0);
  const totalMatriculados = turmas.reduce((acc, t) => acc + t.vagasOcupadas, 0);
  const turmasLotadas = turmas.filter((t) => t.lotada);
  const profCargaAlta = professores.filter((p) => p.cargaHoraria > 100);

  const cards = [
    { titulo: "Disciplinas", valor: disciplinas.length, link: "/institucional/disciplinas", texto: "cadastradas" },
    { titulo: "Professores", valor: professores.length, link: "/institucional/professores", texto: "na equipe" },
    { titulo: "Turmas ofertadas", valor: turmas.length, link: "/institucional/turmas", texto: "neste semestre" },
    { titulo: "Ocupação", valor: `${totalMatriculados}/${totalVagas}`, link: "/institucional/turmas", texto: "vagas preenchidas" }
  ];

  return (
    <>
      <h1 className="h4 mb-1">Painel institucional</h1>
      <p className="text-muted mb-4">Visão geral das ofertas e da alocação de professores.</p>

      <Row className="g-3 mb-4">
        {cards.map((c) => (
          <Col xs={12} sm={6} lg={3} key={c.titulo}>
            <Card className="h-100">
              <Card.Body>
                <div className="text-muted small">{c.titulo}</div>
                <div className="display-6 fw-bold text-primary">{c.valor}</div>
                <div className="text-muted small mb-2">{c.texto}</div>
                <Link to={c.link} className="small">
                  Ver detalhes →
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col xs={12} lg={7}>
          <Card>
            <Card.Header className="fw-semibold">Turmas com poucas vagas ou lotadas</Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Horário</th>
                    <th className="text-center">Vagas</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {turmas
                    .filter((t) => t.vagasDisponiveis <= 5)
                    .map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div className="fw-semibold">{t.disciplinaNome}</div>
                          <div className="text-muted small">{t.professorNome}</div>
                        </td>
                        <td>
                          {DIAS[t.dia]} · {TURNOS[t.turno]}
                        </td>
                        <td className="text-center">
                          {t.vagasOcupadas}/{t.vagas}
                        </td>
                        <td>
                          {t.lotada ? (
                            <Badge bg="danger">Lotada</Badge>
                          ) : (
                            <Badge bg="warning" text="dark">
                              {t.vagasDisponiveis} restantes
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  {turmas.filter((t) => t.vagasDisponiveis <= 5).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        Nenhuma turma próxima do limite de vagas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card>
            <Card.Header className="fw-semibold">Carga horária dos professores</Card.Header>
            <Card.Body className="p-0">
              <Table hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Professor</th>
                    <th className="text-center">Turmas</th>
                    <th className="text-center">Carga (h)</th>
                  </tr>
                </thead>
                <tbody>
                  {professores.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td className="text-center">{p.qtdTurmas}</td>
                      <td className="text-center">
                        {p.cargaHoraria}{" "}
                        {p.cargaHoraria > 100 && (
                          <Badge bg="danger" pill title="Carga acima do limite equilibrado">
                            alta
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                  {profCargaAlta.length > 0 && (
                    <tr>
                      <td colSpan={3} className="text-warning small py-3">
                        ⚠️ {profCargaAlta.map((p) => p.nome).join(", ")} com carga acima de 100h
                        — considere redistribuir as turmas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
