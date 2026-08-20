import 'dotenv/config';
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import * as schema from '../../src/db/schema';
import { DRIZZLE } from "src/db/db.provider";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from "passport-jwt";
import { eq } from "drizzle-orm";

interface JwtPayload{
    userId: string;
    role: string;
}

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'auth'){

    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || ""
        });
        console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
    }

    async validate(payload: JwtPayload) {
        const { userId, role } = payload;

        const [user] = await this.db
         .select()
         .from(schema.users)
         .where(
            eq(schema.users.id, userId)
         );
        
        if(!user){
            throw new UnauthorizedException("Unauthorized Request");
        }
        if(user.role !== role){
            throw new UnauthorizedException("Token corrupted")
        }
        return user;
    }
}