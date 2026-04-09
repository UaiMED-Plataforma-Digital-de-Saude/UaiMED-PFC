import { useState, useCallback } from 'react';
import type { AppModalType, AppModalButton } from '../components/AppModal';

export type ModalState = {
  visible: boolean;
  title: string;
  message: string;
  type: AppModalType;
  buttons?: AppModalButton[];
};

const INITIAL: ModalState = {
  visible: false,
  title: '',
  message: '',
  type: 'info',
};

export function useModal() {
  const [modal, setModal] = useState<ModalState>(INITIAL);

  /** Abre o modal com título, mensagem e opções. */
  const showModal = useCallback(
    (
      title: string,
      message: string,
      options?: { type?: AppModalType; buttons?: AppModalButton[] },
    ) => {
      setModal({
        visible: true,
        title,
        message,
        type: options?.type ?? 'info',
        buttons: options?.buttons,
      });
    },
    [],
  );

  /** Fecha o modal. */
  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, visible: false }));
  }, []);

  return { modal, showModal, hideModal };
}

