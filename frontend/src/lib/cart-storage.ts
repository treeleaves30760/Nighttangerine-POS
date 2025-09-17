export type CartSnapshotItem = {
	productId: string;
	name: string;
	price: number;
	quantity: number;
	imageUrl?: string | null;
	amount?: string | null;
};

export type CartSnapshot = {
	items: CartSnapshotItem[];
	total: number;
	updatedAt: string;
};

const STORAGE_KEY = "pos:cart-snapshot";
const EVENT_NAME = "pos:cart-updated";

const EMPTY_SNAPSHOT: CartSnapshot = {
	items: [],
	total: 0,
	updatedAt: "",
};

const isBrowser = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

function parseSnapshot(raw: string | null): CartSnapshot {
	if (!raw) return EMPTY_SNAPSHOT;
	try {
		const parsed = JSON.parse(raw) as CartSnapshot;
		if (!parsed || typeof parsed !== "object") return EMPTY_SNAPSHOT;
		return {
			items: Array.isArray(parsed.items) ? parsed.items : [],
			total: Number(parsed.total) || 0,
			updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
		};
	} catch {
		return EMPTY_SNAPSHOT;
	}
}

const getSnapshot = (): CartSnapshot => {
	if (!isBrowser()) return EMPTY_SNAPSHOT;
	return parseSnapshot(localStorage.getItem(STORAGE_KEY));
};

const setSnapshot = (snapshot: CartSnapshot) => {
	if (!isBrowser()) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	const event = new CustomEvent<CartSnapshot>(EVENT_NAME, { detail: snapshot });
	window.dispatchEvent(event);
};

const clearSnapshot = () => {
	if (!isBrowser()) return;
	localStorage.removeItem(STORAGE_KEY);
	const event = new CustomEvent<CartSnapshot>(EVENT_NAME, { detail: EMPTY_SNAPSHOT });
	window.dispatchEvent(event);
};

const subscribe = (listener: (snapshot: CartSnapshot) => void) => {
	if (!isBrowser()) return () => undefined;

	const handleStorage = (event: StorageEvent) => {
		if (event.key && event.key !== STORAGE_KEY) return;
		listener(parseSnapshot(event.newValue ?? localStorage.getItem(STORAGE_KEY)));
	};

	const handleCustom = (event: Event) => {
		const custom = event as CustomEvent<CartSnapshot>;
		listener(custom.detail ?? getSnapshot());
	};

	listener(getSnapshot());
	window.addEventListener("storage", handleStorage);
	window.addEventListener(EVENT_NAME, handleCustom as EventListener);

	return () => {
		window.removeEventListener("storage", handleStorage);
		window.removeEventListener(EVENT_NAME, handleCustom as EventListener);
	};
};

export const cartStorage = {
	get: getSnapshot,
	set: setSnapshot,
	clear: clearSnapshot,
	subscribe,
};
