import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
    imports: [UsersModule],
    providers: [{
        provide: APP_GUARD,
        useClass: AuthGuard,
    }]
})
export class AuthModule {}
