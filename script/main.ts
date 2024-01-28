const SLIDER_MIN = 50;
const SLIDER_MAX = 1000;
const SLIDER_STEP = 50;
const SLIDER_DEFAULT = 350;

const MAX_INTERACTION_NUMBER = 20;

const MIN_INTENSITY = 1;
const MAX_INTENSITY = 1000;
const DEFAULT_INTENSITY = 100;
const INTENSITY_STEP = 1;
const INTENSITY_DIVIDER = 10000;

const DISTANCE_MIN = 10;
const DISTANCE_MAX = 500;
const DISTANCE_STEP = 10;
const DISTANCE_DEFAULT = 200;

const Group1 = 0;
const Group2 = 1;

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

type Options = {
	distance?: number;
	g?: number;
};

type Interaction = {
	group1: Particle[];
	group2: Particle[];
	options: Options;
};

class Particle {
	public x: number;
	public y: number;
	public radius: number;
	public color: string;
	public vx: number = 0;
	public vy: number = 0;

	public static DEFAULT_RADIUS = 5;

	public constructor(x: number, y: number, color: string, radius: number) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.radius = radius;
	}

	public draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = ColorsHex[this.color];
		ctx.fillRect(this.x, this.y, this.radius, this.radius);
	}
}

let paused = true;
let particles: Particle[] = [];
let interactions: Interaction[] = [];

const ColorsHex = Object.freeze({
	red: "#f91d4d",
	green: "#0db342",
	blue: "#4a4ad7",
	yellow: "#f0e246",
	magenta: "#d742d7",
	cyan: "#42cedb",
});

const colors = {
	red: null,
	green: null,
	blue: null,
	yellow: null,
	magenta: null,
	cyan: null,
};

function reset() {
	particles.forEach((particle) => {
		particle.x = randomInt(0, canvas.width);
		particle.y = randomInt(0, canvas.height);
	});

	paused = true;
	const img = document.querySelector(".play-pause img") as HTMLImageElement;
	img.src = "/assets/images/svg/play_arrow.svg";
}

function addColor(color: string, autoGroup: boolean = true) {
	if (autoGroup)
		colors[color] = makeGroup(350, color, { radius: Particle.DEFAULT_RADIUS });

	const container = document.querySelector(".particle-containers")!;

	const particle = document.createElement("div");
	particle.classList.add("particle-container");
	particle.classList.add(color);

	const head = document.createElement("div");
	head.classList.add("container-head");
	head.innerHTML = `<div class="color"></div><h3 class="sublabel">${color}</h3><button class="close particle">⨯</button>`;

	const close = head.querySelector(".close") as HTMLButtonElement;

	close.addEventListener("click", () => {
		particles = particles.filter((p) => p.color !== color);
		colors[color] = null;
		container.removeChild(particle);

		interactions = interactions.filter((itn) => {
			if (itn.group1[0].color === color || itn.group2[0].color === color) {
				document
					.querySelector(`.interaction-container .colors .color.${color}`)
					?.parentElement?.parentElement?.parentElement?.remove();

				return false;
			}

			return true;
		});
	});

	const particleSetting = document.createElement("h4");
	particleSetting.classList.add("setting");
	particleSetting.innerHTML = `Particle number : <span class="setting-value">${SLIDER_DEFAULT.toLocaleString(
		"en-US"
	)}</span>`;

	const range = document.createElement("div");
	range.classList.add("range");

	range.innerHTML = `<p class="value">${SLIDER_MIN.toLocaleString(
		"en-US"
	)}</p><input class="range-content" type="range" min="${SLIDER_MIN}" max="${SLIDER_MAX}" step="${SLIDER_STEP}" value="${SLIDER_DEFAULT}"><p class="value">${SLIDER_MAX.toLocaleString(
		"en-US"
	)}</p>`;

	const input = range.querySelector("input") as HTMLInputElement;

	input.addEventListener("input", () => {
		const value = parseInt(input.value);
		particleSetting.innerHTML = `Particle number : <span class="setting-value"Z>${value.toLocaleString(
			"en-US"
		)}</span>`;

		particles = particles.filter((p) => p.color !== color);

		colors[color] = makeGroup(value, color, {
			radius: Particle.DEFAULT_RADIUS,
		});

		interactions = interactions.map((itn) => {
			if (itn.group1[0].color === color) {
				itn.group1 = colors[color]!;
			} else if (itn.group2[0].color === color) {
				itn.group2 = colors[color]!;
			}

			return itn;
		});
	});

	particle.appendChild(head);
	particle.appendChild(particleSetting);
	particle.appendChild(range);

	container.appendChild(particle);
}

