import {setGlobalOptions} from "firebase-functions";

setGlobalOptions({ maxInstances: 10 });

export { onUserCreate } from "./triggers/newUserTrigger";
export { scheduledNewsDiscovery } from "./triggers/scheduledNewsTrigger";
export { onUserInterestChange } from "./triggers/userInterestTrigger";
export { onUserGoalsChange } from "./triggers/userGoalsTrigger";