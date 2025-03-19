export interface Screenshot {
    image: string;
    route: string;
    buttonDescription: string;
}

export interface NavItem {
    title: string;
    description: string;
    screenshots: Screenshot[];
}
