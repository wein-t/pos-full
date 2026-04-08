export const getBgColor = () => {
    const bgarr = [
        "#2D333B", // Charcoal
        "#222831", // Gunmetal
        "#1A2238", // Deep Navy
        "#181A20", // Rich Black
        "#282C34", // Graphite
    ];
    const randomBg = Math.floor(Math.random() * bgarr.length);
    const color = bgarr[randomBg];
    return color;
}

export const getAvatarName = (name) => {
    if(!name) return "";

    return name.split(" ").map(word => word[0]).join("").toUpperCase();
}

export const formatDate = (date) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
    };