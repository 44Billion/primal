import { useIntl } from '@cookbook/solid-intl';
import { Component } from 'solid-js';

import styles from './MissingNWCModal.module.scss';
import { hookForDev } from '../../lib/devTools';
import AdvancedSearchDialog from '../AdvancedSearch/AdvancedSearchDialog';
import ButtonPrimary from '../Buttons/ButtonPrimary';

const MissingNWCModal: Component<{
  id?: string,
  open?: boolean,
  onClose?: () => void,
}> = (props) => {

  const intl = useIntl();

  return (
    <AdvancedSearchDialog
      open={props.open}
      setOpen={(isOpen: boolean) => !isOpen && props.onClose?.()}
      title={
      <div class={styles.title}>
        No Wallet Connected
      </div>
      }
      triggerClass={styles.hidden}
    >
      <div id={props.id} class={styles.modal}>
        <div class={styles.message}>
          In order to send zaps, you need to connect a bitcoin wallet. You can do so on the <a onClick={() => props.onClose?.()} href="/settings/nwc">Connected Wallets</a> settings page.
        </div>
        <div class={styles.actions}>
          <ButtonPrimary
            onClick={props.onClose}
          >
            Close
          </ButtonPrimary>
        </div>
      </div>

    </AdvancedSearchDialog>
  );
}

export default hookForDev(MissingNWCModal);