function colorSelector(
	selected: string,
	group: number,
	interaction: Interaction
) {
	const selector = document.createElement("div");
	selector.classList.add("color-selector");

	const selectedColor = document.createElement("button");
	selectedColor.classList.add("color");
	selectedColor.classList.add(selected);

	const colorList = document.createElement("div");
	colorList.classList.add("color-list");

	selectedColor.addEventListener("click", (e) => {
		e.stopPropagation();

		if (colorList.classList.contains("show")) {
			colorList.classList.remove("show");
		} else {
			const colorButtons = document.querySelectorAll(".color-list");

			colorButtons.forEach((colorButton) => {
				if (colorButton.classList.contains("show")) {
					colorButton.classList.remove("show");
				}
			});

			colorList.classList.add("show");
			colorList.innerHTML = "";

			for (const color in colors) {
				if (!colors[color]) continue;

				const colorButton = document.createElement("button");
				colorButton.classList.add("color");
				colorButton.classList.add(color);

				colorButton.addEventListener("click", (e) => {
					e.stopPropagation();

					selectedColor.classList.remove(selected);
					selected = color;
					selectedColor.classList.add(selected);
					colorList.classList.remove("show");

					switch (group) {
						case Group1:
							interaction.group1 = colors[color];
							break;

						case Group2:
							interaction.group2 = colors[color];
							break;
					}
				});

				colorList.appendChild(colorButton);
			}
		}
	});

	selector.appendChild(selectedColor);
	selector.appendChild(colorList);

	return selector;
}

