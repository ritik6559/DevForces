import type { CreateUser, User } from "common-types";
import { prismaClient } from "store/client";

export interface IAuthRepository {
    createUser( createUserSchema: CreateUser ): Promise<User>;
    findByEmail( email: string ): Promise<User | null>;
    findById( userId: string ): Promise<User | null>;
}

export class AuthRespository implements IAuthRepository {
    
    async createUser(createUserSchema: CreateUser): Promise<User> {

        return await prismaClient.user.create({
            data: {
                email: createUserSchema.email,
                username: createUserSchema.username,
                role: "USER"
            }
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