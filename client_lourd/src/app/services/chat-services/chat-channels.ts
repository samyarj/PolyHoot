export interface ChatChannel {
    name: string;
    isUserInChannel: boolean;
}

export function chatChannelFromJson(json: any, currentUserId: string): ChatChannel {
    const users: string[] = json.users || [];
    const isUserInChannel = users.includes(currentUserId);
    return {
        name: json.name,
        isUserInChannel: isUserInChannel,
    };
}