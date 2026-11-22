// Camada de acesso à API. Usa o proxy do Vite em desenvolvimento.
const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se ele está rodando (use o iniciar.bat)."
    );
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.erro ||
      (res.status >= 500
        ? "O servidor encontrou um problema. Feche tudo e rode o iniciar.bat novamente."
        : `Erro inesperado (${res.status}).`);
    const erro = new Error(msg);
    erro.status = res.status;
    throw erro;
  }

  return data;
}

export const api = {
  login: (body) => request("/login", { method: "POST", body: JSON.stringify(body) }),

  disciplinas: {
    listar: () => request("/disciplinas"),
    criar: (body) => request("/disciplinas", { method: "POST", body: JSON.stringify(body) }),
    atualizar: (id, body) => request(`/disciplinas/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    excluir: (id) => request(`/disciplinas/${id}`, { method: "DELETE" })
  },

  professores: {
    listar: () => request("/professores"),
    criar: (body) => request("/professores", { method: "POST", body: JSON.stringify(body) }),
    atualizar: (id, body) => request(`/professores/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    excluir: (id) => request(`/professores/${id}`, { method: "DELETE" })
  },

  turmas: {
    listar: () => request("/turmas"),
    criar: (body) => request("/turmas", { method: "POST", body: JSON.stringify(body) }),
    atualizar: (id, body) => request(`/turmas/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    excluir: (id) => request(`/turmas/${id}`, { method: "DELETE" })
  },

  matriculas: {
    listar: (alunoId) => request(`/alunos/${alunoId}/matriculas`),
    criar: (body) => request("/matriculas", { method: "POST", body: JSON.stringify(body) }),
    cancelar: (id) => request(`/matriculas/${id}`, { method: "DELETE" })
  }
};
