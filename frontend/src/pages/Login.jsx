import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Nav } from "react-bootstrap";
import { api } from "../api";
import { useAuth } from "../auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState("aluno");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const dados = await api.login({ email, senha, perfil });
      login(dados);
      navigate(dados.perfil === "aluno" ? "/aluno" : "/institucional", { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  function preencherDemo(p) {
    if (p === "aluno") {
      setEmail("laura@aluno.edu");
      setSenha("123456");
    } else {
      setEmail("admin@unimatricula.edu");
      setSenha("admin123");
    }
    setPerfil(p);
    setErro("");
  }

  return (
    <div className="login-page">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5} xl={4}>
            <div className="text-center mb-4">
              <h1 className="login-title">🎓 UniMatrícula</h1>
              <p className="login-subtitle">Sistema de atendimento e matrículas da universidade.</p>
            </div>

            <Card className="login-card">
              <Card.Body className="p-4">
                <Nav
                  variant="pills"
                  className="mb-4 justify-content-center"
                  activeKey={perfil}
                  onSelect={(k) => setPerfil(k)}
                >
                  <Nav.Item>
                    <Nav.Link eventKey="aluno">Sou aluno</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="instituicao">Sou da instituição</Nav.Link>
                  </Nav.Item>
                </Nav>

                {erro && <Alert variant="danger">{erro}</Alert>}

                <Form onSubmit={entrar}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="senha">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" className="w-100" disabled={carregando}>
                    {carregando ? "Entrando…" : "Entrar"}
                  </Button>
                </Form>

                <hr className="my-4" />

                <p className="text-muted small mb-2 text-center">
                  <strong>Acesso de demonstração</strong> (clique para preencher):
                </p>
                <div className="d-grid gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={() => preencherDemo("aluno")}>
                    Aluno: laura@aluno.edu · 123456
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={() => preencherDemo("instituicao")}>
                    Instituição: admin@unimatricula.edu · admin123
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
