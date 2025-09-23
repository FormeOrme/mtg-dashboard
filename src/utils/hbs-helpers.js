function getCurrentWeekEpoch() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

export function getImgUrl(oracleId) {
    if (!oracleId) return "";

    // return `https://api.scryfall.com/cards/${oracleId}?format=image&version=normal`;
    return `https://cards.scryfall.io/normal/front/${oracleId.charAt(0)}/${oracleId.charAt(
        1,
    )}/${oracleId}.jpg?${getCurrentWeekEpoch()}`;
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
    const horizontalPadding = (widthPerCard - widthPerImg) / (commanderCount - 1);

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
