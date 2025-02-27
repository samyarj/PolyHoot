export interface PartialPlayer {
    name: string;
    points: number;
    isInGame: boolean;
    submitted: boolean;
}

export interface PlayerResult {
    name: string;
    points: number;
    isInGame: boolean;
    noBonusesObtained: number;
}
