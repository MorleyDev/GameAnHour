export type GenericAction = {
	readonly type: string;
	readonly [extraProps: string]: any;
};
