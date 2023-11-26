import { Web5 } from '@web5/api';
import { DateSort } from '@tbd54566975/dwn-sdk-js';
// import { AppData } from '@web5/agent';
import { onMount } from 'svelte';
import type { Web5Crypto, JsonWebKey } from '@web5/crypto';
import { Jose } from '@web5/crypto';
import { AppDataVault } from '@web5/agent';
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
	protocolSchema = 'https://mail5.xyz/v0.2.1';

	protocolDefinition = {
		protocol: this.protocolSchema,
		published: true,
		types: {
			email: {
				schema: `${this.protocolSchema}/email`,
				dataFormats: ['application/json']
			}
			// draft: {
			// 	schema: `${this.protocolSchema}/draft`,
			// 	dataFormats: ['application/json']
			// }
			// attachment: {
			// 	schema: `${this.protocolSchema}/attachment`,
			// 	dataFormats: ['image/png', 'jpeg', 'gif']
			// }
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
			}
			// draft: {
			// 	$actions: [
			// 		{
			// 			who: 'anyone',
			// 			can: 'write'
			// 		},
			// 		{
			// 			who: 'author',
			// 			of: 'draft',
			// 			can: 'read'
			// 		}
			// 	]
			// }
		}
	};

	account!: Mail5Account;

	// constructor() {}

	constructor(account?: Mail5Account) {
		if (account) {
			this.account = account;
			// this.defineProtocol().then((definedProtocol) => {
			// 	console.log('definedProtocol', definedProtocol);
			// });
		}
	}

	// async connect(connectedDid?: string) {
	// 	const { web5, did } = await Web5.connect({ connectedDid: connectedDid });
	// 	console.log('myid', did);

	// 	// // export
	// 	// const agent: any = web5.agent;
	// 	// console.log('appData', agent.appData);
	// 	// console.log('keyManager', agent.keyManager);
	// 	// console.log('identityManager', agent.identityManager);

	// 	// const prikey: Web5Crypto.CryptoKey = await agent.appData.getPrivateKey();
	// 	// console.log('prikey', prikey);
	// 	// const prikeyJwk = await Jose.cryptoKeyToJwk({ key: prikey });
	// 	// console.log('prikeyJwk', prikeyJwk);

	// 	// const pubkey = await agent.appData.getPublicKey();
	// 	// console.log('pubkey', pubkey);
	// 	// const pubkeyJwk = await Jose.cryptoKeyToJwk({ key: pubkey });
	// 	// console.log('pubkeyJwk', pubkeyJwk, JSON.stringify(pubkeyJwk));

	// 	// const pubkeyJwkJson = JSON.parse(JSON.stringify(pubkeyJwk));
	// 	// console.log('pubkeyJwkJson', pubkeyJwkJson);

	// 	// const prikeyJwkJson = JSON.parse(JSON.stringify(prikeyJwk));
	// 	// console.log('prikeyJwkJson', prikeyJwkJson);

	// 	// const decodePubkeyJwk: JsonWebKey = pubkeyJwkJson;
	// 	// const decodePrivkeyJwk: JsonWebKey = prikeyJwkJson;

	// 	// // const decodePubkeyJwk: JsonWebKey = {
	// 	// // 	alg: pubkeyJwkJson.alg,
	// 	// // 	crv: pubkeyJwkJson.crv,
	// 	// // 	kty: pubkeyJwkJson.kty,
	// 	// // 	key_ops: pubkeyJwkJson.key_ops,
	// 	// // 	x: pubkeyJwkJson.x
	// 	// // };

	// 	// // const decodePrivkeyJwk: JsonWebKey = {
	// 	// // 	alg: pubkeyJwkJson.alg,
	// 	// // 	crv: pubkeyJwkJson.crv,
	// 	// // 	d: pubkeyJwkJson.d,
	// 	// // 	ext: pubkeyJwkJson.ext,
	// 	// // 	kty: pubkeyJwkJson.kty,
	// 	// // 	key_ops: pubkeyJwkJson.key_ops,
	// 	// // 	x: pubkeyJwkJson.x
	// 	// // };

	// 	// const decodePubkey = await Jose.jwkToCryptoKey({ key: decodePubkeyJwk });
	// 	// const decodePrivkey = await Jose.jwkToCryptoKey({ key: decodePrivkeyJwk });

	// 	// const keypair: Web5Crypto.CryptoKeyPair = {
	// 	// 	publicKey: decodePubkey,
	// 	// 	privateKey: decodePrivkey
	// 	// };
	// 	// console.log('keypair', keypair);

	// 	// const appDataStore: AppDataVault = new AppDataVault();
	// 	// await appDataStore.initialize({ keyPair: keypair, passphrase: '123456' });
	// 	// console.log('appDataStore', appDataStore);
	// 	// const userAgent = await Web5UserAgent.create({ appData: appDataStore });
	// 	// console.log('userAgent', userAgent);
	// 	// const newConnect = await Web5.connect({ agent: userAgent, connectedDid: did });
	// 	// console.log('newConnect.did', newConnect.did);

	// 	this.web5 = web5;
	// 	this.myID = did;

	// 	const keystore = await this.exportAccount();
	// 	console.log('keystore', keystore);

	// 	return { web5, did };
	// }

	async createAccount() {
		const account = await Web5.connect({ sync: '5s' });
		console.log('myid', account.did);

		return account;
	}

	async exportAccount() {
		// export
		const agent: any = this.account.web5.agent;

		const prikey: Web5Crypto.CryptoKey = await agent.appData.getPrivateKey();
		const prikeyJwk = await Jose.cryptoKeyToJwk({ key: prikey });

		const pubkey = await agent.appData.getPublicKey();
		const pubkeyJwk = await Jose.cryptoKeyToJwk({ key: pubkey });

		// const pubkeyJwkJson = JSON.parse(JSON.stringify(pubkeyJwk));
		// const prikeyJwkJson = JSON.parse(JSON.stringify(prikeyJwk));

		return `{"did":"${this.account.did}","publicKey":${JSON.stringify(pubkeyJwk)},"privateKey":${JSON.stringify(prikeyJwk)}}`;
	}

	async importAccount(keystore: string) {
		const did: string = JSON.parse(keystore).did;
		const publicKey: JsonWebKey = JSON.parse(keystore).publicKey;
		const privateKey: JsonWebKey = JSON.parse(keystore).privateKey;

		const publicCryptoKey = await Jose.jwkToCryptoKey({ key: publicKey });
		const privateCryptoKey = await Jose.jwkToCryptoKey({ key: privateKey });

		const appDataStore: AppDataVault = new AppDataVault();
		await appDataStore.initialize({
			keyPair: {
				publicKey: publicCryptoKey,
				privateKey: privateCryptoKey
			},
			passphrase: ''
		});
		console.log('appDataStore', appDataStore);
		const userAgent = await Web5UserAgent.create({ appData: appDataStore });
		console.log('userAgent', userAgent);
		const importedAccount = await Web5.connect({ agent: userAgent, connectedDid: did });
		console.log('connection.did', importedAccount.did);

		this.account = importedAccount;

		return importedAccount;
	}

	async defineProtocol() {
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

	async send(email: Mail5Email) {
		// TODO: validate protocol

		// delete draft
		if (email.status == 'draft') {
			await this.delete(email?.record?.id);
		}

		console.log('send data:', email);
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
		console.log('send record:', record);

		// attachments
		// async function upload(event) {
		// 	const blob = new Blob(event.currentTarget.files, { type: "image/png" });
		// 	const { record } = await web5.dwn.records.create({
		// 		data: blob,
		// 		message: {
		// 			dataFormat: "image/png"
		// 		}
		// 	});
		//   }

		// if (attachments) {
		// 	const blob = new Blob(attachments, { type: 'image/png' });
		// 	const { record: attachmentRecord } = await this.account.web5.dwn.records.write({
		// 		data: blob,
		// 		message: {
		// 			protocol: this.protocolDefinition.protocol,
		// 			protocolPath: 'attachment',
		// 			schema: this.protocolDefinition.types.attachment.schema,
		// 			dataFormat: this.protocolDefinition.types.attachment.dataFormats[0],
		// 			recipient: toDid,
		// 			published: false,
		// 			parentId: record?.id
		// 		}
		// 	});

		// 	console.log('attachmentRecord:', attachmentRecord);
		// }

		// SEND
		const { status } = await record?.send(email.to);
		console.log('send status:', status);

		// TODO: update status to `delivered`
		if (record && (status.code == 200 || status.code == 202)) {
			// data.status = 'delivered';
			// const recRs = await this.account.web5.dwn.records.write({
			// 	data: JSON.stringify(data),
			// 	message: {
			// 		recordId: record.id
			// 	}
			// });
			// console.log('recRs:', recRs);
		}

		return { record, status };
	}

	async reply(email: Mail5Email, replyEmail: Mail5Email) {
		// TODO: validate protocol

		// delete draft
		if (email.status == 'draft') {
			await this.delete(email?.record?.id);
		}

		console.log('send data:', email);
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
		console.log('send record:', record);

		// SEND
		const { status } = await record?.send(email.to);
		console.log('send status:', status);

		// TODO: update status to `delivered`
		if (record && (status.code == 200 || status.code == 202)) {
		}

		return { record, status };
	}

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

		console.log('send data:', email);
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
		console.log('send record:', record);

		// SEND
		const { status } = await record?.send(email.to);
		console.log('send status:', status);

		// TODO: update status to `delivered`
		if (record && (status.code == 200 || status.code == 202)) {
		}

		return { record, status };
	}

	async saveDraft(email: Mail5Email) {
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
			// from: this.account.did,
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol
					// protocolPath: 'email'
				},
				dateSort: DateSort.CreatedDescending
			}
		});

		console.log('drafts records:', records);
		return this.map(records, { status: 'draft' });
	}

	async inbox() {
		const { records, status } = await this.account.web5.dwn.records.query({
			// from: this.account.did,
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol,
					// protocolPath: 'email'
					recipient: this.account.did
				},
				dateSort: DateSort.CreatedDescending
			}
		});
		console.log('inbox records:', records);
		return this.map(records, { status: 'delivered', recipient: this.account.did });
	}

	async outbox() {
		let { records, status } = await this.account.web5.dwn.records.query({
			// from: this.account.did,
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol
					// protocolPath: 'email'
				},
				dateSort: DateSort.CreatedDescending
			}
		});

		// TODO: review filter
		// records = records?.filter((r) => r.recipient != this.account.did);
		console.log('outbox records:', records);
		return this.map(records, { status: 'delivered', sender: this.account.did });
	}

	async trash() {
		let { records, status } = await this.account.web5.dwn.records.query({
			// from: this.account.did,
			message: {
				filter: {
					protocol: this.protocolDefinition.protocol
					// protocolPath: 'email'
				},
				dateSort: DateSort.CreatedDescending
			}
		});

		// TODO: review filter
		console.log('outbox records:', records);
		return this.map(records, { status: 'deleted' });
	}

	// async receive() {
	// 	let result = [];

	// 	const { records, status: recordStatus } = await this.account.web5.dwn.records.query({
	// 		message: { filter: { protocol: this.protocolDefinition.protocol } }
	// 	});

	// 	console.log('recipient records:', records);
	// 	if (records && recordStatus.code == 200) {
	// 		try {
	// 			// const results = await Promise.all(records.map((record) => record.data));

	// 			for (let i = 0; i < records.length; i++) {
	// 				const receivedRecord = records[i];
	// 				// console.log('recipient received record:', receivedRecord);
	// 				// const receivedRecordData = await receivedRecord.data.json();
	// 				// console.log('recipient received record data:', receivedRecordData);

	// 				result.push(receivedRecord);
	// 			}

	// 			// let result = await records[0].data.json();
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	}

	// 	return result;
	// }

	async softDelete(recordId: string | undefined) {
		if (recordId) {
			let { records } = await this.account.web5.dwn.records.query({
				message: {
					filter: { protocol: this.protocolDefinition.protocol, recordId: recordId }
				}
			});

			console.log('records', records);

			if (records) {
				const record = records[0];
				// update deleted status
				let recordDataObj = await record.data.json();
				// console.log('recordDataJson', recordDataJson)
				// let recordDataObj = JSON.parse(recordDataJson);
				recordDataObj.status = 'deleted';

				const { status } = await record.update({ data: JSON.stringify(recordDataObj) });

				// const { record, status } = await this.account.web5.dwn.records.write({
				// 	data: JSON.stringify(recordDataObj),
				// 	message: {
				// 		recordId: records[0].id,
				// 		protocol: this.protocolDefinition.protocol,
				// 		protocolPath: 'email',
				// 		schema: this.protocolDefinition.types.email.schema,
				// 		dataFormat: this.protocolDefinition.types.email.dataFormats[0],
				// 		recipient: records[0].recipient
				// 	}
				// });

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
				// console.log('record', record);
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

					console.log('recordData', recordData);
				} catch (error) {
					console.log(error);
				}
			}
		}

		console.log('rs', rs);
		return rs;
	}
}
