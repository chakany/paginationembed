import {
	Message,
	MessageActionRow,
	ButtonInteraction,
	SelectMenuInteraction,
	MessageSelectOptionData,
} from "discord.js";
import BasePagination, { BasePaginationOptions } from "./BasePagination";

export interface MessagePaginationOptions extends BasePaginationOptions {
	message: Message;
}

export default class MessagePagination extends BasePagination {
	protected message: Message;

	constructor(options: MessagePaginationOptions) {
		super(options);

		const { message } = options;

		if (!message) throw new TypeError("message is not defined");

		this.message = options.message;
	}

	public async build() {
		// Make it easier to access
		const array = this.array;

		let page = this.startPage;
		const pages = Math.trunc(array.length / this.itemsPerPage) + 1;

		const values = (await array.map(this.format)) as never[];

		const startPage = this.paginate(values, this.itemsPerPage, page);

		const embed = this.embed;

		embed.setFields([
			{
				name: this.title,
				value: startPage.join("\n"),
			},
		]);

		const message = this.message;

		const sent = await message.channel.send({
			content: `Page ${page}/${pages}`,
			embeds: [embed],
			components: [
				new MessageActionRow({
					components: [
						{
							type: "BUTTON",
							label: "Back",
							customId: "back",
							style: "PRIMARY",
							disabled: page == 1 ? true : false,
						},
						{
							type: "BUTTON",
							label: "Forward",
							customId: "forward",
							style: "PRIMARY",
							disabled:
								// prettier-ignore
								!((page + 1) * this.itemsPerPage >= array.length),
						},
					],
				}),
				new MessageActionRow({
					components: [
						{
							type: "SELECT_MENU",
							customId: "select",
							placeholder: `Page #${page}`,
							maxValues: 1,
							// Fucking mess lmao
							options: [
								...(array.map((value, i) => {
									return {
										label: `Page #${i + 1}`,
										description: `Jump to Page #${i + 1}`,
										value: (i + 1).toString(),
									};
								}) as unknown as MessageSelectOptionData[]),
							],
						},
					],
				}),
			],
		});

		const filter = (i: ButtonInteraction | SelectMenuInteraction) =>
			(i.componentType == "BUTTON" || i.componentType == "SELECT_MENU") &&
			(i.customId === "back" || i.customId === "forward") &&
			i.user.id === message.author.id;

		const collector = message.channel.createMessageComponentCollector({
			filter,
			time: this.timeout,
		});

		collector.on(
			"collect",
			(i: ButtonInteraction | SelectMenuInteraction) => {
				if (i.componentType == "BUTTON") {
					if (i.customId == "forward") {
						i.deferUpdate();

						// Check if there are items in next page
						if ((page + 1) * this.itemsPerPage >= array.length) {
							page++;
							const newPaginate = this.paginate(
								values,
								this.itemsPerPage,
								page
							);

							embed.setFields([
								{
									name: this.title,
									value: newPaginate.join("\n"),
								},
							]);

							sent.edit({
								content: `Page ${page}/${pages}`,
								embeds: [embed],
								components: [
									new MessageActionRow({
										components: [
											{
												type: "BUTTON",
												label: "Back",
												customId: "back",
												style: "PRIMARY",
												disabled:
													// prettier-ignore
													!((page + 1) * this.itemsPerPage >= array.length),
											},
											{
												type: "BUTTON",
												label: "Forward",
												customId: "forward",
												style: "PRIMARY",
												disabled:
													(page + 1) *
														this.itemsPerPage >=
													array.length,
											},
										],
									}),
									new MessageActionRow({
										components: [
											{
												type: "SELECT_MENU",
												customId: "select",
												placeholder: `Page #${page}`,
												maxValues: 1,
												// Fucking mess lmao
												options: [
													...(array.map(
														(value, i) => {
															return {
																label: `Page #${
																	i + 1
																}`,
																description: `Jump to Page #${
																	i + 1
																}`,
																value: (
																	i + 1
																).toString(),
															};
														}
													) as unknown as MessageSelectOptionData[]),
												],
											},
										],
									}),
								],
							});
						}
					}

					if (i.customId == "back") {
						i.deferUpdate();

						// Check if there are items in previous page
						if ((page - 1) * this.itemsPerPage <= array.length) {
							page--;
							const newPaginate = this.paginate(
								values,
								this.itemsPerPage,
								page
							);

							embed.setFields([
								{
									name: this.title,
									value: newPaginate.join("\n"),
								},
							]);

							sent.edit({
								content: `Page ${page}/${pages}`,
								embeds: [embed],
								components: [
									new MessageActionRow({
										components: [
											{
												type: "BUTTON",
												label: "Back",
												customId: "back",
												style: "PRIMARY",
												disabled: !(
													(page - 1) *
														this.itemsPerPage >=
													array.length
												),
											},
											{
												type: "BUTTON",
												label: "Forward",
												customId: "forward",
												style: "PRIMARY",
												disabled:
													// prettier-ignore
													!((page + 1) * this.itemsPerPage >= array.length),
											},
										],
									}),
									new MessageActionRow({
										components: [
											{
												type: "SELECT_MENU",
												customId: "select",
												placeholder: `Page #${page}`,
												maxValues: 1,
												// Fucking mess lmao
												options: [
													...(array.map(
														(value, i) => {
															return {
																label: `Page #${
																	i + 1
																}`,
																description: `Jump to Page #${
																	i + 1
																}`,
																value: (
																	i + 1
																).toString(),
															};
														}
													) as unknown as MessageSelectOptionData[]),
												],
											},
										],
									}),
								],
							});
						}
					}
				}
			}
		);

		collector.once("end", () => {
			sent.edit({
				components: [],
			});
		});
	}
}
