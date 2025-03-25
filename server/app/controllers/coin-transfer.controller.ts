import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../services/auth/user.service';

interface TransferCoinsDto {
    senderId: string;
    recipientId: string;
    amount: number;
}

@Controller('coin-transfer')
export class CoinTransferController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async transferCoins(@Body() transferData: TransferCoinsDto) {
        return this.userService.transferCoins(transferData.senderId, transferData.recipientId, transferData.amount);
    }
}
