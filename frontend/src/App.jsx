import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import NaoEncontrada from "./pages/NaoEncontrada";
import DashboardInst from "./pages/inst/Dashboard";
import Disciplinas from "./pages/inst/Disciplinas";
import Professores from "./pages/inst/Professores";
import Turmas from "./pages/inst/Turmas";
import Grade from "./pages/aluno/Grade";
import MinhasMatriculas from "./pages/aluno/MinhasMatriculas";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Visão institucional (coordenação / secretaria) */}
          <Route element={<RequireAuth perfil="instituicao" />}>
            <Route element={<Layout />}>
              <Route path="/institucional" element={<DashboardInst />} />
              <Route path="/institucional/disciplinas" element={<Disciplinas />} />
              <Route path="/institucional/professores" element={<Professores />} />
              <Route path="/institucional/turmas" element={<Turmas />} />
            </Route>
          </Route>

          {/* Visão do aluno */}
          <Route element={<RequireAuth perfil="aluno" />}>
            <Route element={<Layout />}>
              <Route path="/aluno" element={<Grade />} />
              <Route path="/aluno/matriculas" element={<MinhasMatriculas />} />
            </Route>
          </Route>

          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
