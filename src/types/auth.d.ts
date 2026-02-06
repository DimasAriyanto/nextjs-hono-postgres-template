export interface TTokenDecoded {
	exp: number;
	iat: number;
	auid: string;
	aurl: string | null;
	utid?: string;
	auem?: string;
}
