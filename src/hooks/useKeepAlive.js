import {useRef} from 'react';

const useKeepAlive = webviewRef => {
  const timeoutRef = useRef();
  return [checkAlive, consumeAlive];

  function checkAlive() {
    timeoutRef.current = setTimeout(reload, 1000);

    if (webviewRef.current) {
      webviewRef.current.postMessage(
        JSON.stringify({
          type: 'SWC.PING',
        }),
      );
    }
  }

  function consumeAlive(action) {
    if (action.type === 'SWC.PONG' && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  function reload() {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  }
};

export default useKeepAlive;
