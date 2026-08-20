import { Injectable, CanActivate, ExecutionContext, BadRequestException, ForbiddenException,  } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleGuard implements CanActivate{

    constructor(private reflector: Reflector){}
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles',[
            context.getHandler(), context.getClass()
        ]);

        if(!requiredRoles){
            throw new BadRequestException('This is not valid');
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        
        if(!user || !user.role){
            throw new ForbiddenException('Access denied: User roles not found');
        }

        //we are going to check if user has atleast one matching role
        const hasRole = requiredRoles.some((role) => user.role.includes(role));
        
        if(!hasRole){
            throw new ForbiddenException('Access denied: Insufficient permission');
        }
        return true
    }
}