/**
 * Get a timestamp that changes every week, used to force image reloads weekly.
 * @returns {number} A timestamp representing the start of the current week.
 */
function getCurrentWeekTimestamp() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return startOfWeek.getTime();
}

export function getImgUrl(oracleId) {
    if (!oracleId) return "";

    // return `https://api.scryfall.com/cards/${oracleId}?format=image&version=normal`;
    return `https://cards.scryfall.io/normal/front/${oracleId.charAt(0)}/${oracleId.charAt(
        1,
    )}/${oracleId}.jpg?${getCurrentWeekTimestamp()}`;
}

export function getCardSvg(images, hbs) {
    if (!images) {
        return "ERROR NO IMAGES";
    }
    if (!Array.isArray(images)) {
        images = [
            {
                card: images,
                url: images.img_url,
            },
        ];
    }
    if (images.length === 0) {
        return "ERROR EMPTY IMAGES";
    }
    const zoom = 3;
    const widthPerCard = 63 * zoom;
    const heightPerCard = 88 * zoom;
    const commanderCount = images.length;

    const verticalPadding = 9 * zoom;
    const heightPerImg = heightPerCard - (commanderCount - 1) * verticalPadding;
    const ratio = heightPerImg / heightPerCard;
    const widthPerImg = widthPerCard * ratio;
    const horizontalPadding =
        commanderCount == 1 ? 0 : (widthPerCard - widthPerImg) / (commanderCount - 1);

    const borderRadius = 3 * zoom * ratio;

    const imgList = images
        .map(({ card, url }, index) => {
            const escapedUrl = url.replace(/&/g, "&amp;").replace(/\?/g, "&quest;");
            const clipId = `clip-path-${commanderCount}-${
                card ? card.card_id : "unknown"
            }-${index}`;
            return `<clipPath id="${clipId}">
                <rect
                    x="${index * horizontalPadding}"
                    y="${index * verticalPadding}"
                    width="${widthPerImg}"
                    height="${heightPerImg}"
                    rx="${borderRadius}"
                    ry="${borderRadius}"
                />
            </clipPath>
            <image
                href="${escapedUrl}"
                x="${index * horizontalPadding}"
                y="${index * verticalPadding}"
                width="${widthPerImg}"
                height="${heightPerImg}"
                clip-path="url(#${clipId})"
            />
        `;
        })
        .join("");

    const svg = `<svg
        width="${widthPerCard}"
        height="${heightPerCard}"
        viewBox="0 0 ${widthPerCard} ${heightPerCard}"
        xmlns="http://www.w3.org/2000/svg"
    >${imgList}</svg>`;

    return new hbs.SafeString(svg);
}

import { COLOR_MAP } from "./color.js";

export function getColorSvg(colors, hbs) {
    if (!colors || colors.length === 0) {
        colors = "C";
    }
    if (typeof colors === "string") {
        colors = colors.split("");
    }

    const side = 24;

    //each color combination is represented as a square with rounded corners
    // if there is only one color, the square is of that color.
    // if there are multiple colors, the colors are represented as a pie chart inside the square.

    let svg = `<svg
        width="${side}"
        height="${side}"
        viewBox="0 0 ${side} ${side}"
        xmlns="http://www.w3.org/2000/svg"
    >`;

    if (colors.length === 1) {
        const color = COLOR_MAP[colors[0]] || COLOR_MAP["C"];
        svg += `<rect
            x="0"
            y="0"
            width="${side}"
            height="${side}"
            rx="4"
            ry="4"
            fill="${color}"
        />`;
    } else {
        const center = side / 2;
        const radius = side;
        const anglePerColor = (2 * Math.PI) / colors.length;

        // Create mask for rounded rectangle
        const maskId = `mask-${Math.random().toString(36).substr(2, 9)}`;
        svg += `<defs>
            <mask id="${maskId}">
                <rect
                    x="0"
                    y="0"
                    width="${side}"
                    height="${side}"
                    rx="4"
                    ry="4"
                    fill="white"
                />
            </mask>
        </defs>`;

        // Create pie chart within the mask
        svg += `<g mask="url(#${maskId})">`;
        colors.forEach((colorKey, index) => {
            const color = COLOR_MAP[colorKey] || COLOR_MAP["C"];
            const startAngle = index * anglePerColor - Math.PI / 2 + Math.PI / 4;
            const endAngle = startAngle + anglePerColor;
            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);
            const largeArcFlag = anglePerColor > Math.PI ? 1 : 0;
            svg += `<path
                d="M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z"
                fill="${color}"
            />`;
        });
        svg += `</g>`;
    }
    svg += `</svg>`;

    return new hbs.SafeString(svg);
}

export function eq(a, b) {
    return a === b;
}
