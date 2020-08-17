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

const Discord = require('discord.js');
const perspective = require('./perspective.js');

require('dotenv').config();

// Set your emoji "awards" here
// 'FLIRTATION': '💋',
// 'TOXICITY': '🧨',
// 'INSULT': '👊',
// 'INCOHERENT': '🤪',
// 'SPAM': '🐟',
const emojiMap = {
  'TOXICITY': '☣️',
  'SEVERE_TOXICITY': '☢️',
  'IDENTITY_ATTACK': '🤺',
  'INSULT': '👊',
  'PROFANITY': '🤬',
  'THREAT': '☠️'
};

// Store some state about user karma.
// TODO: Migrate to a DB, like Firebase
const users = {};

/**
 * Kick bad members out of the guild
 * @param {user} user - user to kick
 * @param {guild} guild - guild to kick user from
 */
async function kickBaddie(user, guild) {
  const member = guild.member(user);
  if (!member) return;
  try {
    await member.kick('Era um babaca');
  } catch (err) {
    console.log(`Não pude chutar o usuário ${user.username}: ${err}`);
  }
}

/**
 * Analyzes a user's message for attribues
 * and reacts to it.
 * @param {string} message - message the user sent
 * @return {bool} shouldKick - whether or not we should
 * kick the users
 */
async function evaluateMessage(message) {
  let scores;
  try {
    scores = await perspective.analyzeText(message.content);
  } catch (err) {
    console.log(err);
    return false;
  }

  const userid = message.author.id;

  for (const attribute in emojiMap) {
    if (scores[attribute]) {
      message.react(emojiMap[attribute]);
      users[userid][attribute] =
        users[userid][attribute] ?
          users[userid][attribute] + 1 : 1;
    }
  }
  // Return whether or not we should kick the user
  return (users[userid]['TOXICITY'] > process.env.KICK_THRESHOLD);
}

/**
 * Writes current user scores to the channel
 * @return {string} karma - printable karma scores
 */
function getKarma() {
  const scores = [];
  for (const user in users) {
    if (!Object.keys(users[user]).length) continue;
    let score = `<@${user}> - `;
    for (const attr in users[user]) {
      score += `${emojiMap[attr]} : ${users[user][attr]}\t`;
    }
    scores.push(score);
  }
  console.log(scores);
  if (!scores.length) {
    return '';
  }
  return scores.join('\n');
}

// Create an instance of a Discord client
const client = new Discord.Client();

client.on('ready', () => {
  console.log('Estou pronto!');
});

client.on('message', async (message) => {
  // Ignore messages that aren't from a guild
  // or are from a bot
  if (!message.guild || message.author.bot) return;

  // If we've never seen a user before, add them to memory
  const userid = message.author.id;
  if (!users[userid]) {
    users[userid] = [];
  }

  // Evaluate attributes of user's message
  let shouldKick = false;
  try {
    shouldKick = await evaluateMessage(message);
  } catch (err) {
    console.log(err);
  }
  if (shouldKick) {
    kickBaddie(message.author, message.guild);
    delete users[message.author.id];
    message.channel.send(`Chutei o usuário ${message.author.username} do canal`);
    return;
  }


  if (message.content.startsWith('!carma')) {
    const karma = getKarma(message);
    explanation = "Legenda:\n\n- ☣️: toxidade\n- ☢️: toxidade severa\n- 🤺: ataque à identidade\n- 👊: insulto\n- 🤬: afronta\n- ☠️: ameaça\n\nSuas ofensas:\n";
    message.channel.send(karma ? explanation + karma : 'Sem carma ainda!');
  }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(process.env.DISCORD_TOKEN);
