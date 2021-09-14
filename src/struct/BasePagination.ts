import { MessageEmbed } from "discord.js";

type CallbackFn = (value: never, index: number) => unknown;

export interface BasePaginationOptions {
	embed: MessageEmbed;
	array: never[];
	startPage?: number;
	itemsPerPage: number;
	callbackfn: CallbackFn;
	timeout?: number;
	title?: string;
}

export default abstract class BasePagination {
	public embed: MessageEmbed;
	protected format: CallbackFn;
	protected title: string;
	protected array: never[];
	protected startPage: number;
	protected itemsPerPage: number;
	// Seconds
	protected timeout: number;

	constructor(options: BasePaginationOptions) {
		const {
			embed,
			array,
			startPage = 1,
			itemsPerPage,
			callbackfn,
			timeout = 300,
			title = "Values",
		} = options;

		this.embed = embed;
		this.format = callbackfn;
		this.array = array;
		this.startPage = startPage;
		this.itemsPerPage = itemsPerPage;
		this.timeout = timeout;
		this.title = title;
	}

	public abstract build(): void;
}
