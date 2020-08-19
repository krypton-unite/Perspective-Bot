/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Example usage of some features of the Perspective API */
import dotenv from 'dotenv';
import * as google from 'googleapis';

dotenv.config();

// Some supported attributes
// attributes = ["TOXICITY", "SEVERE_TOXICITY", "IDENTITY_ATTACK", "INSULT",
// "PROFANITY", "THREAT", "SEXUALLY_EXPLICIT", "FLIRTATION", "SPAM",
// "ATTACK_ON_AUTHOR", "ATTACK_ON_COMMENTER", "INCOHERENT",
// "INFLAMMATORY", "OBSCENE", "SPAM", "UNSUBSTANTIAL"];

// Set your own thresholds for when to trigger a response
// 'INSULT': 0.75,
// 'TOXICITY': 0.75,
// 'SPAM': 0.75,
// 'INCOHERENT': 0.75,
// 'FLIRTATION': 0.75,
const attributeThresholds = {
  'TOXICITY': 0.75,
  'SEVERE_TOXICITY': 0.75,
  'IDENTITY_ATTACK': 0.75,
  'INSULT': 0.75,
  'PROFANITY': 0.75,
  'THREAT': 0.75,
};

/**
 * Analyze attributes in a block of text
 * @param {string} text - text to analyze
 * @return {json} res - analyzed atttributes
 */
async function analyzeText(text) {
  const analyzer = new google.commentanalyzer_v1alpha1.Commentanalyzer();

  // This is the format the API expects
  const requestedAttributes = {};
  for (const key in attributeThresholds) {
    requestedAttributes[key] = {};
  }

  const req = {
    comment: { text: text },
    languages: ['pt'],
    requestedAttributes: requestedAttributes,
  };

  const res = await analyzer.comments.analyze({
    key: process.env.PERSPECTIVE_API_KEY,
    resource: req
  });

  let data = {};

  for (const key in res['data']['attributeScores']) {
    data[key] =
      res['data']['attributeScores'][key]['summaryScore']['value'] >
      attributeThresholds[key];
  }
  return data;
}

export default analyzeText;
