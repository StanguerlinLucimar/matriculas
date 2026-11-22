import { Alert, Spinner } from "react-bootstrap";

export function Carregando() {
  return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="text-muted mt-2 mb-0">Carregando…</p>
    </div>
  );
}

export function Erro({ mensagem, onTentarNovamente }) {
  return (
    <Alert variant="danger">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <span>{mensagem}</span>
        {onTentarNovamente && (
          <button className="btn btn-sm btn-outline-danger" onClick={onTentarNovamente}>
            Tentar novamente
          </button>
        )}
      </div>
    </Alert>
  );
}

export function Vazio({ mensagem }) {
  return (
    <div className="text-center py-5 text-muted">
      <div style={{ fontSize: "2.5rem" }}>📭</div>
      <p className="mt-2 mb-0">{mensagem}</p>
    </div>
  );
}
