import { Web5, getTechPreviewDwnEndpoints } from '@web5/api';
import { DateSort } from '@tbd54566975/dwn-sdk-js';

import type { Web5Crypto, JsonWebKey, JwkKeyPair, PublicKeyJwk, PrivateKeyJwk } from '@web5/crypto';
import { Jose } from '@web5/crypto';

import type { DidKeySet, PortableDid, DidIonKeySet } from '@web5/dids';
import { DidIonMethod, DidKeyMethod, utils } from '@web5/dids';

import type { CreateIdentityOptions, ManagedIdentity } from '@web5/agent';
import { AppDataVault, cryptoToPortableKeyPair, managedToCryptoKey } from '@web5/agent';
import type { ManagedKeyPair, ManagedKey } from '@web5/agent';
import type { AppDataStore } from '@web5/agent';
import { Web5UserAgent } from '@web5/user-agent';

export interface Mail5Account {
	web5: Web5;
	did: string;
}

export interface Mail5EmailAttachment {
	name: string;
	type: string;
	base64: string;
}

export interface Mail5Email {
	from: string;
	to: string;
	cc?: string[];
	subject: string;
	content: string;
	attachments: Mail5EmailAttachment[];
	status: string;

	record?: {
		id: string;
		parentId: string;
		dateCreated: string;
	};

	parent?: Mail5Email;
}

export class Mail5 {
	protocolSchema = 'https://mail5.xyz/v0.2.3';

	protocolDefinition = {
		protocol: this.protocolSchema,
		published: true,
		types: {
			email: {
				schema: `${this.protocolSchema}/email`,
				dataFormats: ['application/json']
			},
			contact: {
				schema: `${this.protocolSchema}/contact`,
				dataFormats: ['application/json']
			}
		},
		structure: {
			email: {
				$actions: [
					{
						who: 'anyone',
						can: 'write'
					},
					{
						who: 'author',
						of: 'email',
						can: 'read'
					},
					{
						who: 'recipient',
						of: 'email',
						can: 'read'
					}
				],
				email: {
					$actions: [
						{
							who: 'anyone',
							can: 'write'
						},
						{
							who: 'author',
							of: 'email/email',
							can: 'read'
						},
						{
							who: 'recipient',
							of: 'email/email',
							can: 'read'
						}
					]
				}
			},
			contact: {
				$actions: [
					{
						who: 'anyone',
						can: 'write'
					},
					{
						who: 'author',
						of: 'draft',
						can: 'read'
					}
				]
			}
		}
	};

	account!: Mail5Account;

	constructor(account?: Mail5Account) {
		if (account) {
			this.account = account;
		}
	}

	async firstLaunch() {
		const userAgent = await Web5UserAgent.create({});
		return userAgent.firstLaunch();
	}

	async generateKeySet() {
		let keySet: DidIonKeySet = {};
		const authenticationkeyPair = await DidIonMethod.generateJwkKeyPair({
			keyAlgorithm: 'Ed25519',
			keyId: 'dwn-sig'
		});
		keySet.verificationMethodKeys = [
			{
				...authenticationkeyPair,
				relationships: ['authentication', 'assertionMethod']
			}
		];
		const recoveryKeyPair = await DidIonMethod.generateJwkKeyPair({
			keyAlgorithm: 'secp256k1',
			keyId: 'ion-recovery-1'
		});
		keySet.recoveryKey = recoveryKeyPair;

		const updateKeyPair = await DidIonMethod.generateJwkKeyPair({
			keyAlgorithm: 'secp256k1',
			keyId: 'ion-update-1'
		});
		keySet.updateKey = updateKeyPair;
		const keystore = {
			authenticationKey: {
				publicKeyJwk: authenticationkeyPair.publicKeyJwk,
				privateKeyJwk: authenticationkeyPair.privateKeyJwk
			},
			recoveryKey: {
				publicKeyJwk: recoveryKeyPair.publicKeyJwk,
				privateKeyJwk: recoveryKeyPair.privateKeyJwk
			},
			updateKey: {
				publicKeyJwk: updateKeyPair.publicKeyJwk,
				privateKeyJwk: updateKeyPair.privateKeyJwk
			}
		};

		return keySet;
	}

