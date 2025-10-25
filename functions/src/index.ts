/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {logger} from "../src/utils/logger";

setGlobalOptions({ maxInstances: 10 });

logger.info("functions ...");
export { onUserInterestChange } from "./triggers/userInterestTrigger";

