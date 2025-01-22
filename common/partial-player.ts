export interface PartialPlayer {
    name: string;
    points: number;
    isInGame: boolean;
    interacted: boolean;
    submitted: boolean;
    canChat: boolean;
}

export interface PlayerResult {
    name: string;
    points: number;
    isInGame: boolean;
    noBonusesObtained: number;
}