	async connectAccount(): Promise<Mail5Account> {
		const account: Mail5Account = await Web5.connect({ sync: '5s' });
		this.account = account;
		return this.account;
	}

	// TODO: review
	async connectAccountWithDid(keySet: DidIonKeySet, did: string | undefined = undefined): Promise<Mail5Account> {
		// A custom Web5Agent implementation was not specified, so use default managed user agent.
		const userAgent = await Web5UserAgent.create({});

		// Start the agent.
		await userAgent.start({ passphrase: 'insecure-static-phrase' });

		let connectedDid = '';

		// Query the Agent's DWN tenant for identity records.
		const identities = await userAgent.identityManager.list();
		const storedIdentities = identities.length;

		// If an existing identity is not found found, create a new one.
		if (storedIdentities === 0) {
			let identity: ManagedIdentity = { name: 'Default', did: '' };
			if (did == undefined) {
				// Generate ION DID service and key set.
				// Use the specified DWN endpoints or get default tech preview hosted nodes.
				const serviceEndpointNodes = await getTechPreviewDwnEndpoints();
				let didOptions = await DidIonMethod.generateDwnOptions({ serviceEndpointNodes });
				didOptions.keySet = await DidIonMethod.generateKeySet({ keySet });

				const portableDid = await DidIonMethod.create(didOptions);
				const identityOptions: CreateIdentityOptions = {
					did: portableDid,
					name: 'Default',
					didOptions,
					kms: 'local'
				};
				identity = await userAgent.identityManager.create(identityOptions as any);

				/** Import the Identity metadata to the User Agent's tenant so that it can be restored
				 * on subsequent launches or page reloads. */
				await userAgent.identityManager.import({ identity, context: userAgent.agentDid });
			} else {
				// reconstruct existing did
				const portableDid: Partial<PortableDid> = {};
				portableDid.keySet = keySet;
				portableDid.did = did;
				// Get short form DID.
				portableDid.canonicalId = await DidIonMethod.getShortFormDid({ didUrl: did });
				const didResolutionResult = await DidIonMethod.resolve({ didUrl: did });
				portableDid.document = didResolutionResult.didDocument;
				identity = { name: 'Default', did: portableDid.did };

				await userAgent.identityManager.import({ identity, did: portableDid as PortableDid, context: userAgent.agentDid, kms: 'local' });
			}

			// Set the newly created identity as the connected DID.
			connectedDid = identity.did;
		} else if (storedIdentities === 1) {
			// An existing identity was found in the User Agent's tenant.
			const [identity] = identities;
			// Set the stored identity as the connected DID.
			connectedDid = identity.did;
		} else {
			throw new Error('connect() failed due to unexpected state: ${storedIdentities} stored identities');
		}

		// // Enable sync
		const sync = 50000;
		await userAgent.syncManager.registerIdentity({ did: connectedDid });
		userAgent.syncManager.startSync({ interval: sync }).catch((error: any) => {
			console.error(`Sync failed: ${error}`);
		});

		const web5 = new Web5({ agent: userAgent, connectedDid });
		this.account = { web5, did: connectedDid };
		return this.account;
	}

	exportAccount(keySet: DidIonKeySet, did: string): string {
		const keystore = JSON.stringify({ did: did, keySet: keySet }, null, 2);
		return keystore;
	}

	// TODO: review
	async importAccount(keystore: string): Promise<Mail5Account> {
		const did: string = JSON.parse(keystore).did;
		const keySet: DidIonKeySet = JSON.parse(keystore).keySet;

		return await this.connectAccountWithDid(keySet, did);
	}

