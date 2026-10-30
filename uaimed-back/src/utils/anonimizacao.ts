// Funções de anonimização usadas em exports/relatórios (LGPD). Mantêm só o
// mínimo necessário para identificação visual, mascarando o restante.

export function mascararCpf(cpf?: string | null): string {
  const digitos = (cpf ?? "").replace(/\D/g, "");
  if (digitos.length < 4) return "***.***.***-**";
  return `***.***.***-${digitos.slice(-2)}`;
}

export function mascararTelefone(telefone?: string | null): string {
  const digitos = (telefone ?? "").replace(/\D/g, "");
  if (digitos.length < 4) return "(**) *****-****";
  return `(**) *****-${digitos.slice(-4)}`;
}

export function mascararEmail(email?: string | null): string {
  const partes = (email ?? "").split("@");
  if (partes.length !== 2 || !partes[0]) return "***";
  const [usuario, dominio] = partes;
  const inicial = usuario.charAt(0);
  return `${inicial}${"*".repeat(Math.max(usuario.length - 1, 1))}@${dominio}`;
}
