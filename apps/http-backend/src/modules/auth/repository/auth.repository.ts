import { injectable, singleton } from "tsyringe";

import type { CreateUser, User } from "../../../types";
import { prismaClient } from "store/client";

export interface IAuthRepository {
    createUser( createUserSchema: CreateUser ): Promise<User>;
    findByEmail( email: string ): Promise<User | null>;
    findById( userId: string ): Promise<User | null>;
}

@singleton()
@injectable()
export class AuthRespository implements IAuthRepository {
    
    async createUser(createUserSchema: CreateUser): Promise<User> {

        return await prismaClient.user.create({
            data: createUserSchema
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        
        return await prismaClient.user.findUnique({
            where: {
                email
            }
        });
    
    }

    async findById(userId: string): Promise<User | null> {
        
        return await prismaClient.user.findUnique({
            where: {
                user_id: userId
            }
        });
    }
}