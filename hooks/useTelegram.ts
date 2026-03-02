import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: any;
  }
}

export const useTelegram = () => {
  const [tg, setTg] = useState<any>(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tgInstance = window.Telegram.WebApp;
      tgInstance.ready();
      tgInstance.expand();
      setTg(tgInstance);
    }
  }, []);

  const onClose = () => {
    tg?.close();
  };

  const onToggleButton = () => {
    if (tg?.MainButton.isVisible) {
      tg?.MainButton.hide();
    } else {
      tg?.MainButton.show();
    }
  };

  return {
    onClose,
    onToggleButton,
    tg,
    user: tg?.initDataUnsafe?.user,
    queryId: tg?.initDataUnsafe?.query_id,
    initData: tg?.initData,
  };
};
