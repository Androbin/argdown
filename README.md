# Argdown

![Argdown logo](./argdown-arrow.png?raw=true "Argdown logo")

[Argdown](https://christianvoigt.github.io/argdown) is a simple syntax for analyzing complex argumentation.

- Writing pro & contra lists in Argdown is as simple as writing a twitter message. You don't have to learn anything new, except a few simple rules that will feel very natural. 
- With these simple rules you will be able to define complex dialectical relations between arguments or dive into the details of their logical premise-conclusion structures. 
- Your document is transformed into an argument map while you are typing. You can export your analysis as HTML, SVG, PDF, PNG or JSON. If that is not enough, you can easily extend Argdown with your own plugin.

Start with [the docs](https://christianvoigt.github.io/argdown) or try it out in the [Browser Sandbox](http://christianvoigt.github.io/argdown).

If you want to start working right away, you should install the [Argdown VS Code extension](https://christianvoigt.github.io/argdown/guide/installing-the-vscode-extension).

## Credits and license

The development of Argdown and Argdown-related tools is funded by the [DebateLab](http://debatelab.philosophie.kit.edu/) at KIT, Karlsruhe.

All code is published under the MIT license.

## About this repository

This repository is a [Monorepo](https://en.wikipedia.org/wiki/Monorepo) containing all packages of the Argdown project. We use [lerna](https://github.com/lerna/lerna) to manage their internal dependencies. You can find all packages in the `packages/` folder.

For further information about the code, consult the [API section](https://christianvoigt.github.io/argdown/api/) of the documentation.

To install this Monorepo 

- fork/pull or download this repository
- run `npm install` in the main folder.
- run `npm run bootstrap` to install the dependencies of all packages. This will call `lerna bootstrap`.
- run `npm run docs:dev` if you want to work on the documentation. Run `npm run` to see the other scripts available.
