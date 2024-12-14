import { google } from 'googleapis';
import { errorHandler } from "../util/error.js";
const DISCOVERY_URL =
  'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';

export const perspectiveMiddleware = async (req, res, next) => {
  try {
    const client = await google.discoverAPI(DISCOVERY_URL);

    const analyzeRequest = {
      comment: {
        text: req.body.content,
      },
      requestedAttributes: {
        TOXICITY: {},
      },
    };

    client.comments.analyze(
      {
        key: process.env.PERSPECTIVE_API_KEY,
        resource: analyzeRequest,
      },
      (err, response) => {
        if (err) {
          return next(errorHandler(404,'Error analyzing comment toxicity.'));
        }
        console.log(response?.data?.attributeScores);
        const toxicityScore =
          response?.data?.attributeScores?.TOXICITY?.summaryScore?.value;

        if (toxicityScore === undefined) {
          return next(errorHandler(404,'Failed to retrieve toxicity score.'));
        }

        if (toxicityScore < 0.65) {
          next();
        } else {
          res.status(400).json({
            status:"comment can't be posted",
            message: 'To maintain a positive environment, comments with harmful or offensive language are not permitted. Please revise.',
          });
        }
      }
    );
  } catch (err) {
    next(errorHandler(404,'Error connecting to Perspective API.'));
  }
};
