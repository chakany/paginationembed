import {
	Message,
	ActionRowBuilder,
	ButtonInteraction,
	SelectMenuInteraction,
	MessageSelectOption,
	MessageComponentInteraction,
	ComponentType,
	ButtonStyle,
	ButtonBuilder,
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

		const selectValues: MessageSelectOption[] = [];

		for (let i = 1; i <= pages; i++) {
			selectValues.push({
				label: `Page #${i}`,
				description: `Jump to Page #${i}`,
				value: i.toString(),
				default: false,
				emoji: null,
			});
		}

		const embed = this.embed;

		embed.setFields([
			{
				name: this.title,
				value: startPage.join("\n"),
			},
		]);

		const message = this.message;

		const sent = await message.channel.send({
			embeds: [embed],
			components: [
				new ActionRowBuilder<ButtonBuilder>({
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: "◀️",
							customId: "back",
							style: ButtonStyle.Secondary,
							disabled: page == 1 ? true : false,
						},
						{
							type: ComponentType.Button,
							label: `${page}/${pages}`,
							customId: "counter",
							style: ButtonStyle.Primary,
							disabled: true,
						},
						{
							type: ComponentType.Button,
							label: "▶️",
							customId: "forward",
							style: ButtonStyle.Secondary,
							disabled: selectValues.find(
								(value) => value.value == (page + 1).toString()
							)
								? false
								: true,
						},
					],
				}),
			],
		});

		const filter = (i: MessageComponentInteraction) =>
			i.componentType == ComponentType.Button &&
			(i.customId === "back" || i.customId === "forward") &&
			i.user.id === message.author.id;

		const collector = message.channel.createMessageComponentCollector({
			filter,
			time: this.timeout,
		});

		collector.on(
			"collect",
			(i: ButtonInteraction | SelectMenuInteraction) => {
				if (i.componentType == ComponentType.StringSelect) {
					i.deferUpdate();

					page = parseInt(i.values[0]);

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
						embeds: [embed],
						components: [
							new ActionRowBuilder<ButtonBuilder>({
								components: [
									{
										type: ComponentType.Button,
										label: "◀️",
										customId: "back",
										style: ButtonStyle.Secondary,
										disabled: page == 1 ? true : false,
									},
									{
										type: ComponentType.Button,
										label: `${page}/${pages}`,
										customId: "counter",
										style: ButtonStyle.Primary,
										disabled: true,
									},
									{
										type: ComponentType.Button,
										label: "▶️",
										customId: "forward",
										style: ButtonStyle.Secondary,
										disabled: selectValues.find(
											(value) =>
												value.value ==
												(page + 1).toString()
										)
											? false
											: true,
									},
								],
							}),
						],
					});
				}

				if (i.componentType == ComponentType.Button) {
					if (i.customId == "forward") {
						// Check if there are items in next page
						if (
							selectValues.find(
								(value) => value.value == (page + 1).toString()
							)
						) {
							i.deferUpdate();
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
								embeds: [embed],
								components: [
									new ActionRowBuilder<ButtonBuilder>({
										components: [
											{
												type: ComponentType.Button,
												label: "◀️",
												customId: "back",
												style: ButtonStyle.Secondary,
												disabled:
													page == 1 ? true : false,
											},
											{
												type: ComponentType.Button,
												label: `${page}/${pages}`,
												customId: "counter",
												style: ButtonStyle.Primary,
												disabled: true,
											},
											{
												type: ComponentType.Button,
												label: "▶️",
												customId: "forward",
												style: ButtonStyle.Secondary,
												disabled: selectValues.find(
													(value) =>
														value.value ==
														(page + 1).toString()
												)
													? false
													: true,
											},
										],
									}),
								],
							});
						}
					}

					if (i.customId == "back") {
						// Check if there are items in previous page
						if (
							selectValues.find(
								(value) => value.value == (page - 1).toString()
							)
						) {
							i.deferUpdate();

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
								embeds: [embed],
								components: [
									new ActionRowBuilder<ButtonBuilder>({
										components: [
											{
												type: ComponentType.Button,
												label: "◀️",
												customId: "back",
												style: ButtonStyle.Secondary,
												disabled:
													page == 1 ? true : false,
											},
											{
												type: ComponentType.Button,
												label: `${page}/${pages}`,
												customId: "counter",
												style: ButtonStyle.Primary,
												disabled: true,
											},
											{
												type: ComponentType.Button,
												label: "▶️",
												customId: "forward",
												style: ButtonStyle.Secondary,
												disabled: selectValues.find(
													(value) =>
														value.value ==
														(page + 1).toString()
												)
													? false
													: true,
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
