import {
  finalizeEvent,
  generateSecretKey as generatePrivateKey,
  getPublicKey,
  verifyEvent,
  SimplePool,
  Event,
  EventTemplate,
  VerifiedEvent,
} from 'nostr-tools';

import * as nip46 from 'nostr-tools/nip46'

// @ts-ignore
import { AbstractRelay as Relay } from 'nostr-tools/abstract-relay';
import { Relay as RelayFactory } from 'nostr-tools';
// import { AbstractSimplePool, SubCloser } from 'nostr-tools/lib/types/abstract-pool';
// import { Handlerinformation, NostrConnect } from 'nostr-tools/lib/types/kinds';
import { Signer } from 'nostr-tools/lib/types/signer';

import {
  nip04,
  nip05,
  nip19,
  nip44,
  nip47,
  nip57,
  utils,
} from "nostr-tools";

const relayInit = (url: string) => {
  const relay = new RelayFactory(url);
  return relay;
}

const generateNsec = () => nip19.nsecEncode(generatePrivateKey())

export {
  nip04,
  nip05,
  nip19,
  nip44,
  nip46,
  nip47,
  nip57,
  utils,
  generatePrivateKey,
  generateNsec,
  Relay,
  RelayFactory,
  relayInit,
  getPublicKey,
  verifyEvent,
  finalizeEvent,
  SimplePool,
  // AbstractSimplePool,
  // Handlerinformation,
  // NostrConnect,
};

export type NostrEvent = Event;
export type NostrEventTemplate = EventTemplate;
export type NostrVerifiedEvent = VerifiedEvent;
// export type NostrSubCloser = SubCloser;
export type NostrSigner = Signer;
