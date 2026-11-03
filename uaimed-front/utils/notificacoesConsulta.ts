import * as Notifications from 'expo-notifications';

const UMA_HORA_MS = 60 * 60 * 1000;

function identificador(agendamentoId: string) {
  return `consulta-${agendamentoId}`;
}

/**
 * Agenda uma notificação local para 1h antes da consulta. Se já existir uma
 * notificação agendada para esse agendamento (ex.: remarcação), ela é
 * cancelada antes de agendar a nova data. Se a consulta já estiver a menos
 * de 1h de distância (ou no passado), nenhuma notificação é agendada.
 *
 * Nunca lança — falhas aqui (ex.: permissão negada) não devem impedir a
 * navegação após criar/remarcar o agendamento.
 */
export async function agendarLembreteConsulta(agendamentoId: string, dataHoraISO: string, nomeProfissional?: string): Promise<void> {
  try {
    const id = identificador(agendamentoId);
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

    const dataConsulta = new Date(dataHoraISO);
    const disparoEm = new Date(dataConsulta.getTime() - UMA_HORA_MS);
    if (disparoEm.getTime() <= Date.now()) return;

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: 'Consulta em 1 hora',
        body: nomeProfissional
          ? `Sua consulta com ${nomeProfissional} é às ${dataConsulta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`
          : `Sua consulta é às ${dataConsulta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: disparoEm },
    });
  } catch (e) {
    console.warn('[notificacoesConsulta] Falha ao agendar lembrete local:', e);
  }
}

/** Cancela o lembrete local de uma consulta (ex.: ao cancelar o agendamento). */
export async function cancelarLembreteConsulta(agendamentoId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identificador(agendamentoId));
  } catch (e) {
    console.warn('[notificacoesConsulta] Falha ao cancelar lembrete local:', e);
  }
}
