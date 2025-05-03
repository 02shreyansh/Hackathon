import { NextFunction, Request, Response } from "express";
import { APIError, AuthorizeError, NotFoundError, VerifyAccessToken } from "../utils";
import { authService } from "../api/auth.route";
interface User{
  id:number;
  first_name:string | null;
  last_name:string | null;
  email:string;
  phone_number:string | null;
  company_name:string ;
  profilePicture:string | null;
  role:"user"|"admin";
}
declare global{
  namespace Express {
    interface Request {
      user?:User;
    }
  }
}
const Authenticate = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken as string;
    if (!accessToken) {
      throw new AuthorizeError("User is not authenticated")
    }
    const decoded = VerifyAccessToken(accessToken) as User | null;
    if (!decoded) {
      throw new APIError("Invalid access token")
    }
    const user = await authService.validateUser(decoded.email);
    if (!user) {
      throw new NotFoundError("User not found")
    }
    const mergedUser: User = {
      id:user.id,
      first_name:user.first_name,
      last_name:user.last_name,
      email:user.email,
      company_name:user.Company_Name,
      phone_number:user.phone_number,
      profilePicture:user.profile_picture,
      role:user.role
    };
    req.user=mergedUser;
    next();
  } catch (error) {
    if(error instanceof AuthorizeError){
      throw new AuthorizeError("User is not authenticated")
    }else if(error instanceof NotFoundError){
      throw new NotFoundError("User not found")
    }else if(error instanceof APIError){
      throw new APIError("Invalid access token")
    }
    throw new APIError("Something went wrong while authenticating user")
  }
};

export default Authenticate;