	async getProtocolStatus() {
		const { protocols, status } = await this.account.web5.dwn.protocols.query({
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol
				}
			}
		});

		if ((status.code == 200 || status.code == 202) && protocols.length > 0) {
			return 'active';
		}

		return 'inactive';
	}

	async configureProtocol() {
		// define protocol
		const { protocols, status: protocolStatus } = await this.account.web5.dwn.protocols.query({
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol
				}
			}
		});

		if (protocolStatus.code !== 200 || protocols.length === 0) {
			const { protocol, status } = await this.account.web5.dwn.protocols.configure({
				message: {
					definition: this.protocolDefinition
				}
			});

			//sends protocol to remote DWNs immediately (vs waiting for sync)
			if (protocol) await protocol.send(this.account.did);

			console.log('configure protocol', { protocol: protocol, status: status });
			return { protocol: protocol, status: status };
		}

		return { protocol: protocols[0], status: protocolStatus };
	}

	async addContact(did: string, name: string) {
		// TODO: validate protocol

		const { record, status } = await this.account.web5.dwn.records.write({
			data: JSON.stringify({ did, name }),
			message: {
				protocol: this.protocolDefinition.protocol,
				protocolPath: 'contact',
				schema: this.protocolDefinition.types.contact.schema,
				dataFormat: this.protocolDefinition.types.contact.dataFormats[0],
				published: false
			}
		});

		return { record, status };
	}

	async contacts() {
		const { records, status } = await this.account.web5.dwn.records.query({
			// from: this.account.did,
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol,
					protocolPath: 'contact'
				},
				dateSort: DateSort.CreatedDescending
			}
		});

		return { records, status };
	}

	async send(email: Mail5Email) {
		// TODO: validate protocol

		// delete draft
		if (email.status == 'draft') {
			await this.delete(email?.record?.id);
		}

		email.status = 'delivered';
		// create record and sent to recipient
		const { record } = await this.account.web5.dwn.records.write({
			data: JSON.stringify(email),
			message: {
				protocol: this.protocolDefinition.protocol,
				protocolPath: 'email',
				schema: this.protocolDefinition.types.email.schema,
				dataFormat: this.protocolDefinition.types.email.dataFormats[0],
				recipient: email.to,
				published: false
			}
		});

		// SEND
		const { status } = await record?.send(email.to);

		return { record, status };
	}

	async reply(email: Mail5Email, replyEmail: Mail5Email) {
		// TODO: validate protocol

		// delete draft
		if (email.status == 'draft') {
			await this.delete(email?.record?.id);
		}

		email.status = 'delivered';
		// create record and sent to recipient
		const { record } = await this.account.web5.dwn.records.write({
			data: JSON.stringify(email),
			message: {
				protocol: this.protocolDefinition.protocol,
				protocolPath: 'email/email',
				schema: this.protocolDefinition.types.email.schema,
				dataFormat: this.protocolDefinition.types.email.dataFormats[0],
				recipient: email.to,
				published: false,
				parentId: replyEmail.record?.id,
				contextId: replyEmail.record?.id
			}
		});

		// SEND
		const { status } = await record?.send(email.to);

		return { record, status };
	}

	// TODO: review
	async forward(email: Mail5Email, forwardEmail: Mail5Email) {
		// TODO: validate protocol

		// delete draft
		if (email.status == 'draft') {
			await this.delete(email?.record?.id);
		}

		// create forward record
		const { record: forwardRecord } = await this.account.web5.dwn.records.write({
			data: JSON.stringify(forwardEmail),
			message: {
				protocol: this.protocolDefinition.protocol,
				protocolPath: 'email',
				schema: this.protocolDefinition.types.email.schema,
				dataFormat: this.protocolDefinition.types.email.dataFormats[0],
				recipient: email.to,
				published: false
			}
		});
		await forwardRecord?.send(email.to);

		email.status = 'delivered';
		// create record and sent to recipient
		const { record } = await this.account.web5.dwn.records.write({
			data: JSON.stringify(email),
			message: {
				protocol: this.protocolDefinition.protocol,
				protocolPath: 'email/email',
				schema: this.protocolDefinition.types.email.schema,
				dataFormat: this.protocolDefinition.types.email.dataFormats[0],
				recipient: email.to,
				published: false,
				parentId: forwardRecord?.id,
				contextId: forwardRecord?.id
				// parentId: 'bafyreidfoqturrowbqxtrca7653cohcldo7rwfg7ru4ngoyjdwk6q3q32y',
				// contextId: 'bafyreidfoqturrowbqxtrca7653cohcldo7rwfg7ru4ngoyjdwk6q3q32y',
			}
		});

		// SEND
		const { status } = await record?.send(email.to);

		return { record, status };
	}

	async saveDraft(email: Mail5Email) {
		// TODO: handle update
		email.status = 'draft';
		const { record, status } = await this.account.web5.dwn.records.write({
			data: JSON.stringify(email),
			message: {
				protocol: this.protocolDefinition.protocol,
				protocolPath: 'email',
				schema: this.protocolDefinition.types.email.schema,
				dataFormat: this.protocolDefinition.types.email.dataFormats[0],
				recipient: email.to && email.to != '' ? email.to : undefined,
				published: false
			}
		});

		return { record, status };
	}

	async drafts() {
		const { records, status } = await this.account.web5.dwn.records.query({
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol,
					protocolPath: 'email'
				},
				dateSort: DateSort.CreatedDescending
			}
		});

		return this.map(records, { status: 'draft' });
	}

	async inbox() {
		const { records, status } = await this.account.web5.dwn.records.query({
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol,
					protocolPath: 'email',
					recipient: this.account.did
				},
				dateSort: DateSort.CreatedDescending
			}
		});

		return this.map(records, { status: 'delivered', recipient: this.account.did });
	}

	async outbox() {
		let { records, status } = await this.account.web5.dwn.records.query({
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol,
					protocolPath: 'email'
				},
				dateSort: DateSort.CreatedDescending
			}
		});

		return this.map(records, { status: 'delivered', sender: this.account.did });
	}

	async trash() {
		let { records, status } = await this.account.web5.dwn.records.query({
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol,
					protocolPath: 'email'
				},
				dateSort: DateSort.CreatedDescending
			}
		});

		return this.map(records, { status: 'deleted' });
	}

	async softDelete(recordId: string | undefined) {
		if (recordId) {
			let { records } = await this.account.web5.dwn.records.query({
				message: {
					filter: { protocol: this.protocolDefinition.protocol, recordId: recordId }
				}
			});

			if (records) {
				const record = records[0];

				// update deleted status
				let recordDataObj = await record.data.json();
				recordDataObj.status = 'deleted';

				const { status } = await record.update({ data: JSON.stringify(recordDataObj) });
				return { record, status };
			}
		}

		return undefined;
	}

	async delete(recordId: string | undefined) {
		if (recordId) {
			const rs = await this.account.web5.dwn.records.delete({ message: { recordId: recordId } });
			return rs;
		}

		return undefined;
	}

	async getById(recordId: string) {
		const { records, status } = await this.account.web5.dwn.records.query({
			message: {
				filter: { protocol: this.protocolDefinition.protocol, recordId: recordId }
			}
		});

		const mappedRecords = await this.map(records);
		return mappedRecords.length > 0 ? mappedRecords[0] : undefined;
	}

	private async map(emailRecords: any, expression: { status: string; sender?: string; recipient?: string } | undefined = undefined) {
		// const emails: Mail5Email[] = await Promise.all(emailRecords.map((record: any) => {record.data.json()}));
		// return emails;

		let rs: Mail5Email[] = [];
		if (emailRecords) {
			for (let i = 0; i < emailRecords.length; i++) {
				const record = emailRecords[i];

				try {
					let recordData: Mail5Email = await record.data.json();

					recordData.record = {
						id: record.id,
						parentId: record.parentId,
						dateCreated: record.dateCreated
					};
					if (record.parentId) {
						const parent = await this.getById(record.parentId);
						recordData.parent = parent;
					}

					if (expression) {
						let isValid = expression.status == recordData.status;
						isValid &&= !expression.sender || expression.sender == recordData.from ? true : false;
						isValid &&= !expression.recipient || expression.recipient == recordData.to ? true : false;
						if (isValid) rs.push(recordData);
					} else {
						rs.push(recordData);
					}
				} catch (error) {
					console.log(error);
				}
			}
		}

		return rs;
	}
}
