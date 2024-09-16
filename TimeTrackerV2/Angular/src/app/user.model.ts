export class User {
    userID?: number;
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    type?: string;
    isActive?: boolean;
    isApproved?: boolean; // Instructor Approval 
    salt?: string;
}