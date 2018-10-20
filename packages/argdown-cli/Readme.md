# @argdown/cli

![Argdown logo](../../argdown-arrow.png?raw=true "Argdown logo")

A commandline interface to process Argdown data.

To learn more about the Argdown argumentation syntax, visit the [Argdown documentation](https://christianvoigt.github.io/argdown).

## Features

* export text document to html with `argdown html`
* export argument map to pdf, svg or dot with `argdown map`
* export data to json with `argdown json`
* returns code diagnostics
* extend @argdown/cli with custom plugins and processes in a `argdown.config.js` file and run them with `argdown run [processName]`

For a better editing experience we recommend to additionally install the [VS Code extension](https://christianvoigt.github.io/argdown/guide/installing-the-vscode-extension.html).

## Installation

If you have not already done so, please [install node.js and npm](https://docs.npmjs.com/getting-started/installing-node) on your system before installing @argdown/cli.

If you already have installed node on your system, please ensure that it is at least of version 8.0.0.

To install @argdown/cli run the following npm command:

```bash
npm install -g @argdown/cli
```

You can try out @argdown/cli without installing it by running:

```bash
npx @argdown/cli map
```

## Available commands

Available commands:

* `argdown html [input glob] [output folder]`: exports the input files as html files into the output folder.
* `argdown map [input glob] [output folder]`: exports argument maps layouted with Graphviz. By default the maps are saved as pdf files. Use `--format svg` to save svg files and `--format dot` to save dot files.
* `argdown json [input glob] [output folder]`: exports the input files as .json files into the output folder.
* `argdown compile [input glob] [output folder]`: compiles the input files with included files into new .argdown files.
* `argdown run [process name]`: runs a custom process defined in your `argdown.config.js`.

All commands can be used with the `-w` option: The cli will then watch your .argdown files continuously for changes and export them instantly.

You can use wildcards to specify the input files, but you have to put them in quotes (e.g. `argdown html './**/*.argdown'`).

If used without input and output arguments these commands will export any .argdown files in the current folder.

For more information use the `--help` option with each command.

## Includes

You can include 'partial' Argdown files in other Argdown files by using the following syntax:

```
Some Argdown content ...

@include(_my-argdown-partial.argdown)

Some more Argdown content ...
```

This will even work recursively as long as you don't try to include an Argdown file that has already been included before.

@argdown/cli will then compile the different Argdown files into one before starting the parsing process. You can also save the result of this compilation by using the `argdown compile` command.

Please note that the line numbers of error messages will always refer to lines in the compiled argdown document, not to lines in the original files.

### Partials

You can include any Argdown file in another Argdown file. However, it is recommended to only include 'partials' in other files. An Argdown file is treated as a partial if its name starts with an underscore. Except in @import statements partials are ignored by @argdown/cli.

This naming convention makes it possible to have a main .argdown file and several partials in the same folder without having to specify which files should be processed or ignored by the commands of @argdown/cli.

## Config options

The cli can be configured with a config file. This allows you to change the behaviour of the built-in features or even add completely new features by adding custom plugins.

@argdown/cli will automatically look for a `argdown.config.js` in the current working directory. If you want to use a different name or path you can use `argdown --config [name-of-my-config-file].js`.

[Visit the config documentation](https://christianvoigt.github.io/argdown/guide/configuration-introduction.html) to learn more about the format of the config file and how to add plugins to @argdown/cli.