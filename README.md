# paginationembed

An Easy and Stylish way of doing Discord Embed Pagination

[![CI](https://github.com/jacany/paginationembed/actions/workflows/ci.yml/badge.svg)](https://github.com/jacany/paginationembed/actions/workflows/ci.yml)

---

## Usage

```js
const { EmbedBuilder } = require("discord.js");
const { MessagePagination } = require("@jacany/paginationembed");

const array = ["Element 1", "Element 2", "Element 3"];

const embed = new MessagePagination({
	embed: new EmbedBuilder(),
	itemsPerPage: 2,
	startPage: 1,
	title: "Values",
	timeout: 300000, // Milliseconds before expiry
	message: Message, // Pass your Message Object
	array,
	callbackfn: (value, index) => `**${index + 1}.** ${value}`,
});

embed.build();
```

### Output

![Screenshot_20210917_142849](https://user-images.githubusercontent.com/30955604/133836832-501a6380-683f-4731-91a4-04c57a8f68d9.png)

## Installing

With NPM:

```sh
npm install @jacany/paginationembed
```

or Yarn:

```sh
yarn add @jacany/paginationembed
```
