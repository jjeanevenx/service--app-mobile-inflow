import {setGlobalOptions} from 'firebase-functions';
import * as dotenv from 'dotenv';
dotenv.config();

setGlobalOptions({maxInstances: 10, region: 'southamerica-east1'});
export {onUserCreate} from './triggers/newUserTrigger';
export {scheduledNewsDiscovery} from './triggers/scheduledNewsTrigger';
export {onUserInterestChange} from './triggers/userInterestTrigger';
export {onUserGoalsChange} from './triggers/userGoalsTrigger';
