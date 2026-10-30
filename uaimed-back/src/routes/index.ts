import { Router } from "express";
import authRoutes from "./auth.routes";
import contatosRoutes from "./contatos.routes";
import pagamentosRoutes from "./pagamentos.routes";
import avaliacoesRoutes from "./avaliacoes.routes";
import medicosRoutes from "./medicos.routes";
import agendamentosRoutes from "./agendamentos.routes";
import usersRoutes from "./users.routes";
import adminRoutes from "./admin.routes";
import professionalsRoutes from "./professionals.routes";
import clinicasRoutes from "./clinicas.routes";
import especialidadesRoutes from "./especialidades.routes";
import contaBancariaRoutes from "./conta-bancaria.routes";
import conversasRoutes from "./conversas.routes";
import artigosRoutes from "./artigos.routes";
import relatoriosRoutes from "./relatorios.routes";

const router = Router();

router.use(authRoutes);
router.use(contatosRoutes);
router.use(pagamentosRoutes);
router.use(avaliacoesRoutes);
router.use(medicosRoutes);
router.use(agendamentosRoutes);
router.use(usersRoutes);
router.use(adminRoutes);
router.use(professionalsRoutes);
router.use(clinicasRoutes);
router.use(especialidadesRoutes);
router.use(contaBancariaRoutes);
router.use(conversasRoutes);
router.use(artigosRoutes);
router.use(relatoriosRoutes);

export default router;
