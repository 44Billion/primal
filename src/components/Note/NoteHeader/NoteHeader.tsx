import { Component, createEffect, createSignal, Show } from 'solid-js';
import { MenuItem, NostrRelaySignedEvent, PrimalNote, PrimalUserPoll } from '../../../types/primal';

import styles from './NoteHeader.module.scss';
import { nip05Verification, truncateNpub, userName } from '../../../stores/profile';
import { useIntl } from '@cookbook/solid-intl';
import { useToastContext } from '../../Toaster/Toaster';
import VerificationCheck from '../../VerificationCheck/VerificationCheck';
import Avatar from '../../Avatar/Avatar';
import { A } from '@solidjs/router';
import { toast as tToast, actions as tActions } from '../../../translations';
import { broadcastEvent } from '../../../lib/notes';
import { reportUser } from '../../../lib/profile';
import { APP_ID } from '../../../App';
import { hexToNpub } from '../../../lib/keys';
import { hookForDev } from '../../../lib/devTools';
import { useAppContext } from '../../../contexts/AppContext';
import { accountStore, addToMuteList, removeFromMuteList } from '../../../stores/accountStore';

const NoteHeader: Component<{
  note: PrimalNote | PrimalUserPoll,
  openCustomZap?: () => void,
  id?: string,
  primary?: boolean,
}> = (props) => {

  const intl = useIntl();
  const toaster = useToastContext();
  const app = useAppContext();

  const [showContext, setContext] = createSignal(false);
  const [confirmReportUser, setConfirmReportUser] = createSignal(false);
  const [confirmMuteUser, setConfirmMuteUser] = createSignal(false);

  const authorName = () => {
    if (!props.note?.user) {
      return hexToNpub(props.note?.msg.pubkey);
    }
    return props.note?.user?.displayName ||
      props.note?.user?.name ||
      truncateNpub(props.note?.user.npub);
  };

  const openContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContext(true);
  };

  const doMuteUser = () => {
    addToMuteList(props.note?.msg.pubkey);
  };

  const doUnmuteUser = () => {
    removeFromMuteList(props.note?.msg.pubkey);
  };

  const doReportUser = () => {
    reportUser(props.note?.user.pubkey, `report_user_${APP_ID}`, props.note?.user);
    setContext(false);
    toaster?.sendSuccess(intl.formatMessage(tToast.noteAuthorReported, { name: userName(props.note?.user)}));
  };

  const noteLinkId = () => {
      try {
        return `/e/${props.note?.noteId}`;
      } catch(e) {
        return '/404';
      }
    };

  const copyNoteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${noteLinkId()}`);
    setContext(false);
    toaster?.sendSuccess(intl.formatMessage(tToast.notePrimalLinkCoppied));
  };

  const copyNoteText = () => {
    navigator.clipboard.writeText(`${props.note?.msg.content}`);
    setContext(false);
    toaster?.sendSuccess(intl.formatMessage(tToast.notePrimalTextCoppied));
  };

  const copyNoteId = () => {
    navigator.clipboard.writeText(`${props.note?.noteId}`);
    setContext(false);
    toaster?.sendSuccess(intl.formatMessage(tToast.noteIdCoppied));
  };

  const copyRawData = () => {
    navigator.clipboard.writeText(`${JSON.stringify(props.note?.msg)}`);
    setContext(false);
    toaster?.sendSuccess(intl.formatMessage(tToast.noteRawDataCoppied));
  };

  const copyUserNpub = () => {
    navigator.clipboard.writeText(`${props.note?.user.npub}`);
    setContext(false);
    toaster?.sendSuccess(intl.formatMessage(tToast.noteAuthorNpubCoppied));
  };

  const broadcastNote = async () => {
    const { success } = await broadcastEvent(
      props.note?.msg as NostrRelaySignedEvent,
    );
    setContext(false);

    if (success) {
      toaster?.sendSuccess(intl.formatMessage(tToast.noteBroadcastSuccess));
      return;
    }
    toaster?.sendWarning(intl.formatMessage(tToast.noteBroadcastFail));
  };

  const onClickOutside = (e: MouseEvent) => {
    if (
      !document?.getElementById(`note_context_${props.note?.msg.id}`)?.contains(e.target as Node)
    ) {
      setContext(false);
    }
  }

  createEffect(() => {
    if (showContext()) {
      document.addEventListener('click', onClickOutside);
    }
    else {
      document.removeEventListener('click', onClickOutside);
    }
  });

  const isVerifiedByPrimal = () => {
    return !!props.note?.user.nip05 &&
      props.note?.user.nip05.endsWith('primal.net');
  }

  return (
    <div id={props.id} class={styles.header}>
      <div class={styles.headerInfo}>
        <div
            class={styles.avatar}
            title={props.note?.user?.npub}
          >
            <A
              href={app?.actions.profileLink(props.note?.user.npub) || ''}
            >
              <Avatar
                user={props.note?.user}
                size="vs"
                highlightBorder={isVerifiedByPrimal()}
              />
            </A>
          </div>
        <div class={styles.postInfo}>
          <div class={styles.userInfo}>

            <span class={`${styles.userName} ${props.primary ? styles.primary : ''}`}>
              {authorName()}
            </span>

            <VerificationCheck
              user={props.note?.user}
            />
          </div>
          <Show
            when={props.note?.user?.nip05}
          >
            <span
              class={styles.verification}
              title={props.note?.user?.nip05}
            >
              {nip05Verification(props.note?.user)}
            </span>
          </Show>
        </div>

      </div>
    </div>
  )
}

export default hookForDev(NoteHeader);
