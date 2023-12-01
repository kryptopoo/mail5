function shortDID(did: string, len: number = 20) {
	if (did && did.length > 0) {
		// short form len is 54
		did = did.slice(0, len);

		return `${did}...`;
	}

	return '';
}

async function download(filename: string, base64: string) {
	const res = await fetch(base64);
	const resBlob = await res.blob();
	saveAsFile(filename, resBlob);
}

function saveAsFile(filename: string, blob: Blob) {
	// const blob = new Blob([data]);
	const link = document.createElement('a');
	link.download = filename;
	link.href = window.URL.createObjectURL(blob);
	link.click();
}

async function b64toBlob(base64: string, type: string = 'application/octet-stream') {
	const res = await fetch(`data:${type};base64,${base64}`);
	return res;
}

function formatDate(date: string | undefined) {
	const today = new Date().toISOString().slice(0, 10);

	let formatedDate = '';
	if (formatedDate == today) formatedDate = date ? date.slice(11, 16) : '';
	else formatedDate = date ? date.slice(0, 10) : '';

	return formatedDate;
}

async function copyClipboard(text: string) {
	if (text) await navigator.clipboard.writeText(text);
}

export { shortDID, download, saveAsFile, b64toBlob, formatDate, copyClipboard };
