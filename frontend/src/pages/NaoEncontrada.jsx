import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NaoEncontrada() {
  return (
    <Container className="text-center py-5">
      <h1 className="display-4">404</h1>
      <p className="text-muted">Página não encontrada.</p>
      <Button as={Link} to="/login" variant="primary">
        Ir para o login
      </Button>
    </Container>
  );
}
