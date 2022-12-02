import { Message, EmbedBuilder } from "discord.js";

type CallbackFn = (value: never, index: number, array: never[]) => unknown;

export interface BasePaginationOptions {
	embed: EmbedBuilder;
	array: never[];
	startPage?: number;
	itemsPerPage: number;
	callbackfn: CallbackFn;
	timeout?: number;
	title?: string;
}

export default abstract class BasePagination {
	public embed: EmbedBuilder;
	protected format: CallbackFn;
	protected title: string;
	protected array: never[];
	protected startPage: number;
	protected itemsPerPage: number;
	// Seconds
	protected timeout: number;

	constructor(options: BasePaginationOptions) {
		const {
			embed = new EmbedBuilder(),
			array,
			startPage = 1,
			itemsPerPage,
			callbackfn,
			timeout = 300000,
			title = "Values",
		} = options;

		if (typeof array !== "object")
			throw new TypeError("Array is not an Object");

		if (typeof startPage !== "number")
			throw new TypeError("startPage is not a number");

		if (typeof itemsPerPage !== "number")
			throw new TypeError("itemsPerPage is not a number");

		if (typeof timeout !== "number")
			throw new TypeError("timeout is not a number");

		if (typeof title !== "string")
			throw new TypeError("title is not a sting");

		this.embed = embed;
		this.format = callbackfn;
		this.array = array;
		this.startPage = startPage;
		this.itemsPerPage = itemsPerPage;
		this.timeout = timeout;
		this.title = title;
	}

	protected paginate(
		array: never[],
		pageSize: number,
		page: number
	): never[] {
		return array.slice((page - 1) * pageSize, page * pageSize);
	}

	public abstract build(): void;
}
