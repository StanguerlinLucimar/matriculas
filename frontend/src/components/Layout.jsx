import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const inst = usuario?.perfil === "instituicao";

  function sair() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={NavLink} to={inst ? "/institucional" : "/aluno"} className="fw-bold">
            🎓 UniMatrícula
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="menu-principal" />
          <Navbar.Collapse id="menu-principal">
            <Nav className="me-auto">
              {inst ? (
                <>
                  <Nav.Link as={NavLink} to="/institucional" end>
                    Painel
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/institucional/disciplinas">
                    Disciplinas
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/institucional/professores">
                    Professores
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/institucional/turmas">
                    Turmas
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={NavLink} to="/aluno" end>
                    Grade de ofertas
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/aluno/matriculas">
                    Minhas matrículas
                  </Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              <Navbar.Text className="text-white-50 me-3 d-none d-lg-inline">
                {usuario?.user?.nome}
              </Navbar.Text>
              <Button variant="outline-light" size="sm" onClick={sair}>
                Sair
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container as="main" className="pb-5">
        <Outlet />
      </Container>
    </>
  );
}