function addInteraction(interaction: Interaction) {
	interactions.push(interaction);
	let isAttractionForce = true;
	const container = document.querySelector(".interaction-containers")!;

	const interactionContainer = document.createElement("div");
	interactionContainer.classList.add("interaction-container");

	const colors = document.createElement("div");
	colors.classList.add("colors");

	const color1 = colorSelector(interaction.group1[0].color, 0, interaction);
	const color2 = colorSelector(interaction.group2[0].color, 1, interaction);

	const liaison = document.createElement("h3");
	liaison.classList.add("setting");

	if (isAttractionForce) {
		liaison.textContent = "is attracted to";
	} else {
		liaison.textContent = "is repulsed by";
	}

	const close = document.createElement("button");
	close.classList.add("close");
	close.classList.add("interaction");
	close.textContent = "⨯";

	colors.appendChild(color1);
	colors.appendChild(liaison);
	colors.appendChild(color2);
	colors.appendChild(close);

	const forceContainer = document.createElement("div");
	forceContainer.classList.add("force-container");
	forceContainer.innerHTML = `<h4 class="setting">Force Type</h4><div class="force-types"><button class="force-type selected">Attraction</button><button class="force-type">Repulsion</button></div>`;

	const forceTypes = forceContainer.querySelectorAll(".force-type");

	forceTypes.forEach((forceType) => {
		forceType.addEventListener("click", () => {
			forceTypes.forEach((ft) => ft.classList.remove("selected"));
			forceType.classList.add("selected");

			isAttractionForce = forceType.textContent === "Attraction";

			if (isAttractionForce) {
				liaison.textContent = "is attracted to";
				interaction.options.g = -Math.abs(interaction.options.g!);
			} else {
				liaison.textContent = "is repulsed by";
				interaction.options.g = Math.abs(interaction.options.g!);
			}
		});
	});

	const intensityContainer = document.createElement("h4");
	intensityContainer.classList.add("setting");
	intensityContainer.innerHTML = `Intensity : <span class="setting-value">${DEFAULT_INTENSITY.toLocaleString(
		"en-US"
	)}</span>`;

	const intensityRange = document.createElement("div");
	intensityRange.classList.add("range");
	intensityRange.innerHTML = `<p class="value">${MIN_INTENSITY.toLocaleString(
		"en-US"
	)}</p><input class="range-content" type="range" min="${MIN_INTENSITY}" max="${MAX_INTENSITY}" step="${INTENSITY_STEP}" value="${DEFAULT_INTENSITY}"><p class="value">${MAX_INTENSITY.toLocaleString(
		"en-US"
	)}</p>`;

	const intensityInput = intensityRange.querySelector(
		"input"
	) as HTMLInputElement;

	intensityInput.addEventListener("input", () => {
		const value = parseInt(intensityInput.value);
		intensityContainer.innerHTML = `Intensity : <span class="setting-value">${value.toLocaleString(
			"en-US"
		)}</span>`;

		if (isAttractionForce) {
			interaction.options.g = -value / INTENSITY_DIVIDER;
		} else {
			interaction.options.g = value / INTENSITY_DIVIDER;
		}
	});

	const distanceContainer = document.createElement("h4");
	distanceContainer.classList.add("setting");
	distanceContainer.innerHTML = `Distance : <span class="setting-value">${DISTANCE_DEFAULT.toLocaleString(
		"en-US"
	)}</span>`;

	const distanceRange = document.createElement("div");
	distanceRange.classList.add("range");
	distanceRange.innerHTML = `<p class="value">${DISTANCE_MIN.toLocaleString(
		"en-US"
	)}</p><input class="range-content" type="range" min="${DISTANCE_MIN}" max="${DISTANCE_MAX}" step="${DISTANCE_STEP}" value="${DISTANCE_DEFAULT}"><p class="value">${DISTANCE_MAX.toLocaleString(
		"en-US"
	)}</p>`;

	const distanceInput = distanceRange.querySelector(
		"input"
	) as HTMLInputElement;

	distanceInput.addEventListener("input", () => {
		const value = parseInt(distanceInput.value);
		distanceContainer.innerHTML = `Distance : <span class="setting-value">${value.toLocaleString(
			"en-US"
		)}</span>`;

		interaction.options.distance = value;
	});

	close.addEventListener("click", () => {
		interactions = interactions.filter((itn) => itn !== interaction);
		container.removeChild(interactionContainer);
	});

	interactionContainer.appendChild(colors);
	interactionContainer.appendChild(forceContainer);
	interactionContainer.appendChild(intensityContainer);
	interactionContainer.appendChild(intensityRange);
	interactionContainer.appendChild(distanceContainer);
	interactionContainer.appendChild(distanceRange);

	container.appendChild(interactionContainer);
}

function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeGroup(
	number: number,
	color: string,
	options: { radius?: number }
) {
	const group: Particle[] = [];

	for (let i = 0; i < number; i++) {
		const particle = new Particle(
			randomInt(0, canvas.width),
			randomInt(0, canvas.height),
			color,
			options.radius ?? Particle.DEFAULT_RADIUS
		);

		group.push(particle);
		particles.push(particle);
	}

	return group;
}

function interaction(
	group1: Particle[],
	group2: Particle[],
	options: Options = {}
) {
	const g = options.g ?? 0.1;
	const distance = options.distance ?? 100;

	for (let i = 0; i < group1.length; i++) {
		let fx = 0;
		let fy = 0;

		for (let j = 0; j < group2.length; j++) {
			let a = group1[i];
			let b = group2[j];

			const dx = a.x - b.x;
			const dy = a.y - b.y;
			const d = Math.sqrt(dx * dx + dy * dy);

			if (d > 0 && d < distance) {
				const F = g / d;
				fx += F * dx;
				fy += F * dy;
			}

			a.vx = (a.vx + fx) * 0.5;
			a.vy = (a.vy + fy) * 0.5;
			a.x += a.vx * 0.01;
			a.y += a.vy * 0.01;
		}
	}
}

document.querySelector(".add.particle")?.addEventListener("click", () => {
	let color: string | null = null;

	for (const c in colors) {
		if (!colors[c]) {
			color = c;
			break;
		}
	}

	if (color) addColor(color);
});

