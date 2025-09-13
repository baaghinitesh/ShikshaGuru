import { Request, Response } from 'express';
export declare const searchTeachers: (req: Request, res: Response) => Promise<void>;
export declare const searchJobs: (req: Request, res: Response) => Promise<void>;
export declare const getNearbyResults: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLocationSuggestions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=searchController.d.ts.map