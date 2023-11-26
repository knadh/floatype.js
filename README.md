# floatype.js

A super tiny Javascript autocomplete / autosuggestion library for rendering floating suggestion widgets in textareas. Zero dependencies and ~1200 bytes minified + gzipped.

[**View demo**](https://knadh.github.io/floatype.js)

![demo](https://github.com/knadh/floatype.js/assets/547147/d4525e83-da4d-46a1-8ebe-203d49ed0115)


## Usage

### Node
```shell
npm install @knadh/floatype
```

```javascript
import { floatype } from @knadh/floatype;

floatype(document.querySelector("textarea"), {
	onQuery: async (val) => {
		// fetch() or whatever that fetches/generates results.
		return ["results", "here"];
	}
});
```

Check the [demo source](https://github.com/knadh/floatype.js/blob/master/docs/index.html) to see advanced usage and basic CSS styles.

### ES6 module
Check the [demo source](https://github.com/knadh/floatype.js/blob/master/docs/index.html) to use the lib in `<script>` directly on an HTML page.

> For dropdown suggestions on input boxes, see [autocomp.js](https://github.com/knadh/autocomp.js)


Licensed under the MIT License.
