var _a, _b, _c, _d, _e, _f, _g;
var SLIDER_MIN = 50;
var SLIDER_MAX = 1000;
var SLIDER_STEP = 50;
var SLIDER_DEFAULT = 350;
var MAX_INTERACTION_NUMBER = 20;
var MIN_INTENSITY = 1;
var MAX_INTENSITY = 1000;
var DEFAULT_INTENSITY = 100;
var INTENSITY_STEP = 1;
var INTENSITY_DIVIDER = 10000;
var DISTANCE_MIN = 10;
var DISTANCE_MAX = 500;
var DISTANCE_STEP = 10;
var DISTANCE_DEFAULT = 200;
var DEFAULT_SPEED = 500;
var DEFAULT_SPEED_DIVIDER = 1000;
var Group1 = 0;
var Group2 = 1;
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var Particle = /** @class */ (function () {
    function Particle(x, y, color, radius) {
        this.vx = 0;
        this.vy = 0;
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
    }
    Particle.prototype.draw = function (ctx) {
        ctx.fillStyle = ColorsHex[this.color];
        ctx.fillRect(this.x, this.y, this.radius, this.radius);
    };
    Particle.DEFAULT_RADIUS = 5;
    return Particle;
}());
var speed = DEFAULT_SPEED / DEFAULT_SPEED_DIVIDER;
var paused = true;
var particles = [];
var interactions = [];
var ColorsHex = Object.freeze({
    red: "#f91d4d",
    green: "#0db342",
    blue: "#4a4ad7",
    yellow: "#f0e246",
    magenta: "#d742d7",
    cyan: "#42cedb",
});
var colors = {
    red: null,
    green: null,
    blue: null,
    yellow: null,
    magenta: null,
    cyan: null,
};
function reset() {
    particles.forEach(function (particle) {
        particle.x = randomInt(0, canvas.width);
        particle.y = randomInt(0, canvas.height);
    });
    paused = true;
    var img = document.querySelector(".play-pause img");
    img.src = "assets/images/svg/play_arrow.svg";
}
function addColor(color, autoGroup) {
    if (autoGroup === void 0) { autoGroup = true; }
    if (autoGroup)
        colors[color] = makeGroup(350, color, { radius: Particle.DEFAULT_RADIUS });
    var container = document.querySelector(".particle-containers");
    var particle = document.createElement("div");
    particle.classList.add("particle-container");
    particle.classList.add(color);
    var head = document.createElement("div");
    head.classList.add("container-head");
    head.innerHTML = "<div class=\"color\"></div><h3 class=\"sublabel\">".concat(color, "</h3><button class=\"close particle\">\u2A2F</button>");
    var close = head.querySelector(".close");
    close.addEventListener("click", function () {
        particles = particles.filter(function (p) { return p.color !== color; });
        colors[color] = null;
        container.removeChild(particle);
        interactions = interactions.filter(function (itn) {
            var _a, _b, _c, _d;
            if (itn.group1[0].color === color || itn.group2[0].color === color) {
                (_d = (_c = (_b = (_a = document
                    .querySelector(".interaction-container .colors .color.".concat(color))) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement) === null || _c === void 0 ? void 0 : _c.parentElement) === null || _d === void 0 ? void 0 : _d.remove();
                return false;
            }
            return true;
        });
    });
    var particleSetting = document.createElement("h4");
    particleSetting.classList.add("setting");
    particleSetting.innerHTML = "Particle number : <span class=\"setting-value\">".concat(SLIDER_DEFAULT.toLocaleString("en-US"), "</span>");
    var range = document.createElement("div");
    range.classList.add("range");
    range.innerHTML = "<p class=\"value\">".concat(SLIDER_MIN.toLocaleString("en-US"), "</p><input class=\"range-content\" type=\"range\" min=\"").concat(SLIDER_MIN, "\" max=\"").concat(SLIDER_MAX, "\" step=\"").concat(SLIDER_STEP, "\" value=\"").concat(SLIDER_DEFAULT, "\"><p class=\"value\">").concat(SLIDER_MAX.toLocaleString("en-US"), "</p>");
    var input = range.querySelector("input");
    input.addEventListener("input", function () {
        var value = parseInt(input.value);
        particleSetting.innerHTML = "Particle number : <span class=\"setting-value\"Z>".concat(value.toLocaleString("en-US"), "</span>");
        particles = particles.filter(function (p) { return p.color !== color; });
        colors[color] = makeGroup(value, color, {
            radius: Particle.DEFAULT_RADIUS,
        });
        interactions = interactions.map(function (itn) {
            if (itn.group1[0].color === color) {
                itn.group1 = colors[color];
            }
            else if (itn.group2[0].color === color) {
                itn.group2 = colors[color];
            }
            return itn;
        });
    });
    particle.appendChild(head);
    particle.appendChild(particleSetting);
    particle.appendChild(range);
    container.appendChild(particle);
}
function colorSelector(selected, group, interaction) {
    var selector = document.createElement("div");
    selector.classList.add("color-selector");
    var selectedColor = document.createElement("button");
    selectedColor.classList.add("color");
    selectedColor.classList.add(selected);
    var colorList = document.createElement("div");
    colorList.classList.add("color-list");
    selectedColor.addEventListener("click", function (e) {
        e.stopPropagation();
        if (colorList.classList.contains("show")) {
            colorList.classList.remove("show");
        }
        else {
            var colorButtons = document.querySelectorAll(".color-list");
            colorButtons.forEach(function (colorButton) {
                if (colorButton.classList.contains("show")) {
                    colorButton.classList.remove("show");
                }
            });
            colorList.classList.add("show");
            colorList.innerHTML = "";
            var _loop_1 = function (color) {
                if (!colors[color])
                    return "continue";
                var colorButton = document.createElement("button");
                colorButton.classList.add("color");
                colorButton.classList.add(color);
                colorButton.addEventListener("click", function (e) {
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
            };
            for (var color in colors) {
                _loop_1(color);
            }
        }
    });
    selector.appendChild(selectedColor);
    selector.appendChild(colorList);
    return selector;
}
function addInteraction(interaction) {
    interactions.push(interaction);
    var isAttractionForce = true;
    var container = document.querySelector(".interaction-containers");
    var interactionContainer = document.createElement("div");
    interactionContainer.classList.add("interaction-container");
    var colors = document.createElement("div");
    colors.classList.add("colors");
    var color1 = colorSelector(interaction.group1[0].color, 0, interaction);
    var color2 = colorSelector(interaction.group2[0].color, 1, interaction);
    var liaison = document.createElement("h3");
    liaison.classList.add("setting");
    if (isAttractionForce) {
        liaison.textContent = "is attracted to";
    }
    else {
        liaison.textContent = "is repulsed by";
    }
    var close = document.createElement("button");
    close.classList.add("close");
    close.classList.add("interaction");
    close.textContent = "⨯";
    colors.appendChild(color1);
    colors.appendChild(liaison);
    colors.appendChild(color2);
    colors.appendChild(close);
    var forceContainer = document.createElement("div");
    forceContainer.classList.add("force-container");
    forceContainer.innerHTML = "<h4 class=\"setting\">Force Type</h4><div class=\"force-types\"><button class=\"force-type selected\">Attraction</button><button class=\"force-type\">Repulsion</button></div>";
    var forceTypes = forceContainer.querySelectorAll(".force-type");
    forceTypes.forEach(function (forceType) {
        forceType.addEventListener("click", function () {
            forceTypes.forEach(function (ft) { return ft.classList.remove("selected"); });
            forceType.classList.add("selected");
            isAttractionForce = forceType.textContent === "Attraction";
            if (isAttractionForce) {
                liaison.textContent = "is attracted to";
                interaction.options.g = -Math.abs(interaction.options.g);
            }
            else {
                liaison.textContent = "is repulsed by";
                interaction.options.g = Math.abs(interaction.options.g);
            }
        });
    });
    var intensityContainer = document.createElement("h4");
    intensityContainer.classList.add("setting");
    intensityContainer.innerHTML = "Intensity : <span class=\"setting-value\">".concat(DEFAULT_INTENSITY.toLocaleString("en-US"), "</span>");
    var intensityRange = document.createElement("div");
    intensityRange.classList.add("range");
    intensityRange.innerHTML = "<p class=\"value\">".concat(MIN_INTENSITY.toLocaleString("en-US"), "</p><input class=\"range-content\" type=\"range\" min=\"").concat(MIN_INTENSITY, "\" max=\"").concat(MAX_INTENSITY, "\" step=\"").concat(INTENSITY_STEP, "\" value=\"").concat(DEFAULT_INTENSITY, "\"><p class=\"value\">").concat(MAX_INTENSITY.toLocaleString("en-US"), "</p>");
    var intensityInput = intensityRange.querySelector("input");
    intensityInput.addEventListener("input", function () {
        var value = parseInt(intensityInput.value);
        intensityContainer.innerHTML = "Intensity : <span class=\"setting-value\">".concat(value.toLocaleString("en-US"), "</span>");
        if (isAttractionForce) {
            interaction.options.g = -value / INTENSITY_DIVIDER;
        }
        else {
            interaction.options.g = value / INTENSITY_DIVIDER;
        }
    });
    var distanceContainer = document.createElement("h4");
    distanceContainer.classList.add("setting");
    distanceContainer.innerHTML = "Distance : <span class=\"setting-value\">".concat(DISTANCE_DEFAULT.toLocaleString("en-US"), "</span>");
    var distanceRange = document.createElement("div");
    distanceRange.classList.add("range");
    distanceRange.innerHTML = "<p class=\"value\">".concat(DISTANCE_MIN.toLocaleString("en-US"), "</p><input class=\"range-content\" type=\"range\" min=\"").concat(DISTANCE_MIN, "\" max=\"").concat(DISTANCE_MAX, "\" step=\"").concat(DISTANCE_STEP, "\" value=\"").concat(DISTANCE_DEFAULT, "\"><p class=\"value\">").concat(DISTANCE_MAX.toLocaleString("en-US"), "</p>");
    var distanceInput = distanceRange.querySelector("input");
    distanceInput.addEventListener("input", function () {
        var value = parseInt(distanceInput.value);
        distanceContainer.innerHTML = "Distance : <span class=\"setting-value\">".concat(value.toLocaleString("en-US"), "</span>");
        interaction.options.distance = value;
    });
    close.addEventListener("click", function () {
        interactions = interactions.filter(function (itn) { return itn !== interaction; });
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
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function makeGroup(number, color, options) {
    var _a;
    var group = [];
    for (var i = 0; i < number; i++) {
        var particle = new Particle(randomInt(0, canvas.width), randomInt(0, canvas.height), color, (_a = options.radius) !== null && _a !== void 0 ? _a : Particle.DEFAULT_RADIUS);
        group.push(particle);
        particles.push(particle);
    }
    return group;
}
function interaction(group1, group2, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var g = (_a = options.g) !== null && _a !== void 0 ? _a : 0.1;
    var distance = (_b = options.distance) !== null && _b !== void 0 ? _b : 100;
    for (var i = 0; i < group1.length; i++) {
        var fx = 0;
        var fy = 0;
        for (var j = 0; j < group2.length; j++) {
            var a = group1[i];
            var b = group2[j];
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d > 0 && d < distance) {
                var F = g / d;
                fx += F * dx;
                fy += F * dy;
            }
            a.vx = (a.vx + fx) * 0.5;
            a.vy = (a.vy + fy) * 0.5;
            a.x += a.vx * speed;
            a.y += a.vy * speed;
        }
    }
}
(_a = document.querySelector(".add.particle")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
    var color = null;
    for (var c in colors) {
        if (!colors[c]) {
            color = c;
            break;
        }
    }
    if (color)
        addColor(color);
});
(_b = document.querySelector(".add.interaction")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
    if (interactions.length >= MAX_INTERACTION_NUMBER)
        return;
    var color1 = null;
    var color2 = null;
    for (var c in colors) {
        if (colors[c]) {
            color1 = c;
            break;
        }
    }
    if (!color1)
        return;
    for (var c in colors) {
        if (colors[c] && c !== color1) {
            color2 = c;
            break;
        }
    }
    if (!color2)
        color2 = color1;
    var group1 = colors[color1];
    var group2 = colors[color2];
    if (!group1 || !group2)
        return;
    var intensity = DEFAULT_INTENSITY;
    var distance = 100;
    var options = {
        distance: distance,
        g: intensity / INTENSITY_DIVIDER,
    };
    var interaction = {
        group1: group1,
        group2: group2,
        options: options,
    };
    addInteraction(interaction);
});
var speedRange = document.querySelector(".range-content.speed");
speedRange.addEventListener("input", function () {
    var value = parseInt(speedRange.value);
    speed = value / DEFAULT_SPEED_DIVIDER;
    document.querySelector(".setting-value.speed").textContent =
        value.toLocaleString("en-US");
});
(_c = document.querySelector(".play-pause")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () {
    paused = !paused;
    var img = document.querySelector(".play-pause img");
    img.src = paused
        ? "assets/images/svg/play_arrow.svg"
        : "assets/images/svg/pause.svg";
});
(_d = document.querySelector(".reset")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function () {
    reset();
});
(_e = document.querySelector(".save")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", function () {
    var element = document.createElement("a");
    element.style.display = "none";
    element.download = "ps".concat(Date.now(), ".json");
    element.setAttribute("href", "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify([
            interactions.map(function (itn) { return ({
                group1: itn.group1[0].color,
                group2: itn.group2[0].color,
                options: itn.options,
            }); }),
            Object.entries(colors)
                .filter(function (_a) {
                var _ = _a[0], v = _a[1];
                return v;
            })
                .map(function (_a) {
                var k = _a[0], _ = _a[1];
                return ({
                    color: k,
                    number: colors[k].length,
                });
            }),
        ])));
    element.click();
    element.remove();
});
(_f = document.querySelector(".load")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", function () {
    var element = document.createElement("input");
    element.style.display = "none";
    element.type = "file";
    element.accept = ".json";
    element.addEventListener("change", function (e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.addEventListener("load", function (e) {
            var _a = JSON.parse(e.target.result), itn = _a[0], groups = _a[1];
            interactions = [];
            particles = [];
            var particleContainer = document.querySelector(".particle-containers");
            var interactionContainer = document.querySelector(".interaction-containers");
            particleContainer.innerHTML = "";
            interactionContainer.innerHTML = "";
            for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                var group = groups_1[_i];
                addColor(group.color, false);
                colors[group.color] = makeGroup(group.number, group.color, {
                    radius: Particle.DEFAULT_RADIUS,
                });
            }
            for (var _b = 0, itn_1 = itn; _b < itn_1.length; _b++) {
                var it = itn_1[_b];
                var group1 = colors[it.group1];
                var group2 = colors[it.group2];
                if (!group1 || !group2)
                    continue;
                addInteraction({
                    group1: group1,
                    group2: group2,
                    options: it.options,
                });
            }
        });
        reader.readAsText(file);
    });
    element.click();
    element.remove();
});
(_g = document.querySelector(".minimize")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", function () {
    var gui = document.querySelector(".gui .content");
    gui.classList.toggle("minimized");
});
window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    reset();
});
window.addEventListener("click", function () {
    document.querySelectorAll(".color-list").forEach(function (colorList) {
        if (colorList.classList.contains("show")) {
            colorList.classList.remove("show");
        }
    });
});
addColor("red");
addColor("green");
addInteraction({
    group1: colors.red,
    group2: colors.green,
    options: {
        distance: DISTANCE_DEFAULT,
        g: -DEFAULT_INTENSITY / INTENSITY_DIVIDER,
    },
});
function animate() {
    if (!paused) {
        interactions.forEach(function (itn) {
            return interaction(itn.group1, itn.group2, itn.options);
        });
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (particle) { return particle.draw(ctx); });
    return requestAnimationFrame(animate);
}
animate();