document.querySelector(".add.interaction")?.addEventListener("click", () => {
	if (interactions.length >= MAX_INTERACTION_NUMBER) return;

	let color1: string | null = null;
	let color2: string | null = null;

	for (const c in colors) {
		if (colors[c]) {
			color1 = c;
			break;
		}
	}

	if (!color1) return;

	for (const c in colors) {
		if (colors[c] && c !== color1) {
			color2 = c;
			break;
		}
	}

	if (!color2) color2 = color1;

	const group1 = colors[color1];
	const group2 = colors[color2];
	if (!group1 || !group2) return;

	const intensity = DEFAULT_INTENSITY;
	const distance = 100;

	const options: Options = {
		distance,
		g: intensity / INTENSITY_DIVIDER,
	};

	const interaction: Interaction = {
		group1,
		group2,
		options,
	};

	addInteraction(interaction);
});

document.querySelector(".play-pause")?.addEventListener("click", () => {
	paused = !paused;

	const img = document.querySelector(".play-pause img") as HTMLImageElement;

	img.src = paused
		? "/assets/images/svg/play_arrow.svg"
		: "/assets/images/svg/pause.svg";
});

document.querySelector(".reset")?.addEventListener("click", () => {
	reset();
});

document.querySelector(".save")?.addEventListener("click", () => {
	const element = document.createElement("a");
	element.style.display = "none";
	element.download = `ps${Date.now()}.json`;

	element.setAttribute(
		"href",
		"data:text/plain;charset=utf-8," +
			encodeURIComponent(
				JSON.stringify([
					interactions.map((itn) => ({
						group1: itn.group1[0].color,
						group2: itn.group2[0].color,
						options: itn.options,
					})),
					Object.entries(colors)
						.filter(([_, v]) => v)
						.map(([k, _]) => ({
							color: k,
							number: colors[k]!.length,
						})),
				])
			)
	);

	element.click();
	element.remove();
});

document.querySelector(".load")?.addEventListener("click", () => {
	const element = document.createElement("input");
	element.style.display = "none";
	element.type = "file";
	element.accept = ".json";

	element.addEventListener("change", (e) => {
		const file = (e.target as HTMLInputElement).files![0];
		const reader = new FileReader();

		reader.addEventListener("load", (e) => {
			const [itn, groups] = JSON.parse(e.target!.result as string);

			interactions = [];
			particles = [];

			const particleContainer = document.querySelector(".particle-containers")!;

			const interactionContainer = document.querySelector(
				".interaction-containers"
			)!;

			particleContainer.innerHTML = "";
			interactionContainer.innerHTML = "";

			for (const group of groups) {
				addColor(group.color, false);

				colors[group.color] = makeGroup(group.number, group.color, {
					radius: Particle.DEFAULT_RADIUS,
				});
			}

			for (const it of itn) {
				const group1 = colors[it.group1];
				const group2 = colors[it.group2];

				if (!group1 || !group2) continue;

				addInteraction({
					group1,
					group2,
					options: it.options,
				});
			}
		});

		reader.readAsText(file);
	});

	element.click();
	element.remove();
});

document.querySelector(".minimize")?.addEventListener("click", () => {
	const gui = document.querySelector(".gui .content") as HTMLDivElement;
	gui.classList.toggle("minimized");
});

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	reset();
});

window.addEventListener("click", () => {
	document.querySelectorAll(".color-list").forEach((colorList) => {
		if (colorList.classList.contains("show")) {
			colorList.classList.remove("show");
		}
	});
});

addColor("red");
addColor("green");

addInteraction({
	group1: colors.red!,
	group2: colors.green!,
	options: {
		distance: DISTANCE_DEFAULT,
		g: -DEFAULT_INTENSITY / INTENSITY_DIVIDER,
	},
});

function animate() {
	if (!paused) {
		interactions.forEach((itn) =>
			interaction(itn.group1, itn.group2, itn.options)
		);
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	particles.forEach((particle) => particle.draw(ctx));
	return requestAnimationFrame(animate);
}

animate();
