export function floatype(el, options = {}) {
	const defaults = {
		onQuery: null, onNavigate: null, onSelect: null, onRender: null, debounce: 100
	};

	const opt = { ...defaults, ...options };
	let box, cur = 0, items = [], val, req;

	const shadow = setupShadow();

	// Attach all the events required for the interactions in one go.
	["input", "keydown", "blur"].forEach(k => el.addEventListener(k, handleEvent));

	function handleEvent(e) {
		if (e.type === "keydown" && handleKeydown(e)) {
			return;
		};

		if (e.type === "blur") {
			destroy();
			return;
		}

		const w = getLastWord(el);
		if (!w) {
			destroy();
			return;
		}

		val = w;

		// Clear (debounce) any existing pending requests and queue
		// the next search request.
		clearTimeout(req);
		req = setTimeout(query, opt.debounce);
	}

	function handleKeydown(e) {
		if (!box) {
			return true;
		};
		switch (e.keyCode) {
			case 38: return navigate(-1, e); // Up arrow.
			case 40: return navigate(1, e); // Down arrow
			case 13: // Enter
				e.preventDefault();
				select(cur);
				destroy();
				return;
			case 27: // Escape.
				destroy(); 
				return true;
		}
	}

	async function query() {
		if (!val) {
			return;
		}
		
		items = await opt.onQuery(val);
		if (!items.length) {
			destroy();
			return;
		}

		if (!box) {
			createBox();
		}

		renderResults();
	}

	function createBox() {
		box = document.createElement("div");
		Object.assign(box.style, {
			width: window.getComputedStyle(el).width,
			position: "fixed",
			left: `${el.offsetLeft}px`,
			top: `${el.offsetTop + el.offsetHeight}px`
		});

		box.classList.add("floatype");
		el.parentNode.insertBefore(box, el.nextSibling);
	}

	function renderResults() {
		box.innerHTML = "";

		const coords = getCaret(el);
		box.style.left = `${coords.x}px`;
		box.style.top = `${coords.y}px`;

		items.forEach((item, idx) => {
			const div = document.createElement("div");
			div.classList.add("floatype-item");

			// If there"s a custom renderer callback, use it, else, simply insert the value/text as-is.
			opt.onRender ? div.appendChild(opt.onRender(item)) : div.innerText = item;
			if (idx === cur) {
				div.classList.add("floatype-sel");
			}

			div.addEventListener("mousedown", () => select(idx));
			box.appendChild(div);
		});
	}

	function navigate(direction, e) {
		e.preventDefault();

		// Remove the previous item"s highlight;
		const prev = box.querySelector(`:nth-child(${cur + 1})`);
		prev && prev.classList.remove("floatype-sel");

		// Increment the cursor and highlight the next item, cycled between [0, n].
		cur = (cur + direction + items.length) % items.length;
		box.querySelector(`:nth-child(${cur + 1})`).classList.add("floatype-sel");
	}

	function select(idx) {
		const val = opt.onSelect ? opt.onSelect(items[idx]) : items[idx];
		insertWord(el, val);
		setTimeout(() => el.focus(), 50);
	}

	function destroy() {
		items = [];
		cur = 0;
		val = null;
		if (box) {
			box.remove();
			box = null;
		}
	}

	// setup a hidden "shadow" div that has all the same styles as the el textarea to use as
	// a proxy to get the cursor"s position as text is typed.
	function setupShadow() {
		const div = document.createElement("div");
		document.querySelector("body").appendChild(div);

		const styles = window.getComputedStyle(el);
		for (const p of styles) {
			div.style[p] = styles[p];
		}

		div.style.visibility = "hidden";
		div.style.position = "absolute";
		div.style.left = "-500%";
		div.style.top = "-500%";

		return div;
	}

	function getCaret(el) {
		const txt = el.value.substring(0, el.selectionStart);
		const start = Math.max(txt.lastIndexOf("\n"), txt.lastIndexOf(" ")) + 1;

		// Update shadow div content up to the cursor position
		const cl = "floatype-caret";
		shadow.innerHTML = el.value.substring(0, start) + `<span id="${cl}" style="display: inline-block;"></span>` + el.value.substring(start);

		const m = document.getElementById(cl);
		const rect = el.getBoundingClientRect();

		return {
			x: rect.left + m.offsetLeft - el.scrollLeft, 
			y: rect.top + m.offsetTop - el.scrollTop + 10
		};
	}

	function getLastWord(el) {
		const text = el.value.substring(0, el.selectionStart);
		if (/\S$/.test(text)) {
			return text.match(/\S*$/)[0];
		}

		return "";
	}

	// insert the new word replacing the current word at the selection caret.
	function insertWord(el, val) {
		const start = Math.max(el.value.lastIndexOf(" ", el.selectionStart - 1), el.value.lastIndexOf("\n", el.selectionStart - 1)) + 1;
		el.value = el.value.substring(0, start) + val + (el.value[el.selectionStart] !== " " ? " " : "") + el.value.substring(el.selectionStart);
		el.setSelectionRange(start + val.length + 1, start + val.length + 1);
	}
}

export default floatype;
