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

import mongo_client from './mongo_driver';
import analyzeText from './perspective.js';
import dotenv from 'dotenv';
import Discord from 'discord.js';
dotenv.config();

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!');
}

const emojiMap = {
  'TOXICITY': '☣️',
  'SEVERE_TOXICITY': '☢️',
  'IDENTITY_ATTACK': '🤺',
  'INSULT': '👊',
  'PROFANITY': '🤬',
  'THREAT': '☠️'
};

const get_true_scores_only = (scores) => {
  Object.keys(scores).forEach((key) => (scores[key] == false) && delete scores[key]);
  return Object.keys(scores);
};

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

const countOccurrences = (offences, val) => offences.reduce((a, v) => (v === val ? a + 1 : a), 0);

mongo_client.connect_mongo_client(async (err, db_client) => {

  if (err) throw err;

  const perspective_bot_db = db_client.db("perspective_bot_db");
  let offence_records = perspective_bot_db.collection('offence_records');
  let robot_memory = perspective_bot_db.collection('robot_memory');

  let intervalID = setInterval((() => {
    let date = new Date();
    const twentyFourHoursAgo = date.setDate(date.getDate() - 1);
    offence_records.deleteMany( { timestamp: { $lt: + twentyFourHoursAgo } } );
  }), 60000); 

  const get_user_offence_count = async (userid, offence) => {
      let query = { offending_user: userid }
      const registered_offence_records = await offence_records.find(query).toArray();
      if (registered_offence_records == 0)
        return 0;
      const offences_matrix = registered_offence_records.map(registered_offence_record => registered_offence_record['offences']);
      const offences = offences_matrix.reduce((a, b) => a.concat(b));
      return countOccurrences(offences, offence)
  };

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
      scores = await analyzeText(message.content);
    } catch (err) {
      console.log(err);
      return false;
    }
    const userid = message.author.id;


    const detected_offences = get_true_scores_only(scores);
    if (detected_offences.length){
      await offence_records.insertOne({ timestamp: + new Date(), offending_user: userid, offences: detected_offences});
      detected_offences.map((detected_offence) => (message.react(emojiMap[detected_offence])));
      return (await get_user_offence_count(userid, 'TOXICITY') > process.env.KICK_THRESHOLD);
    }
    return false
    // Return whether or not we should kick the user
  }

  /**
   * Writes current user scores to the channel
   * @return {string} karma - printable karma scores
   */
  const getKarma = async (userid) => {
    const get_user_karma = async (userid) => {
      let user_karma= {}
      let promises = Object.keys(emojiMap).map(async key => {
        const count = await get_user_offence_count(userid, key);
        if (count > 0){
          Object.assign(
            user_karma,
            {[key]: count}
          );
        }
      });
      await Promise.all(promises);
      return user_karma;
    }
    const user_karma = await get_user_karma(userid);
    let reactions = ''
    Object.entries(user_karma).map(entry => reactions += `${emojiMap[entry[0]]} : ${entry[1]}\t`)
    console.log(reactions);
    return reactions;
  }

  // Create an instance of a Discord client
  const client = new Discord.Client();

  client.on('ready', () => {
    console.log('Estou pronto!');
  });

  // robot_memory.insertOne({ _id: 'my_creator', creator: 'the_creator'});
  let robot_creator_record = await robot_memory.findOne({ _id: 'my_creator' });
  let robot_creator;
  if (robot_creator_record != null){
    robot_creator = robot_creator_record['creator_id'];
  }
  client.on('message', async (message) => {
    // Ignore messages that aren't from a guild
    // or are from a bot
    if (!message.guild || message.author.bot) return;

    // Evaluate attributes of user's message
    let shouldKick = false;
    try {
      shouldKick = await evaluateMessage(message);
    } catch (err) {
      console.log(err);
    }
    if (shouldKick) {
      kickBaddie(message.author, message.guild);
      message.channel.send(`Chutei o usuário <@${message.author.id}> do canal`);
      return;
    }

    if (message.content.startsWith('!carma')) {
      const karma = await getKarma(message.author.id);
      const explanation = "Legenda:\n- ☣️: toxidade\n- ☢️: toxidade severa\n- 🤺: ataque à identidade\n- 👊: insulto\n- 🤬: afronta\n- ☠️: ameaça";
      message.channel.send(karma ? `Suas ofensas, <@${message.author.id}>:\n\n` + karma + '\n\n' + explanation : 'Sem carma ainda!');
    }

    if (message.content.startsWith('!adote-me como seu criador')) {
      if (robot_creator == null){
        robot_creator = message.author.id
        await robot_memory.insertOne({ _id: 'my_creator', creator_id: robot_creator })
        message.channel.send(`Acabo de te adotar como meu criador, <@${robot_creator}>!`);
      }else{
        if (robot_creator == message.author.id){
          message.channel.send(`Você já foi adotado como meu criador, <@${robot_creator}>!`);
        }else{
          message.channel.send(`Meu criador é o <@${robot_creator}>!`);
        }
      }
    }

    const forgive_command = '!perdoe-me';
    if (message.author.id == robot_creator){
      if (message.content.startsWith(forgive_command)) {
        const karma = await getKarma(message.author.id);
        if (!karma){
          message.channel.send('Você não precisa pedir perdão.');
          return;
        }
        await offence_records.deleteMany( { offending_user: message.author.id } )
        // console.log(message.author.id)
        message.channel.send('Suas ofensas foram perdoadas!');
      }
  
      const preamble = /!perdoe [o|a] <@!/
      const postamble = />/;
      const re = new RegExp(preamble.source + /.*/.source + postamble.source);
      if (re.test(message.content)) {
        const user_to_forgive = message.content.match(/(?<=!perdoe [o|a] <@!)(.*)(?=>)/)[0]
        const gender_letter = message.content.match(/(?<=!perdoe )(.*)(?= <@!((.*)(?=>)))/)[0]
        await offence_records.deleteMany( { offending_user: user_to_forgive } )
        // console.log(user_to_forgive)
        message.channel.send(`As ofensas d${gender_letter} <@${user_to_forgive}> foram perdoadas!`);
      }
    }else{
      if (message.content.startsWith(forgive_command)) {
        message.channel.send('Suas ofensas serão perdoadas em 24h a partir do horário de cada ofensa.');
      }
    }
  });

  // Log our bot in using the token from https://discordapp.com/developers/applications/me
  client.login(process.env.DISCORD_TOKEN);
})