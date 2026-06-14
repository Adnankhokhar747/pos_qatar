/// <reference types="vite/client" />

interface POSQatarBoot {
	user: string;
	full_name: string;
	csrf_token: string;
	roles: string[];
	default_pos_profile: string | null;
	sitename: string;
}

interface Window {
	pos_qatar: POSQatarBoot;
}
