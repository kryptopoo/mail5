import type { Web5 } from '@web5/api';
import { writable } from 'svelte/store';
import type { Mail5Account } from './mail5';
export let accountStore = writable<Mail5Account | undefined>();
